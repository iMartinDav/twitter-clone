// profile.d.ts

/**
 * Interface representing the structure of a user profile.
 */
interface ProfileData {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
  created_at: string
}

/**
 * Interface representing the structure of a tweet.
 */
interface Tweet {
  id: string
  content: string
  created_at: string
  user: {
    name: string
    username: string
  }
}

/**
 * Interface representing the props for the TweetList component.
 */
interface TweetListProps {
  initialTweets: Tweet[]
  userId: string // Ensure this matches the expected type
}

/**
 * Interface representing the props for the EditProfileDialog component.
 */
interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileData | null
  onSave: (profileData: Partial<ProfileData>) => Promise<void>
}

/**
 * Interface representing the props for the ProfilePage component.
 */
interface ProfilePageProps {
  params: {
    username?: string
  }
}
