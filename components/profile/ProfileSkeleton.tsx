// components/profile/ProfileSkeleton.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[600px] mx-auto">
                <div className="relative">
                    <Skeleton className="h-[200px] w-full bg-[#2F3336]" />
                    <div className="absolute -bottom-16 left-4">
                        <Skeleton className="w-32 h-32 rounded-full bg-[#2F3336]" />
                    </div>
                </div>
                <div className="pt-20 px-4 space-y-4">
                    <div className="flex justify-end">
                        <Skeleton className="w-32 h-9 rounded-full bg-[#2F3336]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 bg-[#2F3336]" />
                        <Skeleton className="h-4 w-32 bg-[#2F3336]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-[#2F3336]" />
                        <Skeleton className="h-4 w-3/4 bg-[#2F3336]" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24 bg-[#2F3336]" />
                        <Skeleton className="h-4 w-24 bg-[#2F3336]" />
                        <Skeleton className="h-4 w-24 bg-[#2F3336]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
