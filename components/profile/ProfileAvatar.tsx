// components/profile/ProfileAvatar.tsx
'use client'
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { ProfileRow } from '@/types/supabase';

interface ProfileAvatarProps {
    profile: ProfileRow | null;
    canEdit: boolean;
    onEditClick: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profile, canEdit, onEditClick }) => {
    return (
        <div className="relative px-4 -mt-16 z-20">
            <motion.div
                className="relative inline-block"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Ring effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 via-purple-500/30 to-fuchsia-500/30 rounded-full blur-sm opacity-75" />
                <div
                    className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 via-purple-500/30 to-fuchsia-500/30 rounded-full animate-tilt"
                    style={{ animationDuration: '3s' }}
                />
                <div className="relative rounded-full p-0.5 bg-background">
                    <Avatar className="w-32 h-32 ring-1 ring-white/10 relative group transition-transform duration-300 hover:scale-105">
                        <AvatarImage src={profile?.avatar_url} className="object-cover rounded-full" />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-[#352f4d] to-[#6B46CC] text-white">
                            {profile?.full_name?.[0]}
                        </AvatarFallback>
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Avatar>
                </div>
            </motion.div>

            {/* Edit Button */}
            <div className="flex justify-end -mt-12">
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            onClick={onEditClick}
                            variant="outline"
                            className="group relative px-6 py-2 overflow-hidden rounded-full border-2 border-white/20 bg-background/50 backdrop-blur-md transition-all hover:border-white/40 hover:bg-background/70"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-500/20 to-fuchsia-500/30 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative flex items-center gap-2 text-sm font-medium text-white">
                                <span className="relative">Edit profile</span>
                            </span>
                            <motion.div
                                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                                style={{
                                    background:
                                        'radial-gradient(circle at center, rgba(89, 246, 232, 0.1) 0%, transparent 70%)',
                                }}
                                initial={false}
                                animate={{ scale: [0.9, 1], opacity: [0, 1] }}
                                transition={{ duration: 0.3 }}
                            />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProfileAvatar;
