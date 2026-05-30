// components/ui/EmptyState.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = memo(({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Icon container */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <Icon
          size={22}
          style={{ color: 'var(--text-muted)', opacity: 0.6 }}
        />
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {title}
      </p>

      {/* Description */}
      {description && (
        <p
          className="text-xs mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded text-xs font-medium
            transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            color: 'var(--accent-primary)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
          }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState