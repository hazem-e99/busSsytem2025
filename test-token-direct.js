// Test token directly in browser console
console.log('🔐 Testing token in browser...');

// Get token from localStorage
const user = localStorage.getItem('user');
console.log('📋 User data from localStorage:', user);

if (user) {
  try {
    const userData = JSON.parse(user);
    const token = userData.token || userData.accessToken;
    console.log('🔑 Token found:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token) {
      // Test API call
      fetch('http://72.60.35.47/api/Payment', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('📥 Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📊 Payment data:', data);
        console.log('📈 Payment count:', data?.data?.length || 0);
      })
      .catch(error => {
        console.error('❌ Error:', error);
      });
    }
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Instructions
console.log('📝 Instructions:');
console.log('1. Copy this code');
console.log('2. Open browser console (F12)');
console.log('3. Paste and run');
console.log('4. Check the results');
