"use client"

import { useEffect, useState } from "react";
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Inbox, Dog } from "lucide-react"
import { RemoveCategoryDialog } from "~/components/ui/remove-category-dialog";
import { CategorySwitcher } from "~/components/ui/category_switcher";
import { EmailItem } from '~/components/ui/email_item';
import { useEmails } from '~/components/hooks/use_emails';
import { useCategories } from '~/components/hooks/use_categories';


export default function EmailInbox() {
  // Use the custom hook to fetch emails
  const { emails, isLoading, error } = useEmails();
  const categories = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

  // Function to trigger email fetching task
  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error triggering email fetch:', error);
    }
  };

  // Trigger email fetching on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  const unreadCount = emails.length
  const filteredEmails =
    activeCategory === "all" ? emails : [];

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    )
  }

  const handleBatchAction = (action: 'read' | 'archive' | 'delete') => {
    let updatedEmails = [...emails]
    switch (action) {
      case 'read':
        updatedEmails = updatedEmails.map(email =>
          selectedEmails.includes(email.id) ? { ...email, read: true } : email
        )
        break
      case 'archive':
      case 'delete':
        updatedEmails = updatedEmails.filter(email => !selectedEmails.includes(email.id))
        break
    }
    console.log(`Updating emails with action: ${action}`, { updatedEmails });
    setSelectedEmails([])
  }
  const [categoryToRemove, setCategoryToRemove] = useState<Category | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRemoveCategory = (category: Category) => {
    if (category) {
      setCategoryToRemove(category);
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmRemove = (categoryId: string, shouldRecategorize: boolean) => {
    console.log(`Removing category: ${categoryId}`, { recategorize: shouldRecategorize });
    // Add your category removal logic here
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
      {categoryToRemove && (
        <RemoveCategoryDialog
          category={categoryToRemove}
          onConfirm={handleConfirmRemove}
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
        />
      )}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto">
        <aside className="w-56 p-3 hidden md:block h-screen">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Dog className="h-5 w-5 stroke-amber-600" />
            <h1 className="text-lg font-bold">Chompymail</h1>
          </div>
          <div className="space-y-1">
            <Button
              variant={activeCategory === "all" ? "secondary" : "ghost"}
              className="w-full justify-start cursor-pointer"
              onClick={() => setActiveCategory("all")}
            >
              <Inbox className="mr-2 h-4 w-4" />
              All Mail
              <Badge className="ml-auto" variant="secondary">
                {unreadCount}
              </Badge>
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                className="w-full cursor-pointer flex justify-between"
                onClick={() => setActiveCategory(category.id)}
              >
                <DynamicIcon name={(category.icon || "email") as any} className={`mr-2 h-4 w-4 stroke-slate-800`} />
                <div className="w-full flex"><span className='max-w-32 truncate'>{category.name}</span></div>
                <Badge
                  className="w-8 h-6 cursor-pointer group-hover:hidden"
                  variant="secondary"
                >
                  {category?.email[0].count as any}
                </Badge>
              </Button>
            ))}
            <Button
              variant={activeCategory === "none" ? "secondary" : "ghost"}
              className="w-full justify-start cursor-pointer"
              onClick={() => setActiveCategory("none")}
            >
              <Inbox className="mr-2 h-4 w-4" />
              <span className='max-w-32 truncate'>Uncategorized</span>
            </Button>
            <CategorySwitcher
              onSelect={(category) => {
                setSelectedCategory(category)
                console.log("Selected category:", category)
              }}
              categories={categories}
              modalTitle="Select category"
            />
            <div className="mt-4 w-full px-2 text-left">
              <Button variant="outline" size="sm" onClick={() => handleBatchAction('read')} className="cursor-pointer">
                <DynamicIcon name="plus" className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto border-l border-r">
          <div className="sticky top-0 z-10 p-3 border-b backdrop-blur-md bg-white/90 dark:bg-black/50 flex justify-between w-full">
            <div className="flex items-center gap-2 h-12">
              <Checkbox
                checked={selectedEmails.length === filteredEmails.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEmails(filteredEmails.map(email => email.id));
                  } else {
                    setSelectedEmails([]);
                  }
                }}
                className="h-9 w-9 mr-2 rounded-full cursor-pointer"
              />

              <Button variant="outline" disabled={selectedEmails.length == 0} size="sm" onClick={() => handleBatchAction('delete')} className="cursor-pointer">
                <DynamicIcon name="trash-2" className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" disabled={selectedEmails.length == 0} size="sm" onClick={() => handleBatchAction('read')} className="cursor-pointer" title="Use AI agent to unsubscribe">
                <DynamicIcon name="bot" className="h-4 w-4 mr-2" />
                Delete & unsub
              </Button>

            </div>
            <div className="text-sm text-muted-foreground pr-4 my-auto">
              {selectedEmails.length > 0
                ? `${selectedEmails.length} selected`
                : `${filteredEmails.length} messages`}
            </div>
          </div>

          <div className="divide-y w-full">
            {filteredEmails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                categories={categories}
                isSelected={selectedEmails.includes(email.id)}
                onSelect={toggleEmailSelection}
              />
            ))}
          </div>
        </main>

        <aside className="w-32 h-screen"></aside>
      </div >
    </div >
  )
}

