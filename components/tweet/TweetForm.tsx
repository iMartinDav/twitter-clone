// components/tweet/TweetForm.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, Smile, MapPin, BarChart4, Loader2 } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { TweetActionButton } from './tweet-action-button'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import { insertTweet, createReply, createRetweet } from '@/services/tweet-service'
import { useTweetsStore } from '@/hooks/use-tweets-store'
import { Tweet } from '@/types/tweet'

interface TweetFormProps {
    profile: Database['public']['Tables']['profiles']['Row'] | null
    onSuccess?: (tweet: Tweet) => void
    replyTo?: string
    retweetId?: string
    variant?: 'default' | 'conversation'
}

const TweetForm: React.FC<TweetFormProps> = ({
    profile,
    onSuccess,
    replyTo,
    retweetId,
    variant = 'default'
}) => {
    const { user } = useAuth()
    const { toast } = useToast()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const supabase = createClientComponentClient<Database>()
    const addTweet = useTweetsStore((state) => state.addTweet)

    const maxLength = 280
    const remainingChars = maxLength - content.length

    const getAvatarFallback = useCallback((name?: string) => {
        if (!name) return '?'
        return name.charAt(0).toUpperCase()
    }, [])

    const handleNewTweet = useCallback(async (content: string) => {
        console.log('Creating new tweet:', content)
        return await insertTweet(content.trim(), user!.id, {
            retweetId: ''
        })
    }, [user])

    const handleReply = useCallback(async (content: string, replyTo: string) => {
        console.log('Creating reply to:', replyTo)
        return await createReply(content.trim(), replyTo, user!.id)
    }, [user])

    const handleRetweet = useCallback(async (retweetId: string) => {
        console.log('Creating retweet of:', retweetId)
        return await createRetweet(retweetId, user!.id)
    }, [user])

    const handlePost = useCallback(async () => {
        console.log("handlePost function called"); // ADD THIS LINE
        if (!user) {
            console.log("User is null, cannot post."); // ADD THIS LINE
            return;
        }

        setIsSubmitting(true);
        try {
            let newTweet: Tweet;

            if (retweetId) {
                newTweet = await handleRetweet(retweetId);
                console.log("Retweeted content:", `Retweet ID: ${retweetId}`);
            } else if (replyTo) {
                newTweet = await handleReply(content, replyTo);
                console.log("Replied content:", content);
            } else {
                newTweet = await handleNewTweet(content);
                console.log("Tweeted content:", content);
            }

            addTweet(newTweet);
            setContent('');
            onSuccess?.(newTweet);

            toast({
                title: retweetId ? '🔄 Retweeted!' : replyTo ? '💬 Reply Posted!' : '🎉 Tweet Posted!',
                description: retweetId
                    ? 'Tweet has been retweeted!'
                    : replyTo
                        ? 'Your reply has been added!'
                        : 'Your tweet is now live!',
                duration: 4000,
            });
        } catch (error) {
            console.error('Post failed:', error);
            toast({
                title: '❌ Error',
                description: error instanceof Error ? error.message : 'Could not post',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
            setShowEmojiPicker(false);
        }
    }, [user, retweetId, replyTo, content, handleRetweet, handleReply, handleNewTweet, addTweet, onSuccess, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted", { content, isSubmitting, retweetId });

        // Add validation check
        if (!user) {
            console.log("No user found");
            toast({
                title: 'Error',
                description: 'You must be logged in to post',
                variant: 'destructive'
            });
            return;
        }

        if (isSubmitting) {
            console.log("Already submitting");
            return;
        }

        if (!content.trim() && !retweetId) {
            console.log("No content to post");
            return;
        }

        try {
            await handlePost();
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowEmojiPicker(false);
        }
    };

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
                        {getAvatarFallback(fullName)}
                    </AvatarFallback>
                </Avatar>
            </motion.div>
        ),
        [getAvatarFallback],
    );

    const onEmojiClick = (emojiObject: any) => {
        setContent(prevContent => prevContent + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const actions = [
        { icon: <ImagePlus className="h-[18px] w-[18px]" />, label: 'Media', onClick: () => { } },
        { icon: <BarChart4 className="h-[18px] w-[18px]" />, label: 'Poll', onClick: () => { } },
        {
            icon: <Smile className="h-[18px] w-[18px]" />,
            label: 'Emoji',
            onClick: () => setShowEmojiPicker(!showEmojiPicker)
        },
        { icon: <MapPin className="h-[18px] w-[18px]" />, label: 'Location', onClick: () => { } },
    ] as const

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={cn(
                "border-b border-[#2F3336] relative",
                variant === 'conversation' && "border-none"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex p-3 gap-4">
                {renderAvatar(profile?.avatar_url, profile?.full_name)}

                <div className="flex-1 space-y-2">
                    {!retweetId && (
                        <Textarea
                            placeholder={replyTo ? 'Post your reply' : 'What is happening?!'}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="text-xl bg-transparent border-none placeholder:text-muted-foreground resize-none min-h-[56px] max-h-[300px] py-2"
                            maxLength={maxLength}
                            disabled={isSubmitting}
                        />
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#2F3336]">
                        <div className="flex gap-1">
                            {actions.map(({ icon, label, onClick }) => (
                                <TweetActionButton
                                    key={label}
                                    icon={icon}
                                    label={label}
                                    onClick={onClick}
                                    className="hover:bg-foreground/10"
                                    disabled={isSubmitting}
                                />
                            ))}
                        </div>

                        <AnimatePresence>
                            {showEmojiPicker && (
                                <>
                                    <motion.div
                                        className="fixed inset-0 bg-black/50 z-40"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={handleBackdropClick}
                                    />
                                    <motion.div
                                        className="absolute bottom-16 left-0 z-50 shadow-lg rounded-lg overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            theme={Theme.DARK}
                                            width={320}
                                            height={400}
                                        />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-4">
                            {!retweetId && content.length > 0 && (
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
                                    disabled={isSubmitting || (!retweetId && (!content.trim() || content.length > maxLength)) || !user}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <span>{retweetId ? 'Retweet' : replyTo ? 'Reply' : 'Post'}</span>
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

export default TweetForm
