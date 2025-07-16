import type { FlitsmeisterData, UserData, Vehicle } from '../types'

// Extended types for the additional data files
export interface PaymentData {
  created_at: string
  updated_at: string
  amount: string
  deviceType: string
  trial: boolean
  description: string
  orderId: string
}

export interface ProductData {
  name: string
  created_at: string
  expires_at: string
  platform: string
  trial: boolean
  autoRenew: boolean
  plus: boolean
}

export interface MarketingEvent {
  type: string
  timestamp: string
  human_open?: boolean
  ip_address?: string
  machine_open?: boolean
  source?: string
  subject?: string
  user_agent?: string
}

export interface MarketingAttributes {
  app_version: string
  carrier: string
  city: string
  country: string
  device_language: string
  identified_date: string
  mobile_install_date: string
  model: string
  os_version: string
  platform: string
  st: string
  timezone: string
}

export interface MarketingData {
  events: MarketingEvent[]
  attributes: MarketingAttributes
}

export interface ReportData {
  latitude: number
  longitude: number
  type: number
  date?: string
  path?: [number, number][]
}

export interface StatisticsData {
  quarter: string
  ambassador?: boolean
  countries_visited: string[]
  fines_avoided: number
  fm_one_autostarted: number
  fm_two_autostarted: number
  km_driven: number
  lba_shown: number
  navigation_finished: number
  navigation_started: number
  parking_sec: number
  parking_started: number
  provinces_visited: string[]
  sec_driven: number
  session_sec: number
  sessions_started: number
  times_in_traffic: number
  top_consecutive_days: number
  top_speed: number
  total_ratings: number
  ufo_km_driven: number
  wrongway_trips: number
  top_100_sprint_ms?: number
  app_warnings: {
    incidents?: Record<string, number>
    hotspots?: number
    jams?: number
    sectioncontrols?: number
    speedcams?: number
    speedtraps?: number
    traffic_camera?: number
    ew?: Record<string, number>
  }
  carplay_warnings?: {
    incidents?: Record<string, number>
    hotspots?: number
    jams?: number
    sectioncontrols?: number
    speedcams?: number
    speedtraps?: number
    traffic_camera?: number
    ew?: Record<string, number>
  }
  app_ratings?: {
    incidents?: Record<string, number>
    speedcams?: number
    speedtraps?: number
    traffic_camera?: number
    sectioncontrols?: number
  }
  carplay_ratings?: {
    incidents?: Record<string, number>
    speedcams?: number
  }
  app_reports?: {
    maxspeed?: number
    incidents?: Record<string, number>
    speedcams?: number
  }
  cits?: {
    vri?: number
    matrix?: number
  }
}

export interface ExtendedFlitsmeisterData extends FlitsmeisterData {
  payments?: PaymentData[]
  products?: ProductData[]
  quarterlyStatistics?: StatisticsData[]
  userData?: UserData
  vehicles?: Vehicle[]
  marketingData?: MarketingData
  reportsData?: ReportData[]
} 