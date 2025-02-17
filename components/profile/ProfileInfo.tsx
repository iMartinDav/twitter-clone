// components/profile/ProfileInfo.tsx
import React from 'react';
import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { ProfileRow } from '@/types/supabase';

interface ProfileInfoProps {
    profile: ProfileRow | null;
    className?: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, className = '' }) => {
    const formatJoinDate = (dateString?: string) =>
        dateString ? format(new Date(dateString), 'MMMM') : 'Unknown date';

    return (
        <motion.div
            className={`mt-4 ml-6 space-y-4 relative ${className}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <div className="space-y-1">
                <h1 className="text-xl font-bold text-white">{profile?.full_name}</h1>
                <p className="text-gray-500">@{profile?.username}</p>
            </div>

            {profile?.bio && (
                <p className="text-white whitespace-pre-wrap break-words">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-gray-500">
                {profile?.location && (
                    <motion.div
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                    </motion.div>
                )}
                {profile?.website && (
                    <motion.a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#6B46CC] hover:underline"
                        whileHover={{ scale: 1.05 }}
                    >
                        <LinkIcon className="h-4 w-4" />
                        <span>{profile.website.replace(/(^\w+:|^)\/\//, '')}</span>
                    </motion.a>
                )}
                <motion.div
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatJoinDate(profile?.created_at)}</span>
                </motion.div>
            </div>

            <div className="flex gap-4 mt-3">
                <Button className="hover:underline">
                    <span className="font-bold text-white">0</span>
                    <span className="text-gray-500">Following</span>
                </Button>
                <Button className="hover:underline">
                    <span className="font-bold text-white">0</span>
                    <span className="text-gray-500">Followers</span>
                </Button>
            </div>
        </motion.div>
    );
};

export default ProfileInfo;
