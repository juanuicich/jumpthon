"use client"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { Filter, Inbox, Archive, Trash2, MailOpen, Dog } from "lucide-react"
import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";


// Custom hook to fetch emails with optional filters
function useEmails(filters?: { starred?: boolean; read?: boolean; categoryId?: string }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    function fetchEmails() {
      supabase
        .from("email")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching emails:", error);
          } else {
            console.log("Emails fetched:", data);
            setEmails(data);
            setIsLoading(false);
          }
        });
    }

    const channel = supabase.channel("realtime emails").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "email",
    }, (payload) => {
      console.log(payload);
      fetchEmails();
    }).subscribe();

    fetchEmails();

    // Clear the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, setEmails, setIsLoading]);

  return { emails, isLoading, error };
}

// Custom hook to fetch user categories
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const supabase = createClient();

  useEffect(() => {

    function fetchCategories() {
      supabase
        .from("category")
        .select("*, email(count)")
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching categories:", error);
          } else {
            console.log("Categories fetched:", data);
            setCategories(data);
          }
        });
    }

    const channel = supabase.channel("realtime categories").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "category",
    }, (payload) => {
      console.log("Category update", payload);
      fetchCategories();
    }).subscribe();

    fetchCategories();

    // Clear the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, setCategories]);

  return categories;
}

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
        <aside className="w-48 p-3 hidden md:block h-screen">
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
                {category.name}
                <Badge className="ml-auto" variant="secondary">
                  {category?.email[0].count as any}
                </Badge>
              </Button>
            ))}
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

          <div className="divide-y">
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

function EmailItem({ email, isSelected, onSelect, categories }: { email: Email; isSelected: boolean; onSelect: (id: string) => void; categories: Category[] }) {
  const [isHovered, setIsHovered] = useState(false)
  let emailCategories: Category[] = [];

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    onSelect(email.id)
  }

  return (
    <Card
      className={`p-3 rounded-none hover:bg-accent/50 transition-colors cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="relative cursor-pointer"
          onClick={handleSelectClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isSelected || isHovered ? (
            <Checkbox
              checked={isSelected}
              className="h-9 w-9 rounded-full cursor-pointer"
            />
          ) : (
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback>{email.sender ? email.sender.substring(0, 1).toUpperCase() : ""}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="font-semibold text-base truncate max-w-[180px] sm:max-w-xs flex items-center mr-2">
              {email.sender}
              {emailCategories.map(category => (
                <TooltipProvider key={category.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-1 rounded-full hover:bg-accent/50 transition-colors">
                        {/* @ts-ignore */}
                        <DynamicIcon name={category.icon} className="h-4 w-4 text-muted-foreground stroke-2" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {email.created_at}
            </div>
          </div>

          <div className="text-sm">
            <span className="font-semibold">{email.subject}</span>
            {" "}
            <span className="text-muted-foreground">{email.preview}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

