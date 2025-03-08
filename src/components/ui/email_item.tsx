import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Card } from "~/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { Checkbox } from "~/components/ui/checkbox"
import { DynamicIcon } from 'lucide-react/dynamic';
import { useState } from "react";

export function EmailItem({ email, isSelected, onSelect, categories }: { email: Email; isSelected: boolean; onSelect: (id: string) => void; categories: Category[] }) {
  const [isHovered, setIsHovered] = useState(false)
  let category = categories.find(c => c.id === email.category_id);

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
              {category && (
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
              )}
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

