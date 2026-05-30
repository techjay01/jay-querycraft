// components/ui/Badge.tsx
'use client'

import { memo } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning' | 'accent' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
}

const VARIANT_STYLES = {
  default: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-primary)',
  },
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--accent-success)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--accent-error)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--accent-warning)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  accent: {
    background: 'rgba(0, 212, 255, 0.1)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(0, 212, 255, 0.25)',
  },
  secondary: {
    background: 'rgba(124, 58, 237, 0.1)',
    color: 'var(--accent-secondary)',
    border: '1px solid rgba(124, 58, 237, 0.25)',
  },
}

const Badge = memo(({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded font-mono font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      style={VARIANT_STYLES[variant]}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge