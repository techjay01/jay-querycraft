// components/ui/Select.tsx
'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  accentSelected?: boolean
}

const Select = memo(({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  accentSelected = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  // Calculate dropdown position
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Update position on scroll/resize
  useEffect(() => {
    if (open) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [open])

  const handleOpen = () => {
    updatePosition()
    setOpen(p => !p)
  }

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2
          rounded text-xs transition-all duration-150 text-left"
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          color: selected
            ? accentSelected ? 'var(--accent)' : 'var(--text)'
            : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontWeight: selected && accentSelected ? '600' : '400',
        }}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={11}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {/* Dropdown — rendered in portal */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            minWidth: '160px',
          }}
        >
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between gap-2
                  px-3 py-2 text-xs text-left transition-colors duration-100"
                style={{
                  background: opt.value === value
                    ? 'var(--accent-subtle)'
                    : 'transparent',
                  color: opt.value === value
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
                onMouseEnter={e => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
                  <Check size={10} style={{ flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
})

Select.displayName = 'Select'

export default Select