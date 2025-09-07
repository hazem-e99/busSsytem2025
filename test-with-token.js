// Test API with token from localStorage
const API_BASE_URL = 'http://72.60.35.47/api';

// Get token from command line argument or use placeholder
const TOKEN = process.argv[2] || 'YOUR_TOKEN_HERE'; // Pass token as argument: node test-with-token.js YOUR_TOKEN

async function testAPIWithToken() {
  console.log('🔐 Testing API with token...\n');

  try {
    // Test 1: Get All Payments with token
    console.log('📋 Test 1: Getting All Payments with token');
    const paymentsResponse = await fetch(`${API_BASE_URL}/Payment`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json();
      console.log('✅ Payments Response:', paymentsData);
      console.log('📊 Total Payments Count:', paymentsData?.data?.length || 0);
    } else {
      console.log('❌ Payments Response Error:', paymentsResponse.status, paymentsResponse.statusText);
    }
    console.log('');

    // Test 2: Get Students Data with token
    console.log('📋 Test 2: Getting Students Data with token');
    const studentsResponse = await fetch(`${API_BASE_URL}/Users/students-data`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('✅ Students Response:', studentsData);
      console.log('📊 Students Count:', studentsData?.data?.length || 0);
    } else {
      console.log('❌ Students Response Error:', studentsResponse.status, studentsResponse.statusText);
    }
    console.log('');

    // Test 3: Get Subscription Plans with token
    console.log('📋 Test 3: Getting Subscription Plans with token');
    const plansResponse = await fetch(`${API_BASE_URL}/SubscriptionPlan`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (plansResponse.ok) {
      const plansData = await plansResponse.json();
      console.log('✅ Plans Response:', plansData);
      console.log('📊 Plans Count:', plansData?.data?.length || 0);
    } else {
      console.log('❌ Plans Response Error:', plansResponse.status, plansResponse.statusText);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error testing API with token:', error);
  }
}

// Instructions for getting token
console.log('📝 Instructions:');
console.log('1. Open browser and go to your app');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Application/Storage tab');
console.log('4. Find localStorage and look for authToken or similar');
console.log('5. Copy the token value');
console.log('6. Replace YOUR_TOKEN_HERE in this file with the actual token');
console.log('7. Run: node test-with-token.js');
console.log('');

// Run the test
testAPIWithToken();
