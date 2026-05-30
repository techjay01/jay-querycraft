// components/ui/ClientOnly.tsx
'use client'

import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

export default function ClientOnly({
  children,
}: {
  children: React.ReactNode
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (!mounted) return null

  return <>{children}</>
}