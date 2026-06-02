// app/page.tsx
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun, ChevronDown } from 'lucide-react'
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
        <div className="h-16 max-w-350 mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between flex-wrap gap-2">

          {/* Logo */}
          <div className="flex items-center gap-3 -mt-0.5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm"
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
                className="font-bold text-[20px] tracking-tight"
                style={{ color: 'var(--text)' }}
              >
                QueryCraft
              </div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontSize: '9px' }}
              >
                Filters like a pro
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              
              {/* Schema selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs uppercase tracking-wider hidden sm:block"
                  style={{ color: 'var(--text-muted)' }}>
                  Source
                </span>

                <div className="relative group">
                  <select
                    value={selectedSchema?.id ?? ''}
                    onChange={e => setSchema(e.target.value)}
                    className="
                      w-full px-3 py-1.5 pr-8 rounded text-xs uppercase tracking-wider
                      border border-(--border)
                      bg-(--bg-input)
                      text-(--text)
                      font-mono
                      cursor-pointer
                      transition-all duration-200
                      hover:border-(--border-light)
                      focus:border-(--accent)
                      focus:outline-none
                      "
                    style={{
                      border: '1px solid var(--border)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {MOCK_SCHEMAS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <div
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                      transition-colors duration-200
                      text-(--text-muted)
                      group-hover:text-(--text)
                    "
                  >
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className="w-px h-5" style={{ background: 'var(--border)' }} />

              <button
                onClick={() => {
                  setShowHistory(p => !p)
                  setShowMobileMenu(false)
                }}
                className="px-3 py-1.5 rounded text-xs uppercase tracking-wider border transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: showHistory
                    ? 'var(--accent-subtle)'
                    : 'transparent',
                  color: showHistory
                    ? 'var(--accent)'
                    : 'var(--text-muted)',
                  border: `1px solid ${
                    showHistory ? 'var(--accent-border)' : 'var(--border)'
                  }`,
                }}
                onMouseEnter={(e) => {
                  if (!showHistory) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showHistory) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                  }
                }}
              >
                History
              </button>

              <button
                onClick={() => {
                  setShowShortcuts(p => !p)
                  setShowMobileMenu(false)
                }}
                className="px-3 py-1.5 rounded text-xs uppercase tracking-wider border transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                }}
              >
                Shortcuts
              </button>

              <button
                onClick={() => {
                  handleToggleTheme()
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded flex items-center justify-center border transition-all duration-200 active:scale-[0.95]"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                }}
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>

            {/* Mobile hamburger (ALWAYS visible on mobile) */}
            <button
              onClick={() => setShowMobileMenu(p => !p)}
              className="block sm:hidden w-8 h-8 flex items-center justify-center border border-(--border) rounded transition-all duration-200 hover:bg-(--bg-hover) hover:text-(--text) active:scale-[0.95]"
            >
              ☰
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
        <div className="max-w-350 mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 py-2">
            <StatsBar />
          </div>
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
          className="py-16"
        >
          <div className="max-w-350 mx-auto px-6 lg:px-12">
            {/* ── TOP ROW: EDITOR + PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-start">

              {/* EDITOR */}
              <div>
                <div className="mb-4">
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
                    Build recursive functions to handle complex data filtering.
                  </p>
                </div>
                <QueryBuilder />
              </div>

              {/* PREVIEW */}
              <div className="flex flex-col" style={{ height: '100%' }}>
                <div className="mb-4">
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
              className="my-10"
              style={{
                height: '1px',
                background: 'var(--border)',
              }}
            />

            {/* ── INSPECTION */}
            <div className="mb-12">
              <h2
                className="text-xl font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text)' }}
              >
                Inspection
              </h2>
              <p
                className="text-xs mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                Test query on simulated data.
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
                  className="mb-12"
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
        <div className="max-w-350 mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Query Craft · Filters like a pro
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--accent)' }}
            >
              Jay Tech © 2026
            </span>
          </div>
        </div>
      </footer>
      
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 sm:hidden">
          
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-70 bg-(--bg-surface) border-l border-(--border) p-4 flex flex-col gap-4">
          
            <div className="flex items-center justify-between mb-2">
              <div
                className="px-3 text-xs uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Menu
              </div>

              <button
                onClick={() => setShowMobileMenu(false)}
                className="
                  w-8 h-8 flex items-center justify-center rounded
                  border border-(--border)
                  transition-all duration-200
                  hover:bg-(--bg-hover)
                  active:scale-[0.95]
                "
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Source */}
            <div className="relative group rounded">
              <select
                value={selectedSchema?.id ?? ''}
                onChange={e => setSchema(e.target.value)}
                className="
                  w-full px-3 py-2 pr-8
                  rounded text-xs uppercase tracking-wider
                  border border-(--border)
                  bg-(--bg-input)
                  text-(--text)
                  font-mono
                  cursor-pointer
                  transition-all duration-200

                  hover:border-(--border-light)
                  active:scale-[0.99]

                  focus:border-(--accent)
                  focus:outline-none
                "
              >
                {MOCK_SCHEMAS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  pointer-events-none
                  text-(--text-muted)
                  transition-colors duration-200
                  group-hover:text-(--text)
                "
              >
                <ChevronDown size={14} />
              </div>
            </div>

            <button
              onClick={() => {
                setShowHistory(p => !p)
                setShowMobileMenu(false)
              }}
              className="
                text-left w-full px-3 py-2 rounded text-xs uppercase tracking-wider
                border border-transparent
                transition-all duration-200
                hover:bg-(--bg-hover)
                hover:border-(--border)
                active:scale-[0.98]
              "
            >
              History
            </button>

            <button
              onClick={() => {
                setShowShortcuts(p => !p)
                setShowMobileMenu(false)
              }}
              className="
                text-left w-full px-3 py-2 rounded text-xs uppercase tracking-wider
                border border-transparent
                transition-all duration-200
                hover:bg-(--bg-hover)
                hover:border-(--border)
                active:scale-[0.98]
              "
            >
              Shortcuts
            </button>

            <button
              onClick={() => {
                handleToggleTheme()
                setShowMobileMenu(false)
              }}
              className="
                text-left w-full px-3 py-2 rounded text-xs uppercase tracking-wider
                border border-transparent
                transition-all duration-200
                hover:bg-(--bg-hover)
                hover:border-(--border)
                active:scale-[0.98]
              "
            >
              Toggle Theme
            </button>
          </div>
        </div>
      )}

    </div>
  )
}