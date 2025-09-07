// Test script for TripBooking API endpoint
const BASE_URL = 'http://localhost:7126/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AYnVzLXN5c3RlbS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBidXMtc3lzdGVtLmNvbSIsImp0aSI6IjA1Y2FmNDM1LWE4YjctNDE3ZS1hZWIyLTEzNGEwNTJiOGNiZCIsImlhdCI6MTc1NzAyODI1OSwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NTk2MjAyNTksImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzEyNiJ9.boUoHaoDehC9uBveIV8o75LyRI-6vqxYLzOrTRJhQEc';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testBookingAPI() {
  console.log('🎫 Testing TripBooking API Endpoint...\n');

  try {
    // Test 1: Get all trips first to find a valid trip ID
    console.log('1️⃣ Getting available trips...');
    const tripsResponse = await fetch(`${BASE_URL}/Trip`, { headers });
    if (!tripsResponse.ok) {
      console.log('❌ Failed to get trips:', tripsResponse.status, tripsResponse.statusText);
      return;
    }
    
    const tripsData = await tripsResponse.json();
    const trips = tripsData?.data || [];
    console.log('✅ Found', trips.length, 'trips');
    
    if (trips.length === 0) {
      console.log('⚠️ No trips available for testing booking');
      return;
    }

    // Get first trip details to find stop locations
    const firstTrip = trips[0];
    console.log('📋 Testing with trip:', {
      id: firstTrip.id,
      busNumber: firstTrip.busNumber,
      startLocation: firstTrip.startLocation,
      endLocation: firstTrip.endLocation
    });

    // Test 2: Get trip details to find stop locations
    console.log('\n2️⃣ Getting trip details for stop locations...');
    const tripDetailsResponse = await fetch(`${BASE_URL}/Trip/${firstTrip.id}`, { headers });
    if (!tripDetailsResponse.ok) {
      console.log('❌ Failed to get trip details:', tripDetailsResponse.status, tripDetailsResponse.statusText);
      return;
    }
    
    const tripDetails = await tripDetailsResponse.json();
    const tripData = tripDetails?.data || tripDetails;
    const stopLocations = tripData?.stopLocations || [];
    console.log('✅ Found', stopLocations.length, 'stop locations');
    
    if (stopLocations.length === 0) {
      console.log('⚠️ No stop locations available for testing booking');
      return;
    }

    // Test 3: Create booking with valid data
    console.log('\n3️⃣ Testing POST /api/TripBooking');
    const bookingData = {
      tripId: firstTrip.id,
      studentId: 1,
      pickupStopLocationId: stopLocations[0].id
    };
    
    console.log('📤 Sending booking data:', bookingData);
    
    const bookingResponse = await fetch(`${BASE_URL}/TripBooking`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bookingData)
    });
    
    console.log('📥 Booking response status:', bookingResponse.status, bookingResponse.statusText);
    
    if (bookingResponse.ok) {
      const bookingResult = await bookingResponse.json();
      console.log('✅ Booking created successfully!');
      console.log('📋 Booking result:', bookingResult);
    } else {
      const errorText = await bookingResponse.text();
      console.log('❌ Booking failed:', errorText);
    }

    // Test 4: Get student bookings to verify
    console.log('\n4️⃣ Verifying booking by getting student bookings...');
    const studentBookingsResponse = await fetch(`${BASE_URL}/TripBooking/by-student/1`, { headers });
    if (studentBookingsResponse.ok) {
      const studentBookings = await studentBookingsResponse.json();
      console.log('✅ Student bookings:', studentBookings?.data?.length || 0, 'found');
    } else {
      console.log('❌ Failed to get student bookings:', studentBookingsResponse.status, studentBookingsResponse.statusText);
    }

    console.log('\n🎉 Booking API Test Complete!');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testBookingAPI();
