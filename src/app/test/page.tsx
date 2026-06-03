"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  createFunctionalConversationAction, 
  seedFunctionalVectorAction, 
  sendFunctionalMessageAction 
} from "./actions"

interface LineItem {
  role: "user" | "assistant" | "diagnostic"
  text: string
  time: string
}

export default function CompleteFunctionalTestPage() {
  // Configuration Target Parameters
  const [classId, setClassId] = useState("test-class-202")
  const [userId, setUserId] = useState("test-student-77")
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Context Seeding Framework States
  const [docTitle, setDocTitle] = useState("")
  const [docContent, setDocContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [indexedCount, setIndexedCount] = useState<number | null>(null)

  // Message Engine States
  const [chatFeed, setChatFeed] = useState<LineItem[]>([
    { role: "diagnostic", text: "Testing suite loaded. Step 1: Initialize session.", time: new Date().toLocaleTimeString() }
  ])
  const [messageInput, setMessageInput] = useState("")
  const [isProcessingInference, setIsProcessingInference] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  
  const scrollAnchor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatFeed, isProcessingInference])

  const appendDiagnostic = (msg: string) => {
    setChatFeed(prev => [...prev, { role: "diagnostic", text: msg, time: new Date().toLocaleTimeString() }])
  }

  // Phase 1 Exec: Create Live Session Block
  const handleCreateSession = async () => {
    setIsInitializing(true)
    try {
      const session = await createFunctionalConversationAction(classId, userId)
      if (session && session.id) {
        setConversationId(session.id)
        appendDiagnostic(`SUCCESS: DB record mapped. Session ID mounted: ${session.id}`)
      } else {
        appendDiagnostic(`ERROR: Conversation resolved but ID attribute was missing. Details: ${JSON.stringify(session)}`)
      }
    } catch (err: any) {
      appendDiagnostic(`CRASH: Session Init Failed: ${err.message}`)
    } finally {
      setIsInitializing(false)
    }
  }

  // Phase 2 Exec: Seed Upstash Context Layer
  const handleVectorSeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle || !docContent.trim()) return

    setIsUploading(true)
    appendDiagnostic(`Vector Pipeline: Shipping string matrices to Upstash Namespace [class-${classId}]...`)
    try {
      const response = await seedFunctionalVectorAction(classId, docTitle, docContent)
      if (response.success) {
        setIndexedCount(response.chunkCount)
        appendDiagnostic(`SUCCESS: Generated & populated ${response.chunkCount} embeddings from "${docTitle}"`)
        setDocTitle("")
        setDocContent("")
      }
    } catch (err: any) {
      appendDiagnostic(`CRASH: Upstash Storage Failed: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Helper: Deep parse structures to prevent swallowed strings
  const parseLLMOutput = (payload: any): string => {
    if (!payload) return "[Null data return variant evaluated]"
    if (typeof payload === "string") return payload
    if (payload.assistantMessage?.content) return payload.assistantMessage.content
    if (payload.content) return payload.content
    if (payload.text) return payload.text
    return `[Raw Structural Mapping]: ${JSON.stringify(payload)}`
  }

  // Phase 3 Exec: Broadcast Message + Extract Context Injection
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !conversationId || isProcessingInference) return

    const promptText = messageInput.trim()
    setMessageInput("")
    setIsProcessingInference(true)

    // Add User line item
    setChatFeed(prev => [...prev, { role: "user", text: promptText, time: new Date().toLocaleTimeString() }])
    appendDiagnostic("Pipeline Status: Fetching matches from Upstash Vector & processing inference execution...")

    try {
      const rawOutput = await sendFunctionalMessageAction(conversationId, promptText, userId)
      const sanitizedText = parseLLMOutput(rawOutput)
      
      setChatFeed(prev => [...prev, { 
        role: "assistant", 
        text: sanitizedText, 
        time: new Date().toLocaleTimeString() 
      }])
      appendDiagnostic("Pipeline Status: Execution trace loop closed cleanly.")
    } catch (err: any) {
      appendDiagnostic(`CRASH: Inference Execution Failed: ${err.message}`)
    } finally {
      setIsProcessingInference(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      
      {/* Configuration Header Control Panel */}
      <div className="max-w-7xl mx-auto mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">End-to-End AI Engine Testing Suite</h1>
          <p className="text-xs text-slate-400 mt-0.5">Validates standard data synchronization, storage layers, and response streaming mapping arrays</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Namespace:</span>
            <input
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="bg-transparent border-none text-cyan-400 w-28 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">User Profile:</span>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-transparent border-none text-cyan-400 w-28 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={handleCreateSession}
            disabled={isInitializing}
            className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition ${
              conversationId 
                ? "bg-emerald-950/60 border border-emerald-800 text-emerald-400" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
            }`}
          >
            {isInitializing ? "Processing DB Entry..." : conversationId ? "✓ Session Created" : "Step 1: Init Database Session"}
          </button>
        </div>
      </div>

      {/* Main Structural Twin Columns Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Data Upload Pool Component */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Step 2: Vector Context Seeding Pool
              </h2>
              {indexedCount !== null && (
                <span className="bg-blue-950 border border-blue-800 text-blue-400 text-[10px] px-2 py-0.5 rounded font-mono">
                  {indexedCount} chunks live
                </span>
              )}
            </div>

            <form onSubmit={handleVectorSeed} className="space-y-3">
              <input
                type="text"
                placeholder="Document Target Topic (e.g. OSPF Cryptographic Services)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Paste structural raw database info or textual fragments here..."
                rows={10}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 leading-relaxed resize-none focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isUploading || !docTitle || !docContent.trim()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono py-2 rounded-lg transition disabled:opacity-40 uppercase tracking-wider font-bold"
              >
                {isUploading ? "Uploading Context Matrix..." : "Execute Vector Seed to Upstash"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Hand: Unified Message Engine Component */}
        <div className="lg:col-span-7 flex flex-col h-[525px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center font-mono text-xs text-slate-400">
            <span>Step 3: Active RAG Pipe Flow</span>
            {conversationId && <span className="text-[10px] text-slate-600">Active Mount: {conversationId.slice(0, 14)}...</span>}
          </div>

          {/* Interactive Flow Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
            {chatFeed.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border max-w-[90%] text-xs font-mono leading-relaxed ${
                  item.role === "user"
                    ? "bg-blue-950/40 border-blue-900/50 text-blue-200 ml-auto"
                    : item.role === "diagnostic"
                    ? "bg-slate-900/50 border-slate-850 text-amber-500/90 mx-auto w-full text-center border-dashed"
                    : "bg-slate-900 border-slate-800 text-emerald-300 mr-auto"
                }`}
              >
                <div className="text-[9px] text-slate-500 flex justify-between tracking-tight mb-1 font-sans font-bold select-none">
                  <span>{item.role === "user" ? "✦ TRANSMITTED QUERY" : item.role === "diagnostic" ? "⚙ CORE LOG ENGINE" : "⚡ LLM RETURNED DATA"}</span>
                  <span>{item.time}</span>
                </div>
                <p className="whitespace-pre-wrap">{item.text}</p>
              </div>
            ))}
            
            {isProcessingInference && (
              <div className="bg-slate-900/40 border border-slate-800 text-slate-500 p-3 rounded-lg text-xs font-mono mr-auto max-w-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Querying database & parsing LLM text array...
              </div>
            )}
            <div ref={scrollAnchor} />
          </div>

          {/* Prompt Entry Tray */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              disabled={!conversationId}
              placeholder={conversationId ? "Enter query (e.g. Explain signature flags)" : "⚠️ You must open a database session record first (Step 1)"}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={isProcessingInference || !messageInput.trim() || !conversationId}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-xs font-mono uppercase font-bold tracking-wider px-4 py-2 rounded-lg transition"
            >
              Transmit
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}