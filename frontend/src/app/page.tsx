import { redirect } from 'next/navigation';

// For static exports, we'll default to English
// The middleware will handle dynamic locale detection in the browser
export default function RootPage() {
  // Static redirect to English version
  redirect('/en');
} 