import { decode, verify } from '@tsndr/cloudflare-worker-jwt'

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
}

export async function verifyJWT(token: string, secret: string): Promise<{ sub: string } | null> {
  try {
    // Verify token signature
    const isValid = await verify(token, secret);
    if (!isValid) return null;

    // Decode token payload
    const { payload } = decode(token);
    const jwtPayload = payload as JWTPayload;
    
    if (!jwtPayload?.sub || !jwtPayload?.exp) {
      return null;
    }

    // Check expiration
    if (jwtPayload.exp < Date.now() / 1000) {
      return null;
    }

    return { sub: jwtPayload.sub };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
