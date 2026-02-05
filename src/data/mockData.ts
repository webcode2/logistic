export type ShipmentStatus =
  | 'Processing'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'On Hold';

export interface TrackingEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

export interface Waybill {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  currentLocation: string;
  estimatedDelivery: string;
  weight: string;
  dimensions: string;
  shipperName: string;
  receiverName: string;
  events: TrackingEvent[];
}

export const mockWaybills: Waybill[] = [
  {
    id: 'wb-001',
    trackingCode: 'RRT-2024-001234',
    origin: 'Frankfurt, Germany',
    destination: 'London, UK',
    status: 'In Transit',
    currentLocation: 'Heathrow Airport, London',
    estimatedDelivery: '2024-12-30',
    weight: '15.5 kg',
    dimensions: '45 x 35 x 25 cm',
    shipperName: 'Adebayo Enterprises',
    receiverName: 'British Trading Co.',
    events: [
      {
        id: 'evt-006',
        timestamp: '2024-12-28T14:30:00Z',
        status: 'In Transit',
        location: 'Heathrow Airport, London',
        description: 'Package arrived at destination airport, pending customs clearance',
      },
      {
        id: 'evt-005',
        timestamp: '2024-12-28T08:15:00Z',
        status: 'In Transit',
        location: 'In Flight',
        description: 'Package departed from Frankfurt on flight BA075',
      },
      {
        id: 'evt-004',
        timestamp: '2024-12-27T22:00:00Z',
        status: 'In Transit',
        location: 'Frankfurt International Airport, Frankfurt',
        description: 'Package cleared export customs',
      },
      {
        id: 'evt-003',
        timestamp: '2024-12-27T16:45:00Z',
        status: 'In Transit',
        location: 'Frankfurt Sorting Facility',
        description: 'Package processed and ready for international shipment',
      },
      {
        id: 'evt-002',
        timestamp: '2024-12-27T10:30:00Z',
        status: 'Picked Up',
        location: 'Innenstadt, Frankfurt',
        description: 'Package picked up from sender',
      },
      {
        id: 'evt-001',
        timestamp: '2024-12-27T09:00:00Z',
        status: 'Processing',
        location: 'Rhine Route Hub, Frankfurt',
        description: 'Shipment order received and processed',
      },
    ],
  },
  {
    id: 'wb-002',
    trackingCode: 'RRT-2024-005678',
    origin: 'Berlin, Germany',
    destination: 'Amsterdam, Netherlands',
    status: 'Out for Delivery',
    currentLocation: 'Amsterdam Delivery Hub',
    estimatedDelivery: '2024-12-29',
    weight: '8.2 kg',
    dimensions: '30 x 25 x 20 cm',
    shipperName: 'Berlin Electronics Ltd.',
    receiverName: 'Federal Ministry of Tech',
    events: [
      {
        id: 'evt-012',
        timestamp: '2024-12-29T07:00:00Z',
        status: 'Out for Delivery',
        location: 'Amsterdam Delivery Hub',
        description: 'Package out for delivery with courier',
      },
      {
        id: 'evt-011',
        timestamp: '2024-12-29T05:30:00Z',
        status: 'In Transit',
        location: 'Amsterdam Delivery Hub',
        description: 'Package arrived at local delivery hub',
      },
      {
        id: 'evt-010',
        timestamp: '2024-12-28T18:00:00Z',
        status: 'In Transit',
        location: 'Amsterdam Airport Schiphol',
        description: 'Package cleared import customs',
      },
      {
        id: 'evt-009',
        timestamp: '2024-12-26T10:00:00Z',
        status: 'In Transit',
        location: 'Berlin Brandenburg Airport',
        description: 'Package departed on flight',
      },
      {
        id: 'evt-008',
        timestamp: '2024-12-25T14:00:00Z',
        status: 'Picked Up',
        location: 'Berlin, Germany',
        description: 'Package collected from sender',
      },
    ],
  },
  {
    id: 'wb-003',
    trackingCode: 'RRT-2024-009012',
    origin: 'Paris, France',
    destination: 'Rotterdam, Netherlands',
    status: 'Delivered',
    currentLocation: 'Delivered',
    estimatedDelivery: '2024-12-25',
    weight: '25.0 kg',
    dimensions: '60 x 40 x 35 cm',
    shipperName: 'European Goods Trading',
    receiverName: 'Rivers State Enterprises',
    events: [
      {
        id: 'evt-018',
        timestamp: '2024-12-25T11:30:00Z',
        status: 'Delivered',
        location: 'Rotterdam, Netherlands',
        description: 'Package delivered successfully. Signed by: John Amadi',
      },
      {
        id: 'evt-017',
        timestamp: '2024-12-25T08:00:00Z',
        status: 'Out for Delivery',
        location: 'Rotterdam Hub',
        description: 'Package out for final delivery',
      },
      {
        id: 'evt-016',
        timestamp: '2024-12-24T20:00:00Z',
        status: 'In Transit',
        location: 'Rotterdam Airport',
        description: 'Package cleared customs',
      },
      {
        id: 'evt-015',
        timestamp: '2024-12-23T06:00:00Z',
        status: 'In Transit',
        location: 'Paris Charles de Gaulle Airport',
        description: 'Package departed',
      },
      {
        id: 'evt-014',
        timestamp: '2024-12-22T15:00:00Z',
        status: 'Picked Up',
        location: 'Paris, France',
        description: 'Package picked up',
      },
    ],
  },
  {
    id: 'wb-004',
    trackingCode: 'RRT-2024-003456',
    origin: 'Hamburg, Germany',
    destination: 'Munich, Germany',
    status: 'On Hold',
    currentLocation: 'Munich Customs Office',
    estimatedDelivery: '2024-12-31',
    weight: '12.8 kg',
    dimensions: '40 x 30 x 25 cm',
    shipperName: 'Atlantic Imports Inc.',
    receiverName: 'Munich Trading Company',
    events: [
      {
        id: 'evt-024',
        timestamp: '2024-12-28T10:00:00Z',
        status: 'On Hold',
        location: 'Munich Customs Office',
        description: 'Package held for additional documentation verification',
      },
      {
        id: 'evt-023',
        timestamp: '2024-12-27T16:00:00Z',
        status: 'In Transit',
        location: 'Munich International Airport',
        description: 'Package arrived at destination airport',
      },
      {
        id: 'evt-022',
        timestamp: '2024-12-25T08:00:00Z',
        status: 'In Transit',
        location: 'Hamburg Airport',
        description: 'Package departed on international flight',
      },
      {
        id: 'evt-021',
        timestamp: '2024-12-24T12:00:00Z',
        status: 'Picked Up',
        location: 'Hamburg, Germany',
        description: 'Package collected from sender',
      },
    ],
  },
  {
    id: 'wb-005',
    trackingCode: 'RRT-2024-007890',
    origin: 'Zurich, Switzerland',
    destination: 'Frankfurt, Germany',
    status: 'Processing',
    currentLocation: 'Zurich Processing Center',
    estimatedDelivery: '2025-01-02',
    weight: '5.5 kg',
    dimensions: '25 x 20 x 15 cm',
    shipperName: 'Switzerland Express Ltd.',
    receiverName: 'Frankfurt Wholesale Market',
    events: [
      {
        id: 'evt-030',
        timestamp: '2024-12-29T09:00:00Z',
        status: 'Processing',
        location: 'Zurich Processing Center',
        description: 'Shipment order received and being processed',
      },
    ],
  },
];

// Mock admin credentials
export const mockAdminCredentials = {
  username: 'admin',
  password: 'admin123',
};

export const mockAdminUser = {
  id: 'admin-001',
  username: 'admin',
  role: 'admin' as const,
};
