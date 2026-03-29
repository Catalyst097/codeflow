import { NextResponse } from "next/server";

export async function POST(request) {
  const { code, language, apiKey } = await request.json();

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: "No API key provided" }, { status: 400 });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: "You are a helpful coding teacher. Explain code in simple, clear english that a beginner can understand. Keep it under 100 words. Use bullet points. Do not use technical jargon.",
        messages: [{ role: "user", content: `Explain this ${language} code in simple words:\n\n${code}` }],
      }),
    });

    const data = await response.json();
    if (data.error?.type === "authentication_error") {
      return NextResponse.json({ error: "invalid_key" }, { status: 401 });
    }

    const text = data.content?.[0]?.text || "Could not generate explanation.";
    return NextResponse.json({ explanation: text });
  } catch (err) {
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}