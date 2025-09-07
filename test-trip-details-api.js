// Test trip details API endpoint
const BASE_URL = 'http://localhost:7126/api';

// Get token from localStorage (run this in browser console)
function getTokenFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || user?.accessToken;
  }
  return null;
}

// Test trip details API
async function testTripDetailsAPI() {
  console.log('🔍 Testing trip details API...');
  
  const token = getTokenFromLocalStorage();
  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Step 1: Get all trips
    console.log('\n1️⃣ Getting all trips...');
    const tripsResponse = await fetch(`${BASE_URL}/Trip`, { headers });
    console.log('Trips response status:', tripsResponse.status);
    
    if (!tripsResponse.ok) {
      console.error('❌ Failed to get trips:', tripsResponse.status, tripsResponse.statusText);
      return;
    }
    
    const tripsData = await tripsResponse.json();
    const trips = tripsData?.data || tripsData || [];
    console.log('✅ Found', trips.length, 'trips');
    
    if (trips.length === 0) {
      console.log('⚠️ No trips available');
      return;
    }
    
    // Step 2: Get trip details for first trip
    const trip = trips[0];
    console.log('\n2️⃣ Getting trip details for trip ID:', trip.id);
    console.log('Trip basic info:', {
      id: trip.id,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      tripDate: trip.tripDate
    });
    
    const tripDetailsResponse = await fetch(`${BASE_URL}/Trip/${trip.id}`, { headers });
    console.log('Trip details response status:', tripDetailsResponse.status);
    
    if (!tripDetailsResponse.ok) {
      console.error('❌ Failed to get trip details:', tripDetailsResponse.status, tripDetailsResponse.statusText);
      const errorText = await tripDetailsResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const tripDetails = await tripDetailsResponse.json();
    console.log('✅ Trip details response:', tripDetails);
    
    // Step 3: Analyze trip details structure
    const tripData = tripDetails?.data || tripDetails;
    console.log('\n3️⃣ Trip details structure:');
    console.log('Full trip data:', tripData);
    
    if (tripData) {
      console.log('\n📋 Available fields:');
      console.log('- id:', tripData.id);
      console.log('- busNumber:', tripData.busNumber);
      console.log('- driverName:', tripData.driverName);
      console.log('- conductorName:', tripData.conductorName);
      console.log('- totalSeats:', tripData.totalSeats);
      console.log('- bookedSeats:', tripData.bookedSeats);
      console.log('- avalableSeates:', tripData.avalableSeates);
      console.log('- startLocation:', tripData.startLocation);
      console.log('- endLocation:', tripData.endLocation);
      console.log('- tripDate:', tripData.tripDate);
      console.log('- departureTimeOnly:', tripData.departureTimeOnly);
      console.log('- arrivalTimeOnly:', tripData.arrivalTimeOnly);
      console.log('- status:', tripData.status);
      console.log('- stopLocations:', tripData.stopLocations);
      
      if (tripData.stopLocations && Array.isArray(tripData.stopLocations)) {
        console.log('\n🚏 Stop locations:');
        tripData.stopLocations.forEach((stop, index) => {
          console.log(`  ${index + 1}. ${stop.address} (ID: ${stop.id})`);
          console.log(`     Arrival: ${stop.arrivalTimeOnly}, Departure: ${stop.departureTimeOnly}`);
        });
      } else {
        console.log('⚠️ No stop locations found');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
console.log('🚀 Run testTripDetailsAPI() to test trip details endpoint');
console.log('💡 Make sure you are logged in and have a valid token in localStorage');

// Export for browser console
if (typeof window !== 'undefined') {
  window.testTripDetailsAPI = testTripDetailsAPI;
}
