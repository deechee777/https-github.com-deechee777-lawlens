import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/auth';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIP || 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const clientIP = getClientIP(request);
    if (!AdminAuth.checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Verify credentials
    if (!AdminAuth.verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create secure session
    const { token, sessionId } = AdminAuth.createSession(email);

    const response = NextResponse.json({ 
      success: true,
      user: { email, role: 'admin' },
      sessionInfo: {
        sessionId: sessionId.substring(0, 8), // Only show first 8 chars for debugging
        activeSessions: AdminAuth.getActiveSessionCount()
      }
    });

    // Set security headers
    const securityHeaders = AdminAuth.getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    console.log(`Admin login successful for ${email} from ${clientIP}`);
    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current session info before destroying
    const adminUser = AdminAuth.verifyAdminToken(request);
    
    if (adminUser) {
      AdminAuth.destroySession(adminUser.sessionId);
      console.log(`Admin logout: ${adminUser.email}`);
    }

    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}