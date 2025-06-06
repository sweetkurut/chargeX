export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  carNumber?: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  power: number; // kW
  connectorType: "CCS" | "CHAdeMO" | "Type2" | "Tesla";
  pricePerKwh: number; // KGS
  status: "available" | "occupied" | "offline" | "maintenance";
  distance?: number; // km
  isFavorite?: boolean;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  startTime: string;
  endTime?: string;
  energyConsumed: number; // kWh
  cost: number; // KGS
  status: "active" | "completed" | "cancelled";
}

export interface Notification {
  id: string;
  type: "charging_complete" | "charging_error" | "station_available" | "payment_complete";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface RootState {
  auth: AuthState;
  stations: StationsState;
  charging: ChargingState;
  notifications: NotificationsState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface StationsState {
  stations: ChargingStation[];
  favorites: string[];
  isLoading: boolean;
  selectedStation: ChargingStation | null;
}

export interface ChargingState {
  currentSession: ChargingSession | null;
  history: ChargingSession[];
  isLoading: boolean;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}
