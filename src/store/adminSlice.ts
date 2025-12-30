import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mockWaybills, Waybill, TrackingEvent, ShipmentStatus } from '@/data/mockData';

interface AdminState {
  shipments: Waybill[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  shipments: [],
  isLoading: false,
  error: null,
};

export const fetchAllShipments = createAsyncThunk(
  'admin/fetchAllShipments',
  async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [...mockWaybills];
  }
);

export const addTrackingEvent = createAsyncThunk(
  'admin/addTrackingEvent',
  async ({ waybillId, event }: { waybillId: string; event: Omit<TrackingEvent, 'id'> }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newEvent: TrackingEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    
    return { waybillId, event: newEvent };
  }
);

export interface NewShipmentData {
  trackingCode: string;
  origin: string;
  destination: string;
  weight: string;
  dimensions: string;
  shipperName: string;
  receiverName: string;
  estimatedDelivery: string;
}

export const createShipment = createAsyncThunk(
  'admin/createShipment',
  async (data: NewShipmentData) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newShipment: Waybill = {
      id: `wb-${Date.now()}`,
      trackingCode: data.trackingCode,
      origin: data.origin,
      destination: data.destination,
      status: 'Processing' as ShipmentStatus,
      currentLocation: data.origin,
      estimatedDelivery: data.estimatedDelivery,
      weight: data.weight,
      dimensions: data.dimensions,
      shipperName: data.shipperName,
      receiverName: data.receiverName,
      events: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'Processing' as ShipmentStatus,
          location: data.origin,
          description: 'Shipment order received and being processed',
        },
      ],
    };
    
    return newShipment;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllShipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllShipments.fulfilled, (state, action: PayloadAction<Waybill[]>) => {
        state.isLoading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchAllShipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      })
      .addCase(addTrackingEvent.fulfilled, (state, action) => {
        const { waybillId, event } = action.payload;
        const shipment = state.shipments.find((s) => s.id === waybillId);
        if (shipment) {
          shipment.events.unshift(event);
          shipment.status = event.status;
          shipment.currentLocation = event.location;
        }
      })
      .addCase(createShipment.fulfilled, (state, action: PayloadAction<Waybill>) => {
        state.shipments.unshift(action.payload);
      });
  },
});

export default adminSlice.reducer;
