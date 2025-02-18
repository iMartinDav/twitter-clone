// components/tweet/TweetLoadingSkeleton.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TweetLoadingSkeleton() {
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

export default TweetLoadingSkeleton;
