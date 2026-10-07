/** What the token of the API carries: the same fields as `JwtPayload` in the API, plus the dates. */
export interface JwtPayload {
  /** The user id: that is the JWT convention */
  sub: string;
  username: string;
  role: 'admin' | 'user';
  /** Issued at, in seconds since 1970 */
  iat: number;
  /** Expires at, in seconds since 1970 */
  exp: number;
}

/**
 * Given. Reads the payload of a JWT, the part between the two dots, or null
 * when the token cannot be read.
 *
 * The payload is not secret: it is encoded in base64url, not encrypted.
 * Anyone who has the token can read it, here with `atob`, or on jwt.io. What
 * nobody can do is change it: the signature, the third part, would no longer
 * match, and the API would answer 401.
 *
 * So the front reads the payload to show who is logged in, and never trusts
 * it for anything else: the API checks the signature on every request.
 */
export function decodePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    // base64url → base64: the URL-safe alphabet has - and _ where base64 has + and /.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}
