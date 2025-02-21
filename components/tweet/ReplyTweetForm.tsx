'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Smile, MapPin, BarChart4, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { TweetActionButton } from './tweet-action-button'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import { insertReply } from '@/services/tweet-service'
import { useAuth } from '@/contexts/auth-context'
import type { Tweet } from '@/types/tweet'

interface ReplyTweetFormProps {
    profile: Database['public']['Tables']['profiles']['Row'] | null
    parentTweetId: string
    onSuccess?: (reply: Tweet) => void
}

export function ReplyTweetForm({ profile, parentTweetId, onSuccess }: ReplyTweetFormProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const maxLength = 280
    const remainingChars = maxLength - content.length

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const newReply = await insertReply(content.trim(), user.id, parentTweetId)
            setContent('')
            onSuccess?.(newReply)
            toast({
                title: '💬 Reply Posted!',
                description: 'Your reply has been added!',
                duration: 4000,
            })
        } catch (error) {
            toast({
                title: '❌ Error',
                description: error instanceof Error ? error.message : 'Could not post reply',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const actions = [
        { icon: <ImagePlus className="h-[18px] w-[18px]" />, label: 'Media' },
        { icon: <BarChart4 className="h-[18px] w-[18px]" />, label: 'Poll' },
        { icon: <Smile className="h-[18px] w-[18px]" />, label: 'Emoji' },
        { icon: <MapPin className="h-[18px] w-[18px]" />, label: 'Location' },
    ]

    const renderAvatar = () => (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="shrink-0"
        >
            <Avatar className="h-12 w-12 ring-2 ring-transparent hover:ring-[#59F6E8] transition-all duration-200">
                <AvatarImage
                    src={profile?.avatar_url || undefined}
                    className="object-cover"
                    alt={profile?.full_name || 'Profile picture'}
                />
                <AvatarFallback className="bg-[#352f4d] text-white text-lg font-medium">
                    {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
            </Avatar>
        </motion.div>
    )

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="border-b border-[#2F3336]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex p-3 gap-4">
                {renderAvatar()}

                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Post your reply"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="text-xl bg-transparent border-none resize-none min-h-[56px] max-h-[300px] py-2"
                        maxLength={maxLength}
                        disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-[#2F3336]">
                        <div className="flex gap-1">
                            {actions.map(({ icon, label }) => (
                                <TweetActionButton
                                    key={label}
                                    icon={icon}
                                    label={label}
                                    onClick={() => {}}
                                    className="hover:bg-foreground/10"
                                    disabled={isSubmitting}
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
                                    className={cn(
                                        "rounded-full text-white px-6 py-2 font-semibold bg-[#6B46CC] hover:bg-[#5A37A7]",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    disabled={isSubmitting || !content.trim() || content.length > maxLength}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        'Reply'
                                    )}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.form>
    )
}
