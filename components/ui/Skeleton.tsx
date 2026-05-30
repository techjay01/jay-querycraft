// components/ui/Skeleton.tsx
'use client'

import { memo } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

const Skeleton = memo(({ className, width, height }: SkeletonProps) => {
  return (
    <div
      className={clsx('rounded animate-pulse', className)}
      style={{
        width: width ?? '100%',
        height: height ?? '16px',
        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export default Skeleton