// components/profile/ProfileCover.tsx
import React from 'react';

interface ProfileCoverProps {
    coverUrl?: string | null;
}

const ProfileCover: React.FC<ProfileCoverProps> = ({ coverUrl }) => {
    return (
        <div className="relative h-[200px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
            {coverUrl ? (
                <img
                    src={coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2F3336] to-[#1F2937]" />
            )}
        </div>
    );
};

export default ProfileCover;
