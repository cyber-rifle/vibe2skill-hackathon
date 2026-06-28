import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let _ai: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}
const MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
];

// Simple in-memory rate guard for demo safety (warn only)
let analyzeRequestCount = 0;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

interface ExistingReport {
  id: string;
  lat: number;
  lon: number;
  category: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.MOCK_AI === "true") {
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          const steps = [
            {
              step: "classify",
              result: {
                category: "pothole",
                description: "Large pothole approx 40cm across at intersection",
                confidence: 0.92,
                severity: 4,
                boundingBox: { ymin: 310, xmin: 220, ymax: 590, xmax: 680 },
              },
            },
            {
              step: "duplicate_check",
              result: { duplicatesFound: 0, nearbyReports: [] },
            },
            {
              step: "severity_assessment",
              result: {
                urgencyScore: 4,
                assessment: "Urgency: 4/5\nSevere pothole posing safety risk. GHMC Roads typically resolves high-severity potholes within 3–5 business days.",
                grounded: true,
                resolutionTimeEstimate: null,
                sources: [{ uri: "https://ghmc.gov.in/roads", title: "GHMC Road Repair Policy" }],
              },
            },
            {
              step: "final_report",
              result: {
                report: {
                  department: "GHMC Roads Department",
                  reportText: "Severe pothole detected at Banjara Hills Road No. 12. Immediate repair required.",
                },
              },
            },
          ];
          for (const step of steps) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
          }
          controller.close();
        },
      });
      return new Response(mockStream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const { imageBase64, mimeType, lat, lon, existingReports = [] } = await req.json();

    console.log("[analyze] received request", {
      hasImage: !!imageBase64,
      imageLength: imageBase64?.length ?? 0,
      mimeType,
      lat,
      lon,
    });

    if (!imageBase64 || imageBase64.trim() === "") {
      return NextResponse.json(
        { error: "Missing imageBase64 — image was not received by the server" },
        { status: 400 }
      );
    }

    if (!mimeType) {
      return NextResponse.json(
        { error: "Missing mimeType" },
        { status: 400 }
      );
    }

    // Rate-guard: increment request count and warn if approaching daily free-tier cap
    analyzeRequestCount++;
    if (analyzeRequestCount > 15) {
      console.warn("[rate-guard] approaching free-tier daily limit — consider waiting for quota reset");
    }

    console.log("[step1] classifying image...");
    let classification: {
      category: string;
      description: string;
      confidence: number;
      severity?: number;
      boundingBox?: { ymin: number; xmin: number; ymax: number; xmax: number };
      debugError?: string;
    } = {
      category: "other",
      description: "Unable to classify",
      confidence: 0,
    };

    // Prepare the exact contents used for classification so fallbacks reuse it
    const classifyContents = [{
      role: "user",
      parts: [
        { inlineData: { mimeType: mimeType, data: imageBase64 } },
        {
          text: `You are analyzing a photo of a civic infrastructure issue in India.
Classify it into exactly one of: pothole, water_leakage, streetlight, waste_management, other
Provide a factual one-sentence description of what is visible.
Provide a confidence score from 0.0 to 1.0.
Also identify the primary issue location in the frame and return its bounding box as ymin, xmin, ymax, xmax normalized to a 0–1000 scale where (0,0) is top-left.
Respond ONLY with valid JSON, no markdown, no code blocks, no extra text:
{"category":"...","description":"...","confidence":0.0,"severity":3,"boundingBox":{"ymin":0,"xmin":0,"ymax":500,"xmax":500}}`,
        },
      ],
    }];

    let lastErr: unknown = undefined;
    try {
      const classifyResponse = await getAi().models.generateContent({
        model: MODEL,
        contents: classifyContents,
        config: { responseMimeType: "application/json" },
      });
      const raw = classifyResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleaned = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .replace(/^\s*[\r\n]+/, "")
        .trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1
        ? cleaned.slice(jsonStart, jsonEnd + 1)
        : cleaned;
      classification = JSON.parse(jsonStr);
      console.log("[step1] classification result:", classification);
    } catch (err) {
      console.error("[step1] classify error:", err);
      lastErr = err;
      // Try fallbacks in order using same contents
      let fallbackSucceeded = false;
      for (const fallbackModel of FALLBACK_MODELS) {
        console.log(`[step1] trying fallback model: ${fallbackModel}`);
        try {
          const fallbackRes = await withTimeout(
            getAi().models.generateContent({ model: fallbackModel, contents: classifyContents, config: { responseMimeType: "application/json" } }),
            8000,
            `fallback classify call ${fallbackModel}`
          );
          const raw = fallbackRes.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
          const cleaned = raw
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .replace(/^\s*[\r\n]+/, "")
            .trim();
          const jsonStart = cleaned.indexOf("{");
          const jsonEnd = cleaned.lastIndexOf("}");
          const jsonStr = jsonStart !== -1 && jsonEnd !== -1
            ? cleaned.slice(jsonStart, jsonEnd + 1)
            : cleaned;
          classification = JSON.parse(jsonStr);
          console.log(`[step1] fallback ${fallbackModel} classification result:`, classification);
          fallbackSucceeded = true;
          break;
        } catch (fbErr) {
          console.error(`[step1] fallback ${fallbackModel} failed:`, fbErr);
          lastErr = fbErr;
          continue;
        }
      }
      if (!fallbackSucceeded) {
        console.error("[step1] all fallback models failed; using default classification and recording last error");
        classification = {
          category: "other",
          description: "Unable to classify",
          confidence: 0,
          debugError: String(lastErr),
        };
      }
    }

    console.log("[step2] checking duplicates...");
    const duplicates = (existingReports as ExistingReport[])
      .filter(
        (r) =>
          r.category === classification.category &&
          haversine(lat, lon, r.lat, r.lon) <= 100
      )
      .map((r) => ({
        ...r,
        distanceMeters: Math.round(haversine(lat, lon, r.lat, r.lon)),
      }));
    console.log("[step2] duplicates found:", duplicates.length);

    const departmentMap: Record<string, string> = {
      pothole: "Roads and Infrastructure",
      water_leakage: "Water Board",
      streetlight: "Electrical/Streetlighting",
      waste_management: "Sanitation",
      other: "Municipal Corporation",
    };
    const department = departmentMap[classification.category] ?? "Municipal Corporation";

    const departmentUrlMap: Record<string, string> = {
      "Roads and Infrastructure": "https://www.ghmc.gov.in",
      "Electrical/Streetlighting": "https://www.ghmc.gov.in",
      "Sanitation": "https://www.ghmc.gov.in",
      "Water Board": "https://www.hyderabadwater.gov.in",
      "Municipal Corporation": "https://www.ghmc.gov.in",
    };
    const officialUrl = departmentUrlMap[department] ?? "https://www.ghmc.gov.in";
    const duplicateNote =
      duplicates.length > 0
        ? `${duplicates.length} similar report(s) already exist within 100 metres.`
        : "No duplicate reports found nearby.";

    const duplicateContext = duplicates.length > 0
      ? `This issue has been reported ${duplicates.length} time(s) previously within 100 metres, indicating a persistent unresolved problem. Factor this recurrence into your urgency score.`
      : `This appears to be a first-time report for this location.`;

    const severityPrompt = `A civic issue has been reported in an Indian city.
Category: ${classification.category}
Description: ${classification.description}
Confidence: ${Math.round(classification.confidence * 100)}%
Recurrence context: ${duplicateContext}
Department this will be routed to: ${department}
Official department portal: ${officialUrl}

Using Google Search and the official department URL above, find:
1. The current complaint-resolution SLA for ${department} in Hyderabad
2. Any recent news about ${classification.category} issues in Hyderabad
3. Whether this specific issue type has a published response commitment

Assess urgency on a 1–5 scale (1=minor inconvenience, 5=immediate safety hazard).

Respond in EXACTLY this format — do not add extra sections:

Urgency: X/5

Assessment: [2–3 sentences. Reference specific SLA data, news, or policy
you found via search. Name actual timeframes. Be concrete, not generic.]

Policy context: [1 sentence: the department's published SLA or response
commitment. If not found: "No published SLA found — typical resolution
is X days based on citizen reports."]

ResolutionTime: [e.g. "3–5 business days"]`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendStep(step: string, result: unknown) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step, result })}\n\n`));
        }

        sendStep("classify", classification);
        sendStep("duplicate_check", { duplicatesFound: duplicates.length, nearbyReports: duplicates });

        console.log("[step3] calling Gemini with googleSearch grounding (streaming)...");
        let severityResult: { assessment: string; grounded: boolean; sources: { uri: string; title?: string }[]; debugError?: string } = {
          assessment: "Urgency: 3/5\nModerate severity requiring prompt attention.",
          grounded: false,
          sources: [],
        };
        try {
          // STREAMING PATH — accumulate tokens and send intermediate events
          let streamingFullText = "";
          let streamingGroundingChunks: { web?: { uri?: string; title?: string } }[] = [];
          const streamingResponse = await withTimeout(
            getAi().models.generateContentStream({
              model: MODEL,
              contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
              config: { tools: [{ urlContext: {} }, { googleSearch: {} }] },
            }),
            9000,
            "grounded severity stream"
          );
          for await (const chunk of streamingResponse) {
            const chunkText = chunk.candidates?.[0]?.content?.parts
              ?.filter((p: { text?: string }) => typeof p.text === "string")
              ?.map((p: { text?: string }) => p.text)
              ?.join("") ?? "";
            if (chunkText) {
              streamingFullText += chunkText;
              sendStep("severity_streaming", { token: chunkText, full_text: streamingFullText });
            }
            // capture grounding from any chunk that has it
            const chunkGrounding = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunkGrounding?.length) streamingGroundingChunks = chunkGrounding;
          }
          const urgencyCount = (streamingFullText.match(/Urgency:/g) || []).length;
          const dedupedText = urgencyCount > 1
            ? "Urgency:" + streamingFullText.split("Urgency:").filter(Boolean)[0].trimEnd()
            : streamingFullText;
          const sources = streamingGroundingChunks
            .map((c: { web?: { uri?: string; title?: string } }) => c.web)
            .filter((w: { uri?: string } | undefined): w is { uri: string; title?: string } => !!w?.uri)
            .map((w: { uri: string; title?: string }) => ({ uri: w.uri, title: w.title ?? w.uri }));
          const isActuallyGrounded = streamingGroundingChunks.length > 0;
          console.log("[step3] stream complete:", dedupedText?.slice(0, 160), "| grounded:", isActuallyGrounded);
          if (!dedupedText) throw new Error("Empty grounded stream response");
          severityResult = { assessment: dedupedText, grounded: isActuallyGrounded, sources };
        } catch (groundedErr) {
          console.error("[step3] streaming failed, falling back to generateContent:", groundedErr);
          sendStep("severity_retry", { message: "Retrying with backup model..." });
          // CRITICAL FALLBACK — streaming failure must never break Step 3
          let lastErr: unknown = groundedErr;
          let fallbackSucceeded = false;
          // First try original model non-streaming
          try {
            const res = await withTimeout(
              getAi().models.generateContent({
                model: MODEL,
                contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
                config: { tools: [{ urlContext: {} }, { googleSearch: {} }] },
              }),
              9000,
              "non-streaming severity fallback"
            );
            const parts = res.candidates?.[0]?.content?.parts ?? [];
            const text = parts.filter((p: { text?: string }) => typeof p.text === "string").map((p: { text?: string }) => p.text).join("").trim();
            const urgencyCount = (text.match(/Urgency:/g) || []).length;
            const dedupedText = urgencyCount > 1 ? "Urgency:" + text.split("Urgency:").filter(Boolean)[0].trimEnd() : text;
            const groundingChunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            const sources = groundingChunks.map((c: { web?: { uri?: string; title?: string } }) => c.web).filter((w: { uri?: string } | undefined): w is { uri: string; title?: string } => !!w?.uri).map((w: { uri: string; title?: string }) => ({ uri: w.uri, title: w.title ?? w.uri }));
            if (!dedupedText) throw new Error("Empty fallback response");
            severityResult = { assessment: dedupedText, grounded: groundingChunks.length > 0, sources };
            fallbackSucceeded = true;
          } catch (nonStreamErr) {
            lastErr = nonStreamErr;
          }
          // Then try fallback models
          if (!fallbackSucceeded) {
            for (const fallbackModel of FALLBACK_MODELS) {
              try {
                const fallbackRes = await withTimeout(
                  getAi().models.generateContent({
                    model: fallbackModel,
                    contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
                    config: { tools: [{ googleSearch: {} }] },
                  }),
                  8000,
                  `fallback grounded severity call ${fallbackModel}`
                );
                const parts = fallbackRes.candidates?.[0]?.content?.parts ?? [];
                const text = parts.filter((p: { text?: string }) => typeof p.text === "string").map((p: { text?: string }) => p.text).join("").trim();
                const groundingChunks = fallbackRes.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
                const sources = groundingChunks.map((c: { web?: { uri?: string; title?: string } }) => c.web).filter((w: { uri?: string } | undefined): w is { uri: string; title?: string } => !!w?.uri).map((w: { uri: string; title?: string }) => ({ uri: w.uri, title: w.title ?? w.uri }));
                severityResult = { assessment: text || "Urgency: 3/5\nModerate severity requiring prompt attention.", grounded: groundingChunks.length > 0, sources };
                fallbackSucceeded = true;
                break;
              } catch (err) {
                lastErr = err;
              }
            }
          }
          if (!fallbackSucceeded) {
            severityResult = { assessment: "Urgency: 3/5\nModerate severity requiring prompt attention.", grounded: false, sources: [], debugError: String(lastErr) };
          }
        }
        // extract resolution time estimate if provided as a structured line
        const resolutionMatch = severityResult?.assessment?.match(/ResolutionTime:\s*(.+)/i);
        const resolutionTimeEstimate = resolutionMatch ? resolutionMatch[1].trim() : null;

        // strip the ResolutionTime line from the assessment text so it doesn't show in prose
        if (severityResult?.assessment) {
          severityResult.assessment = severityResult.assessment.replace(/ResolutionTime:\s*.+/i, "").trim();
        }

        // Extract Policy context
        const policyMatch = severityResult?.assessment?.match(/Policy context:\s*(.+?)(?=\n|$)/i);
        const policyContext = policyMatch ? policyMatch[1].trim() : null;
        if (severityResult?.assessment) {
          severityResult.assessment = severityResult.assessment
            .replace(/Policy context:\s*.+/i, "")
            .replace(/^Assessment:\s*/im, "")
            .trim();
        }

        sendStep("severity_assessment", {
          ...severityResult,
          resolutionTimeEstimate,
          policyContext,
        });

        const urgencyLine = severityResult?.assessment?.split("\n")[0] ?? "Urgency: 3/5";
        const urgencyTone = (() => {
          const score = parseInt(urgencyLine.match(/(\d)/)?.[1] ?? "3");
          if (score >= 5) return "URGENT: Immediate action required.";
          if (score >= 4) return "High priority — action needed within 48 hours.";
          if (score >= 3) return "Moderate priority — schedule within one week.";
          return "Routine — address in next maintenance cycle.";
        })();
        const urgencyScore = parseInt(urgencyLine.match(/(\d)/)?.[1] ?? "3");

        const reportPrompt = `Draft a formal civic issue report for the ${department} department of the municipal corporation in India.

      Issue details:
      - Category: ${classification.category}
      - Description: ${classification.description}
      - AI Confidence: ${Math.round(classification.confidence * 100)}%
      - Severity: ${urgencyLine}
      - Priority directive: ${urgencyTone}
      - Duplicate status: ${duplicateNote}

      Write exactly three sentences in a formal, neutral tone with no markdown or bullets:
      1) Describe the issue and its exact nature using specific location or physical details if present in the description above.
      2) State the potential impact on citizens and public safety, reflecting the ${urgencyLine} severity.
      3) Conclude with a clear, department-specific recommended action aligned with the priority directive: ${urgencyTone}

      Return only a single paragraph composed of the three sentences. Always return a complete 3-sentence report; do not repeat instructions or include example bracketed text.`;

        console.log("[step4] calling Gemini for draft report (informed by severity)...");
        let reportResult: string = "Report generation failed — please retry.";
        let reportDebugError: string | undefined = undefined;
        try {
          const res = await getAi().models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
          });
          const text = (res.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
          if (text.includes('[') && text.includes(']')) {
            try {
              console.warn('[step4] possible placeholder leakage detected in report text', text.slice(0, 400));
            } catch {
              console.warn('[step4] possible placeholder leakage detected (unable to stringify)')
            }
          }
          if (!text) throw new Error("Empty report response");
          reportResult = text;
        } catch (err) {
          console.error("[step4] report error:", err);
          let lastErr: unknown = err;
          let fallbackSucceeded = false;
          sendStep("report_retry", { message: "Retrying report generation with backup model..." });
          for (const fallbackModel of FALLBACK_MODELS) {
            console.log(`[step4] trying fallback model: ${fallbackModel}`);
            try {
              const fallbackRes = await withTimeout(
                getAi().models.generateContent({ model: fallbackModel, contents: [{ role: "user", parts: [{ text: reportPrompt }] }] }),
                5000,
                `fallback report call ${fallbackModel}`
              );
              const text = fallbackRes.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              reportResult = text || "Report generation failed — please retry.";
              fallbackSucceeded = true;
              break;
            } catch (fallbackErr) {
              console.error(`[step4] fallback ${fallbackModel} failed:`, fallbackErr);
              lastErr = fallbackErr;
              continue;
            }
          }
          if (!fallbackSucceeded) {
            console.error("[step4] all fallback models failed; using default report failure message and recording last error");
            reportResult = "Report generation failed — please retry.";
            reportDebugError = String(lastErr);
          }
        }
        sendStep("final_report", {
          department,
          report: { department, text: reportResult, debugError: reportDebugError },
          duplicateNote,
          urgencyScore,
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[analyze] top-level error:", err);
    if (String(err).includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: "Server is missing its Gemini API key — contact the site admin." }, { status: 500 });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
