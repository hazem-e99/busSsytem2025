// Quick debugging script for booking issues
const BASE_URL = 'http://localhost:7126/api';

// Get token from localStorage (run this in browser console)
function getTokenFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || user?.accessToken;
  }
  return null;
}

// Test booking with detailed logging
async function debugBooking() {
  console.log('🔍 Starting booking debug...');
  
  // Check if we have a token
  const token = getTokenFromLocalStorage();
  if (!token) {
    console.error('❌ No token found in localStorage');
    console.log('💡 Please make sure you are logged in');
    return;
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Get trips
    console.log('\n1️⃣ Getting trips...');
    const tripsResponse = await fetch(`${BASE_URL}/Trip`, { headers });
    console.log('Trips response status:', tripsResponse.status);
    
    if (!tripsResponse.ok) {
      console.error('❌ Failed to get trips:', tripsResponse.status, tripsResponse.statusText);
      return;
    }
    
    const tripsData = await tripsResponse.json();
    const trips = tripsData?.data || [];
    console.log('✅ Found', trips.length, 'trips');
    
    if (trips.length === 0) {
      console.log('⚠️ No trips available');
      return;
    }
    
    // Step 2: Get trip details
    const trip = trips[0];
    console.log('\n2️⃣ Getting trip details for trip ID:', trip.id);
    const tripDetailsResponse = await fetch(`${BASE_URL}/Trip/${trip.id}`, { headers });
    console.log('Trip details response status:', tripDetailsResponse.status);
    
    if (!tripDetailsResponse.ok) {
      console.error('❌ Failed to get trip details:', tripDetailsResponse.status, tripDetailsResponse.statusText);
      return;
    }
    
    const tripDetails = await tripDetailsResponse.json();
    const tripData = tripDetails?.data || tripDetails;
    const stopLocations = tripData?.stopLocations || [];
    console.log('✅ Found', stopLocations.length, 'stop locations');
    
    if (stopLocations.length === 0) {
      console.log('⚠️ No stop locations available');
      return;
    }
    
    // Step 3: Test booking
    const bookingData = {
      tripId: trip.id,
      studentId: 1,
      pickupStopLocationId: stopLocations[0].id
    };
    
    console.log('\n3️⃣ Testing booking with data:', bookingData);
    const bookingResponse = await fetch(`${BASE_URL}/TripBooking`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bookingData)
    });
    
    console.log('Booking response status:', bookingResponse.status);
    console.log('Booking response headers:', Object.fromEntries(bookingResponse.headers.entries()));
    
    const bookingResult = await bookingResponse.text();
    console.log('Booking response body:', bookingResult);
    
    if (bookingResponse.ok) {
      console.log('✅ Booking successful!');
      try {
        const parsedResult = JSON.parse(bookingResult);
        console.log('Parsed result:', parsedResult);
      } catch (e) {
        console.log('Response is not JSON:', bookingResult);
      }
    } else {
      console.error('❌ Booking failed:', bookingResponse.status, bookingResponse.statusText);
      console.error('Error details:', bookingResult);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
console.log('🚀 Run debugBooking() to start debugging');
console.log('💡 Make sure you are logged in and have a valid token in localStorage');

// Export for browser console
if (typeof window !== 'undefined') {
  window.debugBooking = debugBooking;
}
