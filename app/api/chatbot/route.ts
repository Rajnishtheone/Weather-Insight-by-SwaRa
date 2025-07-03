import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not set." }, { status: 500 })
  }

  // Convert your chat history to Gemini's format (just send the latest user message for now)
  const userMessage = messages?.[messages.length - 1]?.content || ""

  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: userMessage }
              ]
            }
          ]
        }),
      }
    )
    const data = await geminiRes.json()
    // Gemini's response format
    const botMsg =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.error?.message ||
      "Sorry, I couldn't understand that."
    return NextResponse.json({ choices: [{ message: { content: botMsg } }] })
  } catch (err) {
    return NextResponse.json({ error: "Failed to contact Gemini." }, { status: 500 })
  }
} 