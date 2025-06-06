import { ChargingSession, ChargingState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChargingState = {
  currentSession: null,
  history: [],
  isLoading: false,
};

const chargingSlice = createSlice({
  name: "charging",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    startCharging: (state, action: PayloadAction<ChargingSession>) => {
      state.currentSession = action.payload;
      state.isLoading = false;
    },
    stopCharging: (state, action: PayloadAction<ChargingSession>) => {
      if (state.currentSession) {
        state.history.unshift(action.payload);
        state.currentSession = null;
      }
      state.isLoading = false;
    },
    setHistory: (state, action: PayloadAction<ChargingSession[]>) => {
      state.history = action.payload;
    },
    updateCurrentSession: (state, action: PayloadAction<Partial<ChargingSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
  },
});

export const { setLoading, startCharging, stopCharging, setHistory, updateCurrentSession } = chargingSlice.actions;
export default chargingSlice.reducer;
