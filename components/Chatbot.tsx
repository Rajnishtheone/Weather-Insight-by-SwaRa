import React, { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot } from "lucide-react"

const AVATAR = (
  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl shadow-lg">
    🤖
  </span>
)

// Helper to get weather context from localStorage (set by main app)
function getWeatherContext() {
  try {
    const data = localStorage.getItem("weather-context")
    if (data) return JSON.parse(data)
  } catch {}
  return null
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rajnishbot-history")
      if (saved) return JSON.parse(saved) as { from: string; text: string }[]
    }
    return [
      { from: "bot", text: "Hi! I'm SwaRa❤️. How can I help you today?" }
    ]
  })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Save chat history to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rajnishbot-history", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, open])

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!input.trim()) return
    const userMsg = { from: "user", text: input }
    setMessages((msgs: { from: string; text: string }[]) => [...msgs, userMsg])
    setInput("")
    setLoading(true)
    try {
      // Weather context for RajnishBot
      const weather = getWeatherContext()
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are SwaRa❤️, a friendly assistant for the Weather App. If the user asks about the weather, use this context: ${weather ? JSON.stringify(weather) : "No weather data available."}` },
            ...[...messages, userMsg].map((m: { from: string; text: string }) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }))
          ]
        }),
      })
      const data = await res.json()
      const botMsg = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that."
      setMessages((msgs: { from: string; text: string }[]) => [...msgs, { from: "bot", text: botMsg }])
    } catch (err) {
      setMessages((msgs: { from: string; text: string }[]) => [...msgs, { from: "bot", text: "Sorry, there was an error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 transition-transform duration-300 ${open ? "scale-90 opacity-60" : "scale-100 hover:scale-110"}`}
        aria-label="Open RajnishBot Chat"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[95vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-2xl">
            <div className="flex items-center gap-2 font-bold text-lg">
              {AVATAR}
              SwaRa<span aria-hidden="true" style={{marginLeft: 4}}>❤️</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg: { from: string; text: string }, i: number) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && AVATAR}
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${msg.from === "user" ? "bg-blue-500 text-white ml-auto" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ml-2"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Bot className="w-4 h-4 animate-bounce" /> SwaRa is typing...</div>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
            <input
              className="flex-1 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              aria-label="Type your message"
              autoFocus
            />
            <button type="submit" className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  )
} 