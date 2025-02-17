// components/profile/ProfileHeader.tsx
'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
    fullName?: string | null;
    tweetCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ fullName, tweetCount }) => {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm flex items-center gap-2 px-2 h-[52px] border-b border-[#2F3336]">
            <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-white/10 rounded-full transition-colors"
            >
                <ArrowLeft className="h-4 w-4 text-white" />
            </Button>
            <div className="flex flex-col justify-center">
                <h1 className="text-lg font-bold text-white leading-5">
                    {fullName || 'Profile'}
                </h1>
                <p className="text-xs text-gray-500 leading-4">{tweetCount} posts</p>
            </div>
        </div>
    );
};

export default ProfileHeader;
