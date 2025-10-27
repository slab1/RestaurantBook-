// Simple test script to debug login
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@restaurantbook.com',
        password: 'password123'
      }),
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('✓ User data found in response');
    } else {
      console.log('✗ No user data in response');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();