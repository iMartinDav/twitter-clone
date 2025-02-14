'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-hook';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, List, Smile, MapPin, BarChart2 } from 'lucide-react';
import TweetList from './tweet-list';
import { Skeleton } from '@/components/ui/skeleton';

const ACTIONS = [
  { icon: ImagePlus, label: 'Media' },
  { icon: BarChart2, label: 'Poll' },
  { icon: Smile, label: 'Emoji' },
  { icon: MapPin, label: 'Location' },
];

export default function Dashboard() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const maxLength = 280;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: 'Success', description: 'Tweet posted!' });
      setContent('');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post tweet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string, email?: string): string => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;

  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full max-w-[600px] mx-auto bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-[#2F3336]">
        <nav className="flex px-4 py-3">
          <div className="flex gap-8 w-full">
            <Button
              variant="ghost"
              className="flex-1 text-white/90 hover:bg-white/10 transition-colors font-semibold relative"
            >
              For you
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#6B46CC] rounded-full" />
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-white/50 hover:bg-white/10 transition-colors font-semibold"
            >
              Following
            </Button>
          </div>
        </nav>
      </header>

      <form onSubmit={handleSubmit} className="border-b border-[#2F3336]">
        <div className="flex p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt="Profile"
          />
          <AvatarFallback className="bg-[#59F6E8] text-[#16141D]">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
          
          <div className="flex-1 ml-3">
            <Textarea
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xl bg-transparent border-none text-white placeholder-white/50 focus:ring-0 resize-none p-0 min-h-[56px]"
              required
              maxLength={maxLength}
            />
            
            <div className="mt-3 flex items-center justify-between border-t border-[#2F3336] pt-3">
              <div className="flex -ml-2">
                {ACTIONS.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#2F3336] transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-[#6B46CC]" />
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                {content.length > 0 && (
                  <div className="flex items-center">
                    <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                      {characterCount}/{maxLength}
                    </span>
                  </div>
                )}
                <Button
                  type="submit"
                  className="rounded-full bg-[#6B46CC] hover:bg-[#5A37A7] text-white px-4 py-1.5 text-sm font-bold transition-colors"
                  disabled={isSubmitting || !content.trim() || isOverLimit}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <TweetList />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4">
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-[#2F3336] p-4">
        <div className="flex gap-8">
          <Skeleton className="h-8 flex-1 rounded-full" />
          <Skeleton className="h-8 flex-1 rounded-full" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-[#2F3336] space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
