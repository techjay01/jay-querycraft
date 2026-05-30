// components/ui/ShortcutsPanel.tsx
'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'

// ============================================
// PROPS
// ============================================

interface ShortcutsPanelProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================
// SHORTCUTS DATA
// ============================================

const SHORTCUT_GROUPS = [
  {
    title: 'Query Actions',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Execute query' },
      { keys: ['Ctrl', '⇧', 'R'], description: 'Reset query' },
      { keys: ['Ctrl', '⇧', 'V'], description: 'Validate query' },
    ],
  },
  {
    title: 'UI Controls',
    shortcuts: [
      { keys: ['Ctrl', '⇧', 'P'], description: 'Toggle preview panel' },
      { keys: ['Ctrl', '⇧', 'H'], description: 'Toggle history panel' },
      { keys: ['Ctrl', '⇧', 'M'], description: 'Cycle themes' },
    ],
  },
  {
    title: 'Builder',
    shortcuts: [
      { keys: ['Drag'], description: 'Reorder conditions' },
      { keys: ['Click AND/OR'], description: 'Toggle logical operator' },
      { keys: ['▶'], description: 'Collapse/expand group' },
    ],
  },
]

// ============================================
// SHORTCUTS PANEL
// ============================================

const ShortcutsPanel = memo(({ isOpen, onClose }: ShortcutsPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              z-50 w-full max-w-md rounded-xl border shadow-2xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <Keyboard
                size={14}
                style={{ color: 'var(--accent-primary)' }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Keyboard Shortcuts
              </span>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="p-1 rounded transition-all duration-200 hover:scale-110"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.color = 'var(--accent-error)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
                aria-label="Close shortcuts panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Shortcut groups */}
            <div className="p-4 flex flex-col gap-4">
              {SHORTCUT_GROUPS.map(group => (
                <div key={group.title} className="flex flex-col gap-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {group.shortcuts.map(shortcut => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between"
                      >
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map(key => (
                            <kbd
                              key={key}
                              className="px-2 py-0.5 rounded text-xs font-mono"
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                color: 'var(--text-secondary)',
                                fontSize: '11px',
                              }}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-3 border-t rounded-b-xl"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--bg-secondary)',
              }}
            >
              <p
                className="text-xs text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                Press{' '}
                <kbd
                  className="px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    fontSize: '10px',
                  }}
                >
                  Esc
                </kbd>{' '}
                to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

ShortcutsPanel.displayName = 'ShortcutsPanel'

export default ShortcutsPanel