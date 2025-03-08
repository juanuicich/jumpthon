"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import * as LucideIcons from "lucide-react"
import { cn } from "~/lib/utils"
import { DynamicIcon } from "lucide-react/dynamic"
import { Icon } from "~/components/ui/icon"
import { iconNames } from "lucide-react/dynamic"

interface IconSelectorProps {
  selectedIcon: string
  onSelectIcon: (iconName: string) => void
}

export function IconSelector({ selectedIcon, onSelectIcon }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Filter icons based on search query
  const filteredIcons = iconNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 30);

  const sanitizedIcon = iconNames.find((name) => name === selectedIcon) || "dog";

  // Get the selected icon component
  const SelectedIcon = (LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.ElementType) || LucideIcons.Dog

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={triggerRef} variant="outline" size="icon" className="h-10 w-10" aria-label="Select icon">
          <Icon name={selectedIcon} className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5} alignOffset={-10} avoidCollisions>
        <Command className="w-[300px]">
          <CommandInput placeholder="Search icons..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-6 gap-1 p-2">
                {filteredIcons.map((name) => {
                  return (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        onSelectIcon(name)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex h-10 w-10 flex-col items-center justify-center rounded-md p-1",
                        selectedIcon === name && "bg-primary/10",
                      )}
                    >
                      <DynamicIcon name={name} className="h-5 w-5" />
                      <span className="sr-only">{name}</span>
                    </CommandItem>
                  )
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

