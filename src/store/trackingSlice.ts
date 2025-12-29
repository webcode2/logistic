import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mockWaybills, Waybill } from '@/data/mockData';

interface TrackingState {
  waybill: Waybill | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TrackingState = {
  waybill: null,
  isLoading: false,
  error: null,
};

export const fetchWaybill = createAsyncThunk(
  'tracking/fetchWaybill',
  async (trackingCode: string, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const waybill = mockWaybills.find(
      (w) => w.trackingCode.toLowerCase() === trackingCode.toLowerCase()
    );
    
    if (!waybill) {
      return rejectWithValue('Waybill not found. Please check your tracking code.');
    }
    
    return waybill;
  }
);

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearTracking: (state) => {
      state.waybill = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaybill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.waybill = null;
      })
      .addCase(fetchWaybill.fulfilled, (state, action: PayloadAction<Waybill>) => {
        state.isLoading = false;
        state.waybill = action.payload;
      })
      .addCase(fetchWaybill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTracking } = trackingSlice.actions;
export default trackingSlice.reducer;
