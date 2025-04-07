import { query } from '@/lib/db';

interface ValidationResponse {
  isValid: boolean;
  message?: string;
  error?: {
    type: 'rate_limit' | 'database' | 'unknown';
    code?: string;
  };
}

export async function validateContactSubmission(email: string): Promise<ValidationResponse> {
  try {
    // Check if there's a recent submission from this email (within last 5 minutes)
    const recentSubmission = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM contact_submissions 
       WHERE email = $1 
       AND created_at > NOW() - INTERVAL '5 minutes'`,
      [email]
    );

    if (parseInt(recentSubmission[0].count) > 0) {
      return {
        isValid: false,
        message: 'We have received your previous inquiry and our team will get back to you shortly.',
        error: { type: 'rate_limit' }
      };
    }

    return { isValid: true };
  } catch (error) {
    console.log('Error validating contact submission:', error);
    
    if (error instanceof Error && 'code' in error) {
      return {
        isValid: false,
        message: 'Database connection error. Please try again later.',
        error: { 
          type: 'database',
          code: (error as any).code
        }
      };
    }

    return {
      isValid: false,
      message: 'An error occurred while validating your submission. Please try again.',
      error: { type: 'unknown' }
    };
  }
} 