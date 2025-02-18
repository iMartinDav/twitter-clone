'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, Smile, MapPin, BarChart4 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { TweetActionButton } from './tweet-action-button'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

const actions = [
  { icon: <ImagePlus className="h-[18px] w-[18px]" />, label: 'Media' },
  { icon: <BarChart4 className="h-[18px] w-[18px]" />, label: 'Poll' },
  { icon: <Smile className="h-[18px] w-[18px]" />, label: 'Emoji' },
  { icon: <MapPin className="h-[18px] w-[18px]" />, label: 'Location' },
] as const

interface TweetFormProps {
  onTweetPosted: () => void
  profile: Database['public']['Tables']['profiles']['Row'] | null
  replyTo?: string
  variant?: 'default' | 'conversation'
}

const TweetForm: React.FC<TweetFormProps> = ({
  onTweetPosted,
  profile,
  replyTo,
  variant = 'default'
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const maxLength = 280
  const remainingChars = maxLength - content.length

  const getAvatarFallback = useCallback((name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    try {
      const tweetData = {
        content,
        user_id: user.id,
        ...(replyTo && { reply_to: replyTo }),
      }

      const { error } = await supabase.from('tweets').insert([tweetData])
      if (error) throw error

      setContent('')
      toast({ title: 'Success', description: 'Tweet posted!' })
      onTweetPosted()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post tweet',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAvatar = useCallback(
    (avatarUrl: string | null | undefined, fullName?: string, className = 'h-12 w-12') => (
      <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
        <Avatar className={`${className} border-2 border-transparent hover:border-[#59F6E8] transition-all`}>
          <AvatarImage
            src={avatarUrl || undefined}
            className="object-cover"
            alt={fullName || 'Profile picture'}
          />
          <AvatarFallback className="bg-[#352f4d] text-white text-lg">
            {fullName?.[0]?.toUpperCase() || '?'} {/* Simplified AvatarFallback */}
          </AvatarFallback>
        </Avatar>
      </motion.div>
    ),
    [getAvatarFallback],
  )

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        "border-b border-[#2F3336]",
        variant === 'conversation' && "border-none"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex p-3 gap-4">
        {renderAvatar(profile?.avatar_url, profile?.full_name)}

        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={replyTo ? 'Post your reply' : 'What is happening?!'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-xl bg-transparent border-none placeholder:text-muted-foreground resize-none min-h-[56px] max-h-[300px] py-2"
            maxLength={maxLength}
          />

          <div className="flex items-center justify-between pt-2 border-t border-[#2F3336]">
            <div className="flex gap-1">
              {actions.map(({ icon, label }) => (
                <TweetActionButton
                  key={label}
                  icon={icon}
                  label={label}
                  className="hover:bg-foreground/10"
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              {content.length > 0 && (
                <motion.span
                  className={cn(
                    'text-sm',
                    remainingChars < 0 ? 'text-red-500' :
                      remainingChars < 20 ? 'text-yellow-500' : 'text-gray-400'
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {remainingChars}
                </motion.span>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] h-8 px-4 text-sm font-bold relative"
                  disabled={isSubmitting || !content.trim() || content.length > maxLength || !user}
                >
                  <AnimatePresence mode='wait'>
                    {isSubmitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ⏳
                        </motion.div>
                        Posting...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="post"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {replyTo ? 'Reply' : 'Post'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  )
}

export default TweetForm
