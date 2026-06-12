"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Message } from "@/lib/types/database"

type RealtimeState = {
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
}

 
export function useRealtimeMessages(channelId: string): RealtimeState {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  const retryCount = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const channelIdRef = useRef(channelId)

  const connect = useCallback((cId: string) => {
     if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const es = new EventSource(`/api/channels/${cId}/messages`)
    esRef.current = es

    es.addEventListener("connected", () => {
      setIsConnected(true)
      retryCount.current = 0
    })

    es.addEventListener("message", (e: MessageEvent) => {
      if (channelIdRef.current !== cId) return
      try {
        const msg: Message = JSON.parse(e.data)
 
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === msg.id)
          if (idx === -1) return [...prev, msg]
          const next = [...prev]
          next[idx] = msg
          return next
        })
      } catch {
        // Malformed event — ignore
      }
    })

    es.addEventListener("deleted", (e: MessageEvent) => {
      if (channelIdRef.current !== cId) return
      try {
        const { id } = JSON.parse(e.data)
        setMessages((prev) => prev.filter((m) => m.id !== id))
      } catch {
        // Malformed event — ignore
      }
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
      setIsConnected(false)

      if (channelIdRef.current !== cId) return

       const delay = Math.min(1000 * 2 ** retryCount.current, 30_000)
      retryCount.current += 1
      retryTimer.current = setTimeout(() => {
        if (channelIdRef.current === cId) connect(cId)
      }, delay)
    }
 
    setTimeout(() => {
      if (channelIdRef.current === cId) {
        setIsLoading(false)
         setMessages((prev) =>
          [...prev].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        )
      }
    }, 400)
  }, [])

  useEffect(() => {
    channelIdRef.current = channelId
    retryCount.current = 0

    setMessages([])
    setIsLoading(true)
    setIsConnected(false)

    if (retryTimer.current) {
      clearTimeout(retryTimer.current)
      retryTimer.current = null
    }

    connect(channelId)

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
    }
  }, [channelId, connect])

  return { messages, isLoading, isConnected }
}
