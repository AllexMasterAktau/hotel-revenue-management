/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HotelKPIs, SegmentData, ChannelData, AncillaryPOS, CompetitorData, SimulationParameters, MarketIndices } from './types';

// Constants for Resort Hotel
export const TOTAL_ROOMS = 500;
export const TOTAL_VILLAS = 15;
export const TOTAL_KEYS = TOTAL_ROOMS + TOTAL_VILLAS; // 515
export const MAX_CABANAS = 40;
export const STANDARD_CABANA_BASE_RATE = 80000; // in KZT

// Baseline values representing a typical high-season summer day
export const BASELINE_OCCUPANCY = 76; // 76%
export const BASELINE_ADR = 145000;    // 145,000 KZT (approx. $300)

export const BASELINE_SEGMENTS: SegmentData[] = [
  { id: 'families', name: 'Families with Kids (Семейный отдых)', share: 45, adr: 155000, roomNights: 0, revenue: 0, color: '#D4AF37' }, // Gold
  { id: 'couples', name: 'Couples & Wellness (Пары / СПА)', share: 25, adr: 160000, roomNights: 0, revenue: 0, color: '#C5A059' },    // Muted Gold
  { id: 'corporate', name: 'MICE & Corporate (Корпоративные группы)', share: 18, adr: 130000, roomNights: 0, revenue: 0, color: '#4A5568' }, // Slate Blue
  { id: 'groups', name: 'Leisure Group Tours (Групповой туризм)', share: 12, adr: 110000, roomNights: 0, revenue: 0, color: '#718096' }     // Muted Gray
];

export const BASELINE_CHANNELS: ChannelData[] = [
  { id: 'direct', name: 'Direct (Website, App, Call Center)', share: 40, commission: 0, revenue: 0, color: '#B8860B' },   // Dark Goldenrod
  { id: 'ota', name: 'OTAs (Booking.com, Expedia)', share: 32, commission: 15, revenue: 0, color: '#E2E8F0' },            // Ice White/Gray
  { id: 'operators', name: 'Tour Operators / Agencies', share: 18, commission: 12, revenue: 0, color: '#8C7853' },        // Khaki Gold
  { id: 'corporate_b2b', name: 'Corporate Direct Contracts', share: 10, commission: 4, revenue: 0, color: '#2D3748' }     // Charcoal
];

export const BASELINE_ANCILLARY: AncillaryPOS[] = [
  {
    id: 'f_b',
    name: 'Рестораны A la Carte и Бары',
    baselineRevenue: 18500000,
    currentRevenue: 18500000,
    visitorCount: 650,
    averageSpend: 28460,
    type: 'f&b',
    description: 'Доход от повышения класса обслуживания до премиального алкоголя "ultra all-inclusive" и частных ужинов в ресторанах A la Carte (Lalezar, Mermaid).'
  },
  {
    id: 'spa',
    name: 'Anjana Spa и VIP Процедуры',
    baselineRevenue: 6800000,
    currentRevenue: 6800000,
    visitorCount: 140,
    averageSpend: 48570,
    type: 'spa',
    description: 'Традиционные процедуры в VIP-турецком хаммаме, индивидуальная массажная терапия и оздоровительные программы.'
  },
  {
    id: 'cabanas',
    name: 'Частные морские кабаны и пляжные павильоны',
    baselineRevenue: 0,
    currentRevenue: 0,
    visitorCount: 0,
    averageSpend: 0,
    type: 'cabanas',
    description: 'Эксклюзивные пляжные кабаны на пирсе с услугами личного дворецкого, премиальными корзинами с фруктами и шампанским.'
  },
  {
    id: 'themepark',
    name: 'Билеты в аквапарк и тематический парк',
    baselineRevenue: 0,
    currentRevenue: 0,
    visitorCount: 0,
    averageSpend: 0,
    type: 'themepark',
    description: 'Продажи внешних дневных абонементов для лиц, не проживающих в отелях, в аквапарк и экстремальные аттракционы.'
  }
];

export const BASELINE_COMPETITORS: CompetitorData[] = [
  { id: 'rixos', name: 'Resort Hotel (Subject)', adr: 145000, occupancy: 76, revpar: 110200, rating: 4.8, distance: 'Host Hotel', isSubject: true },
  { id: 'caspian_riviera', name: 'Caspian Riviera Grand Palace', adr: 118000, occupancy: 64, revpar: 75520, rating: 4.6, distance: '18 km (City)', isSubject: false },
  { id: 'holiday_inn', name: 'Holiday Inn (Business-centric)', adr: 58000, occupancy: 58, revpar: 33640, rating: 4.3, distance: '22 km (Downtown)', isSubject: false },
  { id: 'grand_hotel', name: 'Grand Hotel', adr: 45000, occupancy: 49, revpar: 22050, rating: 4.1, distance: '20 km (Downtown)', isSubject: false },
  { id: 'tree_of_life', name: 'Tree of Life (Beach Resort)', adr: 92000, occupancy: 71, revpar: 65320, rating: 4.4, distance: '8 km (Beach coast)', isSubject: false }
];

export const DEFAULT_SIMULATION_PARAMS: SimulationParameters = {
  occupancyShift: 0,
  adrShift: 0,
  fbUpsellFactor: 0,
  spaPremiumFactor: 0,
  cabanaOccupancy: 0, // 0% occupancy initially
  themeParkExternalPrice: 0, // 0 KZT initially
  themeParkTicketsCount: 0, // 0 tickets initially
  costControlSaving: 0,
  baseOccupancy: 0,
  baseAdr: 0,
  baseFbRevenue: 0,
  baseSpaRevenue: 0
};

export const STRATEGIC_PRESETS = [
  {
    nameRu: '☀️ Летний пик (High Season)',
    nameEn: '☀️ Summer Peak (High Season)',
    descriptionRu: 'Максимальная загрузка курорта, премиум тарифы и полная заполняемость VIP Cabanas.',
    descriptionEn: 'Maximum resort load, premium rates, and full VIP Cabanas occupancy.',
    params: {
      occupancyShift: 18,     // 76% + 18% = 94% occupancy
      adrShift: 35,           // +35% ADR premium (195,750 KZT)
      fbUpsellFactor: 25,     // +25% premium restaurants
      spaPremiumFactor: 20,   // +20% spa treatments
      cabanaOccupancy: 95,    // 95% cabanas occupied
      themeParkExternalPrice: 15000,
      themeParkTicketsCount: 1600, // peak park visits
      costControlSaving: -2   // slight extra cost for premium logistics
    }
  },
  {
    nameRu: '👔 Будни MICE (Corporate Load)',
    nameEn: '👔 Weekday MICE (Corporate Load)',
    descriptionRu: 'Осенние бизнес-группы. Средний тариф ниже, но высокая загрузка номеров и банкетных залов.',
    descriptionEn: 'Autumn business groups. Average daily rate is lower, but rooms and banquet occupancy is high.',
    params: {
      occupancyShift: 8,      // 76% + 8% = 84% occupancy
      adrShift: -12,          // Corporate discount rate
      fbUpsellFactor: 15,     // Corporate banquets & bars
      spaPremiumFactor: -5,   // Busy corporates buy fewer spa packages
      cabanaOccupancy: 40,    // low beach cabana demand
      themeParkExternalPrice: 9000,
      themeParkTicketsCount: 200,
      costControlSaving: 4    // group efficiencies
    }
  },
  {
    nameRu: '🛡️ Защита от конкурентов (Price War)',
    nameEn: '🛡️ Competitor Defense (Price War)',
    descriptionRu: 'Защитная стратегия при ценовом демпинге со стороны других пляжных резортов.',
    descriptionEn: 'Defensive rate yielding strategy during price dumping by other beach resorts.',
    params: {
      occupancyShift: -5,
      adrShift: -15,          // Tactical tariff decrease
      fbUpsellFactor: 20,     // Strong push on extra F&B upsells
      spaPremiumFactor: 15,   // spa promotions
      cabanaOccupancy: 70,
      themeParkExternalPrice: 12000,
      themeParkTicketsCount: 900,
      costControlSaving: 8    // tight expense optimization to protect GOPPAR
    }
  },
  {
    nameRu: '❄️ Зимнее межсезонье (Winter Low)',
    nameEn: '❄️ Winter Off-Season (Winter Low)',
    descriptionRu: 'Низкий зимний сезон. Загрузка падает, сильный фокус на закрытые спа и ресторанные ужины.',
    descriptionEn: 'Low winter season. Occupancy drops, heavy focus on indoor spa treatments and restaurant dinners.',
    params: {
      occupancyShift: -46,    // 76% - 46% = 30% winter load
      adrShift: -35,          // promotional rates
      fbUpsellFactor: -15,
      spaPremiumFactor: 5,    // wellness winter packages
      cabanaOccupancy: 5,     // cold beachcabanas
      themeParkExternalPrice: 5000, // winter discounts
      themeParkTicketsCount: 50,
      costControlSaving: 14   // maximal cost-control and staff consolidation
    }
  }
];

// Formula engine to calculate metrics based on parameters
export function calculateHotelMetrics(params: SimulationParameters): HotelKPIs {
  const baseOcc = params.baseOccupancy !== undefined ? params.baseOccupancy : BASELINE_OCCUPANCY;
  const baseAdrVal = params.baseAdr !== undefined ? params.baseAdr : BASELINE_ADR;
  const baseFbRev = params.baseFbRevenue !== undefined ? params.baseFbRevenue : 18500000;
  const baseSpaRev = params.baseSpaRevenue !== undefined ? params.baseSpaRevenue : 6800000;

  // 1. Calculate Occupancies
  const stdOccupancy = baseOcc === 0
    ? Math.max(0, Math.min(100, params.occupancyShift))
    : Math.max(10, Math.min(100, baseOcc + params.occupancyShift));
  // Villa occupancy reacts strongly to general demand with a baseline of 60%
  const villasOccupancy = baseOcc === 0
    ? Math.max(0, Math.min(100, params.occupancyShift * 0.8))
    : Math.max(5, Math.min(100, 60 + params.occupancyShift * 0.8));

  const stdOccupied = Math.round(TOTAL_ROOMS * (stdOccupancy / 100));
  const villasOccupied = Math.round(TOTAL_VILLAS * (villasOccupancy / 100));
  const totalOccupied = stdOccupied + villasOccupied;
  const occupancy = (totalOccupied / TOTAL_KEYS) * 100;

  // 2. Calculate ADRs (Premium villas have very high ADR - baseline 950,000 KZT)
  const stdAdr = Math.round(baseAdrVal * (1 + params.adrShift / 100));
  const villasAdr = baseAdrVal === 0 ? 0 : Math.round(950000 * (1 + params.adrShift / 100));

  // 3. Rooms Revenue
  const stdRevenue = stdOccupied * stdAdr;
  const villasRevenue = villasOccupied * villasAdr;
  const roomsRevenue = stdRevenue + villasRevenue;
  
  const adr = totalOccupied > 0 ? Math.round(roomsRevenue / totalOccupied) : 0;
  const revpar = Math.round(roomsRevenue / TOTAL_KEYS);

  // 4. Calculate Ancillary Revenues dynamically
  // Under default conditions (occupancyShift === 0), we normalize scaling factor to exactly 1.0
  // to avoid rounding discrepancies with baseline percentages.
  const baseScale = params.occupancyShift === 0 ? 1.0 : (baseOcc > 0 ? (occupancy / baseOcc) : 0);

  // F&B scales linearly with hotel occupied rooms, multiplied by upsell factor
  const fbScale = baseScale;
  const fbRevenue = Math.round(
    baseFbRev *
    fbScale *
    (1 + params.fbUpsellFactor / 100)
  );

  // Spa scales with occupied rooms and premium factor
  const spaScale = baseScale;
  const spaRevenue = Math.round(
    baseSpaRev *
    spaScale *
    (1 + params.spaPremiumFactor / 100)
  );

  // Cabanas revenue is based directly on cabana occupancy and standard rate
  const rentedCabanas = Math.round(MAX_CABANAS * (params.cabanaOccupancy / 100));
  const cabanasRevenue = rentedCabanas * STANDARD_CABANA_BASE_RATE;

  // Theme park scales with external tickets and external price
  const themeparkRevenue = params.themeParkTicketsCount * params.themeParkExternalPrice;

  const ancillaryRevenue = fbRevenue + spaRevenue + cabanasRevenue + themeparkRevenue;
  const totalRevenue = roomsRevenue + ancillaryRevenue;
  const trevpar = Math.round(totalRevenue / TOTAL_KEYS);

  // 5. Calculate Expenses and GOP
  // Baseline rooms variable expense per occupied room is 26,000 KZT (All-inclusive guest costs)
  // Shifted by cost control: standard saving reduces variable cost
  const baseVariableCostPerRoom = 26000;
  const variableCostPerRoom = baseVariableCostPerRoom * (1 - params.costControlSaving / 100);
  // Villas have a 2.5x variable service cost factor due to premium level
  const totalVariableCost = (stdOccupied + villasOccupied * 2.5) * variableCostPerRoom;

  // Fixed costs are 24,000,000 KZT per day.
  // Saved by cost control (e.g. energy management, staffing efficiency, but less flexible than variable, say half speed)
  const baseFixedCost = 24000000;
  const fixedCost = baseFixedCost * (1 - (params.costControlSaving * 0.5) / 100);

  // Ancillary direct cost of sales is approximately 35% of F&B and Spa, 15% of Cabanas, and 20% of Theme Park
  const fbCost = fbRevenue * 0.38 * (1 - params.costControlSaving / 100);
  const spaCost = spaRevenue * 0.30 * (1 - params.costControlSaving / 100);
  const cabanasCost = cabanasRevenue * 0.10;
  const themeparkCost = themeparkRevenue * 0.15;
  const totalAncillaryCosts = fbCost + spaCost + cabanasCost + themeparkCost;

  const totalExpenses = totalVariableCost + fixedCost + totalAncillaryCosts;
  const gop = Math.max(0, totalRevenue - totalExpenses);
  const goppar = Math.round(gop / TOTAL_KEYS);
  const gopMargin = totalRevenue > 0 ? (gop / totalRevenue) * 100 : 0;

  return {
    occupancy,
    adr,
    revpar,
    roomsRevenue,
    ancillaryRevenue,
    totalRevenue,
    trevpar,
    gop,
    goppar,
    gopMargin
  };
}

// Generate dynamic Compset indexing
export function calculateMarketIndices(subjectKpis: HotelKPIs, competitors: CompetitorData[]): MarketIndices {
  // Extract all competitors except Rixos (isSubject)
  const compsetList = competitors.filter(c => !c.isSubject);
  
  // Calculate average competitor ADR, Occupancy, RevPAR
  const avgCompAdr = compsetList.reduce((acc, c) => acc + c.adr, 0) / compsetList.length;
  const avgCompOcc = compsetList.reduce((acc, c) => acc + c.occupancy, 0) / compsetList.length;
  const avgCompRevpar = compsetList.reduce((acc, c) => acc + c.revpar, 0) / compsetList.length;

  // Market indices: (Subject value / Competitor average) * 100
  const mpi = (subjectKpis.occupancy / avgCompOcc) * 100;
  const ari = (subjectKpis.adr / avgCompAdr) * 100;
  const rgi = (subjectKpis.revpar / avgCompRevpar) * 100;

  return { mpi, ari, rgi };
}

// Dynamic segment and channel revenue breakdown
export function getSimulatedSegments(occupancy: number, adr: number, params?: SimulationParameters): SegmentData[] {
  const baseAdrVal = (params && params.baseAdr !== undefined) ? params.baseAdr : BASELINE_ADR;
  const occupiedRooms = Math.round(TOTAL_KEYS * (occupancy / 100));
  
  return BASELINE_SEGMENTS.map(seg => {
    const roomNights = Math.round(occupiedRooms * (seg.share / 100));
    // segment rate relative to overall average ADR
    const segmentRate = Math.round(adr * (seg.adr / (baseAdrVal || 1)));
    const revenue = roomNights * segmentRate;
    return {
      ...seg,
      roomNights,
      adr: segmentRate,
      revenue
    };
  });
}

export function getSimulatedChannels(roomsRevenue: number): ChannelData[] {
  return BASELINE_CHANNELS.map(ch => {
    const revenue = Math.round(roomsRevenue * (ch.share / 100));
    return {
      ...ch,
      revenue
    };
  });
}

export function getSimulatedAncillary(params: SimulationParameters, occupancy: number): AncillaryPOS[] {
  const baseOcc = params.baseOccupancy !== undefined ? params.baseOccupancy : BASELINE_OCCUPANCY;
  const baseFbRev = params.baseFbRevenue !== undefined ? params.baseFbRevenue : 18500000;
  const baseSpaRev = params.baseSpaRevenue !== undefined ? params.baseSpaRevenue : 6800000;

  const fbScale = baseOcc > 0 ? (occupancy / baseOcc) : 0;
  
  return BASELINE_ANCILLARY.map(pos => {
    let currentRevenue = pos.baselineRevenue;
    let visitorCount = pos.visitorCount;
    let averageSpend = pos.averageSpend;

    const actualBaselineRevenue = pos.id === 'f_b' ? baseFbRev : (pos.id === 'spa' ? baseSpaRev : pos.baselineRevenue);

    if (pos.id === 'f_b') {
      currentRevenue = Math.round(actualBaselineRevenue * fbScale * (1 + params.fbUpsellFactor / 100));
      visitorCount = Math.round(pos.visitorCount * fbScale);
      averageSpend = visitorCount > 0 ? Math.round(currentRevenue / visitorCount) : 0;
    } else if (pos.id === 'spa') {
      currentRevenue = Math.round(actualBaselineRevenue * fbScale * (1 + params.spaPremiumFactor / 100));
      visitorCount = Math.round(pos.visitorCount * fbScale * (1 + params.spaPremiumFactor * 0.2 / 100));
      averageSpend = visitorCount > 0 ? Math.round(currentRevenue / visitorCount) : 0;
    } else if (pos.id === 'cabanas') {
      const rentedCabanas = Math.round(MAX_CABANAS * (params.cabanaOccupancy / 100));
      currentRevenue = rentedCabanas * STANDARD_CABANA_BASE_RATE;
      visitorCount = rentedCabanas;
      averageSpend = STANDARD_CABANA_BASE_RATE;
    } else if (pos.id === 'themepark') {
      currentRevenue = params.themeParkTicketsCount * params.themeParkExternalPrice;
      visitorCount = params.themeParkTicketsCount;
      averageSpend = params.themeParkExternalPrice;
    }

    return {
      ...pos,
      baselineRevenue: actualBaselineRevenue,
      currentRevenue,
      visitorCount,
      averageSpend
    };
  });
}

// Currency Formatter
export function formatKZT(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
  }).format(value).replace('KZT', '₸');
}

export let USD_TO_KZT_RATE = 476.5; // fallback rate

export function setUSDExchangeRate(rate: number) {
  USD_TO_KZT_RATE = rate;
}

// Convert to USD using dynamic/real-time exchange rate
export function formatUSD(value: number): string {
  const usdVal = value / USD_TO_KZT_RATE;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(usdVal);
}
