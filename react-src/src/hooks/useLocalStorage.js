import { useState } from 'react'

// For simple string values (draft fields)
export function useDraftField(key, defaultValue = '') {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? defaultValue)

  const set = (newValue) => {
    setValue(newValue)
    localStorage.setItem(key, newValue)
  }

  return [value, set]
}

// For JSON values (saved prompts array)
export function useJsonStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = (newValue) => {
    setValue(newValue)
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch {}
  }

  return [value, set]
}
