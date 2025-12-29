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
    trackingCode: 'LGT-2024-001234',
    origin: 'Lagos, Nigeria',
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
        description: 'Package departed from Lagos on flight BA075',
      },
      {
        id: 'evt-004',
        timestamp: '2024-12-27T22:00:00Z',
        status: 'In Transit',
        location: 'Murtala Muhammed International Airport, Lagos',
        description: 'Package cleared export customs',
      },
      {
        id: 'evt-003',
        timestamp: '2024-12-27T16:45:00Z',
        status: 'In Transit',
        location: 'Lagos Sorting Facility',
        description: 'Package processed and ready for international shipment',
      },
      {
        id: 'evt-002',
        timestamp: '2024-12-27T10:30:00Z',
        status: 'Picked Up',
        location: 'Victoria Island, Lagos',
        description: 'Package picked up from sender',
      },
      {
        id: 'evt-001',
        timestamp: '2024-12-27T09:00:00Z',
        status: 'Processing',
        location: 'LogiTrack Hub, Lagos',
        description: 'Shipment order received and processed',
      },
    ],
  },
  {
    id: 'wb-002',
    trackingCode: 'LGT-2024-005678',
    origin: 'Shanghai, China',
    destination: 'Abuja, Nigeria',
    status: 'Out for Delivery',
    currentLocation: 'Abuja Delivery Hub',
    estimatedDelivery: '2024-12-29',
    weight: '8.2 kg',
    dimensions: '30 x 25 x 20 cm',
    shipperName: 'China Electronics Ltd.',
    receiverName: 'Federal Ministry of Tech',
    events: [
      {
        id: 'evt-012',
        timestamp: '2024-12-29T07:00:00Z',
        status: 'Out for Delivery',
        location: 'Abuja Delivery Hub',
        description: 'Package out for delivery with courier',
      },
      {
        id: 'evt-011',
        timestamp: '2024-12-29T05:30:00Z',
        status: 'In Transit',
        location: 'Abuja Delivery Hub',
        description: 'Package arrived at local delivery hub',
      },
      {
        id: 'evt-010',
        timestamp: '2024-12-28T18:00:00Z',
        status: 'In Transit',
        location: 'Nnamdi Azikiwe International Airport',
        description: 'Package cleared import customs',
      },
      {
        id: 'evt-009',
        timestamp: '2024-12-26T10:00:00Z',
        status: 'In Transit',
        location: 'Shanghai Pudong Airport',
        description: 'Package departed on flight',
      },
      {
        id: 'evt-008',
        timestamp: '2024-12-25T14:00:00Z',
        status: 'Picked Up',
        location: 'Shanghai, China',
        description: 'Package collected from sender',
      },
    ],
  },
  {
    id: 'wb-003',
    trackingCode: 'LGT-2024-009012',
    origin: 'Dubai, UAE',
    destination: 'Port Harcourt, Nigeria',
    status: 'Delivered',
    currentLocation: 'Delivered',
    estimatedDelivery: '2024-12-25',
    weight: '25.0 kg',
    dimensions: '60 x 40 x 35 cm',
    shipperName: 'Arabian Goods Trading',
    receiverName: 'Rivers State Enterprises',
    events: [
      {
        id: 'evt-018',
        timestamp: '2024-12-25T11:30:00Z',
        status: 'Delivered',
        location: 'Port Harcourt, Nigeria',
        description: 'Package delivered successfully. Signed by: John Amadi',
      },
      {
        id: 'evt-017',
        timestamp: '2024-12-25T08:00:00Z',
        status: 'Out for Delivery',
        location: 'Port Harcourt Hub',
        description: 'Package out for final delivery',
      },
      {
        id: 'evt-016',
        timestamp: '2024-12-24T20:00:00Z',
        status: 'In Transit',
        location: 'Port Harcourt Airport',
        description: 'Package cleared customs',
      },
      {
        id: 'evt-015',
        timestamp: '2024-12-23T06:00:00Z',
        status: 'In Transit',
        location: 'Dubai International Airport',
        description: 'Package departed',
      },
      {
        id: 'evt-014',
        timestamp: '2024-12-22T15:00:00Z',
        status: 'Picked Up',
        location: 'Dubai, UAE',
        description: 'Package picked up',
      },
    ],
  },
  {
    id: 'wb-004',
    trackingCode: 'LGT-2024-003456',
    origin: 'New York, USA',
    destination: 'Kano, Nigeria',
    status: 'On Hold',
    currentLocation: 'Kano Customs Office',
    estimatedDelivery: '2024-12-31',
    weight: '12.8 kg',
    dimensions: '40 x 30 x 25 cm',
    shipperName: 'American Imports Inc.',
    receiverName: 'Kano Trading Company',
    events: [
      {
        id: 'evt-024',
        timestamp: '2024-12-28T10:00:00Z',
        status: 'On Hold',
        location: 'Kano Customs Office',
        description: 'Package held for additional documentation verification',
      },
      {
        id: 'evt-023',
        timestamp: '2024-12-27T16:00:00Z',
        status: 'In Transit',
        location: 'Mallam Aminu Kano Airport',
        description: 'Package arrived at destination airport',
      },
      {
        id: 'evt-022',
        timestamp: '2024-12-25T08:00:00Z',
        status: 'In Transit',
        location: 'JFK International Airport',
        description: 'Package departed on international flight',
      },
      {
        id: 'evt-021',
        timestamp: '2024-12-24T12:00:00Z',
        status: 'Picked Up',
        location: 'New York, USA',
        description: 'Package collected from sender',
      },
    ],
  },
  {
    id: 'wb-005',
    trackingCode: 'LGT-2024-007890',
    origin: 'Accra, Ghana',
    destination: 'Lagos, Nigeria',
    status: 'Processing',
    currentLocation: 'Accra Processing Center',
    estimatedDelivery: '2025-01-02',
    weight: '5.5 kg',
    dimensions: '25 x 20 x 15 cm',
    shipperName: 'Ghana Express Ltd.',
    receiverName: 'Lagos Wholesale Market',
    events: [
      {
        id: 'evt-030',
        timestamp: '2024-12-29T09:00:00Z',
        status: 'Processing',
        location: 'Accra Processing Center',
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
