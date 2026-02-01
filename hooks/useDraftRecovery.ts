'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface DraftRecoveryOptions<T> {
  key: string
  defaultValue: T
  debounceMs?: number
  maxAgeMs?: number
}

interface DraftMetadata {
  lastUpdated: string
  title?: string
}

interface StoredDraft<T> {
  data: T
  metadata: DraftMetadata
}

export function useDraftRecovery<T>({
  key,
  defaultValue,
  debounceMs = 1000,
  maxAgeMs = 7 * 24 * 60 * 60 * 1000, // 7 days default
}: DraftRecoveryOptions<T>) {
  const [data, setData] = useState<T>(defaultValue)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftMetadata, setDraftMetadata] = useState<DraftMetadata | null>(null)
  const [isRecovering, setIsRecovering] = useState(true)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const storageKey = `aiden_draft_${key}`

  // Check for existing draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsRecovering(false)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed: StoredDraft<T> = JSON.parse(stored)
        const lastUpdated = new Date(parsed.metadata.lastUpdated).getTime()
        const now = Date.now()

        if (now - lastUpdated < maxAgeMs) {
          setHasDraft(true)
          setDraftMetadata(parsed.metadata)
        } else {
          localStorage.removeItem(storageKey)
        }
      }
    } catch (e) {
      console.error('Failed to check for draft:', e)
      localStorage.removeItem(storageKey)
    }

    setIsRecovering(false)
  }, [storageKey, maxAgeMs])

  // Auto-save with debounce
  const saveDraft = useCallback(
    (newData: T, title?: string) => {
      if (typeof window === 'undefined') return

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          const draft: StoredDraft<T> = {
            data: newData,
            metadata: {
              lastUpdated: new Date().toISOString(),
              title,
            },
          }
          localStorage.setItem(storageKey, JSON.stringify(draft))
          setHasDraft(true)
          setDraftMetadata(draft.metadata)
        } catch (e) {
          console.error('Failed to save draft:', e)
        }
      }, debounceMs)
    },
    [storageKey, debounceMs]
  )

  // Update data and trigger auto-save
  const updateData = useCallback(
    (newData: T | ((prev: T) => T), title?: string) => {
      setData((prev) => {
        const next = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData
        saveDraft(next, title)
        return next
      })
    },
    [saveDraft]
  )

  // Recover draft
  const recoverDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed: StoredDraft<T> = JSON.parse(stored)
        setData(parsed.data)
        setHasDraft(false)
      }
    } catch (e) {
      console.error('Failed to recover draft:', e)
    }
  }, [storageKey])

  // Discard draft
  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setDraftMetadata(null)
      setData(defaultValue)
    } catch (e) {
      console.error('Failed to discard draft:', e)
    }
  }, [storageKey, defaultValue])

  // Clear draft (after successful submission)
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setDraftMetadata(null)
    } catch (e) {
      console.error('Failed to clear draft:', e)
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [storageKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Format relative time for display
  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return {
    data,
    setData: updateData,
    hasDraft,
    draftMetadata,
    isRecovering,
    recoverDraft,
    discardDraft,
    clearDraft,
    getRelativeTime: draftMetadata
      ? () => getRelativeTime(draftMetadata.lastUpdated)
      : () => '',
  }
}
