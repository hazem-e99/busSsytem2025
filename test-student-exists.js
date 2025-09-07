// Test if student exists in the system
const BASE_URL = 'http://localhost:7126/api';

// Get token from localStorage (run this in browser console)
function getTokenFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || user?.accessToken;
  }
  return null;
}

// Test student existence
async function testStudentExists() {
  console.log('🔍 Testing student existence...');
  
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
    // Get current user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentStudentId = user?.id || user?.userId;
    
    console.log('👤 Current user from localStorage:', user);
    console.log('🆔 Student ID to test:', currentStudentId);
    
    if (!currentStudentId) {
      console.error('❌ No student ID found in localStorage');
      return;
    }
    
    // Test 1: Get all students
    console.log('\n1️⃣ Getting all students...');
    const studentsResponse = await fetch(`${BASE_URL}/Users/students-data`, { headers });
    console.log('Students response status:', studentsResponse.status);
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      const students = studentsData?.data || [];
      console.log('✅ Found', students.length, 'students');
      
      // Check if our student exists
      const ourStudent = students.find(s => s.id == currentStudentId || s.userId == currentStudentId);
      if (ourStudent) {
        console.log('✅ Our student found:', ourStudent);
      } else {
        console.log('❌ Our student NOT found in students list');
        console.log('Available student IDs:', students.map(s => s.id || s.userId));
      }
    } else {
      console.error('❌ Failed to get students:', studentsResponse.status, studentsResponse.statusText);
    }
    
    // Test 2: Try to get student by ID
    console.log('\n2️⃣ Testing direct student lookup...');
    const studentResponse = await fetch(`${BASE_URL}/Users/students-data/${currentStudentId}`, { headers });
    console.log('Student lookup response status:', studentResponse.status);
    
    if (studentResponse.ok) {
      const studentData = await studentResponse.json();
      console.log('✅ Student found:', studentData);
    } else {
      console.error('❌ Student not found:', studentResponse.status, studentResponse.statusText);
      const errorText = await studentResponse.text();
      console.error('Error details:', errorText);
    }
    
    // Test 3: Check user profile
    console.log('\n3️⃣ Testing user profile...');
    const profileResponse = await fetch(`${BASE_URL}/Users/profile`, { headers });
    console.log('Profile response status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ User profile:', profileData);
    } else {
      console.error('❌ Profile not found:', profileResponse.status, profileResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
console.log('🚀 Run testStudentExists() to check if student exists');
console.log('💡 Make sure you are logged in and have a valid token in localStorage');

// Export for browser console
if (typeof window !== 'undefined') {
  window.testStudentExists = testStudentExists;
}
