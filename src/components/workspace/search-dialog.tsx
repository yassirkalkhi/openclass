"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Hash, BookOpen, FileText, Layers, CornerDownLeft, Command, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { searchAction, type SearchResultItem } from "@/app/actions/search"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const { t } = useI18n()

  // Native <dialog> open/close
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      document.body.style.overflow = "hidden"
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      dialog.close()
      document.body.style.overflow = "unset"
      setQuery("")
      setResults([])
    }
  }, [open])

  // Escape key / backdrop cancel
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onOpenChange(false)
    }
    dialog.addEventListener("cancel", handleCancel)
    return () => dialog.removeEventListener("cancel", handleCancel)
  }, [onOpenChange])

  // Debounced search — fires 300 ms after the user stops typing
  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const result = await searchAction(q)
    setIsLoading(false)
    if (result.success && result.data) {
      setResults(result.data.items)
    } else {
      setResults([])
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    debounceRef.current = setTimeout(() => runSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[activeIndex]) handleSelect(results[activeIndex].href)
    }
  }

  const getIcon = (type: SearchResultItem["type"]) => {
    const cls = "w-4 h-4 text-zinc-400 dark:text-zinc-500"
    switch (type) {
      case "class":      return <Layers className={cls} />
      case "channel":    return <Hash className={cls} />
      case "assignment": return <FileText className={cls} />
      case "resource":   return <BookOpen className={cls} />
    }
  }

  const getTypeLabel = (type: SearchResultItem["type"]) => {
    const s = t.search
    if (!s) return type
    const map: Record<SearchResultItem["type"], string> = {
      class:      s.class      ?? "Class",
      channel:    s.channel    ?? "Channel",
      assignment: s.assignment ?? "Assignment",
      resource:   s.resource   ?? "Resource",
    }
    return map[type]
  }

  const s = t.search ?? {
    title:       "Search",
    placeholder: "Search classes, channels, assignments...",
    emptyState:  "Type a keyword to discover...",
    noResults:   "No matches found",
    tryDifferent:"Double check your spelling or try another term",
  }

  const showEmpty   = !isLoading && query.trim().length < 2
  const showNoMatch = !isLoading && query.trim().length >= 2 && results.length === 0
  const showResults = results.length > 0

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => e.target === dialogRef.current && onOpenChange(false)}
      className="
        fixed inset-0 z-50
        w-full max-w-2xl
        p-0 m-auto overflow-hidden
        rounded-xl border border-zinc-200/80 dark:border-zinc-800
        bg-white dark:bg-zinc-950
        shadow-2xl shadow-zinc-200/50 dark:shadow-black/50
        backdrop:bg-zinc-950/40 backdrop:backdrop-blur-sm
        open:animate-in open:fade-in-0 open:zoom-in-95 duration-150
      "
    >
      {/* Input row */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-900">
        {isLoading
          ? <Loader2 className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 animate-spin" />
          : <Search  className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={s.placeholder}
          className="
            w-full bg-transparent text-zinc-900 dark:text-zinc-100
            text-base placeholder-zinc-400 dark:placeholder-zinc-500
            focus:outline-none focus:ring-0 border-0 p-0
          "
        />
        <button
          onClick={() => onOpenChange(false)}
          className="text-xs font-medium px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/40 dark:border-zinc-800"
        >
          ESC
        </button>
      </div>

      {/* Results area */}
      <div className="max-h-[380px] overflow-y-auto p-2">
        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-full mb-3 border border-zinc-100 dark:border-zinc-900">
              <Command className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {s.emptyState}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Loader2 className="w-6 h-6 text-zinc-400 dark:text-zinc-500 animate-spin mb-3" />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Searching…</p>
          </div>
        )}

        {showNoMatch && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-full mb-3 border border-zinc-100 dark:border-zinc-900">
              <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.noResults}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">{s.tryDifferent}</p>
          </div>
        )}

        {showResults && (
          <div className="space-y-0.5">
            {results.map((result, index) => {
              const isSelected = index === activeIndex
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result.href)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`
                    w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-left
                    transition-colors duration-100 outline-none
                    ${isSelected
                      ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40"
                    }
                  `}
                >
                  <div className={`
                    flex w-8 h-8 shrink-0 items-center justify-center rounded-md border transition-colors
                    ${isSelected
                      ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900"
                    }
                  `}>
                    {getIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 shrink-0">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {result.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer hints */}
      <div className="border-t border-zinc-100 dark:border-zinc-900 px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">Enter</kbd>
            Open
          </span>
        </div>
        <span>
          Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">Esc</kbd> to exit
        </span>
      </div>
    </dialog>
  )
}
