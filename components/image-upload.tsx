import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, ImagePlus } from 'lucide-react'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageSelect: (file: File) => void
  type: 'avatar' | 'cover'
  initials?: string
}

export function ImageUpload({ currentImageUrl, onImageSelect, type, initials }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      onImageSelect(file)
    }
  }

  if (type === 'cover') {
    return (
      <div className="relative w-full h-[200px] bg-[#3a3450] group overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <ImagePlus className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all duration-200">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-6 h-6" />
            </Button>
            <span className="text-sm text-white font-medium drop-shadow-lg">
              Change cover photo
            </span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
          aria-label="Upload cover photo"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="group relative inline-block">
        <Avatar className="w-32 h-32 border-4 border-[#16141D] relative -mt-16 cursor-pointer shadow-xl transition-transform duration-200 group-hover:scale-105">
          <AvatarImage src={previewUrl} className="object-cover" />
          <AvatarFallback className="text-2xl bg-[#352f4d] text-white">{initials}</AvatarFallback>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-full transition-all duration-200"
            aria-label="Change avatar"
          >
            <Camera className="w-8 h-8 text-white drop-shadow-lg" />
          </Button>
        </Avatar>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        aria-label="Upload avatar"
      />
    </div>
  )
}
