import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/api-client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get('refresh_token')?.value;
    
    if (!refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    const { access_token } = await apiClient.refreshToken(refresh_token);

    // Create response with new access token
    const response = NextResponse.json({ access_token });
    
    // Set new access token cookie
    response.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
  }
} 