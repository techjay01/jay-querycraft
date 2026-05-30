// components/preview/QueryPreview.tsx
'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Code2, RefreshCw } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useQueryBuilder } from '@/hooks/useQueryBuilder'
import { QueryOutputFormat } from '@/types/query'
import { clsx } from 'clsx'

// ============================================
// FORMAT TAB
// ============================================

const FORMAT_TABS: { value: QueryOutputFormat; label: string; color: string }[] = [
  { value: 'sql', label: 'SQL', color: 'var(--accent-primary)' },
  { value: 'mongodb', label: 'MongoDB', color: 'var(--accent-success)' },
  { value: 'graphql', label: 'GraphQL', color: '#f472b6' },
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
        transition-all duration-200 hover:scale-105"
      style={{
        background: copied
          ? 'rgba(16, 185, 129, 0.1)'
          : 'var(--bg-tertiary)',
        color: copied
          ? 'var(--accent-success)'
          : 'var(--text-muted)',
        border: `1px solid ${copied
          ? 'rgba(16, 185, 129, 0.25)'
          : 'var(--border-primary)'}`,
      }}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
})

CopyButton.displayName = 'CopyButton'

// ============================================
// SYNTAX HIGHLIGHTER — lightweight, no deps
// ============================================

const highlight = (code: string, format: QueryOutputFormat): string => {
  if (format === 'sql') {
    return code
      .replace(
        /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|TRUE|FALSE|REGEXP)\b/g,
        '<span style="color: var(--accent-primary); font-weight: 600;">$1</span>'
      )
      .replace(
        /`([^`]+)`/g,
        '<span style="color: #f472b6;">$&</span>'
      )
      .replace(
        /'([^']*)'/g,
        '<span style="color: var(--accent-success);">$&</span>'
      )
      .replace(
        /\b(\d+\.?\d*)\b/g,
        '<span style="color: var(--accent-warning);">$1</span>'
      )
  }

  if (format === 'mongodb') {
    return code
      .replace(
        /"\$[a-zA-Z]+"/g,
        '<span style="color: var(--accent-primary); font-weight: 600;">$&</span>'
      )
      .replace(
        /"([^$"][^"]*)"\s*:/g,
        '<span style="color: #f472b6;">$&</span>'
      )
      .replace(
        /:\s*"([^"]*)"/g,
        ': <span style="color: var(--accent-success);">$&</span>'
      )
      .replace(
        /:\s*(\d+\.?\d*)/g,
        ': <span style="color: var(--accent-warning);">$1</span>'
      )
      .replace(
        /\b(true|false|null)\b/g,
        '<span style="color: var(--accent-secondary);">$1</span>'
      )
  }

  if (format === 'graphql') {
    return code
      .replace(
        /\b(query|mutation|filter|and|or|items|totalCount)\b/g,
        '<span style="color: var(--accent-primary); font-weight: 600;">$1</span>'
      )
      .replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=:)/g,
        '<span style="color: #f472b6;">$1</span>'
      )
      .replace(
        /:\s*"([^"]*)"/g,
        ': <span style="color: var(--accent-success);">"$1"</span>'
      )
      .replace(
        /:\s*(\d+\.?\d*)/g,
        ': <span style="color: var(--accent-warning);">$1</span>'
      )
      .replace(
        /\b(true|false|null)\b/g,
        '<span style="color: var(--accent-secondary);">$1</span>'
      )
  }

  return code
}

// ============================================
// QUERY PREVIEW — MAIN COMPONENT
// ============================================

const QueryPreview = memo(() => {
  const { outputFormat, setOutputFormat, isDirty } = useQueryStore()
  const { getCurrentOutput } = useQueryBuilder()

  const currentOutput = getCurrentOutput(outputFormat)
  const outputString = typeof currentOutput === 'string'
    ? currentOutput
    : JSON.stringify(currentOutput, null, 2)

  const highlighted = highlight(outputString, outputFormat)

  const isEmpty = !isDirty && outputString.includes('SELECT *\nFROM records')
    || outputString === '{}'
    || outputString === 'query {\n  recordsList {\n    items { id }\n  }\n}'

  return (
    <div
      className="flex flex-col rounded-lg border overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <Code2 size={13} style={{ color: 'var(--accent-primary)' }} />
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Query Preview
        </span>

        {isDirty && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--accent-warning)', fontSize: '10px' }}
          >
            <RefreshCw size={9} className="animate-spin" />
            live
          </span>
        )}

        <div className="flex-1" />
        <CopyButton text={outputString} />
      </div>

      {/* Format tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        {FORMAT_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setOutputFormat(tab.value)}
            className={clsx(
              'flex-1 py-2 text-xs font-mono font-semibold transition-all duration-200',
            )}
            style={{
              color: outputFormat === tab.value
                ? tab.color
                : 'var(--text-muted)',
              background: outputFormat === tab.value
                ? `${tab.color}10`
                : 'transparent',
              borderBottom: outputFormat === tab.value
                ? `2px solid ${tab.color}`
                : '2px solid transparent',
            }}
            aria-pressed={outputFormat === tab.value}
            aria-label={`Switch to ${tab.label} format`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code output */}
      <AnimatePresence mode="wait">
        <motion.div
          key={outputFormat}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="relative flex-1"
        >
          {isEmpty ? (
            <div
              className="flex flex-col items-center justify-center py-10 px-4 text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <Code2 size={24} className="mb-2 opacity-30" />
              <p className="text-xs">
                Add conditions to see the generated query
              </p>
            </div>
          ) : (
            <pre
              className="p-4 text-xs overflow-auto font-mono leading-relaxed"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                maxHeight: '320px',
                tabSize: 2,
              }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
              aria-label={`Generated ${outputFormat.toUpperCase()} query`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats bar */}
      {isDirty && (
        <div
          className="flex items-center gap-3 px-3 py-1.5 border-t text-xs"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-muted)',
            fontSize: '10px',
          }}
        >
          <span>{outputString.split('\n').length} lines</span>
          <span>{outputString.length} chars</span>
          <div className="flex-1" />
          <span
            className="font-mono"
            style={{ color: 'var(--accent-primary)' }}
          >
            {outputFormat.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
})

QueryPreview.displayName = 'QueryPreview'

export default QueryPreview