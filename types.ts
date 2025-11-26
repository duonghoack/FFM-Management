export type CalculationType = 'FIXED' | 'RANGE_WEIGHT' | 'TIER_VOLUME' | 'FORMULA' | 'AMAZON_TIER';

export type ApplyLevel = 'PER_ITEM' | 'PER_ORDER';

export interface Rule {
  min?: number;
  max?: number;
  price?: number;
  name?: string;
  max_volume?: number;
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

export interface SimulationResult {
  totalCost: number;
  details: CostDetail[];
  totalWeight: number;
  totalVolume: number;
}
