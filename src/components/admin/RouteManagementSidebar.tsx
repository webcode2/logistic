'use client';

import { useState, useTransition } from 'react';
import { Plus, MapPin, Terminal as TerminalIcon, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createRoute, getAllTerminals, getAllRoutes } from '@/actions/tracking';
import { cn } from '@/lib/utils';
import type { Terminal, Route } from '@prisma/client';

interface RouteWithNodes extends Route {
  nodes: Array<{
    id: string;
    sequence_order: number;
    terminal: Terminal;
  }>;
}

export default function RouteManagementSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [routes, setRoutes] = useState<RouteWithNodes[]>([]);
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // New Route Form
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadTerminals = () => {
    setIsLoadingTerminals(true);
    startTransition(async () => {
      try {
        const result = await getAllTerminals();
        if (result.success) {
          setTerminals(result.terminals);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load terminals',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load terminals',
          variant: 'destructive',
        });
      }
      setIsLoadingTerminals(false);
    });
  };

  const loadRoutes = () => {
    setIsLoadingRoutes(true);
    startTransition(async () => {
      try {
        const result = await getAllRoutes();
        if (result.success) {
          setRoutes(result.routes as RouteWithNodes[]);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load routes',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load routes',
          variant: 'destructive',
        });
      }
      setIsLoadingRoutes(false);
    });
  };

  const handleOpenSidebar = () => {
    setIsOpen(true);
    loadTerminals();
    loadRoutes();
  };

  const handleAddNode = (terminalId: string) => {
    if (!selectedNodes.includes(terminalId)) {
      setSelectedNodes([...selectedNodes, terminalId]);
    }
  };

  const handleRemoveNode = (terminalId: string) => {
    setSelectedNodes(selectedNodes.filter(id => id !== terminalId));
  };

  const handleCreateRoute = () => {
    if (!routeName.trim()) {
      toast({
        title: 'Error',
        description: 'Route name is required',
        variant: 'destructive',
      });
      return;
    }

    if (selectedNodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Route must have at least one node',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createRoute({
          name: routeName,
          description: routeDescription || undefined,
          terminal_ids: selectedNodes,
        });

        if (result.success) {
          toast({
            title: 'Success',
            description: 'Route created successfully',
          });
          setIsCreateRouteOpen(false);
          setRouteName('');
          setRouteDescription('');
          setSelectedNodes([]);
          loadRoutes();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to create route',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create route',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleOpenSidebar}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 shadow-lg z-50 gap-2"
      >
        <MapPin className="h-4 w-4" />
        Routes & Nodes
      </Button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-screen w-96 bg-background border-l shadow-2xl z-50 transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Routes & Nodes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Create Route Button */}
          <Button
            onClick={() => {
              setIsCreateRouteOpen(true);
              if (terminals.length === 0) loadTerminals();
            }}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Route
          </Button>

          {/* Routes List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Active Routes
            </h3>
            {isLoadingRoutes ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading routes...</p>
            ) : routes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No routes created yet</p>
            ) : (
              routes.map((route) => (
                <Card key={route.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{route.name}</CardTitle>
                        {route.description && (
                          <CardDescription className="text-xs mt-1">
                            {route.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRoute(expandedRoute === route.id ? null : route.id)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            expandedRoute === route.id && 'rotate-180'
                          )}
                        />
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedRoute === route.id && (
                    <CardContent className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg space-y-3">
                        {route.nodes.map((node, idx) => (
                          <div key={node.id} className="border rounded-lg p-3 bg-background space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {node.terminal.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {node.terminal.location}
                                </p>
                              </div>
                            </div>

                            {/* Node Operation Details */}
                            <div className="ml-8 space-y-1 border-t pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Processing Time:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {node.terminal.average_processing_days} days
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Type:</span>
                                <Badge variant="outline" className="text-xs">
                                  {idx === 0 ? 'Origin' : idx === route.nodes.length - 1 ? 'Destination' : 'Hub'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Total Nodes:</strong> {route.nodes.length}</p>
                        <p><strong>Total Processing Days:</strong> {route.nodes.reduce((sum, n) => sum + n.terminal.average_processing_days, 0)}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Route Dialog */}
      <Dialog open={isCreateRouteOpen} onOpenChange={setIsCreateRouteOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Create New Route
            </DialogTitle>
            <DialogDescription>
              Define a route with an ordered sequence of terminals (nodes)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Route Details */}
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name *</Label>
              <Input
                id="routeName"
                placeholder="e.g., Rhine Express Route"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeDescription">Description</Label>
              <Textarea
                id="routeDescription"
                placeholder="Optional route description..."
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Node Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Route Nodes *</Label>
                <Badge variant="outline">{selectedNodes.length} selected</Badge>
              </div>

              {isLoadingTerminals ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading terminals...
                </p>
              ) : terminals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No terminals available
                </p>
              ) : (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {terminals.map((terminal) => (
                    <button
                      key={terminal.id}
                      onClick={() => handleAddNode(terminal.id)}
                      disabled={selectedNodes.includes(terminal.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedNodes.includes(terminal.id) && 'bg-green-50 dark:bg-green-950'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{terminal.name}</p>
                          <p className="text-xs text-muted-foreground">{terminal.location}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {terminal.average_processing_days}d
                            </Badge>
                            <span className="text-xs text-muted-foreground">avg processing</span>
                          </div>
                        </div>
                        {selectedNodes.includes(terminal.id) && (
                          <Badge className="bg-green-600 shrink-0">Added</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Nodes Order */}
            {selectedNodes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Node Sequence</Label>
                <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                  {selectedNodes.map((terminalId, idx) => {
                    const terminal = terminals.find((t) => t.id === terminalId);
                    return (
                      <div
                        key={`${terminalId}-${idx}`}
                        className="flex items-center justify-between gap-3 bg-background p-3 rounded-lg border"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{terminal?.name}</p>
                            <p className="text-xs text-muted-foreground">{terminal?.location}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {terminal?.average_processing_days}d
                              </Badge>
                              <span className="text-xs text-muted-foreground">processing</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNode(terminalId)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateRouteOpen(false);
                setRouteName('');
                setRouteDescription('');
                setSelectedNodes([]);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoute}
              disabled={isPending || selectedNodes.length === 0}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isPending ? 'Creating...' : 'Create Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
