import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import chargingSlice from "./slices/chargingSlice";
import notificationsSlice from "./slices/notificationsSlice";
import stationsSlice from "./slices/stationSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    charging: chargingSlice,
    stations: stationsSlice,
    notifications: notificationsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
