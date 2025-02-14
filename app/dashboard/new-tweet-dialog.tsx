'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-hook'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Gift, ImagePlus, List, Smile, MapPin } from 'lucide-react'
import React from 'react'

interface NewTweetDialogProps {
  children: React.ReactElement
}

export default function NewTweetDialog({ children }: NewTweetDialogProps) {
  const [content, setContent] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      toast({ title: 'Success', description: 'Tweet posted!' })
      setContent('')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post tweet',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {React.Children.only(children)}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] p-0 bg-black border-2 border-[#2F3336] rounded-2xl">
        <DialogHeader className="relative p-4 border-b border-[#2F3336]">
          <DialogTitle className="text-white text-lg">What's happening?</DialogTitle>
          
          <div className="absolute top-2 right-2">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="rounded-full hover:bg-[#2F3336]"
                aria-label="Close"
              >
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={user?.user_metadata?.avatar_url} 
                alt="Profile" 
              />
              <AvatarFallback className="bg-[#59F6E8] text-[#16141D]">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <Textarea
              placeholder="What's happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xl bg-transparent border-none text-white focus:ring-0 min-h-[120px]"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#2F3336]">
            <div className="flex gap-2">
              {[Gift, ImagePlus, List, Smile, MapPin].map((Icon, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#2F3336]"
                  aria-label={['Gift', 'Image', 'List', 'Emoji', 'Location'][idx]}
                >
                  <Icon className="h-5 w-5 text-[#1D9BF0]" />
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white px-6 py-2 font-bold"
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
