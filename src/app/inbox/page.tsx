"use client"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { Filter, Inbox, Laptop, Plane, PiggyBank, Briefcase, Archive, Trash2, MailOpen, Dog } from "lucide-react"
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

// Add this constant for category icons
const categoryIcons = {
  ai: Laptop,
  finance: PiggyBank,
  travel: Plane,
  work: Briefcase,
}

// Import necessary hooks and functions

// Email interface based on the DB schema
interface Email {
  id: string;
  sender: string;
  from: string;
  subject: string;
  preview: string;
  read: boolean;
  starred: boolean;
  gmailId: string;
  categories: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date | null;
}

// Helper function to format date for display
function formatEmailDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (date >= yesterday) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// Custom hook to fetch emails with optional filters
function useEmails(filters?: { starred?: boolean; read?: boolean; categoryId?: string }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const emailsQuery = api.email.getAll.useQuery();

  useEffect(() => {
    setIsLoading(true);
    if (emailsQuery.isSuccess) {
      setEmails(emailsQuery.data);
      setIsLoading(false);
    } else if (emailsQuery.isError) {
      console.error("Error fetching emails:", emailsQuery.error);
      setError("Failed to load emails");
      setIsLoading(false);
    }
  }, [emailsQuery.isSuccess, emailsQuery.isError, emailsQuery.data, emailsQuery.error, filters?.starred, filters?.read, filters?.categoryId]);

  // Transform DB emails to the format expected by the UI
  const formattedEmails = emails.map(email => ({
    id: email.id,
    sender: email.sender || "Unknown sender",
    email: email.from || "",
    subject: email.subject || "No subject",
    preview: email.preview || "",
    date: email.createdAt ? formatEmailDate(new Date(email.createdAt)) : "",
    read: email.read,
    categories: email.categories,
    avatar: "/placeholder.svg?height=40&width=40",
  }));

  return { emails: formattedEmails, isLoading, error };
}

// Custom hook to fetch user categories
function useCategories() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string, icon: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = api.email.getCategories.useQuery();

  useEffect(() => {
    setIsLoading(true);
    if (categoriesQuery.isSuccess) {
      setCategories(categoriesQuery.data);
      setIsLoading(false);
    } else if (categoriesQuery.isError) {
      console.error("Error fetching categories:", categoriesQuery.error);
      setError("Failed to load categories");
      setIsLoading(false);
    }
  }, [categoriesQuery.isSuccess, categoriesQuery.isError, categoriesQuery.data, categoriesQuery.error]);

  return { categories, isLoading, error };
}

export default function EmailInbox() {
  // Use the custom hook to fetch emails
  const { emails: emailList, isLoading, error } = useEmails();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

  // Show loading state or error if needed
  if (isLoading) return <div className="flex justify-center p-4">Loading emails...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const unreadCount = emailList.filter((email) => !email.read).length
  const aiCount = emailList.filter((email) => email.category === "ai").length
  const financeCount = emailList.filter((email) => email.category === "finance").length
  const travelCount = emailList.filter((email) => email.category === "travel").length

  const filteredEmails =
    activeCategory === "all" ? emailList : emailList.filter((email) => email.category === activeCategory)

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    )
  }

  const handleBatchAction = (action: 'read' | 'archive' | 'delete') => {
    let updatedEmails = [...emailList]
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
    setEmailList(updatedEmails)
    setSelectedEmails([])
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full max-h-screen bg-background">
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-48 border-r p-3 hidden md:block">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Dog className="h-5 w-5" />
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
                  className="w-full justify-start cursor-pointer"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <DynamicIcon name={category.icon} className="mr-2 h-4 w-4" color="black" />
                  {category.name}
                  <Badge className="ml-auto" variant="secondary">
                    ?
                    {/* {emailList.filter(email => email.category === category.id).length} */}
                  </Badge>
                </Button>
              ))}
            </div>
          </aside>

          <main className="flex-1 overflow-auto">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedEmails.length === filteredEmails.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEmails(filteredEmails.map(email => email.id));
                    } else {
                      setSelectedEmails([]);
                    }
                  }}
                  className="mr-2"
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
              <div className="text-sm text-muted-foreground">
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
        </div>
      </div>
    </TooltipProvider>
  )
}

interface EmailItemProps {
  email: {
    id: string
    sender: string
    email: string
    subject: string
    preview: string
    date: string
    read: boolean
    categories: string[]
    avatar: string
  }
  isSelected: boolean
  onSelect: (id: string) => void
}

function EmailItem({ email, isSelected, onSelect, categories }: EmailItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const emailCategories = categories.filter(category => email.categories.includes(category.id));

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    onSelect(email.id)
  }

  return (
    <Card
      className={`p-3 rounded-none hover:bg-accent/50 transition-colors ${!email.read ? 'bg-accent/20' : ''
        } ${isSelected ? 'bg-primary/10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div
          className="relative cursor-pointer"
          onClick={handleSelectClick}
        >
          {isSelected || isHovered ? (
            <Checkbox
              checked={isSelected}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={email.avatar} alt={email.sender} />
              <AvatarFallback>{email.sender.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="font-semibold truncate max-w-[180px] sm:max-w-xs flex items-center">
              {email.sender}
              {emailCategories.map(category => (
                <TooltipProvider key={category.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ml-2 p-1 rounded-full hover:bg-accent/50 transition-colors">
                        <DynamicIcon name={category.icon} className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{category.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {email.date}
            </div>
          </div>

          <div className="text-sm">
            <span className={`font-semibold ${!email.read ? '' : ''}`}>{email.subject}</span>
            {" "}
            <span className="text-muted-foreground">{email.preview}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

