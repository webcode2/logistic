import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Package, MapPin, RefreshCw } from 'lucide-react';
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
import { fetchAllShipments, addTrackingEvent } from '@/store/adminSlice';
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
  const [selectedShipment, setSelectedShipment] = useState<Waybill | null>(null);
  const [newEvent, setNewEvent] = useState({
    status: '' as ShipmentStatus,
    location: '',
    description: '',
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
    setNewEvent({ status: '' as ShipmentStatus, location: '', description: '' });
    setIsUpdateModalOpen(true);
  };

  const handleSubmitEvent = async () => {
    if (!selectedShipment) return;
    
    if (!newEvent.status || !newEvent.location.trim() || !newEvent.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    await dispatch(
      addTrackingEvent({
        waybillId: selectedShipment.id,
        event: {
          timestamp: new Date().toISOString(),
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

  const handleRefresh = () => {
    dispatch(fetchAllShipments());
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, <span className="font-medium">{user?.username}</span>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Shipments</p>
                  <p className="text-2xl font-bold">{shipments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                  <MapPin className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">
                    {shipments.filter((s) => s.status === 'In Transit').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Package className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">
                    {shipments.filter((s) => s.status === 'Delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Package className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On Hold</p>
                  <p className="text-2xl font-bold">
                    {shipments.filter((s) => s.status === 'On Hold').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Shipments</CardTitle>
              <CardDescription>Manage and update shipment locations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Code</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono font-medium">
                          {shipment.trackingCode}
                        </TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(shipment)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Update
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tracking Event</DialogTitle>
            <DialogDescription>
              {selectedShipment && (
                <span className="font-mono">{selectedShipment.trackingCode}</span>
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
            <Button onClick={handleSubmitEvent} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
