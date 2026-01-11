'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Package, MapPin, RefreshCw, Truck, Calendar, Clock, Settings } from 'lucide-react';
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
import { logoutAction, getAuthStatus } from '@/actions/auth';
import { getAllWaybillsAdmin, updateWaybillLocation, createNewWaybill, moveWaybillToNode } from '@/actions/admin';
import { getAllRoutes, getAllTerminals, createTerminal, updateTerminal, deleteTerminal, createRoute, updateRoute, deleteRoute } from '@/actions/tracking';
import { sendShipmentConfirmationEmail } from '@/actions/email';
import { cn } from '@/lib/utils';
import type { Waybill, ShipmentStatus, Route } from '@prisma/client';

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

const statusOptions: ShipmentStatus[] = [
  'PROCESSING',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
];

const statusDisplay: Record<ShipmentStatus, string> = {
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  DELIVERED: 'Delivered',
};

export default function AdminPage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Waybill | null>(null);
  const [shipments, setShipments] = useState<Waybill[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [isTerminalsModalOpen, setIsTerminalsModalOpen] = useState(false);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [isManageRoutesModalOpen, setIsManageRoutesModalOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeBuilder, setRouteBuilder] = useState<Array<{ terminal: any; details?: string }>>([]);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDescription, setNewRouteDescription] = useState('');
  const [newTerminalName, setNewTerminalName] = useState('');
  const [newTerminalLocation, setNewTerminalLocation] = useState('');
  const [newTerminalAvgDays, setNewTerminalAvgDays] = useState<number | ''>('');
  const [editingTerminalId, setEditingTerminalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    status: 'PROCESSING' as ShipmentStatus,
    location: '',
    description: '',
    date: '',
    time: '',
    targetNodeIndex: -1,
  });
  const [newShipment, setNewShipment] = useState({
    trackingCode: '',
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    shipper_name: '',
    shipper_email: '',
    shipper_phone: '',
    shipper_address: '',
    receiver_name: '',
    receiver_email: '',
    receiver_phone: '',
    receiver_address: '',
    route_id: '',
  });
  
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        setIsLoading(true);
        // Verify auth status first
        const authStatus = await getAuthStatus();
        console.log('Auth Status:', authStatus);
        
        if (!authStatus.isAuthenticated) {
          console.error('User is not authenticated');
          toast({
            title: 'Unauthorized',
            description: 'You are not authenticated. Please log in again.',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        
        if (authStatus.role !== 'ADMIN') {
          console.error('User role is not ADMIN:', authStatus.role);
          toast({
            title: 'Unauthorized',
            description: 'You do not have admin access',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }

        // Load data
        await Promise.all([
          (async () => {
            const result = await getAllWaybillsAdmin();
            if (result.success) {
              setShipments(result.waybills);
            } else {
              console.error('Failed to load waybills:', result.error);
            }
          })(),
          (async () => {
            const result = await getAllRoutes();
            if (result.success) {
              setRoutes(result.routes);
            } else {
              console.error('Failed to load routes:', result.error);
            }
          })(),
          (async () => {
            const res = await getAllTerminals();
            if (res.success) {
              setTerminals(res.terminals);
            } else {
              console.error('Failed to load terminals:', res.error);
            }
          })(),
        ]);
      } catch (error) {
        console.error('Error initializing admin:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, [toast, router]);
  
  const loadTerminals = () => {
    startTransition(async () => {
      try {
        const res = await getAllTerminals();
        if (res.success) setTerminals(res.terminals);
      } catch (error) {
        console.error('Failed to load terminals', error);
      }
    });
  };

  const handleCreateTerminal = () => {
    if (!newTerminalName.trim() || !newTerminalLocation.trim() || !newTerminalAvgDays) {
      toast({ title: 'Error', description: 'Please fill all terminal fields', variant: 'destructive' });
      return;
    }
    startTransition(async () => {
      try {
        const res = await createTerminal({ name: newTerminalName, location: newTerminalLocation, average_processing_days: Number(newTerminalAvgDays) });
        if (res.success) {
          toast({ title: 'Success', description: 'Terminal created' });
          setNewTerminalName('');
          setNewTerminalLocation('');
          setNewTerminalAvgDays('');
          loadTerminals();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to create terminal', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create terminal', variant: 'destructive' });
      }
    });
  };

  const handleSaveTerminal = (terminal_id?: string) => {
    const id = terminal_id ?? editingTerminalId;
    if (!id) return;
    startTransition(async () => {
      try {
        const res = await updateTerminal(id, { name: newTerminalName, location: newTerminalLocation, average_processing_days: Number(newTerminalAvgDays) });
        if (res.success) {
          toast({ title: 'Success', description: 'Terminal updated' });
          setEditingTerminalId(null);
          setNewTerminalName('');
          setNewTerminalLocation('');
          setNewTerminalAvgDays('');
          loadTerminals();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update terminal', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update terminal', variant: 'destructive' });
      }
    });
  };

  const handleDeleteTerminalLocal = (terminal_id: string) => {
    startTransition(async () => {
      try {
        const res = await deleteTerminal(terminal_id);
        if (res.success) {
          toast({ title: 'Success', description: 'Terminal deleted' });
          loadTerminals();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to delete terminal', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete terminal', variant: 'destructive' });
      }
    });
  };

  const handleAddNodeToRoute = (terminal: any) => {
    setRouteBuilder((prev) => [...prev, { terminal, details: '' }]);
  };

  const handleRemoveNodeFromRoute = (index: number) => {
    setRouteBuilder((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    setRouteBuilder((prev) => {
      const copy = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= copy.length) return prev;
      const tmp = copy[swapIndex];
      copy[swapIndex] = copy[index];
      copy[index] = tmp;
      return copy;
    });
  };

  const handleUpdateNodeDetails = (index: number, details: string) => {
    setRouteBuilder((prev) => prev.map((n, i) => i === index ? { ...n, details } : n));
  };

  const handleCreateRouteLocal = () => {
    if (!newRouteName.trim() || routeBuilder.length < 2) {
      toast({ title: 'Error', description: 'Provide route name and at least two nodes', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const terminal_ids = routeBuilder.map((r) => r.terminal.id);
        const terminal_details = routeBuilder.map((r) => r.details || '');
        const res = await createRoute({ name: newRouteName, terminal_ids, terminal_details, description: newRouteDescription });
        if (res.success) {
          toast({ title: 'Success', description: 'Route created' });
          setIsCreateRouteModalOpen(false);
          setRouteBuilder([]);
          setNewRouteName('');
          setNewRouteDescription('');
          loadRoutes();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to create route', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create route', variant: 'destructive' });
      }
    });
  };

  const handleOpenEditRoute = (route: Route) => {
    setEditingRouteId(route.id);
    setNewRouteName(route.name);
    setNewRouteDescription(route.description || '');
    const nodes = (route as any).nodes || [];
    setRouteBuilder(nodes.map((n: any) => ({ terminal: n.terminal, details: '' })));
    setIsEditRouteModalOpen(true);
  };

  const handleUpdateRouteLocal = () => {
    if (!editingRouteId || !newRouteName.trim() || routeBuilder.length < 2) {
      toast({ title: 'Error', description: 'Provide route name and at least two nodes', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const terminal_ids = routeBuilder.map((r) => r.terminal.id);
        const terminal_details = routeBuilder.map((r) => r.details || '');
        const res = await updateRoute(editingRouteId, { name: newRouteName, terminal_ids, terminal_details, description: newRouteDescription });
        if (res.success) {
          toast({ title: 'Success', description: 'Route updated' });
          setIsEditRouteModalOpen(false);
          setEditingRouteId(null);
          setRouteBuilder([]);
          setNewRouteName('');
          setNewRouteDescription('');
          loadRoutes();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update route', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update route', variant: 'destructive' });
      }
    });
  };

  const handleDeleteRouteLocal = (route_id: string) => {
    if (!confirm('Delete this route? This cannot be undone.')) return;
    startTransition(async () => {
      try {
        const res = await deleteRoute(route_id);
        if (res.success) {
          toast({ title: 'Success', description: 'Route deleted' });
          loadRoutes();
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to delete route', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete route', variant: 'destructive' });
      }
    });
  };

  const loadShipments = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await getAllWaybillsAdmin();
        if (result.success) {
          setShipments(result.waybills);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load shipments',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load shipments',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    });
  };

  const loadRoutes = () => {
    startTransition(async () => {
      try {
        const result = await getAllRoutes();
        if (result.success) {
          setRoutes(result.routes);
        }
      } catch (error) {
        console.error('Failed to load routes:', error);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  const handleOpenUpdateModal = (shipment: Waybill) => {
    setSelectedShipment(shipment);
    const now = new Date();
    setNewEvent({
      status: 'PROCESSING' as ShipmentStatus,
      location: '',
      description: '',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      targetNodeIndex: shipment.current_node_index + 1,
    });
    setIsUpdateModalOpen(true);
  };

  const handleOpenNewShipmentModal = () => {
    setNewShipment({
      trackingCode: '',
      origin: '',
      destination: '',
      weight: '',
      dimensions: '',
      shipper_name: '',
      shipper_email: '',
      shipper_phone: '',
      shipper_address: '',
      receiver_name: '',
      receiver_email: '',
      receiver_phone: '',
      receiver_address: '',
      route_id: '',
    });
    setIsNewShipmentModalOpen(true);
  };

  const handleSubmitEvent = () => {
    if (!selectedShipment) return;

    if (newEvent.targetNodeIndex < 0 || !newEvent.date || !newEvent.time) {
      toast({
        title: 'Error',
        description: 'Please select a target node and provide date/time.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await moveWaybillToNode(selectedShipment.id, newEvent.targetNodeIndex);
        
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Waybill moved to selected node successfully.',
          });
          setIsUpdateModalOpen(false);
          setSelectedShipment(null);
          loadShipments();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to move waybill',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to move waybill',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSubmitNewShipment = () => {
    if (!newShipment.origin.trim() || !newShipment.destination.trim() || 
        !newShipment.shipper_name.trim() || !newShipment.shipper_email.trim() ||
        !newShipment.shipper_phone.trim() || !newShipment.shipper_address.trim() ||
        !newShipment.receiver_name.trim() || !newShipment.receiver_email.trim() ||
        !newShipment.receiver_phone.trim() || !newShipment.receiver_address.trim() ||
        !newShipment.route_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createNewWaybill({
          route_id: newShipment.route_id,
          shipper_name: newShipment.shipper_name,
          shipper_email: newShipment.shipper_email,
          shipper_phone: newShipment.shipper_phone,
          shipper_address: newShipment.shipper_address,
          receiver_name: newShipment.receiver_name,
          receiver_email: newShipment.receiver_email,
          receiver_phone: newShipment.receiver_phone,
          receiver_address: newShipment.receiver_address,
          origin: newShipment.origin,
          destination: newShipment.destination,
          weight: newShipment.weight || 'Not specified',
          dimensions: newShipment.dimensions || 'Not specified',
        });

        if (result.success && result.waybill) {
          // Send confirmation emails
          const trackingUrl = `${process.env.NEXT_PUBLIC_API_URL}/tracking/${result.waybill.tracking_code}`;
          const emailResult = await sendShipmentConfirmationEmail({
            waybill: result.waybill,
            trackingUrl,
          });

          toast({
            title: 'Success',
            description: 'Waybill created and confirmation emails sent successfully.',
          });
          
          // Reset form
          setNewShipment({
            trackingCode: '',
            origin: '',
            destination: '',
            weight: '',
            dimensions: '',
            shipper_name: '',
            shipper_email: '',
            shipper_phone: '',
            shipper_address: '',
            receiver_name: '',
            receiver_email: '',
            receiver_phone: '',
            receiver_address: '',
            route_id: '',
          });
          
          setIsNewShipmentModalOpen(false);
          loadShipments();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to create waybill',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create waybill',
          variant: 'destructive',
        });
      }
    });
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
                  Welcome, <span className="font-medium text-primary">admin</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
                disabled={isPending}
                className="border-background/20 text-foreground hover:bg-background hover:text-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                disabled={isPending}
                className="border-background/20 text-foreground hover:bg-background hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">
                    {shipments.filter((s) => s.status === 'IN_TRANSIT').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-200" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-200">
                    {shipments.filter((s) => s.status === 'DELIVERED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
                  <Package className="h-6 w-6 text-amber-600 dark:text-amber-200" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arrived</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-200">
                    {shipments.filter((s) => s.status === 'ARRIVED').length}
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
                onClick={loadShipments}
                disabled={isLoading || isPending}
                className="border-background/20 text-foreground hover:bg-background hover:text-foreground"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageRoutesModalOpen(true)}
                disabled={isPending}
                className="border-background/20 text-foreground hover:bg-background hover:text-foreground"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Routes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTerminalsModalOpen(true)}
                disabled={isPending}
                className="border-background/20 text-foreground hover:bg-background hover:text-foreground"
              >
                <Truck className="h-4 w-4 mr-2" />
                Manage Terminals
              </Button>
              <Button 
                size="sm" 
                onClick={handleOpenNewShipmentModal}
                disabled={isPending}
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
                          {shipment.tracking_code}
                        </TableCell>
                        <TableCell className="font-medium">{shipment.origin}</TableCell>
                        <TableCell className="font-medium">{shipment.destination}</TableCell>
                        <TableCell>
                          <Badge className={cn("font-medium", getStatusColor(shipment.status))}>
                            {statusDisplay[shipment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(shipment.estimated_delivery_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(shipment)}
                            disabled={isPending}
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
              Move Shipment to Next Node
            </DialogTitle>
            <DialogDescription>
              {selectedShipment && (
                <span className="font-mono font-semibold text-primary">{selectedShipment.tracking_code}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Current Details:</p>
              <div className="space-y-1 text-sm">
                <p>Origin: {selectedShipment?.origin}</p>
                <p>Destination: {selectedShipment?.destination}</p>
                <p>Status: {selectedShipment && statusDisplay[selectedShipment.status]}</p>
                <p>EDD: {selectedShipment && new Date(selectedShipment.estimated_delivery_date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Route Visualization */}
            {selectedShipment && (selectedShipment as any).route?.nodes && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Route Nodes:</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-muted/50">
                  {(selectedShipment as any).route.nodes.map((node: any, idx: number) => {
                    const isCurrentNode = idx === selectedShipment.current_node_index;
                    const isFutureNode = idx > selectedShipment.current_node_index;
                    return (
                      <button
                        key={node.id}
                        onClick={() => isFutureNode && setNewEvent(prev => ({ ...prev, targetNodeIndex: idx }))}
                        disabled={!isFutureNode}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center gap-2',
                          isCurrentNode && 'bg-blue-100 dark:bg-blue-900 border-blue-400 font-semibold',
                          isFutureNode && newEvent.targetNodeIndex === idx && 'bg-green-100 dark:bg-green-900 border-green-400 font-semibold',
                          isFutureNode && newEvent.targetNodeIndex !== idx && 'hover:bg-muted cursor-pointer border-border',
                          !isFutureNode && !isCurrentNode && 'opacity-50 cursor-not-allowed border-border'
                        )}
                      >
                        <MapPin className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{node.terminal.name}</p>
                          <p className="text-xs opacity-75">{node.terminal.location}</p>
                        </div>
                        {isCurrentNode && <Badge className="bg-blue-600">Current</Badge>}
                        {isFutureNode && newEvent.targetNodeIndex === idx && <Badge className="bg-green-600">Selected</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEvent} disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? 'Moving...' : 'Move Shipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Shipment Modal */}
      <Dialog open={isNewShipmentModalOpen} onOpenChange={setIsNewShipmentModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Create New Waybill
            </DialogTitle>
            <DialogDescription>
              Fill in all details to create a new waybill and send confirmation emails
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Tracking Code and Route */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Tracking Code</Label>
                <Input
                  id="trackingCode"
                  value={newShipment.trackingCode}
                  onChange={(e) =>
                    setNewShipment((prev) => ({ ...prev, trackingCode: e.target.value }))
                  }
                  placeholder="Auto-generated if empty"
                  className="font-mono font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route_id">Route *</Label>
                <Select
                  value={newShipment.route_id}
                  onValueChange={(value) =>
                    setNewShipment((prev) => ({ ...prev, route_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Origin and Destination */}
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

            {/* Shipper Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-4">Shipper (Sender) Details *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipper_name">Name</Label>
                  <Input
                    id="shipper_name"
                    placeholder="Full name or company"
                    value={newShipment.shipper_name}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, shipper_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipper_email">Email</Label>
                  <Input
                    id="shipper_email"
                    type="email"
                    placeholder="sender@example.com"
                    value={newShipment.shipper_email}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, shipper_email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="shipper_phone">Phone</Label>
                  <Input
                    id="shipper_phone"
                    placeholder="+234901234567"
                    value={newShipment.shipper_phone}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, shipper_phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipper_address">Address</Label>
                  <Input
                    id="shipper_address"
                    placeholder="Complete address"
                    value={newShipment.shipper_address}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, shipper_address: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-4">Receiver (Recipient) Details *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver_name">Name</Label>
                  <Input
                    id="receiver_name"
                    placeholder="Full name or company"
                    value={newShipment.receiver_name}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, receiver_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_email">Email</Label>
                  <Input
                    id="receiver_email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={newShipment.receiver_email}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, receiver_email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver_phone">Phone</Label>
                  <Input
                    id="receiver_phone"
                    placeholder="+441234567890"
                    value={newShipment.receiver_phone}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, receiver_phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_address">Address</Label>
                  <Input
                    id="receiver_address"
                    placeholder="Complete address"
                    value={newShipment.receiver_address}
                    onChange={(e) =>
                      setNewShipment((prev) => ({ ...prev, receiver_address: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-4">Package Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsNewShipmentModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitNewShipment} disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? 'Creating...' : 'Create Waybill & Send Emails'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminals Modal */}
      <Dialog open={isTerminalsModalOpen} onOpenChange={setIsTerminalsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">Manage Terminals</DialogTitle>
            <DialogDescription>Create, update, or delete terminals</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-8 px-2">
            {/* Terminal Form */}
            <div className="space-y-5 pr-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Terminal Name</Label>
                <Input 
                  value={newTerminalName} 
                  onChange={(e) => setNewTerminalName(e.target.value)}
                  className="h-10"
                  placeholder="e.g., Lagos Hub"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Location</Label>
                <Input 
                  value={newTerminalLocation} 
                  onChange={(e) => setNewTerminalLocation(e.target.value)}
                  className="h-10"
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Average Processing Days</Label>
                <Input 
                  type="number" 
                  value={String(newTerminalAvgDays)} 
                  onChange={(e) => setNewTerminalAvgDays(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-10"
                  placeholder="e.g., 2"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                {editingTerminalId ? (
                  <>
                    <Button onClick={() => handleSaveTerminal()} className="bg-primary flex-1">Save Terminal</Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setEditingTerminalId(null); setNewTerminalName(''); setNewTerminalLocation(''); setNewTerminalAvgDays(''); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateTerminal} className="bg-primary w-full">Create Terminal</Button>
                )}
              </div>
            </div>
            
            {/* Terminals List */}
            <div className="space-y-3 pl-4 border-l">
              <Label className="text-base font-semibold block">Existing Terminals ({terminals.length})</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {terminals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No terminals yet</p>
                ) : (
                  terminals.map((t) => (
                    <div key={t.id} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.location}</p>
                        <p className="text-xs text-muted-foreground">Process: {t.average_processing_days} days</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs"
                          onClick={() => { setEditingTerminalId(t.id); setNewTerminalName(t.name); setNewTerminalLocation(t.location); setNewTerminalAvgDays(t.average_processing_days); }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-8 text-xs"
                          onClick={() => handleDeleteTerminalLocal(t.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Routes Modal */}
      <Dialog open={isManageRoutesModalOpen} onOpenChange={setIsManageRoutesModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">Manage Routes</DialogTitle>
            <DialogDescription>View, edit, or delete existing routes</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={() => { setIsManageRoutesModalOpen(false); setIsCreateRouteModalOpen(true); }}
              className="bg-primary w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Route
            </Button>

            <div className="space-y-3">
              {routes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No routes created yet</p>
              ) : (
                routes.map((route) => (
                  <div key={route.id} className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{route.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {((route as any).nodes?.length || 0)} terminals in route
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9"
                          onClick={() => {
                            handleOpenEditRoute(route);
                            setIsManageRoutesModalOpen(false);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9"
                          onClick={() => handleDeleteRouteLocal(route.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show route nodes */}
                    {((route as any).nodes?.length || 0) > 0 && (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Route sequence:</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(route as any).nodes.map((node: any, idx: number) => (
                            <div key={node.id} className="flex items-center gap-2">
                              <div className="px-2 py-1 rounded bg-primary/10 text-xs font-medium">
                                {node.terminal.name}
                              </div>
                              {idx < ((route as any).nodes.length - 1) && (
                                <span className="text-xs text-muted-foreground">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Route Modal */}
      <Dialog open={isCreateRouteModalOpen} onOpenChange={setIsCreateRouteModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">Create New Route</DialogTitle>
            <DialogDescription>Build a route by selecting and ordering terminals with operation details</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6 px-2">
            {/* Available Terminals */}
            <div className="space-y-3 pr-4">
              <Label className="text-base font-semibold">Available Terminals</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {terminals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Create terminals first</p>
                ) : (
                  terminals.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition">
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.location} • {t.average_processing_days} days</p>
                      <Button size="sm" className="w-full mt-3 h-8" onClick={() => handleAddNodeToRoute(t)}>
                        Add to Route
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Route Configuration */}
            <div className="col-span-2 space-y-4 pl-4 border-l">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Name</Label>
                <Input 
                  value={newRouteName} 
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="h-10"
                  placeholder="e.g., Lagos to London Express"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Description</Label>
                <Textarea 
                  value={newRouteDescription} 
                  onChange={(e) => setNewRouteDescription(e.target.value)} 
                  rows={3}
                  placeholder="Describe the route..."
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Nodes (Sequence)</Label>
                <div className="border rounded-lg p-4 max-h-72 overflow-y-auto space-y-3">
                  {routeBuilder.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No nodes added yet</p>
                  ) : (
                    routeBuilder.map((n, idx) => (
                      <div key={`${n.terminal.id}-${idx}`} className="p-3 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{n.terminal.name}</p>
                              <p className="text-xs text-muted-foreground">{n.terminal.location}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 text-xs shrink-0"
                            onClick={() => handleRemoveNodeFromRoute(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <Textarea 
                          value={n.details} 
                          onChange={(e) => handleUpdateNodeDetails(idx, e.target.value)} 
                          rows={2}
                          placeholder="Operation details for this node..."
                          className="resize-none text-sm"
                        />
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={idx === 0}
                            onClick={() => handleMoveNode(idx, 'up')}
                          >
                            ↑ Up
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={idx === routeBuilder.length - 1}
                            onClick={() => handleMoveNode(idx, 'down')}
                          >
                            ↓ Down
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsCreateRouteModalOpen(false); setRouteBuilder([]); setNewRouteName(''); setNewRouteDescription(''); }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRouteLocal} className="bg-primary">
                  Create Route
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal */}
      <Dialog open={isEditRouteModalOpen} onOpenChange={setIsEditRouteModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">Edit Route</DialogTitle>
            <DialogDescription>Modify the route name, description, and node sequence</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6 px-2">
            {/* Available Terminals */}
            <div className="space-y-3 pr-4">
              <Label className="text-base font-semibold">Available Terminals</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {terminals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Create terminals first</p>
                ) : (
                  terminals.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition">
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.location} • {t.average_processing_days} days</p>
                      <Button size="sm" className="w-full mt-3 h-8" onClick={() => handleAddNodeToRoute(t)}>
                        Add to Route
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Route Configuration */}
            <div className="col-span-2 space-y-4 pl-4 border-l">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Name</Label>
                <Input 
                  value={newRouteName} 
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="h-10"
                  placeholder="e.g., Lagos to London Express"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Description</Label>
                <Textarea 
                  value={newRouteDescription} 
                  onChange={(e) => setNewRouteDescription(e.target.value)} 
                  rows={3}
                  placeholder="Describe the route..."
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Route Nodes (Sequence)</Label>
                <div className="border rounded-lg p-4 max-h-72 overflow-y-auto space-y-3">
                  {routeBuilder.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No nodes added yet</p>
                  ) : (
                    routeBuilder.map((n, idx) => (
                      <div key={`${n.terminal.id}-${idx}`} className="p-3 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{n.terminal.name}</p>
                              <p className="text-xs text-muted-foreground">{n.terminal.location}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 text-xs shrink-0"
                            onClick={() => handleRemoveNodeFromRoute(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <Textarea 
                          value={n.details} 
                          onChange={(e) => handleUpdateNodeDetails(idx, e.target.value)} 
                          rows={2}
                          placeholder="Operation details for this node..."
                          className="resize-none text-sm"
                        />
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={idx === 0}
                            onClick={() => handleMoveNode(idx, 'up')}
                          >
                            ↑ Up
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={idx === routeBuilder.length - 1}
                            onClick={() => handleMoveNode(idx, 'down')}
                          >
                            ↓ Down
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsEditRouteModalOpen(false); setRouteBuilder([]); setNewRouteName(''); setNewRouteDescription(''); setEditingRouteId(null); }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateRouteLocal} className="bg-primary">
                  Update Route
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Routes List with Edit/Delete */}
      <Dialog open={false}>
        <DialogContent className="hidden">Hidden Routes Dialog</DialogContent>
      </Dialog>
    </div>
  );
}
