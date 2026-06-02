// app/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Database, Zap, GitBranch, Code2, Shield, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: GitBranch,
    title: 'Recursive Nesting',
    desc: 'Build unlimited nested condition groups with AND/OR logic.',
  },
  {
    icon: Code2,
    title: 'Multi-Format Output',
    desc: 'Generate SQL, MongoDB and GraphQL queries simultaneously.',
  },
  {
    icon: Zap,
    title: 'Live Preview',
    desc: 'Query output updates in real time as you build conditions.',
  },
  {
    icon: Database,
    title: 'Schema-Driven',
    desc: 'UI adapts dynamically based on your selected data source.',
  },
  {
    icon: BarChart3,
    title: 'Query Execution',
    desc: 'Filter live simulated datasets and inspect results instantly.',
  },
  {
    icon: Shield,
    title: 'Validation Engine',
    desc: 'Prevents invalid queries with inline error surfacing.',
  },
]

const highlights = [
  '122 tests passing',
  'Drag and drop reordering',
  'Import / Export JSON',
  'Query history and presets',
  'Dark and light mode',
  'Keyboard shortcuts',
]

export default function Landing() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between h-14"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}
        >
          <div className="flex items-center gap-3">
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
              <div className="font-bold text-[20px]" style={{ color: 'var(--text)' }}>
                QueryCraft
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                Query Engine v1.0
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/builder')}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs
              font-bold uppercase tracking-wider transition-all duration-150
              hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            Launch Builder
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs
            uppercase tracking-wider mb-8"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          Visual Query Builder
        </div>

        {/* Title */}
        <h1
          className="font-bold uppercase tracking-tight mb-6"
          style={{ color: 'var(--text)', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
        >
          Build Complex Queries.
          <br />
          <span style={{ color: 'var(--accent)' }}>Visually.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm mb-10 leading-relaxed"
          style={{ color: 'var(--text-muted)', maxWidth: '520px' }}
        >
          Construct recursive database queries through a graphical interface.
          No raw syntax required. Supports SQL, MongoDB and GraphQL output.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => router.push('/builder')}
            className="flex items-center gap-2 px-6 py-3 rounded text-sm
              font-bold uppercase tracking-wider transition-all duration-150
              hover:opacity-90 hover:scale-105"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            Start Building
            <ArrowRight size={14} />
          </button>

          <a
            href="https://github.com/techjay01/jay-querycraft"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded text-sm
              font-bold uppercase tracking-wider transition-all duration-150"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 48px' }} />

      {/* Features */}
      <section className="py-20 px-6">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2
            className="text-xs uppercase tracking-widest text-center mb-12"
            style={{ color: 'var(--text-muted)' }}
          >
            Everything you need
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="p-6 rounded-lg border"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                  }}
                >
                  <f.icon size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 48px' }} />

      {/* Highlights */}
      <section className="py-16 px-6">
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
          {highlights.map(h => (
            <div
              key={h}
              className="flex items-center gap-2 text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              <CheckCircle size={13} style={{ color: 'var(--accent)' }} />
              {h}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
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
    </div>
  )
}