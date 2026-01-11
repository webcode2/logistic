import { Waybill, Terminal, RouteNode } from '@prisma/client';

/**
 * Calculate Estimated Delivery Date (EDD)
 * Sums the average_processing_days of all remaining terminals in the route
 */
export function calculateEDD(
  currentTerminal: Terminal,
  remainingTerminals: Terminal[]
): Date {
  const today = new Date();
  
  // Sum processing days from current terminal onwards
  const totalDays = remainingTerminals.reduce(
    (sum, terminal) => sum + terminal.average_processing_days,
    0
  );
  
  // Add total days to today
  const edd = new Date(today);
  edd.setDate(edd.getDate() + totalDays);
  
  return edd;
}

/**
 * Get current terminal from waybill
 * Returns the Terminal object at the current_node_index in the route
 */
export async function getCurrentTerminal(
  routeNodes: RouteNode[],
  currentNodeIndex: number
): Promise<Terminal | null> {
  const currentNode = routeNodes.find((node) => node.sequence_order === currentNodeIndex);
  if (!currentNode) return null;
  
  // In actual implementation, you'd fetch from DB
  return currentNode as any;
}

/**
 * Get remaining terminals from current position in route
 */
export function getRemainingTerminals(
  routeNodes: (RouteNode & { terminal: Terminal })[],
  currentNodeIndex: number
): Terminal[] {
  return routeNodes
    .filter((node) => node.sequence_order >= currentNodeIndex)
    .map((node) => node.terminal)
    .sort((a, b) => {
      const aNode = routeNodes.find((n) => n.terminal_id === a.id);
      const bNode = routeNodes.find((n) => n.terminal_id === b.id);
      return (aNode?.sequence_order || 0) - (bNode?.sequence_order || 0);
    });
}

/**
 * Determine shipment status based on position in route
 */
export function determineStatus(
  currentNodeIndex: number,
  totalNodes: number
): string {
  if (currentNodeIndex === 0) return 'PROCESSING';
  if (currentNodeIndex === totalNodes - 1) return 'ARRIVED';
  if (currentNodeIndex > 0 && currentNodeIndex < totalNodes - 1) return 'IN_TRANSIT';
  return 'DELIVERED';
}

/**
 * Generate tracking code
 */
export function generateTrackingCode(): string {
  const prefix = 'LGT';
  const year = new Date().getFullYear();
  const randomNum = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `${prefix}-${year}-${randomNum}`;
}
