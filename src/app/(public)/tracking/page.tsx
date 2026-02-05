'use client';

import { useState, useTransition } from 'react';
import { Search, MapPin, ArrowRight, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getWaybillByTrackingCode, getTrackingEvents } from '@/actions/tracking';
import { cn } from '@/lib/utils';
import MainLayout from '@/components/layout/MainLayout';
import type { Waybill, ShipmentStatus, TrackingEvent } from '@prisma/client';

const getStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'IN_TRANSIT':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'ARRIVED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const statusDisplay: Record<ShipmentStatus, string> = {
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  DELIVERED: 'Delivered',
};

const getStatusIcon = (status: ShipmentStatus) => {
  switch (status) {
    case 'DELIVERED':
      return <CheckCircle className="h-5 w-5" />;
    case 'IN_TRANSIT':
    case 'ARRIVED':
      return <Truck className="h-5 w-5" />;
    case 'PROCESSING':
      return <Package className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

import Image from 'next/image';

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [waybill, setWaybill] = useState<Waybill | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      startTransition(async () => {
        try {
          const result = await getWaybillByTrackingCode(trackingCode.trim());
          if (result.success && result.waybill) {
            setWaybill(result.waybill);
            setError(null);
            // Fetch tracking events for this waybill
            const eventsResult = await getTrackingEvents(result.waybill.id);
            setTrackingEvents(eventsResult.events || []);
          } else {
            setError(result.error || 'Waybill not found');
            setWaybill(null);
            setTrackingEvents([]);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setWaybill(null);
          setTrackingEvents([]);
        }
      });
    }
  };

  const handleClear = () => {
    setTrackingCode('');
    setWaybill(null);
    setTrackingEvents([]);
    setError(null);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-[#0a0a0a] text-background py-24 lg:py-32 overflow-hidden items-center flex">
          {/* Subtle Animated Radiant/Radial Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-primary/20 rounded-full blur-[120px] animate-drift opacity-50" />
            <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-primary/10 rounded-full blur-[100px] animate-drift [animation-delay:2s] opacity-30" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-primary/15 rounded-full blur-[130px] animate-drift [animation-delay:4s] opacity-40" />
          </div>

          <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter uppercase font-heading italic lg:whitespace-nowrap">
                Track Your Shipment
              </h1>
              <p className="text-background/60 mb-12 text-lg lg:text-xl max-w-2xl mx-auto font-sans leading-relaxed tracking-wide">
                Get real-time updates on your cargo's journey through our integrated global network.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto scale-110">
                <div className="relative flex-1 ">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter tracking code (e.g., RRT-2024-XXXXXX)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="pl-12 h-16 text-lg bg-background text-foreground border-0 shadow-2xl rounded-2xl"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isPending || !trackingCode.trim()} className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 rounded-2xl">
                  {isPending ? 'Searching...' : 'Track Now'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Loading State */}
          {isPending && (
            <div className="mx-auto max-w-3xl">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-20 w-full" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error State */}
          {error && !isPending && (
            <div className="mx-auto max-w-2xl">
              <Alert variant="destructive" className="border-0 shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Waybill Not Found</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={handleClear} className="border-foreground/20">
                  Try Another Code
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {waybill && !isPending && (
            <div className="mx-auto max-w-3xl animate-fade-in">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-foreground to-foreground/90 text-background">
                  {/* Route Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/10">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span>{waybill.origin}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-background/50" />
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span>{waybill.destination}</span>
                      </div>
                    </div>
                    <Badge className={cn('text-sm font-medium', getStatusColor(waybill.status))}>
                      {statusDisplay[waybill.status]}
                    </Badge>
                  </div>

                  {/* Tracking Info */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div className="bg-background/10 rounded-lg p-3">
                      <p className="text-background/60 text-xs uppercase tracking-wider">Tracking Code</p>
                      <p className="font-mono font-bold text-primary">{waybill.tracking_code}</p>
                    </div>
                    <div className="bg-background/10 rounded-lg p-3">
                      <p className="text-background/60 text-xs uppercase tracking-wider">Est. Delivery</p>
                      <p className="font-semibold">{new Date(waybill.estimated_delivery_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-background/10 rounded-lg p-3">
                      <p className="text-background/60 text-xs uppercase tracking-wider">Weight</p>
                      <p className="font-semibold">{waybill.weight}</p>
                    </div>
                    <div className="bg-background/10 rounded-lg p-3">
                      <p className="text-background/60 text-xs uppercase tracking-wider">Dimensions</p>
                      <p className="font-semibold">{waybill.dimensions}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8">
                  <h3 className="font-bold text-foreground mb-6 text-lg">Tracking Timeline</h3>

                  {/* Timeline */}
                  <div className="relative space-y-0">
                    {trackingEvents.length > 0 ? (
                      trackingEvents.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                          {/* Timeline line */}
                          {index !== trackingEvents.length - 1 && (
                            <div className="absolute left-[19px] top-12 h-full w-0.5 bg-border" />
                          )}

                          {/* Icon */}
                          <div className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg',
                            index === 0 ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-muted text-muted-foreground'
                          )}>
                            <Package className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <h4 className="font-bold text-foreground">{event.event_type}</h4>
                              <time className="text-sm text-muted-foreground font-medium">
                                {new Date(event.timestamp).toLocaleString()}
                              </time>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No tracking events yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <Button variant="outline" onClick={handleClear} className="border-foreground/20 hover:bg-foreground hover:text-background">
                  Track Another Shipment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout >
  );
}
