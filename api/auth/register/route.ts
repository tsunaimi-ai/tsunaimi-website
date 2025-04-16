import { NextResponse } from 'next/server';
import { UserCreate, UserResponse } from '@/types/auth';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const userData: UserCreate = await request.json();

    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Registration failed' },
        { status: response.status }
      );
    }

    const user: UserResponse = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 