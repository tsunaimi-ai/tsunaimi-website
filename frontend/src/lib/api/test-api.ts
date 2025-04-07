import { apiClient } from './api-client';

async function testApiIntegration() {
  try {
    console.log('\n=== Starting API Integration Test ===\n');

    // Step 1: Health Check
    console.log('Step 1: Testing health check...');
    const health = await fetch('http://localhost:8000/api/v1/health').then(r => r.json());
    console.log('✓ Health check response:', health);

    // Step 2: LinkedIn Auth URL
    console.log('\nStep 2: Testing LinkedIn auth URL...');
    const linkedInUrl = await apiClient.getLinkedInAuthUrl('http://localhost:3000/callback');
    console.log('✓ LinkedIn auth URL:', linkedInUrl);

    // Step 3: User Registration
    console.log('\nStep 3: Registering test user...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'test_password123';
    
    const registerResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    console.log('✓ Test user registered successfully:', testEmail);

    // Step 4: User Login
    console.log('\nStep 4: Testing login...');
    const loginResponse = await apiClient.login(testEmail, testPassword);
    console.log('✓ Login successful, token received');
    console.log('Debug - Token:', apiClient.getToken() ? 'Present' : 'Missing');

    // Step 5: Search Endpoint
    console.log('\nStep 5: Testing search endpoint...');
    try {
      console.log('Debug - Making search request with token:', apiClient.getToken() ? 'Present' : 'Missing');
      const searchResponse = await fetch('http://localhost:8000/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          criteria: [
            {
              field: 'location',
              value: 'Paris',
              operator: 'contains'
            }
          ],
          max_results: 10,
          include_details: true,
          sort_by: 'relevance_score',
          sort_order: 'desc'
        }),
      });
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(`API request failed: ${searchResponse.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      const searchResult = await searchResponse.json();
      console.log('✓ Search response:', searchResult);
    } catch (error) {
      console.error('✗ Search endpoint failed:', error);
      console.log('Debug info:');
      console.log('- Endpoint: /api/v1/search');
      console.log('- Method: POST');
      console.log('- Auth token present:', !!apiClient.getToken());
      console.log('- Login response:', loginResponse);
      throw error;
    }

    console.log('\n=== All tests completed successfully! ===\n');
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Run the tests
testApiIntegration(); 