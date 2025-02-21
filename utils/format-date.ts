import { formatDistanceToNowStrict, format, isThisYear } from 'date-fns'

export function formatTimeAgo(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const distance = formatDistanceToNowStrict(dateObj, { addSuffix: true })
  
  // Return both timeAgo and formatted date
  const formattedDate = isThisYear(dateObj) 
    ? format(dateObj, 'MMM d') 
    : format(dateObj, 'MMM d, yyyy')

  return {
    timeAgo: distance,
    date: formattedDate
  }
}

export function getFullDateTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'h:mm a · MMM d, yyyy')
}
