import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateRequiredFields } from '../../../lib/contact-validation';
import { validateContactSubmission } from './validation';
import { query } from '../../../lib/db';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  interest: string;
  message: string;
  phone_number?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Add export const dynamic = 'force-dynamic' to ensure this route is always server-rendered
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get client IP for logging
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || 'unknown';
    const clientIp = forwardedFor.split(',')[0];

    const data = await request.json() as ContactFormData;
    
    // Validate required fields and email format
    const fieldsValidation = validateRequiredFields(data);
    if (!fieldsValidation.isValid) {
      return NextResponse.json(
        { error: fieldsValidation.message },
        { status: 400 }
      );
    }

    // Check for rate limiting
    const validationResult = await validateContactSubmission(data.email);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.message },
        { status: 429 }
      );
    }

    try {
      // Store the submission in the database
      await query(
        `INSERT INTO contact_submissions 
        (name, email, company, role, interest, message, phone_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.name,
          data.email,
          data.company,
          data.role,
          data.interest,
          data.message,
          data.phone_number || null,
          'pending' // New submissions are pending
        ]
      );

      // Log the submission for monitoring
      console.log('Contact form submission stored:', {
        email: data.email,
        company: data.company,
        timestamp: new Date().toISOString(),
        ip: clientIp
      });

      return NextResponse.json(
        { message: 'Contact form submission stored successfully.' },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store your submission. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
} 