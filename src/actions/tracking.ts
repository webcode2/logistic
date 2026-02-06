'use server';

import prisma from '@/lib/prisma';
import { calculateEDD, determineStatus, generateTrackingCode, getRemainingTerminals } from '@/lib/tracking-utils';
import { formatError } from '@/lib/utils';

// Terminal Actions
export async function createTerminal(data: {
  name: string;
  location: string;
  average_processing_days: number;
}) {
  try {
    const terminal = await prisma.terminal.create({
      data: {
        name: data.name,
        location: data.location,
        average_processing_days: data.average_processing_days,
      },
    });

    return { success: true, terminal };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to create terminal.'),
    };
  }
}

export async function getAllTerminals() {
  try {
    const terminals = await prisma.terminal.findMany({
      orderBy: { name: 'asc' },
    });

    return { success: true, terminals };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch terminals.'),
      terminals: [],
    };
  }
}

export async function updateTerminal(terminal_id: string, data: {
  name?: string;
  location?: string;
  average_processing_days?: number;
}) {
  try {
    const terminal = await prisma.terminal.update({
      where: { id: terminal_id },
      data: {
        name: data.name,
        location: data.location,
        average_processing_days: data.average_processing_days,
        updated_at: new Date(),
      },
    });
    return { success: true, terminal };
  } catch (error) {
    return { success: false, error: formatError(error, 'Failed to update terminal.') };
  }
}

export async function deleteTerminal(terminal_id: string) {
  try {
    // Deleting a terminal may fail if referenced by route nodes (Restrict). Catch and return a helpful error.
    const terminal = await prisma.terminal.delete({ where: { id: terminal_id } });
    return { success: true, terminal };
  } catch (error) {
    return { success: false, error: formatError(error, 'Failed to delete terminal (it may be used by existing routes).') };
  }
}

// Route Actions
export async function createRoute(data: {
  name: string;
  description?: string;
  terminal_ids: string[]; // Ordered array of terminal IDs
  terminal_details?: string[]; // Optional per-node details stored in route.description as JSON
}) {
  try {
    // Create route, store node details (if provided) inside description as JSON to avoid schema changes
    const route = await prisma.route.create({
      data: {
        name: data.name,
        description: data.terminal_details && data.terminal_details.length ? JSON.stringify({ nodes: data.terminal_details }) : data.description,
      },
    });

    // Create route nodes in order
    const routeNodes = await Promise.all(
      data.terminal_ids.map((terminal_id, index) =>
        prisma.routeNode.create({
          data: {
            route_id: route.id,
            terminal_id,
            sequence_order: index,
          },
        })
      )
    );

    return { success: true, route, routeNodes };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to create route.'),
    };
  }
}

export async function updateRoute(route_id: string, data: {
  name?: string;
  description?: string;
  terminal_ids?: string[];
  terminal_details?: string[];
}) {
  try {
    const route = await prisma.route.findUnique({ where: { id: route_id }, include: { nodes: true } });
    if (!route) return { success: false, error: 'Route not found' };

    // Update basic fields
    const updated = await prisma.route.update({
      where: { id: route_id },
      data: {
        name: data.name ?? route.name,
        description: data.terminal_details && data.terminal_details.length ? JSON.stringify({ nodes: data.terminal_details }) : (data.description ?? route.description),
        updated_at: new Date(),
      },
    });

    // If terminal_ids provided, rebuild nodes
    let routeNodes = [];
    if (data.terminal_ids) {
      await prisma.routeNode.deleteMany({ where: { route_id } });
      routeNodes = await Promise.all(
        data.terminal_ids.map((terminal_id, index) =>
          prisma.routeNode.create({
            data: { route_id, terminal_id, sequence_order: index },
          })
        )
      );
    }

    return { success: true, route: updated, routeNodes };
  } catch (error) {
    return { success: false, error: formatError(error, 'Failed to update route.') };
  }
}

export async function deleteRoute(route_id: string) {
  try {
    // Soft-delete by marking inactive
    const route = await prisma.route.update({ where: { id: route_id }, data: { is_active: false, updated_at: new Date() } });
    return { success: true, route };
  } catch (error) {
    return { success: false, error: formatError(error, 'Failed to delete route.') };
  }
}

export async function getAllRoutes() {
  try {
    const routes = await prisma.route.findMany({
      where: { is_active: true },
      include: {
        nodes: {
          include: { terminal: true },
          orderBy: { sequence_order: 'asc' },
        },
      },
    });

    return { success: true, routes };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch routes.'),
      routes: [],
    };
  }
}

export async function getRouteById(route_id: string) {
  try {
    const route = await prisma.route.findUnique({
      where: { id: route_id },
      include: {
        nodes: {
          include: { terminal: true },
          orderBy: { sequence_order: 'asc' },
        },
      },
    });

    if (!route) {
      return { success: false, error: 'Route not found' };
    }

    return { success: true, route };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch route details.'),
    };
  }
}

// Waybill Actions
export async function createWaybill(data: {
  route_id: string;
  shipper_name: string;
  shipper_email: string;
  shipper_phone: string;
  shipper_address: string;
  receiver_name: string;
  receiver_email: string;
  receiver_phone: string;
  receiver_address: string;
  origin: string;
  destination: string;
  weight: string;
  dimensions: string;
}) {
  try {
    // Fetch route with nodes
    const route = await prisma.route.findUnique({
      where: { id: data.route_id },
      include: {
        nodes: {
          include: { terminal: true },
          orderBy: { sequence_order: 'asc' },
        },
      },
    });

    if (!route) {
      return { success: false, error: 'Route not found' };
    }

    // Get first and last terminals
    const firstTerminal = route.nodes[0]?.terminal;
    const lastTerminal = route.nodes[route.nodes.length - 1]?.terminal;
    if (!firstTerminal || !lastTerminal) {
      return { success: false, error: 'Route must have at least a start and end terminal' };
    }

    // Validate origin/destination locations against route terminals
    const originLower = (data.origin || '').toLowerCase();
    const destLower = (data.destination || '').toLowerCase();
    const firstLoc = (firstTerminal.location || '').toLowerCase();
    const lastLoc = (lastTerminal.location || '').toLowerCase();

    const originMatches = originLower.includes(firstLoc) || firstLoc.includes(originLower) || originLower === firstLoc;
    const destinationMatches = destLower.includes(lastLoc) || lastLoc.includes(destLower) || destLower === lastLoc;

    if (!originMatches) {
      return { success: false, error: `Origin must match starting terminal location (${firstTerminal.location})` };
    }

    if (!destinationMatches) {
      return { success: false, error: `Destination must match final terminal location (${lastTerminal.location})` };
    }

    // Calculate EDD
    const remainingTerminals = getRemainingTerminals(
      route.nodes as any,
      0
    );
    const edd = calculateEDD(firstTerminal, remainingTerminals);

    // Create waybill
    const waybill = await prisma.waybill.create({
      data: {
        tracking_code: generateTrackingCode(),
        route_id: data.route_id,
        current_node_index: 0,
        current_terminal_id: firstTerminal.id,
        shipper_name: data.shipper_name,
        shipper_email: data.shipper_email,
        shipper_phone: data.shipper_phone,
        shipper_address: data.shipper_address,
        receiver_name: data.receiver_name,
        receiver_email: data.receiver_email,
        receiver_phone: data.receiver_phone,
        receiver_address: data.receiver_address,
        origin: data.origin,
        destination: data.destination,
        weight: data.weight,
        dimensions: data.dimensions,
        estimated_delivery_date: edd,
        status: 'PROCESSING',
      },
      include: {
        route: {
          include: {
            nodes: {
              include: { terminal: true },
            },
          },
        },
        current_terminal: true,
      },
    });

    // Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        waybill_id: waybill.id,
        terminal_id: firstTerminal.id,
        event_type: 'CREATED',
        description: `Shipment created and processing at ${firstTerminal.name}`,
      },
    });

    return { success: true, waybill };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to create waybill.'),
    };
  }
}

export async function getWaybillByTrackingCode(tracking_code: string) {
  try {
    const waybill = await prisma.waybill.findUnique({
      where: { tracking_code },
      include: {
        route: {
          include: {
            nodes: {
              include: { terminal: true },
              orderBy: { sequence_order: 'asc' },
            },
          },
        },
        current_terminal: true,
        tracking_events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!waybill) {
      return { success: false, error: 'Waybill not found' };
    }

    return { success: true, waybill };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch waybill information.'),
    };
  }
}

export async function getAllWaybills() {
  try {
    const waybills = await prisma.waybill.findMany({
      include: {
        route: {
          include: {
            nodes: {
              include: { terminal: true },
            },
          },
        },
        current_terminal: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, waybills };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch list of waybills.'),
      waybills: [],
    };
  }
}

/**
 * Move waybill to next node in route
 * Increments current_node_index and updates timestamps
 */
export async function moveToNextNode(waybill_id: string) {
  try {
    // Fetch waybill with route
    const waybill = await prisma.waybill.findUnique({
      where: { id: waybill_id },
      include: {
        route: {
          include: {
            nodes: {
              include: { terminal: true },
              orderBy: { sequence_order: 'asc' },
            },
          },
        },
      },
    });

    if (!waybill) {
      return { success: false, error: 'Waybill not found' };
    }

    const totalNodes = waybill.route.nodes.length;
    const nextIndex = waybill.current_node_index + 1;

    // Check if at end of route
    if (nextIndex >= totalNodes) {
      return { success: false, error: 'Waybill already at final destination' };
    }

    // Get next terminal
    const nextTerminal = waybill.route.nodes[nextIndex]?.terminal;
    if (!nextTerminal) {
      return { success: false, error: 'Next terminal not found' };
    }

    // Calculate new EDD
    const remainingTerminals = getRemainingTerminals(
      waybill.route.nodes as any,
      nextIndex
    );
    const newEDD = calculateEDD(nextTerminal, remainingTerminals);

    // Update waybill
    const newStatus = determineStatus(nextIndex, totalNodes);

    const updatedWaybill = await prisma.waybill.update({
      where: { id: waybill_id },
      data: {
        current_node_index: nextIndex,
        current_terminal_id: nextTerminal.id,
        estimated_delivery_date: newEDD,
        status: newStatus as any,
        last_updated: new Date(),
      },
      include: {
        route: {
          include: {
            nodes: {
              include: { terminal: true },
            },
          },
        },
        current_terminal: true,
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        waybill_id,
        terminal_id: nextTerminal.id,
        event_type: 'ARRIVED',
        description: `Package arrived at ${nextTerminal.name}, ${nextTerminal.location}`,
      },
    });

    return { success: true, waybill: updatedWaybill };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to update movement status.'),
    };
  }
}

export async function getTrackingEvents(waybill_id: string) {
  try {
    const events = await prisma.trackingEvent.findMany({
      where: { waybill_id },
      include: {
        waybill: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return { success: true, events };
  } catch (error) {
    return {
      success: false,
      error: formatError(error, 'Failed to fetch tracking history.'),
      events: [],
    };
  }
}
