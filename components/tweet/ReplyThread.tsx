'use client'

import { TweetCard } from './TweetCard'
import { motion } from 'framer-motion'
import type { Tweet } from '@/types/tweet'

interface ReplyThreadProps {
  replies: Tweet[]
}

export function ReplyThread({ replies }: ReplyThreadProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="divide-y divide-[#2F3336]"
    >
      {replies.map((reply, index) => (
        <div key={reply.id} className="relative group">
          <div 
            className="absolute left-[52px] -top-4 bottom-0 w-0.5 bg-[#2F3336] group-first:top-0"
            style={{
              background: 'linear-gradient(transparent, #2F3336 20px)',
            }}
          />
          <TweetCard
            tweet={reply}
            className="hover:bg-white/5"
          />
        </div>
      ))}
    </motion.div>
  )
}
