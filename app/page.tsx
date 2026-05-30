// app/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Eye,
  EyeOff,
  History,
  Keyboard,
  PanelRight,
  PanelRightClose,
} from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { MOCK_SCHEMAS } from '@/lib/schemas'
import { ThemeMode } from '@/types/query'
import QueryBuilder from '@/components/builder/QueryBuilder'
import QueryPreview from '@/components/preview/QueryPreview'
import QueryHistory from '@/components/history/QueryHistory'
import ResultsPanel from '@/components/results/ResultsPanel'
import SchemaSelector from '@/components/schema/SchemaSelector'
import ShortcutsPanel from '@/components/ui/ShortcutsPanel'
import ThemeToggle from '@/components/ui/ThemeToggle'
import StatsBar from '@/components/ui/StatsBar'

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
  const [showRightPanel, setShowRightPanel] = useState(true)

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev)
      const next = THEMES[(idx + 1) % THEMES.length]
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  useKeyboardShortcuts({
    onTogglePreview: () => setShowPreview(p => !p),
    onToggleHistory: () => setShowHistory(p => !p),
    onToggleTheme: handleToggleTheme,
  })

  return (
    <div
      className="circuit-bg min-h-screen flex flex-col"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* ── HEADER */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          borderColor: 'var(--border-primary)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="w-full px-4 lg:px-6 h-14 flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.25)',
              }}
            >
              <Database size={15} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="font-bold text-base tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Query
              </span>
              <span
                className="font-bold text-base tracking-tight"
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
                border: '1px solid rgba(0, 212, 255, 0.15)',
                fontSize: '10px',
              }}
            >
              v1.0
            </span>
          </div>

          {/* Schema selector */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <Database size={12} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedSchema?.id ?? ''}
              onChange={e => setSchema(e.target.value)}
              className="text-xs outline-none cursor-pointer bg-transparent"
              style={{ color: 'var(--text-primary)' }}
            >
              {MOCK_SCHEMAS.map(s => (
                <option
                  key={s.id}
                  value={s.id}
                  style={{ background: 'var(--bg-card)' }}
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats bar */}
          <div className="hidden lg:flex flex-1 items-center">
            <StatsBar />
          </div>

          <div className="flex-1 lg:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">

            {/* Preview toggle */}
            <button
              onClick={() => setShowPreview(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                transition-all duration-200 hover:scale-105"
              style={{
                background: showPreview
                  ? 'rgba(0, 212, 255, 0.08)'
                  : 'var(--bg-secondary)',
                color: showPreview
                  ? 'var(--accent-primary)'
                  : 'var(--text-muted)',
                border: `1px solid ${showPreview
                  ? 'rgba(0, 212, 255, 0.2)'
                  : 'var(--border-primary)'}`,
              }}
              title="Toggle preview (Ctrl+Shift+P)"
            >
              {showPreview
                ? <Eye size={13} />
                : <EyeOff size={13} />
              }
              <span className="hidden sm:block">Preview</span>
            </button>

            {/* History toggle */}
            <button
              onClick={() => setShowHistory(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                transition-all duration-200 hover:scale-105"
              style={{
                background: showHistory
                  ? 'rgba(124, 58, 237, 0.08)'
                  : 'var(--bg-secondary)',
                color: showHistory
                  ? 'var(--accent-secondary)'
                  : 'var(--text-muted)',
                border: `1px solid ${showHistory
                  ? 'rgba(124, 58, 237, 0.2)'
                  : 'var(--border-primary)'}`,
              }}
              title="Toggle history (Ctrl+Shift+H)"
            >
              <History size={13} />
              <span className="hidden sm:block">History</span>
            </button>

            {/* Right panel toggle */}
            <button
              onClick={() => setShowRightPanel(p => !p)}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-primary)',
              }}
              title="Toggle right panel"
            >
              {showRightPanel
                ? <PanelRightClose size={13} />
                : <PanelRight size={13} />
              }
            </button>

            {/* Shortcuts */}
            <button
              onClick={() => setShowShortcuts(p => !p)}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
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

      {/* ── SHORTCUTS MODAL */}
      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* ── MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR — Schema */}
        <aside
          className="hidden xl:flex flex-col w-64 shrink-0 border-r overflow-y-auto"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="p-4">
            <SchemaSelector />
          </div>
        </aside>

        {/* CENTER — Query Builder */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Panel header */}
          <div
            className="sticky top-0 z-10 flex items-center gap-3 px-4 lg:px-6 py-3 border-b"
            style={{
              background: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div
              className="w-1.5 h-5 rounded-full shrink-0"
              style={{ background: 'var(--accent-primary)' }}
            />
            <h1
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Query Builder
            </h1>
            {selectedSchema && (
              <span
                className="text-xs px-2 py-0.5 rounded-md"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {selectedSchema.name}
              </span>
            )}

            {/* Mobile schema selector */}
            <div className="ml-auto xl:hidden">
              <select
                value={selectedSchema?.id ?? ''}
                onChange={e => setSchema(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg outline-none cursor-pointer"
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
          </div>

          {/* Builder content */}
          <div className="flex-1 p-4 lg:p-6">
            <QueryBuilder />
          </div>
        </main>

        {/* RIGHT PANEL — Preview + Results + History */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="shrink-0 border-l flex flex-col overflow-hidden"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">

                {/* Preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <QueryPreview />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results — always visible */}
                <ResultsPanel />

                {/* History */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <QueryHistory />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER */}
      <footer
        className="border-t py-2.5 px-4 lg:px-6 shrink-0"
        style={{
          borderColor: 'var(--border-primary)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)', fontSize: '11px' }}
          >
            QueryCraft · Visual Query Builder
          </span>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono hidden sm:block"
              style={{ color: 'var(--text-muted)', fontSize: '11px' }}
            >
              Next.js · TypeScript · Zustand
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--accent-primary)', fontSize: '11px' }}
            >
              122 tests passing
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}