import { query } from '@/lib/db';
import { DatabaseError } from 'pg';

export interface ValidationResponse {
    isValid: boolean;
    message?: string;
    error?: {
        type: 'rate_limit' | 'database' | 'unknown';
        code?: string;
    };
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Simple in-memory rate limiting
const submissionCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // Maximum submissions per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function validateContactSubmission(email: string): Promise<ValidationResult> {
  const now = Date.now();
  const submission = submissionCounts.get(email);

  if (submission) {
    // Check if the window has expired
    if (now - submission.timestamp > RATE_LIMIT_WINDOW) {
      // Reset the count if the window has expired
      submissionCounts.set(email, { count: 1, timestamp: now });
    } else if (submission.count >= RATE_LIMIT) {
      return {
        isValid: false,
        message: 'Too many submissions. Please try again later.'
      };
    } else {
      // Increment the count
      submission.count++;
    }
  } else {
    // First submission
    submissionCounts.set(email, { count: 1, timestamp: now });
  }

  return { isValid: true, message: '' };
} 