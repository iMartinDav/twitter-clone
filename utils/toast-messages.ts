const EMOJIS = ['🎉', '✨', '🌟', '🚀', '💫', '🎊', '🌈', '⭐️', '💝', '💪']

const SUCCESS_MESSAGES = [
  'Tweet sent into the universe! Keep sharing!',
  'Your voice matters - tweet posted!',
  'Another great tweet from you!',
  'Tweet posted successfully! The world is listening!',
  'Your thoughts are now live! Keep them coming!',
  'Wonderful tweet! Your followers will love this!',
  'Tweet shared with style! Keep up the energy!',
  'Amazing tweet! You\'re on fire today!',
  'Your tweet is making waves! Keep shining!',
  'Tweet posted! You\'re making the timeline better!'
]

export function getTweetPostedMessage() {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const message = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]
  
  return {
    title: `${emoji} Tweet Posted!`,
    description: message,
    duration: 4000,
  }
}

// Also export individual functions for different actions
export const getDeleteSuccessMessage = () => ({
  title: '🗑️ Tweet Deleted',
  description: 'Your tweet has been removed successfully',
  duration: 3000,
})

export const getErrorMessage = (action: string) => ({
  title: '❌ Error',
  description: `Failed to ${action}. Please try again.`,
  duration: 5000,
  variant: 'destructive' as const,
})
