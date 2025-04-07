import { NextResponse } from 'next/server';

export async function GET() {
  // Only enable in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development mode' }, { status: 403 });
  }

  // Return environment variables (with sensitive parts masked)
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    MAILERSEND_API_KEY: process.env.MAILERSEND_API_KEY ? 'Set (starts with: ' + process.env.MAILERSEND_API_KEY.substring(0, 8) + '...)' : 'Not set',
    MAILERSEND_TO_EMAIL: process.env.MAILERSEND_TO_EMAIL || 'Not set',
    MAILERSEND_TO_NAME: process.env.MAILERSEND_TO_NAME || 'Not set',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'Not set',
    EMAIL_USER: process.env.EMAIL_USER || 'Not set',
    EMAIL_FROM: process.env.EMAIL_FROM || 'Not set',
    EMAIL_TO: process.env.EMAIL_TO || 'Not set',
  });
} 