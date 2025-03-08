"use client"

import { useState, useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"

type ShortcutCategory = {
  name: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

type ShortcutHandlers = {
  [key: string]: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  // Define the keyboard shortcuts
  const shortcuts: ShortcutCategory[] = [
    {
      name: "Navigation",
      shortcuts: [
        { keys: ["j", "↑"], description: "Previous email" },
        { keys: ["k", "↓"], description: "Next email" },
        { keys: ["Enter"], description: "Open email" },
      ],
    },
    {
      name: "Selection",
      shortcuts: [
        { keys: ["Space", "x"], description: "Select email" },
        { keys: ["a"], description: "Select all emails" },
        { keys: ["c"], description: "Select category" },
        { keys: ["A"], description: "Select account" },
      ],
    },
    {
      name: "Actions",
      shortcuts: [
        { keys: ["⌘ U", "Ctrl U"], description: "Unsubscribe from email" },
        { keys: ["⌘ ⌫", "Ctrl ⌫"], description: "Delete email" },
      ],
    },
  ]

  // Register the keyboard shortcut to open the modal
  useHotkeys("?", (event) => {
    // Only prevent default if we're not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }
    event.preventDefault()
    handlers["openModal"]?.()
  })

  // Register all the other keyboard shortcuts
  useHotkeys("j, up", (event) => {
    event.preventDefault()
    handlers["previousEmail"]?.()
  })

  useHotkeys("k, down", (event) => {
    event.preventDefault()
    handlers["nextEmail"]?.()
  })

  useHotkeys("space", (event) => {
    // Only prevent default if we're not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }
    event.preventDefault()
    handlers["selectEmail"]?.()
  })

  useHotkeys("a", (event) => {
    // Only prevent default if we're not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }
    event.preventDefault()
    handlers["selectAllEmails"]?.()
  })

  useHotkeys("enter", (event) => {
    // Only prevent default if we're not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }
    event.preventDefault()
    handlers["openEmail"]?.()
  })

  useHotkeys(["command+u", "ctrl+u"], (event) => {
    event.preventDefault()
    handlers["unsubscribeEmail"]?.()
  })

  useHotkeys(["command+backspace", "ctrl+backspace"], (event) => {
    event.preventDefault()
    handlers["deleteEmail"]?.()
  })

  useHotkeys("c", (event) => {
    // Only prevent default if we're not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }
    event.preventDefault()
    handlers["selectCategory"]?.()
  })

  useHotkeys(["A"], (event) => {
    // Don't prevent default here as it's a common shortcut for selecting all text
    // Only handle if we're not in an input field
    if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault()
      handlers["selectAccount"]?.()
    }
  })

  return {
    shortcuts,
  }
}

