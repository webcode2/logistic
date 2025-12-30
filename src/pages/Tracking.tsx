import { useState } from 'react';
import { Search, MapPin, ArrowRight, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Track Your Shipment</h1>
            <p className="text-background/70 mb-8">
              Enter your tracking code to get real-time updates on your package
            </p>

            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter tracking code (e.g., LGT-2024-001234)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="pl-12 h-14 text-base bg-background text-foreground border-0 shadow-xl"
                />
              </div>
              <Button type="submit" size="lg" disabled={isLoading || !trackingCode.trim()} className="h-14 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                {isLoading ? 'Searching...' : 'Track'}
              </Button>
            </form>

            {/* Sample tracking codes hint */}
            <p className="mt-4 text-sm text-background/60">
              Try: <span className="font-mono text-primary cursor-pointer hover:underline" onClick={() => setTrackingCode('LGT-2024-001234')}>LGT-2024-001234</span>
              {' '} or {' '}
              <span className="font-mono text-primary cursor-pointer hover:underline" onClick={() => setTrackingCode('LGT-2024-005678')}>LGT-2024-005678</span>
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Loading State */}
        {isLoading && (
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
        {error && !isLoading && (
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
        {waybill && !isLoading && (
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
                    {waybill.status}
                  </Badge>
                </div>

                {/* Tracking Info */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div className="bg-background/10 rounded-lg p-3">
                    <p className="text-background/60 text-xs uppercase tracking-wider">Tracking Code</p>
                    <p className="font-mono font-bold text-primary">{waybill.trackingCode}</p>
                  </div>
                  <div className="bg-background/10 rounded-lg p-3">
                    <p className="text-background/60 text-xs uppercase tracking-wider">Est. Delivery</p>
                    <p className="font-semibold">{new Date(waybill.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-background/10 rounded-lg p-3">
                    <p className="text-background/60 text-xs uppercase tracking-wider">Weight</p>
                    <p className="font-semibold">{waybill.weight}</p>
                  </div>
                  <div className="bg-background/10 rounded-lg p-3">
                    <p className="text-background/60 text-xs uppercase tracking-wider">Current Location</p>
                    <p className="font-semibold">{waybill.currentLocation}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <h3 className="font-bold text-foreground mb-6 text-lg">Tracking Timeline</h3>
                
                {/* Timeline */}
                <div className="relative space-y-0">
                  {waybill.events.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Timeline line */}
                      {index !== waybill.events.length - 1 && (
                        <div className="absolute left-[19px] top-12 h-full w-0.5 bg-border" />
                      )}
                      
                      {/* Icon */}
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg',
                        index === 0 ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-muted text-muted-foreground'
                      )}>
                        {getStatusIcon(event.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="font-bold text-foreground">{event.status}</h4>
                          <time className="text-sm text-muted-foreground font-medium">
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </div>
                        <p className="text-sm text-primary font-medium mt-1">{event.location}</p>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
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
  );
};

export default Tracking;
