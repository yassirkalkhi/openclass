"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Message } from "@/lib/types/database"

type RealtimeState = {
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
}

/**
 * Subscribes to a channel's messages in real-time via SSE.
 *
 * The SSE endpoint (`/api/channels/[channelId]/messages`) opens a Firestore
 * onSnapshot listener server-side and forwards every change as an event:
 *  - "connected" — stream is live
 *  - "message"   — new or updated message (includes senderProfile)
 *  - "deleted"   — a message was removed { id }
 *
 * The hook automatically reconnects with exponential back-off if the
 * connection is lost, and cleans up cleanly when the component unmounts or
 * the channelId changes.
 */
export function useRealtimeMessages(channelId: string): RealtimeState {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // Tracks whether the initial snapshot has been delivered (first "message"
  // events from onSnapshot are the full initial set of docs).
  const initialSnapshotDone = useRef(false)
  const retryCount = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const channelIdRef = useRef(channelId)

  const connect = useCallback((cId: string) => {
    // Close any existing connection
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

        if (!initialSnapshotDone.current) {
          // Collect messages until the first batch flush — we detect "end of
          // initial snapshot" by the fact that Firestore delivers the whole
          // initial result set synchronously before any subsequent changes.
          // We accumulate and then sort+set once loading stops.
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id)
            if (exists) return prev
            return [...prev, msg]
          })
        } else {
          // Subsequent events are individual changes — upsert
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === msg.id)
            if (idx === -1) return [...prev, msg]
            const next = [...prev]
            next[idx] = msg
            return next
          })
        }
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

      // Exponential back-off: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * 2 ** retryCount.current, 30_000)
      retryCount.current += 1
      retryTimer.current = setTimeout(() => {
        if (channelIdRef.current === cId) connect(cId)
      }, delay)
    }

    // After a short delay we assume the initial snapshot has been delivered
    // (Firestore delivers the whole initial set synchronously within a single
    // microtask batch, so 200 ms is more than enough).
    setTimeout(() => {
      if (channelIdRef.current === cId) {
        initialSnapshotDone.current = true
        setIsLoading(false)
        // Sort chronologically after initial load
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
    initialSnapshotDone.current = false
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
