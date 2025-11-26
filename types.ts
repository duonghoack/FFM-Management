export type CalculationType = 'FIXED' | 'RANGE_WEIGHT' | 'TIER_VOLUME' | 'FORMULA' | 'AMAZON_FBA' | 'SHIPPING_ZONE';

export type ApplyLevel = 'PER_ITEM' | 'PER_ORDER';

export interface Rule {
  min?: number;
  max?: number;
  price?: number;
  name?: string;
  max_volume?: number;
  // Shipping Zone specific
  zone?: string;
  // Amazon specific
  tier_name?: string;
  // Dynamic fields
  [key: string]: any;
}

export interface Component {
  id: string;
  name: string;
  type: CalculationType;
  apply_level: ApplyLevel;
  unit?: string;
  price?: number; // For FIXED
  base_price?: number; // For FORMULA
  incremental_price?: number; // For FORMULA
  rules: Rule[];
}

export interface RateCard {
  id: string;
  vendor: string;
  name: string;
  currency: string;
  components: Component[];
}

export interface OrderItem {
  id: number;
  name: string;
  weight: number; // lbs
  l: number; // inches
  w: number; // inches
  h: number; // inches
  qty: number;
}

export interface CostDetail {
  name: string;
  cost: number;
  note: string;
}

export interface RoutingCandidate {
  rateCardId: string;
  vendorName: string;
  totalCost: number;
  details: CostDetail[];
  totalWeight: number;
  totalVolume: number;
  isPriority?: boolean; // For Owned Warehouse Zone 1
}

export interface SimulationResult {
  candidates: RoutingCandidate[];
  winner: RoutingCandidate | null;
}