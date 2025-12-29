import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mockWaybills, Waybill, TrackingEvent } from '@/data/mockData';

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
      });
  },
});

export default adminSlice.reducer;
