'use client';

import { useEffect } from 'react';
import { getPlatformUrl } from '@/lib/platform-config';

export default function ProfilePage() {
  useEffect(() => {
    // Redirect to platform profile/dashboard
    const platformUrl = getPlatformUrl('dashboard'); // or specific profile URL
    window.location.href = platformUrl;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="text-[#251C6B] text-lg font-medium mb-4">
          Redirecting to TsunAImi Platform...
        </div>
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-[#7057A0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
} 