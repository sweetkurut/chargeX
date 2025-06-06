import { ChargingStation, StationsState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: StationsState = {
  stations: [],
  favorites: [],
  isLoading: false,
  selectedStation: null,
};

const stationsSlice = createSlice({
  name: "stations",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setStations(state, action: PayloadAction<ChargingStation[]>) {
      state.stations = action.payload;
      state.isLoading = false;
    },

    setSelectedStation(state, action: PayloadAction<ChargingStation | null>) {
      state.selectedStation = action.payload;
    },

    toggleFavorite(state, action: PayloadAction<string>) {
      const stationId = action.payload;
      const index = state.favorites.indexOf(stationId);

      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(stationId);
      }

      const station = state.stations.find((s) => s.id === stationId);
      if (station) {
        station.isFavorite = !station.isFavorite;
      }
    },

    updateStationStatus(state, action: PayloadAction<{ id: string; status: ChargingStation["status"] }>) {
      const { id, status } = action.payload;
      const station = state.stations.find((s) => s.id === id);
      if (station) {
        station.status = status;
      }
    },
  },
});

export const { setLoading, setStations, setSelectedStation, toggleFavorite, updateStationStatus } = stationsSlice.actions;

export default stationsSlice.reducer;
