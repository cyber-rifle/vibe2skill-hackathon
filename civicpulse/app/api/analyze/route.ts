import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
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
      const cleaned = raw.replace(/```json|```/g, "").trim();
      classification = JSON.parse(cleaned);
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

    const severityPrompt = `A civic issue has been reported in an Indian city.
Category: ${classification.category}
Description: ${classification.description}
Assess the urgency of this issue on a scale of 1 to 5 where 1 = minor inconvenience and 5 = immediate safety hazard.
Start your response with exactly "Urgency: X/5" on the first line.
Then write 2-3 sentences explaining the severity and referencing typical municipal resolution timeframes from Indian cities such as BBMP Bengaluru, BMC Mumbai, or GHMC Hyderabad.`;

    const reportPrompt = `Draft a formal civic issue report for the ${department} department of a municipal corporation in India.

Issue details:
- Category: ${classification.category}
- Description: ${classification.description}  
- AI Confidence: ${Math.round(classification.confidence * 100)}%
- Duplicate status: ${duplicateNote}

Write exactly 3 sentences:
Sentence 1: Describe the issue and its exact nature with specific details.
Sentence 2: State the potential impact on citizens and public safety.
Sentence 3: Recommend specific action and urgency for the ${department} department.

Formal tone. No markdown. No bullet points. Plain paragraph only.

IMPORTANT: Always return a complete 3-sentence report. Never return an empty response.`;

    console.log("[step3+4] running severity + report in parallel...");

    const [severitySettled, reportSettled] = await Promise.allSettled([
      (async () => {
        console.log("[step3] calling Gemini with googleSearch grounding...");
        try {
          const res = await ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
            config: { tools: [{ googleSearch: {} }], toolConfig: { functionCallingConfig: { mode: "AUTO" } } },
          });
          const parts = res.candidates?.[0]?.content?.parts ?? [];
          const text = parts
            .filter((p: { text?: string }) => typeof p.text === "string")
            .map((p: { text?: string }) => p.text)
            .join("")
            .trim();
          console.log("[step3] grounded result:", text?.slice(0, 160));
          if (text) return { assessment: text, grounded: true };
          throw new Error("Empty grounded response");
        } catch (groundedErr) {
          console.error("[step3] grounded call failed, retrying without grounding:", groundedErr);
          try {
            const fallback = await ai.models.generateContent({
              model: FALLBACK_MODEL,
              contents: [{ role: "user", parts: [{ text: severityPrompt }] }],
            });
            const text = fallback.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            console.log("[step3] ungrounded fallback result:", text?.slice(0, 160));
            return {
              assessment:
                text || "Urgency: 3/5\nModerate severity requiring prompt attention.",
              grounded: false,
            };
          } catch (fallbackErr) {
            console.error("[step3] fallback also failed:", fallbackErr);
            return {
              assessment: "Urgency: 3/5\nModerate severity requiring prompt attention.",
              grounded: false,
            };
          }
        }
      })(),

      (async () => {
        console.log("[step4] calling Gemini for draft report...");
        try {
          const res = await ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
          });
          const text = (res.candidates?.[0]?.content?.parts ?? []).map((p: {text?: string}) => p.text ?? "").join("").trim();
          console.log("[step4] report result:", text?.slice(0, 160));
          if (text) return text;
          throw new Error("Empty report response");
        } catch (err) {
          console.error("[step4] report error:", err);
          try {
            const fallback = await ai.models.generateContent({
              model: FALLBACK_MODEL,
              contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
            });
            const text = fallback.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            console.log("[step4] fallback report result:", text?.slice(0, 160));
            return text || "Report generation failed — please retry.";
          } catch (fallbackErr) {
            console.error("[step4] fallback report error:", fallbackErr);
            return "Report generation failed — please retry.";
          }
        }
      })(),
    ]);

    const severityResult =
      severitySettled.status === "fulfilled"
        ? (severitySettled.value as { assessment: string; grounded: boolean })
        : { assessment: "Urgency: 3/5\nModerate severity.", grounded: false };

    const reportText =
      reportSettled.status === "fulfilled"
        ? (reportSettled.value as string)
        : "Report generation failed.";

    const steps = [
      { step: "classify", result: classification },
      { step: "duplicate_check", result: { duplicatesFound: duplicates.length, nearbyReports: duplicates } },
      { step: "severity_assessment", result: severityResult },
      { step: "final_report", result: { department, report: reportText, duplicateNote } },
    ];

    console.log("[analyze] all steps complete, returning response");

    return NextResponse.json({
      steps,
      classification,
      duplicates,
      severity: severityResult.assessment,
      report: { department, text: reportText },
    });
  } catch (err) {
    console.error("[analyze] top-level error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
