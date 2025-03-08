"use client"

import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Filter, Inbox, Archive, Trash2, MailOpen, Dog } from "lucide-react"
import { useEffect, useState } from "react";
import { EmailItem } from '~/components/ui/email_item';
import { useEmails } from '~/components/hooks/use_emails';
import { useCategories } from '~/components/hooks/use_categories';


export default function EmailInbox() {
  // Use the custom hook to fetch emails
  const { emails, isLoading, error } = useEmails();
  const categories = useCategories();
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

  // Function to trigger email fetching
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

      const result = await response.json();
      console.log('Email fetch triggered:', result);
    } catch (error) {
      console.error('Error triggering email fetch:', error);
    }
  };

  // Trigger email fetching on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  // Show loading state or error if needed
  // if (isLoading) return <div className="flex justify-center p-4">Loading emails...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

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

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
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
                className={`w-full justify-start cursor-pointer`}
                onClick={() => setActiveCategory(category.id)}
              >
                <DynamicIcon name={(category.icon || "email") as any} className={`mr-2 h-4 w-4 stroke-slate-800`} />
                <span className='max-w-32 truncate'>{category.name}</span>
                <Badge className="ml-auto" variant="secondary">
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
              {selectedEmails.length > 0 ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('read')}>
                    <MailOpen className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="unread">Unread first</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </>
              )}
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
      </div>
    </div>
  )
}

