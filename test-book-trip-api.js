// Test script for Book Trip API endpoints
const BASE_URL = 'http://localhost:7126/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AYnVzLXN5c3RlbS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBidXMtc3lzdGVtLmNvbSIsImp0aSI6IjA1Y2FmNDM1LWE4YjctNDE3ZS1hZWIyLTEzNGEwNTJiOGNiZCIsImlhdCI6MTc1NzAyODI1OSwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NTk2MjAyNTksImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzEyNiJ9.boUoHaoDehC9uBveIV8o75LyRI-6vqxYLzOrTRJhQEc';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAPI() {
  console.log('🚌 Testing Book Trip API Endpoints...\n');

  try {
    // Test 1: Get all trips
    console.log('1️⃣ Testing GET /api/Trip');
    const tripsResponse = await fetch(`${BASE_URL}/Trip`, { headers });
    if (tripsResponse.ok) {
      const tripsData = await tripsResponse.json();
      console.log('✅ Trips API Success:', tripsData?.data?.length || 0, 'trips found');
      console.log('📋 Sample trip:', tripsData?.data?.[0] || 'No trips available');
    } else {
      console.log('❌ Trips API Error:', tripsResponse.status, tripsResponse.statusText);
    }

    // Test 2: Get my trips (student bookings)
    console.log('\n2️⃣ Testing GET /api/Trip/my-trips');
    const myTripsResponse = await fetch(`${BASE_URL}/Trip/my-trips`, { headers });
    if (myTripsResponse.ok) {
      const myTripsData = await myTripsResponse.json();
      console.log('✅ My Trips API Success:', myTripsData?.data?.length || 0, 'bookings found');
    } else {
      console.log('❌ My Trips API Error:', myTripsResponse.status, myTripsResponse.statusText);
    }

    // Test 3: Get trip by ID (if trips exist)
    console.log('\n3️⃣ Testing GET /api/Trip/{id}');
    const tripsData = await fetch(`${BASE_URL}/Trip`, { headers }).then(r => r.ok ? r.json() : null);
    if (tripsData?.data?.[0]?.id) {
      const tripId = tripsData.data[0].id;
      const tripResponse = await fetch(`${BASE_URL}/Trip/${tripId}`, { headers });
      if (tripResponse.ok) {
        const tripDetails = await tripResponse.json();
        console.log('✅ Trip Details API Success for ID:', tripId);
        console.log('📋 Trip details:', {
          busNumber: tripDetails?.data?.busNumber,
          startLocation: tripDetails?.data?.startLocation,
          endLocation: tripDetails?.data?.endLocation,
          status: tripDetails?.data?.status,
          stopLocations: tripDetails?.data?.stopLocations?.length || 0
        });
      } else {
        console.log('❌ Trip Details API Error:', tripResponse.status, tripResponse.statusText);
      }
    } else {
      console.log('⚠️ No trips available to test trip details');
    }

    // Test 4: Get bookings by student
    console.log('\n4️⃣ Testing GET /api/TripBooking/by-student/1');
    const bookingsResponse = await fetch(`${BASE_URL}/TripBooking/by-student/1`, { headers });
    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Student Bookings API Success:', bookingsData?.data?.length || 0, 'bookings found');
    } else {
      console.log('❌ Student Bookings API Error:', bookingsResponse.status, bookingsResponse.statusText);
    }

    // Test 5: Check eligibility
    console.log('\n5️⃣ Testing GET /api/TripBooking/check-eligibility');
    const eligibilityResponse = await fetch(`${BASE_URL}/TripBooking/check-eligibility?tripId=1&studentId=1`, { headers });
    if (eligibilityResponse.ok) {
      const eligibilityData = await eligibilityResponse.json();
      console.log('✅ Eligibility Check API Success:', eligibilityData?.data);
    } else {
      console.log('❌ Eligibility Check API Error:', eligibilityResponse.status, eligibilityResponse.statusText);
    }

    console.log('\n🎉 API Testing Complete!');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testAPI();
