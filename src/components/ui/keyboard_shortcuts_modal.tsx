"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { KeySquare } from "lucide-react"

type ShortcutCategory = {
  name: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

type KeyboardShortcutsModalProps = {
  isOpen: boolean
  onClose?: () => void
  shortcuts: ShortcutCategory[]
}

export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh]">
        <DialogHeader className="flex flex-row items-center gap-2">
          <KeySquare className="h-5 w-5" />
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="pr-4 max-h-[calc(85vh-120px)]">
          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.name} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">{category.name}</h3>
                <div className="space-y-1.5">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            {keyIndex > 0 && <span className="mx-1 text-muted-foreground">or</span>}
                            <KeyboardKey>{key}</KeyboardKey>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs font-medium">
      {children}
    </kbd>
  )
}

