import { NextResponse } from 'next/server';

/**
 * Runtime Configuration API
 * Provides environment-specific configuration to the client-side
 */
export async function GET() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;
  
  if (!platformUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_PLATFORM_URL not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    platformUrl,
  });
}
