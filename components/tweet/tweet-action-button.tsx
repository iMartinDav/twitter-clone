import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface TweetActionButtonProps {
  icon: LucideIcon
  label: string
  count?: number
  onClick?: () => void
  isActive?: boolean
  activeColor?: string
  hoverColor?: string
}

export function TweetActionButton({
  icon: Icon,
  label,
  count = 0,
  onClick,
  isActive = false,
  activeColor = 'text-blue-400',
  hoverColor = 'hover:text-blue-400',
}: TweetActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 text-gray-500 ${hoverColor} transition-colors group`}
      onClick={onClick}
      aria-label={label}
    >
      <div className={`p-2 rounded-full ${hoverColor.replace('text', 'bg')}/10`}>
        <Icon
          className={`w-4 h-4 ${isActive ? activeColor : ''} ${isActive ? 'fill-current' : ''}`}
        />
      </div>
      {count > 0 && <span className={`text-xs ${isActive ? activeColor : ''}`}>{count}</span>}
    </motion.button>
  )
}
