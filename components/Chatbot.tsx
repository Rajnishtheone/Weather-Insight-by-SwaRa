"use client";
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
      console.log('OpenAI API response:', data) // Debug log
      let botMsg = data.choices?.[0]?.message?.content
      if (!botMsg && data.error) botMsg = `Error: ${data.error}`
      if (!botMsg) botMsg = "Sorry, I couldn't understand that."
      setMessages((msgs: { from: string; text: string }[]) => [...msgs, { from: "bot", text: botMsg }])
    } catch (err) {
      setMessages((msgs: { from: string; text: string }[]) => [...msgs, { from: "bot", text: "Sorry, there was an error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  // Delete the most recent user message
  function deleteLastUserMessage() {
    setMessages((msgs: { from: string; text: string }[]) => {
      const lastUserIdx = [...msgs].reverse().findIndex(m => m.from === 'user')
      if (lastUserIdx === -1) return msgs
      const idx = msgs.length - 1 - lastUserIdx
      return msgs.filter((_, i) => i !== idx)
    })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className={`fixed bottom-20 right-6 z-[9999] rounded-full shadow-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 transition-transform duration-300 ${open ? "scale-90 opacity-60" : "scale-100 hover:scale-110"}`}
        aria-label="Open RajnishBot Chat"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-36 right-6 z-[9999] w-80 max-w-[95vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 dark:text-gray-900 rounded-t-2xl">
            <div className="flex items-center gap-2 font-bold text-lg">
              {AVATAR}
              SwaRa<span aria-hidden="true" style={{marginLeft: 4}}>❤️</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="hover:scale-110 transition-transform"><X className="w-5 h-5 text-gray-900" /></button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900" style={{ maxHeight: 400, minHeight: 200 }}>
            {messages.map((msg: { from: string; text: string }, i: number) => {
              const isLastUser = msg.from === 'user' && i === messages.map(m => m.from).lastIndexOf('user')
              return (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} items-center`}>
                  {msg.from === "bot" && AVATAR}
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${msg.from === "user" ? "bg-yellow-400 text-gray-900 ml-auto" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ml-2"}`}>
                    {msg.text}
                  </div>
                  {isLastUser && (
                    <button onClick={deleteLastUserMessage} aria-label="Delete message" className="ml-2 text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  )}
                </div>
              )
            })}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Bot className="w-4 h-4 animate-bounce" /> SwaRa is typing...</div>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
            <input
              className="flex-1 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              aria-label="Type your message"
              autoFocus
            />
            <button type="submit" className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 disabled:opacity-50" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  )
} 