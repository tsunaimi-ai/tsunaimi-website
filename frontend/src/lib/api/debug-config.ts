export function debugConfig() {
    console.log('Environment variables:', {
        NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
        NODE_ENV: process.env.NODE_ENV,
        window: typeof window !== 'undefined',
        document: typeof document !== 'undefined'
    });
} 