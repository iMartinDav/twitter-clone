import { verifyJWT } from './jwt';

export async function validateToken(token: string, secret: string): Promise<{ sub: string } | null> {
  return verifyJWT(token, secret);
}

export function sanitizeTweet(content: string): string {
  return content.trim().slice(0, 280);
}

export function validateTweetContent(content: string): boolean {
  const sanitized = content.trim();
  return sanitized.length > 0 && sanitized.length <= 280;
}

export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map(m => m.slice(1)) : [];
}
