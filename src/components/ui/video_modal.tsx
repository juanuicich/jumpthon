"use client"
import { useState, useRef, useEffect } from "react"
import { Play, X } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { DialogTitle } from "@radix-ui/react-dialog"

export interface VideoModalProps {
  /**
   * The source URL for the video
   */
  videoSrc: string
  /**
   * The text to display on the trigger button
   */
  buttonText: string
  /**
   * The date to display next to the button
   */
  date?: string
  /**
   * Optional CSS class for the trigger button
   */
  buttonClassName?: string
}

/**
 * A modal component that displays a video when triggered
 */
export function VideoModal({
  videoSrc = "",
  buttonText = "Video",
  buttonClassName,
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  // Handle modal open/close to control video playback
  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Attempt to play the video
      const playPromise = videoRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay was prevented:", error)
        })
      }
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsMuted(true) // Reset to muted state when closing
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className={cn("m-0 p-0 has-[>svg]:px-0 py-2 h-auto flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer", buttonClassName)}
        >
          <Play className="w-4 h-4" />
          <span>{buttonText}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black">
        <DialogTitle className="hidden">Video</DialogTitle>
        <div className="relative w-full aspect-video">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full"
            controls
            playsInline
            autoPlay
            muted={isMuted}
          />
          <DialogClose className="absolute top-2 right-2 z-10 rounded-full p-1.5 bg-black/50 text-white hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

