// store/historyStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import {
  QueryGroup,
  QueryHistoryEntry,
  QueryPreset,
  QueryOutputFormat,
  DataSchema,
} from '@/types/query'

// ============================================
// STORE TYPE
// ============================================

export interface HistoryStore {
  // History
  history: QueryHistoryEntry[]
  maxHistorySize: number

  // Presets
  presets: QueryPreset[]

  // Actions — history
  addToHistory: (
    query: QueryGroup,
    schema: DataSchema,
    resultCount: number,
    format: QueryOutputFormat
  ) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void

  // Actions — presets
  savePreset: (
    name: string,
    description: string,
    query: QueryGroup,
    schemaId: string
  ) => void
  deletePreset: (id: string) => void
  updatePreset: (id: string, name: string, description: string) => void
}

// ============================================
// STORE
// ============================================

export const useHistoryStore = create<HistoryStore>()(
  persist(
    immer((set) => ({
      history: [],
      maxHistorySize: 50,
      presets: [],

      // — Add to history
      addToHistory: (query, schema, resultCount, format) => {
        set(state => {
          const entry: QueryHistoryEntry = {
            id: nanoid(),
            name: `Query on ${schema.name}`,
            timestamp: Date.now(),
            query,
            schema: schema.id,
            resultCount,
            format,
          }

          // Prepend and cap at maxHistorySize
          state.history.unshift(entry)
          if (state.history.length > state.maxHistorySize) {
            state.history = state.history.slice(0, state.maxHistorySize)
          }
        })
      },

      // — Remove single history entry
      removeFromHistory: (id) => {
        set(state => {
          state.history = state.history.filter(h => h.id !== id)
        })
      },

      // — Clear all history
      clearHistory: () => {
        set(state => {
          state.history = []
        })
      },

      // — Save preset
      savePreset: (name, description, query, schemaId) => {
        set(state => {
          const preset: QueryPreset = {
            id: nanoid(),
            name,
            description,
            query,
            schemaId,
            createdAt: Date.now(),
          }
          state.presets.unshift(preset)
        })
      },

      // — Delete preset
      deletePreset: (id) => {
        set(state => {
          state.presets = state.presets.filter(p => p.id !== id)
        })
      },

      // — Update preset name/description
      updatePreset: (id, name, description) => {
        set(state => {
          const preset = state.presets.find(p => p.id === id)
          if (preset) {
            preset.name = name
            preset.description = description
          }
        })
      },
    })),
    {
      name: 'querycraft-history',
      // Only persist history and presets, not UI state
      partialize: (state) => ({
        history: state.history,
        presets: state.presets,
      }),
    }
  )
)