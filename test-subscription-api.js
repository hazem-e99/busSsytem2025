// Test Subscription API
const API_BASE_URL = 'http://72.60.35.47/api';

async function testSubscriptionAPI() {
  console.log('🧪 Testing Subscription API...\n');

  try {
    // Test 1: Get Active Subscription Plans
    console.log('📋 Test 1: Getting Active Subscription Plans');
    const plansResponse = await fetch(`${API_BASE_URL}/SubscriptionPlan/active`);
    const plansData = await plansResponse.json();
    console.log('✅ Plans Response:', plansData);
    console.log('📊 Active Plans Count:', plansData?.data?.length || 0);
    console.log('');

          // Test 2: Get All Subscription Plans
      console.log('📋 Test 2: Getting All Subscription Plans');
      const allPlansResponse = await fetch(`${API_BASE_URL}/SubscriptionPlan`);
      if (allPlansResponse.ok) {
        const allPlansData = await allPlansResponse.json();
        console.log('✅ All Plans Response:', allPlansData);
        console.log('📊 Total Plans Count:', allPlansData?.data?.length || 0);
      } else {
        console.log('❌ All Plans Response Error:', allPlansResponse.status, allPlansResponse.statusText);
      }
      console.log('');

          // Test 3: Get Payments for a specific student (replace with actual student ID)
      console.log('📋 Test 3: Getting Payments for Student ID 1');
      const paymentsResponse = await fetch(`${API_BASE_URL}/Payment/by-student/1`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        console.log('✅ Payments Response:', paymentsData);
        console.log('📊 Payments Count:', paymentsData?.data?.length || 0);
      } else {
        console.log('❌ Payments Response Error:', paymentsResponse.status, paymentsResponse.statusText);
      }
      console.log('');

      // Test 4: Get All Payments
      console.log('📋 Test 4: Getting All Payments');
      const allPaymentsResponse = await fetch(`${API_BASE_URL}/Payment`);
      if (allPaymentsResponse.ok) {
        const allPaymentsData = await allPaymentsResponse.json();
        console.log('✅ All Payments Response:', allPaymentsData);
        console.log('📊 Total Payments Count:', allPaymentsData?.data?.length || 0);
      } else {
        console.log('❌ All Payments Response Error:', allPaymentsResponse.status, allPaymentsResponse.statusText);
      }
      console.log('');

      // Test 5: Get Pending Payments
      console.log('📋 Test 5: Getting Pending Payments');
      const pendingPaymentsResponse = await fetch(`${API_BASE_URL}/Payment/pending`);
      if (pendingPaymentsResponse.ok) {
        const pendingPaymentsData = await pendingPaymentsResponse.json();
        console.log('✅ Pending Payments Response:', pendingPaymentsData);
        console.log('📊 Pending Payments Count:', pendingPaymentsData?.data?.length || 0);
      } else {
        console.log('❌ Pending Payments Response Error:', pendingPaymentsResponse.status, pendingPaymentsResponse.statusText);
      }
      console.log('');

      // Test 6: Get Student Profile
      console.log('📋 Test 6: Getting Student Profile for ID 1');
      const profileResponse = await fetch(`${API_BASE_URL}/Users/students-data/1`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile Response:', profileData);
      } else {
        console.log('❌ Profile Response Error:', profileResponse.status, profileResponse.statusText);
      }
      console.log('');

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the test
testSubscriptionAPI();
