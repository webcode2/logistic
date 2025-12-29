import { useState } from 'react';
import { Search, MapPin, ArrowRight, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchWaybill, clearTracking } from '@/store/trackingSlice';
import { ShipmentStatus } from '@/data/mockData';
import { cn } from '@/lib/utils';

const getStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case 'Delivered':
      return 'bg-success text-success-foreground';
    case 'In Transit':
      return 'bg-info text-info-foreground';
    case 'Out for Delivery':
      return 'bg-primary text-primary-foreground';
    case 'Processing':
      return 'bg-secondary text-secondary-foreground';
    case 'Picked Up':
      return 'bg-secondary text-secondary-foreground';
    case 'On Hold':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: ShipmentStatus) => {
  switch (status) {
    case 'Delivered':
      return <CheckCircle className="h-5 w-5" />;
    case 'In Transit':
    case 'Out for Delivery':
      return <Truck className="h-5 w-5" />;
    case 'Processing':
    case 'Picked Up':
      return <Package className="h-5 w-5" />;
    case 'On Hold':
      return <Clock className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const dispatch = useAppDispatch();
  const { waybill, isLoading, error } = useAppSelector((state) => state.tracking);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      dispatch(fetchWaybill(trackingCode.trim()));
    }
  };

  const handleClear = () => {
    setTrackingCode('');
    dispatch(clearTracking());
  };

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        {/* Search Section */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Track Your Shipment</h1>
          <p className="text-muted-foreground mb-8">
            Enter your tracking code to get real-time updates on your package
          </p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter tracking code (e.g., LGT-2024-001234)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading || !trackingCode.trim()}>
              {isLoading ? 'Searching...' : 'Track'}
            </Button>
          </form>

          {/* Sample tracking codes hint */}
          <p className="mt-4 text-sm text-muted-foreground">
            Try: <span className="font-mono text-primary cursor-pointer" onClick={() => setTrackingCode('LGT-2024-001234')}>LGT-2024-001234</span>
            {' '} or {' '}
            <span className="font-mono text-primary cursor-pointer" onClick={() => setTrackingCode('LGT-2024-005678')}>LGT-2024-005678</span>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mx-auto max-w-3xl">
            <Card>
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
        {error && !isLoading && (
          <div className="mx-auto max-w-2xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Waybill Not Found</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleClear}>
                Try Another Code
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {waybill && !isLoading && (
          <div className="mx-auto max-w-3xl animate-fade-in">
            <Card>
              <CardHeader className="border-b">
                {/* Route Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{waybill.origin}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{waybill.destination}</span>
                    </div>
                  </div>
                  <Badge className={cn('text-sm', getStatusColor(waybill.status))}>
                    {waybill.status}
                  </Badge>
                </div>

                {/* Tracking Info */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tracking Code</p>
                    <p className="font-mono font-semibold">{waybill.trackingCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Delivery</p>
                    <p className="font-semibold">{new Date(waybill.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-semibold">{waybill.weight}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Location</p>
                    <p className="font-semibold">{waybill.currentLocation}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Tracking Timeline</h3>
                
                {/* Timeline */}
                <div className="relative space-y-0">
                  {waybill.events.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {index !== waybill.events.length - 1 && (
                        <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
                      )}
                      
                      {/* Icon */}
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {getStatusIcon(event.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="font-semibold text-foreground">{event.status}</h4>
                          <time className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                        <p className="text-sm text-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Button variant="outline" onClick={handleClear}>
                Track Another Shipment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
