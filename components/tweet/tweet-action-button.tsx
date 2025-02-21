'use client'

import React, { useState, useEffect } from 'react' // Import useState and useEffect
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import type { TweetVariant } from './types'

interface TweetActionButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode
  label: string
  count?: number
  isActive?: boolean
  activeColor?: string
  hoverColor?: string
  onClick?: (e: React.MouseEvent) => void
  variant?: Extract<TweetVariant, 'default' | 'compact'>
}

export const TweetActionButton = React.forwardRef<HTMLButtonElement, TweetActionButtonProps>(
  ({
    icon,
    label,
    count,
    isActive,
    activeColor = 'text-blue-500',
    hoverColor,
    className,
    onClick,
    variant = 'default',
    ...props
  }, ref) => {
    const [animatedIsActive, setAnimatedIsActive] = useState(isActive); // State for animation trigger

    useEffect(() => {
      if (isActive !== animatedIsActive && isActive) { // Only animate on active (like)
        setAnimatedIsActive(true);
        setTimeout(() => setAnimatedIsActive(isActive), 400); // Duration slightly longer than animation
      } else {
        setAnimatedIsActive(isActive); // For "unliking" - no animation
      }
    }, [isActive, animatedIsActive]);

    const buttonClass = cn(
      "group relative h-8 w-8 rounded-full transition-colors duration-200",
      hoverColor,
      isActive ? activeColor : 'text-muted-foreground',
      variant === 'compact' && 'scale-90',
      className
    );

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClick?.(e)
    }

    return (
      <motion.div
        className="flex items-center gap-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          className={buttonClass}
          {...props}
        >
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: animatedIsActive ? 1.1 : 1 }} // Use animatedIsActive for scale animation
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
            <motion.div
              className="absolute inset-0 rounded-full bg-current opacity-10"
              initial={{ scale: 0 }}
              animate={{ scale: animatedIsActive ? 0.32 : 0 }} // Use animatedIsActive for background animation
              transition={{ type: 'spring', stiffness: 300 }}
            />
             {label === 'Like' && animatedIsActive && ( // Heart specific burst animation
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, rotate: [0, 30, -30, 0] }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Heart className="text-red-400 h-5 w-5" fill="currentColor" />
              </motion.div>
            )}
          </motion.div>
        </Button>

        <AnimatePresence mode="wait">
          {typeof count === 'number' && (
            <motion.span
              key={count}
              className={cn(
                "text-[13px] font-normal",
                isActive ? activeColor : 'text-muted-foreground'
              )}
              initial={{ y: 4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -4, opacity: 0 }}
            >
              {count > 0 ? count : ''}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

TweetActionButton.displayName = 'TweetActionButton'
