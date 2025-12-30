import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Package, MapPin, RefreshCw, Truck, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { logout } from '@/store/authSlice';
import { fetchAllShipments, addTrackingEvent, createShipment, NewShipmentData } from '@/store/adminSlice';
import { ShipmentStatus, Waybill } from '@/data/mockData';
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

const statusOptions: ShipmentStatus[] = [
  'Processing',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'On Hold',
];

const Admin = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Waybill | null>(null);
  const [newEvent, setNewEvent] = useState({
    status: '' as ShipmentStatus,
    location: '',
    description: '',
    date: '',
    time: '',
  });
  const [newShipment, setNewShipment] = useState<NewShipmentData>({
    trackingCode: '',
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    shipperName: '',
    receiverName: '',
    estimatedDelivery: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { shipments, isLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllShipments());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenUpdateModal = (shipment: Waybill) => {
    setSelectedShipment(shipment);
    const now = new Date();
    setNewEvent({ 
      status: '' as ShipmentStatus, 
      location: '', 
      description: '',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    });
    setIsUpdateModalOpen(true);
  };

  const handleOpenNewShipmentModal = () => {
    const trackingCode = `LGT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    setNewShipment({
      trackingCode,
      origin: '',
      destination: '',
      weight: '',
      dimensions: '',
      shipperName: '',
      receiverName: '',
      estimatedDelivery: '',
    });
    setIsNewShipmentModalOpen(true);
  };

  const handleSubmitEvent = async () => {
    if (!selectedShipment) return;
    
    if (!newEvent.status || !newEvent.location.trim() || !newEvent.description.trim() || !newEvent.date || !newEvent.time) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields including date and time.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    const timestamp = new Date(`${newEvent.date}T${newEvent.time}:00`).toISOString();
    
    await dispatch(
      addTrackingEvent({
        waybillId: selectedShipment.id,
        event: {
          timestamp,
          status: newEvent.status,
          location: newEvent.location,
          description: newEvent.description,
        },
      })
    );

    toast({
      title: 'Success',
      description: 'Tracking event added successfully.',
    });

    setIsUpdateModalOpen(false);
    setSelectedShipment(null);
    setIsSubmitting(false);
  };

  const handleSubmitNewShipment = async () => {
    if (!newShipment.origin.trim() || !newShipment.destination.trim() || 
        !newShipment.shipperName.trim() || !newShipment.receiverName.trim() ||
        !newShipment.estimatedDelivery) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    await dispatch(createShipment(newShipment));

    toast({
      title: 'Success',
      description: 'New shipment created successfully.',
    });

    setIsNewShipmentModalOpen(false);
    setIsSubmitting(false);
  };

  const handleRefresh = () => {
    dispatch(fetchAllShipments());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-foreground text-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-background/70">
                  Welcome, <span className="font-medium text-primary">{user?.username}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-background/20 text-background hover:bg-background hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-foreground to-foreground/90 text-background">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-background/70">Total Shipments</p>
                  <p className="text-3xl font-bold">{shipments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                  <MapPin className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-3xl font-bold text-info">
                    {shipments.filter((s) => s.status === 'In Transit').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Package className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-3xl font-bold text-success">
                    {shipments.filter((s) => s.status === 'Delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Package className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On Hold</p>
                  <p className="text-3xl font-bold text-warning">
                    {shipments.filter((s) => s.status === 'On Hold').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments Table */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-foreground to-foreground/90 text-background">
            <div>
              <CardTitle className="text-background">All Shipments</CardTitle>
              <CardDescription className="text-background/70">Manage and update shipment locations</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="border-background/20 text-background hover:bg-background hover:text-foreground"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={handleOpenNewShipmentModal}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Shipment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-bold">Tracking Code</TableHead>
                      <TableHead className="font-bold">Origin</TableHead>
                      <TableHead className="font-bold">Destination</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Est. Delivery</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-semibold text-primary">
                          {shipment.trackingCode}
                        </TableCell>
                        <TableCell className="font-medium">{shipment.origin}</TableCell>
                        <TableCell className="font-medium">{shipment.destination}</TableCell>
                        <TableCell>
                          <Badge className={cn("font-medium", getStatusColor(shipment.status))}>
                            {shipment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(shipment)}
                            className="bg-foreground text-background hover:bg-foreground/80"
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Update Location
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Update Location Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Update Tracking Location
            </DialogTitle>
            <DialogDescription>
              {selectedShipment && (
                <span className="font-mono font-semibold text-primary">{selectedShipment.trackingCode}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newEvent.status}
                onValueChange={(value) =>
                  setNewEvent((prev) => ({ ...prev, status: value as ShipmentStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos Sorting Facility"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the tracking event..."
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEvent} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? 'Adding...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Shipment Modal */}
      <Dialog open={isNewShipmentModalOpen} onOpenChange={setIsNewShipmentModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Create New Shipment
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new shipment
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="trackingCode">Tracking Code</Label>
              <Input
                id="trackingCode"
                value={newShipment.trackingCode}
                onChange={(e) =>
                  setNewShipment((prev) => ({ ...prev, trackingCode: e.target.value }))
                }
                className="font-mono font-semibold"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Lagos, Nigeria"
                  value={newShipment.origin}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, origin: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., London, UK"
                  value={newShipment.destination}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, destination: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipperName">Shipper Name *</Label>
                <Input
                  id="shipperName"
                  placeholder="Sender's name or company"
                  value={newShipment.shipperName}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, shipperName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name *</Label>
                <Input
                  id="receiverName"
                  placeholder="Recipient's name or company"
                  value={newShipment.receiverName}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, receiverName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 15.5 kg"
                  value={newShipment.weight}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, weight: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  placeholder="e.g., 45 x 35 x 25 cm"
                  value={newShipment.dimensions}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, dimensions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Est. Delivery *</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={newShipment.estimatedDelivery}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, estimatedDelivery: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewShipmentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitNewShipment} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? 'Creating...' : 'Create Shipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
