"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { Filter, Inbox, Laptop, Plane, PiggyBank, Briefcase, Archive, Trash2, MailOpen } from "lucide-react"

// Add this constant for category icons
const categoryIcons = {
  ai: Laptop,
  finance: PiggyBank,
  travel: Plane,
  work: Briefcase,
}

// Sample email data
const emails = [
  {
    id: "1",
    sender: "John Doe",
    email: "john.doe@example.com",
    subject: "Weekly Team Meeting",
    preview:
      "Hi team, Just a reminder that we have our weekly team meeting tomorrow at 10 AM. Please prepare your updates and be ready to discuss the project timeline.",
    date: "10:30 AM",
    read: false,
    category: "work",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    sender: "Marketing Team",
    email: "marketing@company.com",
    subject: "New Campaign Launch",
    preview:
      "We're excited to announce the launch of our new marketing campaign! Please review the attached materials and provide feedback by EOD.",
    date: "Yesterday",
    read: true,
    category: "work",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    email: "sarah.j@example.com",
    subject: "Project Deadline Update",
    preview:
      "Hello, I wanted to inform everyone that the deadline for the current project phase has been extended by one week. This should give us enough time to address the feedback.",
    date: "Yesterday",
    read: true,
    category: "work",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    sender: "AI Newsletter",
    email: "newsletter@ai-weekly.com",
    subject: "This Week in AI:",
    preview:
      "The latest developments in artificial intelligence include breakthroughs in natural language processing and computer vision. Researchers have developed a new model that can understand context better than previous versions.",
    date: "Jul 12",
    read: false,
    category: "ai",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    sender: "Travel Deals",
    email: "deals@travel.com",
    subject: "Summer Vacation Specials",
    preview:
      "Check out our exclusive summer deals to popular destinations! Book by the end of the month to get 30% off on select packages. Limited availability.",
    date: "Jul 10",
    read: true,
    category: "travel",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    sender: "Financial Advisor",
    email: "advisor@finance.com",
    subject: "Your Monthly Investment Report",
    preview:
      "Here's a summary of your portfolio performance for the past month. Overall, your investments have grown by 3.2% despite market volatility. We recommend reviewing your allocation strategy.",
    date: "Jul 8",
    read: true,
    category: "finance",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    sender: "AI Research Group",
    email: "research@ai-lab.org",
    subject: "Invitation to AI Conference",
    preview:
      "We're pleased to invite you to our annual AI conference taking place next month. The event will feature keynote speakers from leading tech companies and research institutions.",
    date: "Jul 5",
    read: false,
    category: "ai",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function EmailInbox() {
  const [emailList, setEmailList] = useState(emails)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

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
              <Inbox className="h-5 w-5" />
              <h1 className="text-lg font-bold">Inbox</h1>
            </div>
            <div className="space-y-1">
              <Button
                variant={activeCategory === "all" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveCategory("all")}
              >
                <Inbox className="mr-2 h-4 w-4" />
                All Mail
                <Badge className="ml-auto" variant="secondary">
                  {unreadCount}
                </Badge>
              </Button>
              <Button
                variant={activeCategory === "ai" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveCategory("ai")}
              >
                <Laptop className="mr-2 h-4 w-4" />
                AI
                <Badge className="ml-auto" variant="secondary">
                  {aiCount}
                </Badge>
              </Button>
              <Button
                variant={activeCategory === "finance" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveCategory("finance")}
              >
                <PiggyBank className="mr-2 h-4 w-4" />
                Finance
                <Badge className="ml-auto" variant="secondary">
                  {financeCount}
                </Badge>
              </Button>
              <Button
                variant={activeCategory === "travel" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveCategory("travel")}
              >
                <Plane className="mr-2 h-4 w-4" />
                Travel
                <Badge className="ml-auto" variant="secondary">
                  {travelCount}
                </Badge>
              </Button>
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
                  isSelected={selectedEmails.includes(email.id)}
                  onSelect={toggleEmailSelection}
                />
              ))}
            </div>
          </main>
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
    category: string
    avatar: string
  }
  isSelected: boolean
  onSelect: (id: string) => void
}

function EmailItem({ email, isSelected, onSelect }: EmailItemProps) {
  const CategoryIcon = categoryIcons[email.category as keyof typeof categoryIcons]
  const [isHovered, setIsHovered] = useState(false)

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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-2 p-1 rounded-full hover:bg-accent/50 transition-colors">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{email.category}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

