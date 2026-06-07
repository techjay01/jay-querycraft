// components/preview/QueryPreview.tsx
'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useQueryBuilder } from '@/hooks/useQueryBuilder'
import { QueryOutputFormat } from '@/types/query'

// ============================================
// FORMAT TABS
// ============================================

const FORMAT_TABS: { value: QueryOutputFormat; label: string }[] = [
  { value: 'sql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'graphql', label: 'GraphQL' },
]

// ============================================
// COPY BUTTON
// ============================================

const CopyButton = memo(({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs
        uppercase tracking-wider transition-colors duration-150"
      style={{
        background: copied ? 'var(--accent-subtle)' : 'var(--bg-input)',
        color: copied ? 'var(--accent)' : 'var(--text-muted)',
        border: `1px solid ${copied ? 'var(--accent-border)' : 'var(--border)'}`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
})

CopyButton.displayName = 'CopyButton'

// ============================================
// SYNTAX HIGHLIGHT
// ============================================

const highlight = (code: string, format: QueryOutputFormat): string => {
  if (format === 'sql') {
    return code
      .replace(
        /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|TRUE|FALSE|REGEXP)\b/g,
        '<span style="color:var(--accent);font-weight:bold;">$1</span>'
      )
      .replace(/`([^`]+)`/g, '<span style="color:#93c5fd;">$&</span>')
      .replace(/'([^']*)'/g, '<span style="color:var(--success);">$&</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f9a8d4;">$1</span>')
  }

  if (format === 'mongodb') {
    return code
      .replace(
        /"\$[a-zA-Z]+"/g,
        '<span style="color:var(--accent);font-weight:bold;">$&</span>'
      )
      .replace(/"([^$"][^"]*)"\s*:/g, '<span style="color:#93c5fd;">$&</span>')
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:var(--success);">$&</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#f9a8d4;">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color:var(--accent);">$1</span>')
  }

  if (format === 'graphql') {
    return code
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=:)/g, '<span style="color:#93c5fd;">$1</span>')
      .replace(
        /\b(query|mutation|filter|and|or|items|totalCount)\b/g,
        '<span style="color:var(--accent);font-weight:bold;">$1</span>'
      )
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:var(--success);">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#f9a8d4;">$1</span>')
  }

  return code
}

// ============================================
// QUERY PREVIEW
// ============================================

const QueryPreview = memo(() => {
  const { outputFormat, setOutputFormat, isDirty } = useQueryStore()
  const { getCurrentOutput } = useQueryBuilder()

  const currentOutput = getCurrentOutput(outputFormat)
  const outputString = typeof currentOutput === 'string'
    ? currentOutput
    : JSON.stringify(currentOutput, null, 2)

  const highlighted = highlight(outputString, outputFormat)

  return (
    <div
        className="rounded-lg border overflow-hidden flex flex-col h-full"
        style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
        }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold leading-none tracking-tight"
            style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
            }}
            >
            {'</>'}
          </div>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text)' }}
          >
            Live Output
          </span>
          {isDirty && (
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--accent)', fontSize: '9px' }}
            >
              ● live
            </span>
          )}
        </div>
        <CopyButton text={outputString} />
      </div>

      {/* Format tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {FORMAT_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setOutputFormat(tab.value)}
            className="flex-1 py-2.5 text-xs uppercase tracking-wider font-medium transition-all duration-150 rounded-md mx-1 my-1"
            style={{
                color:
                outputFormat === tab.value
                    ? 'var(--accent-fg)'
                    : 'var(--text-muted)',
                background:
                outputFormat === tab.value
                    ? 'var(--accent)'
                    : 'transparent',
                fontFamily: 'var(--font-mono)',
            }}
            >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code output */}
      <AnimatePresence mode="wait">
        <motion.div
          key={outputFormat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="flex-1"
        >
          {!isDirty ? (
            <div
              className="py-12 text-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Add conditions to see output
            </div>
          ) : (
            <pre
                className="p-6 text-xs overflow-auto leading-relaxed"
                style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    minHeight: '200px',
                    maxHeight: '600px',
                    tabSize: 2,
                }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats */}
      {isDirty && (
        <div
          className="flex items-center justify-between px-4 py-2 border-t text-xs mt-auto"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
            fontSize: '10px',
          }}
        >
          <span>{outputString.split('\n').length} lines · {outputString.length} chars</span>
          <span
            className="uppercase tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            {outputFormat}
          </span>
        </div>
      )}
    </div>
  )
})

QueryPreview.displayName = 'QueryPreview'

export default QueryPreview