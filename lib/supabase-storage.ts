import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'
import { AuthService } from '@/services/auth-service'

type ImageType = 'avatar' | 'cover'

// Export the interface
export interface UploadResponse {
  path: string
  publicUrl: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

async function validateFile(file: File): Promise<void> {
  if (!file) throw new Error('File is required')
  if (file.size > MAX_FILE_SIZE) throw new Error('File size must be less than 5MB')
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed types: JPG, PNG, GIF, WebP')
  }
}

async function validateSession(): Promise<void> {
  try {
    await AuthService.validateSession()
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHENTICATED') {
        throw new Error('Please sign in to continue')
      }
      if (error.message === 'SESSION_EXPIRED') {
        await AuthService.refreshToken()
      }
    }
    throw error
  }
}

export async function uploadProfileImage(
  file: File,
  userId: string,
  type: ImageType,
): Promise<UploadResponse> {
  try {
    await validateSession()
    await validateFile(file)
    if (!userId) throw new Error('User ID is required')

    const bucket = type === 'avatar' ? 'avatars' : 'covers'
    const fileExt = file.name.split('.').pop()?.toLowerCase()

    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      throw new Error('Invalid file extension')
    }

    // Create a unique filename with user ID and timestamp
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${uuidv4()}.${fileExt}`

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Storage error details:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    if (!data?.path) {
      throw new Error('Upload successful but path is missing')
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    if (!publicUrl) {
      throw new Error('Failed to generate public URL')
    }

    return {
      path: data.path,
      publicUrl,
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Upload error (${type}):`, error.message)
      // Classify errors for better handling
      if (error.message.includes('sign in')) {
        throw new Error('AUTH_REQUIRED')
      }
      if (error.message.includes('expired')) {
        throw new Error('SESSION_EXPIRED')
      }
    }
    throw error
  }
}

export async function deleteProfileImage(url: string, type: ImageType): Promise<void> {
  try {
    if (!url) return

    const bucket = type === 'avatar' ? 'avatars' : 'covers'
    const path = url.split('/').slice(-2).join('/')

    // Verify the path belongs to the correct bucket
    if (!path.startsWith('avatars/') && !path.startsWith('covers/')) {
      throw new Error('Invalid file path')
    }

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('Delete error details:', error)
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error(`Error in deleteProfileImage (${type}):`, error)
    throw error
  }
}

// Helper function to check if a file exists
export async function checkFileExists(
  path: string,
  bucket: 'avatars' | 'covers',
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) return false
    return !!data
  } catch {
    return false
  }
}

// Keeping backward compatibility
export const uploadAvatarImage = async (file: File, userId: string): Promise<string> => {
  const response = await uploadProfileImage(file, userId, 'avatar')
  return response.publicUrl
}

export const deleteAvatarImage = (url: string): Promise<void> => deleteProfileImage(url, 'avatar')
