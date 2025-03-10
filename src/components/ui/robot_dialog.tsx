"use client"
import { MessageSquare, BotIcon as Robot } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/utils"

// Update the interface to include typewriter options
interface RobotDialogProps {
  /**
   * The React children elements to display in the popover
   */
  children: React.ReactNode
  /**
   * Optional class name for additional styling
   */
  className?: string
  /**
   * Optional class name for the popover content
   */
  contentClassName?: string
}

// Update the component to use the typewriter hook
export function RobotDialog({
  children,
  className,
  contentClassName,
}: RobotDialogProps) {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn("gap-1 cursor-pointer p-1", className)}
          aria-label="Open robot speech"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Robot className="h-3 w-3 text-red-500" />
          <MessageSquare className="h-3 w-3 text-neutral-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`relative p-4 max-w-xs ${contentClassName}`} sideOffset={5}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

