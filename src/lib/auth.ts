import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface AdminUser {
  email: string;
  role: string;
  sessionId: string;
  loginTime: number;
}

interface JWTPayload extends AdminUser {
  exp: number;
}

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map<string, {
  email: string;
  loginTime: number;
  lastActivity: number;
}>();

export class AdminAuth {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours of inactivity

  /**
   * Verify admin credentials
   */
  static verifyCredentials(email: string, password: string): boolean {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured');
      return false;
    }

    // In production, you should hash passwords
    return email === adminEmail && password === adminPassword;
  }

  /**
   * Create a secure admin session
   */
  static createSession(email: string): { token: string; sessionId: string } {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const loginTime = Date.now();

    // Store session
    activeSessions.set(sessionId, {
      email,
      loginTime,
      lastActivity: loginTime
    });

    // Create JWT token
    const payload: AdminUser = {
      email,
      role: 'admin',
      sessionId,
      loginTime
    };

    const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
      expiresIn: '24h',
      issuer: 'lawlens-admin',
      audience: 'lawlens-app'
    });

    return { token, sessionId };
  }

  /**
   * Verify and validate admin token
   */
  static verifyAdminToken(request: NextRequest): AdminUser | null {
    try {
      const token = request.cookies.get('admin_token')?.value;
      if (!token) {
        return null;
      }

      // Verify JWT token
      const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!, {
        issuer: 'lawlens-admin',
        audience: 'lawlens-app'
      }) as JWTPayload;

      // Check if session exists and is valid
      const session = activeSessions.get(payload.sessionId);
      if (!session) {
        console.log('Session not found:', payload.sessionId);
        return null;
      }

      // Check session timeout
      const now = Date.now();
      if (now - session.loginTime > this.SESSION_TIMEOUT) {
        console.log('Session expired');
        this.destroySession(payload.sessionId);
        return null;
      }

      // Check activity timeout
      if (now - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        console.log('Session inactive too long');
        this.destroySession(payload.sessionId);
        return null;
      }

      // Update last activity
      session.lastActivity = now;

      return {
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
        loginTime: payload.loginTime
      };

    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Destroy a session
   */
  static destroySession(sessionId: string): void {
    activeSessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now - session.loginTime > this.SESSION_TIMEOUT || 
          now - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Get active session count
   */
  static getActiveSessionCount(): number {
    this.cleanupExpiredSessions();
    return activeSessions.size;
  }

  /**
   * Rate limiting for login attempts
   */
  private static loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts.get(ip);

    if (!attempts) {
      this.loginAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if lockout period has passed
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if too many attempts
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      return false;
    }

    // Increment attempt count
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }

  /**
   * Security headers for admin responses
   */
  static getSecurityHeaders() {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    };
  }
}

// Middleware function for protecting admin routes
export function requireAdminAuth(request: NextRequest): AdminUser | null {
  return AdminAuth.verifyAdminToken(request);
}

// Clean up expired sessions every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    AdminAuth.cleanupExpiredSessions();
  }, 60 * 60 * 1000);
}