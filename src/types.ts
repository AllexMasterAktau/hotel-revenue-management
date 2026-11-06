/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HotelKPIs {
  occupancy: number; // in % (e.g. 75)
  adr: number;       // in KZT (e.g. 140000)
  revpar: number;    // ADR * (Occupancy / 100)
  roomsRevenue: number;
  ancillaryRevenue: number;
  totalRevenue: number;
  trevpar: number;   // Total Revenue / Total Rooms
  gop: number;       // Gross Operating Profit
  goppar: number;    // GOP / Total Rooms
  gopMargin: number; // GOP / Total Revenue * 100
}

export interface SegmentData {
  id: string;
  name: string;
  share: number;       // in % (sum of shares is 100)
  adr: number;         // average rate for this segment in KZT
  roomNights: number;
  revenue: number;
  color: string;
}

export interface ChannelData {
  id: string;
  name: string;
  share: number;       // in %
  commission: number;  // average commission in %
  revenue: number;
  color: string;
}

export interface AncillaryPOS {
  id: string;
  name: string;
  baselineRevenue: number;
  currentRevenue: number;
  visitorCount: number;
  averageSpend: number;
  type: 'f&b' | 'spa' | 'cabanas' | 'themepark' | 'other';
  description: string;
}

export interface CompetitorData {
  id: string;
  name: string;
  adr: number;         // in KZT
  occupancy: number;   // in %
  revpar: number;      // ADR * Occupancy / 100
  rating: number;      // Guest review score (out of 5.0)
  distance: string;    // relative distance or location note
  isSubject: boolean;  // True if it is Rixos Water World Aktau itself
}

// Market position indexes
export interface MarketIndices {
  mpi: number; // Market Penetration Index (Occupancy Share)
  ari: number; // Average Rate Index (ADR Share)
  rgi: number; // Revenue Generation Index (RevPAR Share)
}

export interface SimulationParameters {
  occupancyShift: number;     // e.g. -10 to +25 %
  adrShift: number;           // e.g. -20 to +40 %
  fbUpsellFactor: number;     // e.g. -30 to +50 %
  spaPremiumFactor: number;   // e.g. -30 to +50 %
  cabanaOccupancy: number;    // in % (baseline 60)
  themeParkExternalPrice: number; // in KZT (baseline 12000)
  themeParkTicketsCount: number;  // baseline 800
  costControlSaving: number;  // cost control saving in % (e.g. -5 to +15)
  channelCommissionRate?: number; // average channel commission %
  baseOccupancy?: number;     // baseline occupancy % (default 76)
  baseAdr?: number;           // baseline ADR in KZT (default 145000)
  baseFbRevenue?: number;     // baseline F&B revenue in KZT (default 18500000)
  baseSpaRevenue?: number;    // baseline Spa revenue in KZT (default 6800000)
}

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  params: SimulationParameters;
  description?: string;
}

export interface AIAdviceResponse {
  advice: string;
  strategicActions: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    impactMetric: string;
  }[];
}
