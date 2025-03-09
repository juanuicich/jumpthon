"use client"

import { useEffect, useState } from "react";
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Inbox, Dog } from "lucide-react"
import { EmailItem } from '~/components/ui/email_item';
import { Icon } from "~/components/ui/icon";
import { AddCategoryModal } from "~/components/ui/add_category_modal";
import { RemoveCategoryModal } from "~/components/ui/remove_category_modal";
import { useEmails } from '~/components/hooks/use_emails';
import { useCategories } from '~/components/hooks/use_categories';


export default function EmailInbox() {
  // Use the custom hook to fetch emails
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const categories = useCategories();
  const { emails, isLoading, error } = useEmails({ categoryId: selectedCategory });

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      setActiveCategory(category || null);
    } else {
      setActiveCategory(null);
    }
  }, [selectedCategory, categories]);


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

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
      <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
        <aside className="w-56 p-3 hidden md:block h-screen flex-none">
          <div className="h-full w-full flex justify-between flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Dog className="h-5 w-5 stroke-amber-600" />
              <h1 className="text-lg font-bold">Chompymail</h1>
            </div>
            <div className="space-y-1 h-full">
              <Button
                variant={selectedCategory === "all" ? "outline" : "ghost"}
                className="w-full justify-start cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                <Inbox className="mr-2 h-4 w-4" />
                All Mail
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "outline" : "ghost"}
                  className="w-full cursor-pointer flex justify-between"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <DynamicIcon name={(category.icon || "email") as any} className={`mr-2 h-4 w-4 stroke-slate-800`} />
                  <div className="w-full flex"><span className='max-w-32 truncate'>{category.name}</span></div>
                  {false && <Badge
                    className="w-8 h-6 cursor-pointer group-hover:hidden"
                    variant="secondary"
                  >
                  </Badge>}
                </Button>
              ))}
              <Button
                variant={selectedCategory === "none" ? "secondary" : "ghost"}
                className="w-full justify-start cursor-pointer"
                onClick={() => setSelectedCategory("none")}
              >
                <Inbox className="mr-2 h-4 w-4" />
                <span className='max-w-32 truncate'>Uncategorized</span>
              </Button>
              <div className="mt-4 w-full px-2 text-left">
                <AddCategoryModal />
              </div>
            </div>
          </div>
        </aside>

        <main className="overflow-y-auto border-l border-r w-full">
          <div className="sticky top-0 z-10 p-3 border-b backdrop-blur-md bg-white/90 dark:bg-black/50 flex justify-between w-full">
            <div className="flex items-center gap-2 h-12">
              <Checkbox
                checked={selectedEmails.length === emails.length && selectedEmails.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEmails(emails.map(email => email.id));
                  } else {
                    setSelectedEmails([]);
                  }
                }}
                className="h-9 w-9 mr-2 rounded-full cursor-pointer"
              />

              {selectedEmails.length > 0 &&
                <>
                  <Button variant="outline" disabled={selectedEmails.length == 0} size="sm" onClick={() => handleBatchAction('delete')} className="cursor-pointer">
                    <DynamicIcon name="trash-2" className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" disabled={selectedEmails.length == 0} size="sm" onClick={() => handleBatchAction('read')} className="cursor-pointer" title="Use AI agent to unsubscribe">
                    <DynamicIcon name="bot" className="h-4 w-4 mr-2" />
                    Delete & unsub
                  </Button>
                </>}
              {selectedEmails.length === 0 && activeCategory &&
                <div className="flex items-center gap-2">
                  <Icon name={activeCategory?.icon} className="h-6 w-6 mr-2" />
                  <div className="text-lg mr-4">{activeCategory?.name}</div>
                  <AddCategoryModal edit={true} category={activeCategory} />
                  <RemoveCategoryModal category={activeCategory} />
                </div>
              }

            </div>
            <div className="text-sm text-muted-foreground pr-4 my-auto">
              {selectedEmails.length > 0
                ? `${selectedEmails.length} selected`
                : `${emails.length} messages`}
            </div>
          </div>

          <div className="divide-y w-full">
            {emails.map((email) => (
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

