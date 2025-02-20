'use client'

import React from 'react'
import { TweetCard } from './TweetCard'
import type { Tweet } from '@/types/tweet'

interface TweetItemProps {
  tweet: Tweet;
  variant?: 'default' | 'compact';
}

const TweetItem: React.FC<TweetItemProps> = ({ tweet, variant = 'default' }) => {
  return <TweetCard tweet={tweet} variant={variant} />;
};

export default TweetItem;
