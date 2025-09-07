'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MovementManagerDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to buses page immediately
    router.replace('/dashboard/movement-manager/buses');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-6 text-lg text-gray-600 font-medium">Redirecting to Bus Management...</p>
        <p className="mt-2 text-gray-500">Please wait while we navigate to the buses page</p>
      </div>
    </div>
  );
}
