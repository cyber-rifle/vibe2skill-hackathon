"use client";
import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type, lat: 17.385, lon: 78.487, existingReports: [] }),
        });
        setResult(await res.json());
      } catch (err) { setError(String(err)); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace", maxWidth: 800 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>CivicPulse — API Test</h1>
      <input type="file" accept="image/*" onChange={handleSubmit} />
      {loading && <p style={{ color: "#5BBFBF", marginTop: 12 }}>Analyzing…</p>}
      {error && <pre style={{ color: "red", marginTop: 12, whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && <pre style={{ marginTop: 16, background: "#f2ede4", padding: 16, borderRadius: 8, fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
