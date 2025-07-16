// Address object structure
export interface AddressObj {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  streetNumber?: string;
  postcode?: string;
}

// Speed trap event structure
export interface SpeedTrapEvent {
  speedTrapType: string;
  timestamp: string;
  location?: string;
  latitude: number;
  longitude: number;
  roadName?: string;
  hectometerPole?: number;
  speed: number;
  maxSpeed: number;
  stationary: boolean;
  sourceID?: string;
  trajectory?: string; // Polyline string for average speed checks
}

// Vehicle metadata structure
export interface VehicleMetaData {
  name?: string;
  vehicleParameters?: {
    weight?: number;
    height?: number;
    width?: number;
    axles?: number;
    euroClass?: number;
    licensePlate?: string;
    make?: string;
    model?: string;
    costPerKM?: number;
    odometer?: number;
  };
  adr?: {
    dangerCode?: string;
    unNumber?: string;
  };
}

// Trip structure
export interface Trip {
  startTime: string;
  endTime: string;
  startAddress?: string;
  startAddressObj?: AddressObj;
  endAddress?: string;
  endAddressObj?: AddressObj;
  distanceKm?: number;
  odoMeterStart?: number;
  odoMeterStop?: number;
  speedTrapEvents?: SpeedTrapEvent[];
  polyline?: string;
  created?: string;
  updated?: string;
}

// User data from CSV (key-value format)
export interface UserData {
  Username?: string;
  Name?: string;
  Birthday?: string;
  Since?: string;
  "Last active"?: string;
  [key: string]: unknown;
}

// Vehicle structure
export interface Vehicle {
  hasTrailer?: boolean;
  mileageReimbursementRate?: number;
  trailerWeight?: number;
  type?: string;
  licensePlate?: string;
  licensePlateCountry?: string;
  make?: string;
  model?: string;
  mileageInKilometer?: number;
}

// Product/subscription structure
export interface Product {
  name?: string;
  created_at?: string;
  expires_at?: string;
  platform?: string;
  trial?: boolean;
  autoRenew?: boolean;
  plus?: boolean;
}

// Payment structure
export interface Payment {
  created_at?: string;
  updated_at?: string;
  amount?: string;
  deviceType?: string;
  trial?: boolean;
  description?: string;
  orderId?: string;
}

// Report structure
export interface Report {
  latitude?: number;
  longitude?: number;
  type?: number;
  date?: string;
  path?: [number, number][];
}

// Statistics and marketing - keeping flexible
export interface Statistics {
  [key: string]: unknown;
}

export interface Marketing {
  [key: string]: unknown;
}

// Main data structure
export interface FlitsmeisterData {
  clientData?: {
    vehicleMetaData?: VehicleMetaData;
  };
  trips?: Trip[];
  user?: UserData;
  vehicles?: Vehicle[];
  products?: Product[];
  payments?: Payment[];
  reports?: Report[];
  statistics?: Statistics;
  marketing?: Marketing;
  importDate: string;
  fileName: string;
} 