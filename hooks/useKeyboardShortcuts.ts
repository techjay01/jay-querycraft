// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import { useQueryStore } from '@/store/queryStore'

interface ShortcutOptions {
  onTogglePreview?: () => void
  onToggleHistory?: () => void
  onToggleTheme?: () => void
}

export const useKeyboardShortcuts = (options: ShortcutOptions = {}) => {
  const store = useQueryStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + Enter — execute query
      if (mod && e.key === 'Enter') {
        e.preventDefault()
        store.executeQueryTree()
      }

      // Ctrl/Cmd + Shift + R — reset query
      if (mod && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        store.resetQuery()
      }

      // Ctrl/Cmd + Shift + P — toggle preview
      if (mod && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        options.onTogglePreview?.()
      }

      // Ctrl/Cmd + Shift + H — toggle history
      if (mod && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        options.onToggleHistory?.()
      }

      // Ctrl/Cmd + Shift + T — toggle theme
      if (mod && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        options.onToggleTheme?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [store, options])

  return {
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Execute query' },
      { keys: ['Ctrl', 'Shift', 'R'], description: 'Reset query' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Toggle preview' },
      { keys: ['Ctrl', 'Shift', 'H'], description: 'Toggle history' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle theme' },
    ],
  }
}