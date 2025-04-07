# Tsunaimi Authentication Service API Documentation

## Overview
This document provides technical documentation for the Tsunaimi Authentication Service API. The service handles user authentication, registration, and profile management.

## Base URL
```
Development: http://localhost:8000/api/v1
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require a Bearer token in the Authorization header.

### Token Types
- **Access Token**: Short-lived token (30 minutes) for API access
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

### Authentication Flow
1. User registers or logs in to receive access and refresh tokens
2. Use access token in Authorization header for protected endpoints
3. When access token expires, use refresh token to get a new access token

## Endpoints

### User Registration
```http
POST /auth/register
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "John Doe"
}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data
- 409 Conflict: Email already registered
- 422 Validation Error: Invalid data format

### User Login
```http
POST /auth/token
```

**Request Body:**
```json
{
    "username": "user@example.com", // Note: username is actually the email
    "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials
- 422 Validation Error: Invalid data format

### Get User Profile
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true
}
```

**Error Responses:**
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: User not found

### Refresh Access Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
}
```

**Error Responses:**
- 401 Unauthorized: Invalid refresh token
- 422 Validation Error: Invalid data format

## CORS Configuration
The API accepts requests from the following origins:
- http://localhost:3000
- http://localhost:8000

## Error Response Format
All error responses follow this format:
```json
{
    "detail": "Error message description"
}
```

## Common HTTP Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Internal Server Error

## Rate Limiting
Currently, no rate limiting is implemented. This may be added in future versions.

## Security Considerations
1. Always use HTTPS in production
2. Store tokens securely (preferably in HTTP-only cookies)
3. Implement proper token refresh logic
4. Handle token expiration gracefully
5. Never store sensitive data in localStorage

## Example Usage

### Registration Flow
```typescript
async function registerUser(email: string, password: string, fullName: string) {
    const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            full_name: fullName
        })
    });
    
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    
    return await response.json();
}
```

### Login Flow
```typescript
async function loginUser(email: string, password: string) {
    const response = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: email,
            password
        })
    });
    
    if (!response.ok) {
        throw new Error('Login failed');
    }
    
    const data = await response.json();
    // Store tokens securely
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    return data;
}
```

### Protected API Call
```typescript
async function getUserProfile() {
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
}
```

## Environment Variables
The frontend application should use the following environment variables:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Production (to be provided)
# VITE_API_BASE_URL=https://api.tsunaimi.com/api/v1
```

### Usage in Frontend
```typescript
// Example environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Use in API calls
async function registerUser(email: string, password: string, fullName: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            full_name: fullName
        })
    });
}
```

## Support
For any questions or issues, please contact the backend team.

## Frontend Integration

### Auth API Client
We provide a TypeScript client (`auth-api-client.ts`) to handle all authentication-related API calls. This client:
- Manages token storage and refresh
- Handles authentication errors
- Provides type-safe API methods
- Implements request queuing during token refresh

#### Installation
Copy the `auth-api-client.ts` file to your frontend project.

#### Environment Setup
Add the following environment variable to your `.env` file:
```env
VITE_AUTH_API_URL=http://localhost:8000/api/v1
```

#### Usage Example
```typescript
import { AuthApiClient } from './auth-api-client';

// Initialize the client
const authClient = new AuthApiClient(import.meta.env.VITE_AUTH_API_URL);

// Register a new user
try {
    const user = await authClient.register({
        email: 'user@example.com',
        password: 'secure_password',
        full_name: 'John Doe'
    });
    console.log('Registered:', user);
} catch (error) {
    console.error('Registration failed:', error);
}

// Login
try {
    const response = await authClient.login('user@example.com', 'secure_password');
    console.log('Logged in:', response);
} catch (error) {
    console.error('Login failed:', error);
}

// Get user profile
try {
    const profile = await authClient.getProfile();
    console.log('Profile:', profile);
} catch (error) {
    console.error('Failed to get profile:', error);
}
```

#### Available Methods
- `register(userData: RegisterRequest): Promise<User>`
- `login(email: string, password: string): Promise<LoginResponse>`
- `getProfile(): Promise<User>`
- `requestPasswordReset(email: string): Promise<void>`
- `resetPassword(token: string, newPassword: string): Promise<void>`
- `logout(): Promise<void>`

#### Error Handling
The client includes a custom `AuthError` class for handling authentication-specific errors:
```typescript
try {
    await authClient.login(email, password);
} catch (error) {
    if (error instanceof AuthError) {
        console.error(`Authentication error: ${error.message}`);
        // Handle specific error cases
        switch (error.status) {
            case 401:
                // Handle unauthorized
                break;
            case 400:
                // Handle bad request
                break;
            // ... handle other cases
        }
    }
}
```

#### Security Considerations
1. The client is designed to work with HTTP-only cookies for token storage
2. Implement proper token storage based on your frontend framework
3. Handle token expiration and refresh automatically
4. Clear tokens on logout 