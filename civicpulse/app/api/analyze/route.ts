import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash-001";

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

    console.log("[step1] classifying image...");
    let classification = {
      category: "other",
      description: "Unable to classify",
      confidence: 0,
    };
    try {
      const classifyResponse = await ai.models.generateContent({
        model: MODEL,
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType, data: imageBase64 } },
            {
              text: `You are analyzing a photo of a civic infrastructure issue in India.
Classify it into exactly one of: pothole, water_leakage, streetlight, waste_management, other
Provide a factual one-sentence description of what is visible.
Provide a confidence score from 0.0 to 1.0.
Respond ONLY with valid JSON, no markdown, no code blocks, no extra text:
{"category":"...","description":"...","confidence":0.0}`,
            },
          ],
        }],
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
Assess the urgency of this issue on a scale of 1 to 5 where 1 = minor inconvenience and 5 = immediate safety hazard.
Start your response with exactly "Urgency: X/5" on the first line.
Then write 2-3 sentences explaining the severity, factoring in recurrence if applicable, and referencing typical municipal resolution timeframes from Indian cities such as BBMP Bengaluru, BMC Mumbai, or GHMC Hyderabad.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendStep(step: string, result: unknown) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step, result })}\n\n`));
        }

        sendStep("classify", classification);
        sendStep("duplicate_check", { duplicatesFound: duplicates.length, nearbyReports: duplicates });

        console.log("[step3] calling Gemini with googleSearch grounding...");
        let severityResult: { assessment: string; grounded: boolean; sources: { uri: string; title?: string }[] };
        try {
          const res = await withTimeout(
            ai.models.generateContent({
              model: MODEL,
              contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
              config: { tools: [{ googleSearch: {} }] },
            }),
            8000,
            "grounded severity call"
          );
          const parts = res.candidates?.[0]?.content?.parts ?? [];
          const text = parts
            .filter((p: { text?: string }) => typeof p.text === "string")
            .map((p: { text?: string }) => p.text)
            .join("")
            .trim();
          const urgencyCount = (text.match(/Urgency:/g) || []).length;
          const dedupedText = urgencyCount > 1
            ? "Urgency:" + text.split("Urgency:").filter(Boolean)[0].trimEnd()
            : text;
          const groundingMetadata = res.candidates?.[0]?.groundingMetadata;
          const groundingChunks = groundingMetadata?.groundingChunks ?? [];
          const sources = groundingChunks
            .map((c: { web?: { uri?: string; title?: string } }) => c.web)
            .filter((w: { uri?: string } | undefined): w is { uri: string; title?: string } => !!w?.uri)
            .map((w: { uri: string; title?: string }) => ({ uri: w.uri, title: w.title ?? w.uri }));
          const isActuallyGrounded = groundingChunks.length > 0;
          console.log("[step3] grounded result:", dedupedText?.slice(0, 160), "| isActuallyGrounded:", isActuallyGrounded);
          if (!dedupedText) throw new Error("Empty grounded response");
          severityResult = { assessment: dedupedText, grounded: isActuallyGrounded, sources };
        } catch (groundedErr) {
          console.error("[step3] grounded call failed or timed out, retrying without grounding:", groundedErr);
          try {
            const fallback = await ai.models.generateContent({
              model: FALLBACK_MODEL,
              contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
            });
            const text = fallback.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            severityResult = {
              assessment: text || "Urgency: 3/5\nModerate severity requiring prompt attention.",
              grounded: false,
              sources: [],
            };
          } catch (fallbackErr) {
            console.error("[step3] fallback also failed:", fallbackErr);
            severityResult = {
              assessment: "Urgency: 3/5\nModerate severity requiring prompt attention.",
              grounded: false,
              sources: [],
            };
          }
        }
        sendStep("severity_assessment", severityResult);

        const urgencyLine = severityResult?.assessment?.split("\n")[0] ?? "Urgency: 3/5";
        const urgencyTone = (() => {
          const score = parseInt(urgencyLine.match(/(\d)/)?.[1] ?? "3");
          if (score >= 5) return "URGENT: Immediate action required.";
          if (score >= 4) return "High priority — action needed within 48 hours.";
          if (score >= 3) return "Moderate priority — schedule within one week.";
          return "Routine — address in next maintenance cycle.";
        })();
        const urgencyScore = parseInt(urgencyLine.match(/(\d)/)?.[1] ?? "3");

        const reportPrompt = `Draft a formal civic issue report for the ${department} department of a municipal corporation in India.

Issue details:
- Category: ${classification.category}
- Description: ${classification.description}
- AI Confidence: ${Math.round(classification.confidence * 100)}%
- Severity: ${urgencyLine}
- Priority directive: ${urgencyTone}
- Duplicate status: ${duplicateNote}

Write exactly 3 sentences:
Sentence 1: Describe the issue and its exact nature with specific details.
Sentence 2: State the potential impact on citizens and public safety, reflecting the ${urgencyLine} severity.
Sentence 3: ${urgencyTone} Recommend specific action for the ${department} department.

Formal tone. No markdown. No bullet points. Plain paragraph only.
IMPORTANT: Always return a complete 3-sentence report. Never return an empty response.`;

        console.log("[step4] calling Gemini for draft report (informed by severity)...");
        let reportResult: string;
        try {
          const res = await ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
          });
          const text = (res.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
          if (!text) throw new Error("Empty report response");
          reportResult = text;
        } catch (err) {
          console.error("[step4] report error:", err);
          try {
            const fallback = await ai.models.generateContent({
              model: FALLBACK_MODEL,
              contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
            });
            const text = fallback.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            reportResult = text || "Report generation failed — please retry.";
          } catch (fallbackErr) {
            console.error("[step4] fallback report error:", fallbackErr);
            reportResult = "Report generation failed — please retry.";
          }
        }
        sendStep("final_report", {
          department,
          report: { department, text: reportResult },
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
