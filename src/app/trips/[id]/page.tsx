'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import tripService from '@/services/tripService';
import { TripViewModel } from '@/types/trip';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapPin, Clock, Calendar, Users, Bus, ArrowLeft, Edit, Route, Gauge, User, Activity } from 'lucide-react';

export default function TripDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await tripService.getById(id);
        setTrip(data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Failed to load trip:', errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [params, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Delayed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <TripDetailsSkeleton />;
  if (!trip) return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Trip not found</h1>
        <p className="text-gray-600 mb-6">The trip you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
        <Link href="/trips">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to trips
          </Button>
        </Link>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Creative Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/trips">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Trip #{trip.id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(trip.status)}>
                  {trip.status}
                </Badge>
                <span className="text-sm text-text-secondary">• ID: {trip.id}</span>
              </div>
            </div>
          </div>
          <Link href={`/trips/edit/${trip.id}`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Trip
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Bus className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-text-secondary">Bus ID</p>
              <p className="font-semibold">{trip.busId}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-text-secondary">Available Seats</p>
              <p className="font-semibold">{trip.avalableSeates}/{trip.totalSeats}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-text-secondary">Date</p>
              <p className="font-semibold">{new Date(trip.tripDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-text-secondary">Duration</p>
              <p className="font-semibold">{trip.departureTimeOnly} - {trip.arrivalTimeOnly}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="rounded-xl border bg-sky-50/60">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Route className="w-5 h-5" />
              Trip Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Driver ID" value={trip.driverId} />
              <DetailItem label="Conductor ID" value={trip.conductorId} />
              <DetailItem label="Departure Time" value={trip.departureTimeOnly} />
              <DetailItem label="Arrival Time" value={trip.arrivalTimeOnly} />
              <DetailItem label="Total Seats" value={trip.totalSeats} />
              <DetailItem label="Booked Seats" value={trip.bookedSeats} />
            </div>
          </div>
        </Card>

        {/* Route Information */}
        <Card className="rounded-xl border bg-emerald-50/60">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Information
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/70 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Start Location</span>
                </div>
                <p className="text-gray-700 ml-6">{trip.startLocation}</p>
              </div>
              <div className="p-4 bg-white/70 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">End Location</span>
                </div>
                <p className="text-gray-700 ml-6">{trip.endLocation}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stop Locations */}
      <Card className="rounded-xl border bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Stop Locations
            </h2>
            <Badge variant="outline">
              {trip.stopLocations?.length || 0} stops
            </Badge>
          </div>
          
          {trip.stopLocations && trip.stopLocations.length > 0 ? (
            <div className="space-y-4">
              {trip.stopLocations.map((stop, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-800">{index + 1}</span>
                    </div>
                    {index < trip.stopLocations.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{stop.address}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Arrival: {stop.arrivalTimeOnly}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Departure: {stop.departureTimeOnly}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No stops scheduled for this trip</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Component for detail items
const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

// Skeleton loader for better loading experience
const TripDetailsSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border bg-white/70 backdrop-blur p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="rounded-xl border bg-sky-50/60 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="rounded-xl border bg-emerald-50/60 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    </div>

    <Card className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  </div>
);