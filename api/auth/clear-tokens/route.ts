import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Delete access token cookie
    response.cookies.delete('access_token');
    
    // Delete refresh token cookie
    response.cookies.delete('refresh_token');
    
    return response;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear authentication tokens' },
      { status: 500 }
    );
  }
} 