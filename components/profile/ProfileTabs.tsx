// components/profile/ProfileTabs.tsx
'use client'
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4 sticky top-16 z-40 bg-background/80 backdrop-blur-md"
        >
            <TabsList className="w-full justify-start border-b border-[#2F3336] bg-transparent">
                {['Tweets', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
                    <TabsTrigger
                        key={tab.toLowerCase()}
                        value={tab.toLowerCase()}
                        className="flex-1 text-gray-500 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#6B46CC]"
                    >
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export default ProfileTabs;
