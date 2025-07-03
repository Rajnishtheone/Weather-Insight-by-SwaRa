import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not set." }, { status: 500 })
  }
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 256,
      }),
    })
    const data = await openaiRes.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to contact OpenAI." }, { status: 500 })
  }
} 