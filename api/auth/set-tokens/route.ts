import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token, rememberMe } = await request.json();
    const cookieStore = await cookies();

    // Set access token cookie with shorter expiration
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    // Set refresh token cookie with longer expiration if remember me is checked
    cookieStore.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days if remember me, 7 days otherwise
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting tokens:', error);
    return NextResponse.json(
      { error: 'Failed to set authentication tokens' },
      { status: 500 }
    );
  }
} 