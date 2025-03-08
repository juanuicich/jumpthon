"use client"

import { useState, useEffect, useRef } from "react"
import Fuse from "fuse.js"
import { Command } from "cmdk"
import { Icon } from "~/components/ui/icon";
import { Search, ChevronsUpDown } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

interface CategorySwitcherProps {
  onSelect?: (category: Category) => void
  open?: boolean,
  categories: Category[],
  modalTitle?: string
  placeholder?: string
}

export function CategorySwitcher({
  onSelect,
  categories,
  modalTitle = "Select a category",
  placeholder = "Search categories...",
  open = false,
}: CategorySwitcherProps) {
  const [isOpen, setOpen] = useState(open)
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(
    [...categories].sort((a, b) => a.name.localeCompare(b.name)),
  )
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize fuse for fuzzy search
  const fuse = new Fuse(categories, {
    keys: ["name", "description"],
    threshold: 0.3,
    includeScore: true,
  })

  // Filter and sort categories based on search query
  useEffect(() => {
    if (!query) {
      setFilteredCategories([...categories].sort((a, b) => a.name.localeCompare(b.name)))
      return
    }

    const results = fuse.search(query)
    const filtered = results.map((result) => result.item)
    setFilteredCategories(filtered)
  }, [query, fuse, categories])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery("")
    }
  }, [isOpen])

  const handleSelect = (category: Category) => {
    setSelectedCategory(category)
    onSelect?.(category)
    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Command.Item
                  key={category.id}
                  value={category.id}
                  onSelect={() => handleSelect(category)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer",
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                    <Icon name={category.icon} />
                  </span>
                  <div className="flex flex-col">
                    <span>{category.name}</span>
                    {category.description && (
                      <span className="text-xs text-muted-foreground">{category.description}</span>
                    )}
                  </div>
                </Command.Item>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">No categories found.</div>
            )}
          </Command.List>
        </Command>
        <div className="text-xs text-muted-foreground mt-2">
          <span className="inline-block mr-4">↑↓ to navigate</span>
          <span className="inline-block mr-4">↵ to select</span>
          <span className="inline-block">esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

