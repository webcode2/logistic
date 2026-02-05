'use server';

import prisma from '@/lib/prisma';
import { calculateEDD, getRemainingTerminals, generateTrackingCode, determineStatus } from '@/lib/tracking-utils';

export async function getAllWaybillsAdmin() {
  try {
    const waybills = await prisma.waybill.findMany({
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
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, waybills };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch waybills',
      waybills: [],
    };
  }
}

export async function getWaybillDetails(waybill_id: string) {
  try {
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
      error: 'Failed to fetch waybill details',
    };
  }
}

export async function updateWaybillLocation(waybill_id: string) {
  try {
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

    if (nextIndex >= totalNodes) {
      return { success: false, error: 'Shipment has already reached the final terminal. Please mark it as delivered instead.' };
    }

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
    const newStatus = determineStatus(nextIndex, totalNodes);

    // Update waybill
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
              orderBy: { sequence_order: 'asc' },
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
        description: `Package moved to ${nextTerminal.name}, ${nextTerminal.location}`,
      },
    });

    return { success: true, waybill: updatedWaybill };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update waybill location: ' + (error as Error).message,
    };
  }
}

export async function createNewWaybill(data: {
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
    // Validate required fields
    if (!data.route_id) {
      return { success: false, error: 'Route ID is required' };
    }

    if (!data.shipper_name || !data.shipper_email || !data.shipper_phone || !data.shipper_address) {
      return { success: false, error: 'All shipper fields are required' };
    }

    if (!data.receiver_name || !data.receiver_email || !data.receiver_phone || !data.receiver_address) {
      return { success: false, error: 'All receiver fields are required' };
    }

    if (!data.origin || !data.destination) {
      return { success: false, error: 'Origin and destination are required' };
    }

    const route = await prisma.route.findUnique({
      where: { id: data.route_id },
      include: {
        nodes: {
          include: { terminal: true },
          orderBy: { sequence_order: 'asc' },
        },
      },
    });

    if (!route || route.nodes.length === 0) {
      return { success: false, error: 'Invalid route selected or route has no terminals' };
    }

    const firstTerminal = route.nodes[0].terminal;

    // Calculate EDD
    const remainingTerminals = getRemainingTerminals(
      route.nodes as any,
      0
    );
    const edd = calculateEDD(firstTerminal, remainingTerminals);

    if (!edd || isNaN(edd.getTime())) {
      return { success: false, error: 'Failed to calculate estimated delivery date' };
    }

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
        description: `New shipment created at ${firstTerminal.name}`,
      },
    });

    return { success: true, waybill };
  } catch (error) {
    console.error('createNewWaybill error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: 'Failed to create waybill: ' + errorMessage,
    };
  }
}

export async function moveWaybillToNode(waybill_id: string, target_node_index: number) {
  try {
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

    if (target_node_index < 0 || target_node_index >= totalNodes) {
      return { success: false, error: 'Invalid target terminal selection.' };
    }

    if (target_node_index <= waybill.current_node_index) {
      return { success: false, error: 'Can only move to a node ahead in the route' };
    }

    const targetTerminal = waybill.route.nodes[target_node_index]?.terminal;
    if (!targetTerminal) {
      return { success: false, error: 'Target terminal not found' };
    }

    // Calculate new EDD
    const remainingTerminals = getRemainingTerminals(
      waybill.route.nodes as any,
      target_node_index
    );

    if (!remainingTerminals || remainingTerminals.length === 0) {
      return { success: false, error: 'No remaining terminals from target node' };
    }

    const newEDD = calculateEDD(targetTerminal, remainingTerminals);
    const newStatus = determineStatus(target_node_index, totalNodes);

    if (!newStatus) {
      return { success: false, error: 'Invalid status calculation' };
    }

    // Update waybill
    const updatedWaybill = await prisma.waybill.update({
      where: { id: waybill_id },
      data: {
        current_node_index: target_node_index,
        current_terminal_id: targetTerminal.id,
        estimated_delivery_date: newEDD,
        status: newStatus as any,
        last_updated: new Date(),
      },
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
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        waybill_id,
        terminal_id: targetTerminal.id,
        event_type: 'ARRIVED',
        description: `Package moved to ${targetTerminal.name}, ${targetTerminal.location}`,
      },
    });

    return { success: true, waybill: updatedWaybill };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to move waybill: ' + (error as Error).message,
    };
  }
}

export async function markAsDelivered(waybill_id: string) {
  try {
    const waybill = await prisma.waybill.findUnique({
      where: { id: waybill_id },
      include: {
        current_terminal: true,
        route: {
          include: {
            nodes: true
          }
        }
      },
    });

    if (!waybill) {
      return { success: false, error: 'Waybill not found' };
    }

    if (waybill.status === 'DELIVERED') {
      return { success: false, error: 'Shipment is already delivered.' };
    }

    // Check if it has reached the last terminal
    const totalNodes = waybill.route.nodes.length;
    if (waybill.current_node_index < totalNodes - 1) {
      const lastNode = waybill.route.nodes[totalNodes - 1];
      return {
        success: false,
        error: `Cannot mark as delivered. The shipment must first reach the final terminal in the route sequence.`
      };
    }

    // Update waybill status to DELIVERED
    const updatedWaybill = await prisma.waybill.update({
      where: { id: waybill_id },
      data: {
        status: 'DELIVERED',
        last_updated: new Date(),
      },
    });

    // Create final tracking event
    await prisma.trackingEvent.create({
      data: {
        waybill_id,
        terminal_id: waybill.current_terminal_id,
        event_type: 'DELIVERED',
        description: `Package successfully delivered to recipient at ${waybill.receiver_address}`,
      },
    });

    return { success: true, waybill: updatedWaybill };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to mark as delivered: ' + (error as Error).message,
    };
  }
}
