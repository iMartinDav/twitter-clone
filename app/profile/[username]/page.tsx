// app/profile/[username]/page.tsx
'use client'

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import type { Database } from '@/types/supabase';
import type { ProfileRow } from '@/types/supabase';
import type { Tweet } from '@/types/tweet';

import { getProfileByUsername, updateProfileData, getSessionData } from '@/services/profile-service';
import { getTweetsByUserId } from '@/services/tweet-service';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCover from '@/components/profile/ProfileCover';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import TweetList from '@/components/tweet-list';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tweets');
    const [isEditing, setIsEditing] = useState(false);
    const [session, setSession] = useState<any>(null);

    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const sessionData = await getSessionData();
                setSession(sessionData.data.session);

                if (!sessionData.data.session) {
                    router.push('/login');
                    return;
                }

                const profileData = await getProfileByUsername(username);
                if (!profileData) {
                    router.push('/404');
                    return;
                }
                setProfile(profileData);

                const tweetData = await getTweetsByUserId(profileData.user_id);
                setTweets(tweetData);

            } catch (error) {
                console.error('Error fetching profile page data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load profile',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username, router, toast]);

    const handleProfileUpdate = async (updatedProfile: Partial<ProfileRow>) => {
        try {
            const updatedData = await updateProfileData(updatedProfile);
            if (updatedData) {
                setProfile(updatedData);
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
                router.refresh();
            }
            setIsEditing(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) return <ProfileSkeleton />;
    const canEdit = profile?.user_id === session?.user?.id;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[600px] mx-auto">

                <ProfileHeader fullName={profile?.full_name} tweetCount={tweets.length} />
                <ProfileCover coverUrl={profile?.cover_url} />
                <ProfileAvatar
                    profile={profile}
                    canEdit={canEdit}
                    onEditClick={() => setIsEditing(true)}
                />

                <ProfileInfo profile={profile} className="mr-4" />
                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="divide-y divide-[#2F3336]"
                    >
                        <TweetList initialTweets={tweets} userId={profile?.id} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <EditProfileDialog
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={profile}
                onSave={handleProfileUpdate}
            />
        </div>
    );
}
