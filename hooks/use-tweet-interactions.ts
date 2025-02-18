import { useCallback } from 'react';
import { handleLikeTweet } from '@/services/interaction-service';
import { useTweetInteractionsContext } from '@/contexts/tweet-interactions-context';

export const useTweetInteractions = () => {
  const { interactions, fetchTweetInteractions } = useTweetInteractionsContext();

  const likeTweet = useCallback(async (tweetId: string, userId: string) => {
    await handleLikeTweet(tweetId, userId);
    await fetchTweetInteractions(tweetId);
  }, [fetchTweetInteractions]);

  return {
    interactions,
    fetchTweetInteractions,
    likeTweet,
  };
};
