"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { IconSelector } from "~/components/ui/icon_selector"

interface CategoryModalProps {
  onSubmit?: (data: CategoryFormData) => void
}

export interface CategoryFormData {
  category_name: string,
  category_description: string,
  category_icon: string,
  recategorize: boolean
}

export function AddCategoryModal({ onSubmit }: CategoryModalProps) {
  const emptyState = {
    category_name: "",
    category_description: "",
    category_icon: "dog",
    recategorize: false,
  };

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>(emptyState)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIconChange = (iconName: string) => {
    setFormData((prev) => ({ ...prev, category_icon: iconName }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData(emptyState);
    setOpen(false);
  }

  const onOpenChange = () => {
    setOpen(!open);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">Add New Category</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for organizing your content.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="category_name"
                  name="category_name"
                  minLength={1}
                  value={formData.category_name}
                  onChange={handleChange}
                  className="flex-1"
                  autoComplete="off"
                  required
                />
                {false && <IconSelector selectedIcon={formData.category_icon} onSelectIcon={handleIconChange} />}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="category_description" className="text-right">
                Description
              </Label>
              <Textarea
                id="category_description"
                name="category_description"
                value={formData.category_description}
                onChange={handleChange}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1" />
              <div className="col-span-3 flex flex-row space-x-2">
                <Input
                  type="checkbox"
                  id="recategorize"
                  name="recategorize"
                  checked={formData.recategorize}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recategorize: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="recategorize">
                  Recategorize all emails?
                </Label>
              </div>
            </div>
            <input type="hidden" name="category_icon" value={formData.category_icon} />
          </div>
          <DialogFooter>
            <Button type="submit" className="cursor-pointer">Save Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

