import { randomBytes } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Zapewnia identyfikator sesji CSRF
export function ensureCsrfSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let sessionId = req.cookies?.unihub_csrf_session;

  if (!sessionId) {
    sessionId = randomBytes(32).toString('hex');

    res.cookie('unihub_csrf_session', sessionId, sessionCookieOptions);

    req.cookies = {
      ...req.cookies,
      unihub_csrf_session: sessionId,
    };
  }

  next();
}

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;

    if (!secret) {
      throw new Error('CSRF_SECRET is not configured');
    }

    return secret;
  },

  getSessionIdentifier: (req) => req.cookies?.unihub_csrf_session ?? '',

  cookieName: 'unihub_csrf',

  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },

  getCsrfTokenFromRequest: (req) => {
    const token = req.headers['x-csrf-token'];
    return Array.isArray(token) ? token[0] : token;
  },
});

export { doubleCsrfProtection, generateCsrfToken };
