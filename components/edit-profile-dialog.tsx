import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './image-upload'
import { uploadProfileImage, deleteProfileImage, type UploadResponse } from '@/lib/supabase-storage'
import { X, MapPin, Link2, AtSign, User, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { updateProfile } from '@/lib/supabase'

export interface ProfileData {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
  created_at: string
  cover_url?: string
}

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileData | null
  onSave: (profileData: Partial<ProfileData>) => Promise<void>
}

interface FormField {
  id: keyof ProfileData
  label: string
  placeholder: string
  icon: React.ReactNode
  type?: string
  component?: 'input' | 'textarea'
}

export function EditProfileDialog({ isOpen, onClose, profile, onSave }: EditProfileDialogProps) {
  const { session, user } = useAuth()
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    cover_url: profile?.cover_url || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{
    avatar?: File
    cover?: File
  }>({})

  const formFields: FormField[] = [
    {
      id: 'full_name',
      label: 'Name',
      placeholder: 'Add your name',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'username',
      label: 'Username',
      placeholder: '@username',
      icon: <AtSign className="h-5 w-5" />,
    },
    {
      id: 'bio',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
      component: 'textarea',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'location',
      label: 'Location',
      placeholder: 'Add your location',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 'website',
      label: 'Website',
      placeholder: 'Add your website',
      icon: <Link2 className="h-5 w-5" />,
    },
  ]

  const handleImageSelect = useCallback(
    (type: 'avatar' | 'cover') => (file: File) => {
      setSelectedFiles((prev) => ({ ...prev, [type]: file }))
    },
    [],
  )

  // Verify authentication when dialog opens
  useEffect(() => {
    if (isOpen && !session) {
      console.error('No active session')
      onClose()
    }
  }, [isOpen, session, onClose])

  const handleSave = async () => {
    if (!session?.user?.id) {
      onClose()
      return
    }

    setIsLoading(true)
    try {
      let newAvatarUrl = editedProfile.avatar_url
      let newCoverUrl = editedProfile.cover_url

      // Handle avatar upload
      if (selectedFiles.avatar) {
        try {
          const avatarUpload = await uploadProfileImage(
            selectedFiles.avatar,
            session.user.id,
            'avatar',
          )
          newAvatarUrl = avatarUpload.publicUrl
        } catch (error) {
          if (error instanceof Error) {
            if (['AUTH_REQUIRED', 'SESSION_EXPIRED'].includes(error.message)) {
              onClose()
              return
            }
          }
          throw error
        }
      }

      // Handle cover upload
      if (selectedFiles.cover) {
        try {
          const coverUpload = await uploadProfileImage(
            selectedFiles.cover,
            session.user.id,
            'cover',
          )
          newCoverUrl = coverUpload.publicUrl
        } catch (error) {
          if (error instanceof Error) {
            if (['AUTH_REQUIRED', 'SESSION_EXPIRED'].includes(error.message)) {
              onClose()
              return
            }
          }
          throw error
        }
      }

      // Update profile in database
      await updateProfile(session.user.id, {
        ...editedProfile,
        avatar_url: newAvatarUrl,
        cover_url: newCoverUrl,
      })

      await onSave({
        ...editedProfile,
        avatar_url: newAvatarUrl,
        cover_url: newCoverUrl,
      })
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof typeof editedProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditedProfile((prev) => ({ ...prev, [field]: e.target.value }))
    }

  if (!session || !user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-[#16141D] text-white border border-[#2F3336] h-[90vh] sm:h-auto">
        <div className="h-full flex flex-col">
          <DialogHeader className="p-4 border-b border-[#2F3336] sticky top-0 z-50 bg-[#16141D]/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-xl font-bold">Edit profile</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Edit your profile information including avatar, cover image, name, bio, and more
            </DialogDescription>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="absolute right-4 top-3 bg-white text-black hover:bg-white/90 rounded-full font-bold px-6"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              <div className="relative">
                <ImageUpload
                  type="cover"
                  currentImageUrl={editedProfile.cover_url}
                  onImageSelect={handleImageSelect('cover')}
                />
                <div className="px-4 pb-4">
                  <ImageUpload
                    type="avatar"
                    currentImageUrl={editedProfile.avatar_url}
                    onImageSelect={handleImageSelect('avatar')}
                    initials={editedProfile.full_name?.[0] || '?'}
                  />
                </div>
              </div>

              <div className="p-4 space-y-6 pb-8">
                {formFields.map((field) => (
                  <div key={field.id} className="relative">
                    {field.component === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        value={editedProfile[field.id as keyof typeof editedProfile] || ''}
                        onChange={handleInputChange(field.id as keyof typeof editedProfile)}
                        className="bg-transparent border-[#2F3336] text-white resize-none min-h-[100px] focus-visible:ring-[#1D9BF0]"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <div className="relative">
                        <Input
                          id={field.id}
                          value={editedProfile[field.id as keyof typeof editedProfile] || ''}
                          onChange={handleInputChange(field.id as keyof typeof editedProfile)}
                          className="bg-transparent border-[#2F3336] text-white pl-10 h-14 focus-visible:ring-[#1D9BF0]"
                          placeholder={field.placeholder}
                        />
                        <span className="absolute left-3 top-4 text-gray-400">{field.icon}</span>
                      </div>
                    )}
                    <Label
                      htmlFor={field.id}
                      className="absolute -top-2 left-2 bg-[#16141D] px-2 text-xs text-gray-400"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
