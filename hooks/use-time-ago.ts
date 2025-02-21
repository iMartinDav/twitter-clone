import { useState, useEffect } from 'react'
import { formatTimeAgo } from '@/utils/format-date'

export function useTimeAgo(date: string | Date) {
  const [timeInfo, setTimeInfo] = useState(() => formatTimeAgo(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInfo(formatTimeAgo(date))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [date])

  return timeInfo
}
