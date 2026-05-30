// app/page.tsx
'use client'

import { useState, useCallback } from 'react'
import ResultsPanel from '@/components/results/ResultsPanel'
import {
  Database,
  Eye,
  History,
  Keyboard,
} from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { MOCK_SCHEMAS } from '@/lib/schemas'
import { ThemeMode } from '@/types/query'
import QueryBuilder from '@/components/builder/QueryBuilder'
import QueryPreview from '@/components/preview/QueryPreview'
import QueryHistory from '@/components/history/QueryHistory'
import SchemaSelector from '@/components/schema/SchemaSelector'
import ClientOnly from '@/components/ui/ClientOnly'
import ShortcutsPanel from '@/components/ui/ShortcutsPanel'
import ThemeToggle from '@/components/ui/ThemeToggle'

// ============================================
// THEME CYCLE
// ============================================

const THEMES: ThemeMode[] = ['dark', 'blueprint', 'light']

// ============================================
// PAGE
// ============================================

export default function Home() {
  const { selectedSchema, setSchema } = useQueryStore()
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [showPreview, setShowPreview] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Cycle through themes
  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev)
      const next = THEMES[(idx + 1) % THEMES.length]
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePreview: () => setShowPreview(p => !p),
    onToggleHistory: () => setShowHistory(p => !p),
    onToggleTheme: handleToggleTheme,
  })

  return (
    <ClientOnly>
      <div className="circuit-bg min-h-screen flex flex-col">

        {/* ── HEADER */}
        <header
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center animate-pulse-glow"
                style={{
                  background: 'rgba(0, 212, 255, 0.12)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                }}
              >
                <Database size={14} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Query
                </span>
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Craft
                </span>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono hidden sm:block"
                style={{
                  background: 'rgba(0, 212, 255, 0.08)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  fontSize: '10px',
                }}
              >
                v1.0
              </span>
            </div>

            {/* Schema selector */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                Schema:
              </span>
              <select
                value={selectedSchema?.id ?? ''}
                onChange={e => setSchema(e.target.value)}
                className="px-3 py-1.5 rounded text-sm outline-none cursor-pointer"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                {MOCK_SCHEMAS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1.5">

              {/* Preview toggle */}
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
                  transition-all duration-200 hover:scale-105"
                style={{
                  background: showPreview
                    ? 'rgba(0, 212, 255, 0.1)'
                    : 'var(--bg-secondary)',
                  color: showPreview
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                  border: `1px solid ${showPreview
                    ? 'rgba(0, 212, 255, 0.25)'
                    : 'var(--border-primary)'}`,
                }}
                title="Toggle preview (Ctrl+Shift+P)"
              >
                <Eye size={13} />
                <span className="hidden sm:block">Preview</span>
              </button>

              {/* History toggle */}
              <button
                onClick={() => setShowHistory(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
                  transition-all duration-200 hover:scale-105"
                style={{
                  background: showHistory
                    ? 'rgba(124, 58, 237, 0.1)'
                    : 'var(--bg-secondary)',
                  color: showHistory
                    ? 'var(--accent-secondary)'
                    : 'var(--text-muted)',
                  border: `1px solid ${showHistory
                    ? 'rgba(124, 58, 237, 0.25)'
                    : 'var(--border-primary)'}`,
                }}
                title="Toggle history (Ctrl+Shift+H)"
              >
                <History size={13} />
                <span className="hidden sm:block">History</span>
              </button>

              {/* Shortcuts */}
              <button
                onClick={() => setShowShortcuts(p => !p)}
                className="p-1.5 rounded transition-all duration-200 hover:scale-105"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-primary)',
                }}
                title="Keyboard shortcuts"
              >
                <Keyboard size={13} />
              </button>

              {/* Theme toggle */}
              <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
            </div>
          </div>
        </header>

        {/* ── KEYBOARD SHORTCUTS MODAL */}
        <ShortcutsPanel
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />

        {/* ── MAIN CONTENT */}
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
          <div className="flex gap-4 items-start">

            {/* Left sidebar — schema selector */}
            <div className="w-64 shrink-0">
              <SchemaSelector />
            </div>

            {/* Query builder panel */}
            <div className="flex-1 min-w-0">
              {/* Panel header */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-1.5 h-5 rounded-full"
                  style={{ background: 'var(--accent-primary)' }}
                />
                <h2
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Query Builder
                </h2>
                {selectedSchema && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {selectedSchema.name} · {selectedSchema.fields.length} fields
                  </span>
                )}
              </div>

              <QueryBuilder />
            </div>

            {/* Preview + History sidebar */}
            {(showPreview || showHistory) && (
              <div className="w-96 shrink-0 flex flex-col gap-4">
                {showPreview && <QueryPreview />}
                <ResultsPanel />
                {showHistory && <QueryHistory />}
              </div>
            )}
          </div>
        </main>

        {/* ── FOOTER */}
        <footer
          className="border-t py-3 px-4"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              QueryCraft · Visual Query Builder
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Built with Next.js · TypeScript · Zustand
            </span>
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}