// app/page.tsx
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { MOCK_SCHEMAS } from '@/lib/schemas'
import { useQueryStore } from '@/store/queryStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ThemeMode } from '@/types/query'
import QueryBuilder from '@/components/builder/QueryBuilder'
import QueryPreview from '@/components/preview/QueryPreview'
import ResultsPanel from '@/components/results/ResultsPanel'
import QueryHistory from '@/components/history/QueryHistory'
import ShortcutsPanel from '@/components/ui/ShortcutsPanel'
import StatsBar from '@/components/ui/StatsBar'

export default function Home() {
  const { selectedSchema, setSchema } = useQueryStore()
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  useKeyboardShortcuts({
    onToggleHistory: () => setShowHistory(p => !p),
    onToggleTheme: handleToggleTheme,
  })

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── HEADER */}
      <header
        className="border-b shrink-0 sticky top-0 z-50"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="h-16 flex items-center justify-between w-full"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}
        >

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            >
              <Image
                src="/querycraft.svg"
                alt="QueryCraft Logo"
                width={80}
                height={80}
              />
            </div>
            <div>
              <div
                className="font-bold text-sm tracking-tight"
                style={{ color: 'var(--text)' }}
              >
                QueryCraft
              </div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontSize: '9px' }}
              >
                Query Engine v1.0
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Schema selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs uppercase tracking-wider hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                Source
              </span>
              <select
                value={selectedSchema?.id ?? ''}
                onChange={e => setSchema(e.target.value)}
                className="px-3 py-1.5 rounded text-xs uppercase tracking-wider"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {MOCK_SCHEMAS.map(s => (
                  <option key={s.id} value={s.id}
                    style={{ background: 'var(--bg-card)' }}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="w-px h-5" style={{ background: 'var(--border)' }} />

            <button
              onClick={() => setShowHistory(p => !p)}
              className="px-3 py-1.5 rounded text-xs uppercase tracking-wider
                transition-colors duration-150"
              style={{
                background: showHistory ? 'var(--accent-subtle)' : 'transparent',
                color: showHistory ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${showHistory ? 'var(--accent-border)' : 'var(--border)'}`,
              }}
            >
              History
            </button>

            <button
              onClick={() => setShowShortcuts(p => !p)}
              className="px-3 py-1.5 rounded text-xs uppercase tracking-wider
                transition-colors duration-150"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Shortcuts
            </button>

            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded flex items-center justify-center
                transition-colors duration-150"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
              title="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={13} />
                : <Moon size={13} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── STATS BAR */}
      <div
        className="border-b shrink-0"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center gap-4 py-2"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 48px' }}
        >
          <StatsBar />
        </div>
      </div>

      {/* ── SHORTCUTS MODAL */}
      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* ── MAIN CONTENT */}
      <main className="flex-1">
        <div
          className="w-full py-14"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 48px' }}
        >

          {/* ── TOP ROW: EDITOR + PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

            {/* EDITOR */}
            <div>
              <div className="mb-6">
                <h2
                  className="text-xl font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  Editor
                </h2>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Construct recursive logic for complex data filtering.
                </p>
              </div>
              <QueryBuilder />
            </div>

            {/* PREVIEW */}
            <div>
              <div className="mb-6">
                <h2
                  className="text-xl font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  Preview
                </h2>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Generated syntax output.
                </p>
              </div>
              <QueryPreview />
            </div>
          </div>

          {/* Divider */}
          <div
            className="mb-12"
            style={{
              height: '1px',
              background: 'var(--border)',
            }}
          />

          {/* ── INSPECTION */}
          <div className="mb-8">
            <h2
              className="text-xl font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text)' }}
            >
              Inspection
            </h2>
            <p
              className="text-xs mb-8"
              style={{ color: 'var(--text-muted)' }}
            >
              Validate your query against live simulated data.
            </p>
            <ResultsPanel />
          </div>

          {/* ── HISTORY */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-8"
              >
                <div
                  className="mb-5"
                  style={{
                    height: '1px',
                    background: 'var(--border)',
                  }}
                />
                <h2
                  className="text-lg font-bold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  History
                </h2>
                <p
                  className="text-xs mb-6"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Previously executed queries and saved presets.
                </p>
                <QueryHistory />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* ── FOOTER */}
      <footer
        className="border-t py-4"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          className="flex items-center justify-between w-full"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}
        >
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            High Precision Query Builder · Built for Performance
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--accent)' }}
          >
            122 tests passing
          </span>
        </div>
      </footer>
    </div>
  )
}