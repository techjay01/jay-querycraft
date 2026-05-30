// components/ui/ThemeToggle.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Layers } from 'lucide-react'
import { ThemeMode } from '@/types/query'

// ============================================
// PROPS
// ============================================

interface ThemeToggleProps {
  theme: ThemeMode
  onToggle: () => void
}

// ============================================
// THEME CONFIG
// ============================================

const THEME_CONFIG: {
  [key in ThemeMode]: { icon: React.ReactNode; label: string; color: string }
} = {
  dark: {
    icon: <Moon size={13} />,
    label: 'Circuit',
    color: 'var(--accent-primary)',
  },
  blueprint: {
    icon: <Layers size={13} />,
    label: 'Blueprint',
    color: '#2563eb',
  },
  light: {
    icon: <Sun size={13} />,
    label: 'Light',
    color: '#f59e0b',
  },
}

// ============================================
// THEME TOGGLE
// ============================================

const ThemeToggle = memo(({ theme, onToggle }: ThemeToggleProps) => {
  const config = THEME_CONFIG[theme]

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
        transition-colors duration-200"
      style={{
        background: 'var(--bg-secondary)',
        color: config.color,
        border: `1px solid var(--border-primary)`,
      }}
      title="Toggle theme (Ctrl+Shift+T)"
      aria-label={`Current theme: ${config.label}. Click to change.`}
    >
      {config.icon}
      <span className="hidden sm:block">{config.label}</span>
    </motion.button>
  )
})

ThemeToggle.displayName = 'ThemeToggle'

export default ThemeToggle