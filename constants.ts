import { RateCard } from './types';

export const CALCULATION_TYPES = {
  FIXED: { label: 'Fixed Fee', unit: '$ / order' },
  RANGE_WEIGHT: { label: 'Weight Range', unit: '$ / unit (or lb)' },
  TIER_VOLUME: { label: 'Volume Tier (Box)', unit: '$ / box' },
  FORMULA: { label: 'Progressive Formula', unit: 'Base + Incremental' },
  AMAZON_FBA: { label: 'Amazon FBA Bundle', unit: 'Size Tier Price' },
  SHIPPING_ZONE: { label: 'Shipping Rate (Zone)', unit: 'Zone x Weight' }
};

// Mock Zone Mapping: Zipcode starts with -> Zone
export const MOCK_ZONE_MAPPING: Record<string, number> = {
  '900': 1, // Los Angeles (Zone 1 for West Coast)
  '902': 1,
  '100': 8, // New York (Zone 8 from West Coast)
  '750': 5, // Texas (Zone 5)
  '331': 8  // Florida (Zone 8)
};

export const INITIAL_RATE_CARDS: RateCard[] = [
  {
    id: 'rc_amazon',
    vendor: 'Amazon FBA',
    name: 'Amazon Multi-Channel Fulfillment',
    currency: 'USD',
    components: [
      {
        id: 'comp_amz_bundle',
        name: 'FBA Fulfillment Fee (Pick+Pack+Ship)',
        type: 'AMAZON_FBA',
        apply_level: 'PER_ITEM',
        unit: 'unit',
        rules: [
          { tier_name: 'Small Standard (up to 4oz)', max: 0.25, price: 5.35 },
          { tier_name: 'Small Standard (up to 8oz)', max: 0.5, price: 5.50 },
          { tier_name: 'Large Standard (up to 1lb)', max: 1, price: 6.10 },
          { tier_name: 'Large Standard (1lb to 1.5lb)', max: 1.5, price: 7.25 },
          { tier_name: 'Large Standard (1.5lb to 2lb)', max: 2, price: 8.50 },
          { tier_name: 'Small Oversize', max: 70, price: 9.80 } // Simplified
        ]
      }
    ]
  },
  {
    id: 'rc_yqn',
    vendor: 'YQN Logistics',
    name: 'YQN US Standard (Unbundled)',
    currency: 'USD',
    components: [
      {
        id: 'comp_yqn_pick',
        name: 'Picking Fee',
        type: 'RANGE_WEIGHT',
        apply_level: 'PER_ITEM',
        unit: 'lb',
        rules: [
          { min: 0, max: 1, price: 1.00 },
          { min: 1, max: 5, price: 1.50 },
          { min: 5, max: 999, price: 2.50 }
        ]
      },
      {
        id: 'comp_yqn_label',
        name: 'Label Fee',
        type: 'FIXED',
        apply_level: 'PER_ORDER',
        price: 0.60,
        rules: []
      },
      {
        id: 'comp_yqn_ship',
        name: 'Shipping Fee (Ground)',
        type: 'SHIPPING_ZONE',
        apply_level: 'PER_ORDER',
        unit: 'Zone',
        rules: [
          // Simplified Rate Table: Zone 1, Zone 5, Zone 8
          { zone: '1', min: 0, max: 1, price: 4.50 },
          { zone: '1', min: 1, max: 5, price: 5.50 },
          { zone: '5', min: 0, max: 1, price: 6.50 },
          { zone: '5', min: 1, max: 5, price: 8.50 },
          { zone: '8', min: 0, max: 1, price: 9.20 }, // Per example in PRD
          { zone: '8', min: 1, max: 5, price: 12.00 }
        ]
      }
    ]
  },
  {
    id: 'rc_owned',
    vendor: 'Owned Warehouse',
    name: 'In-House Fulfillment',
    currency: 'USD',
    components: [
      {
        id: 'comp_owned_labor',
        name: 'Labor & Box Cost',
        type: 'FIXED',
        apply_level: 'PER_ORDER',
        price: 1.00, // Cheap internal labor
        rules: []
      },
      {
        id: 'comp_owned_ship',
        name: 'Best Rate Carrier (Rate Shop)',
        type: 'SHIPPING_ZONE',
        apply_level: 'PER_ORDER',
        unit: 'Zone',
        rules: [
          // Aggressive rates using USPS logic from PRD
          { zone: '1', min: 0, max: 1, price: 3.80 }, // In-house fleet / Local
          { zone: '1', min: 1, max: 5, price: 4.80 },
          { zone: '5', min: 0, max: 1, price: 5.50 },
          { zone: '8', min: 0, max: 1, price: 8.50 } // Per example in PRD
        ]
      }
    ]
  },
  {
    id: 'rc_gearment',
    vendor: 'Gearment',
    name: 'Gearment Fulfillment',
    currency: 'USD',
    components: [
      {
        id: 'comp_gear_process',
        name: 'Processing Fee',
        type: 'FORMULA',
        apply_level: 'PER_ORDER',
        base_price: 7.00,       // 1st Item
        incremental_price: 2.00, // 2nd Item+
        rules: []
      },
      {
         id: 'comp_gear_ship',
         name: 'Shipping (USPS)',
         type: 'SHIPPING_ZONE',
         apply_level: 'PER_ORDER', 
         rules: [
             { zone: '1', min: 0, max: 10, price: 0 }, // Included in base price often, but added here for flexibility
             { zone: '8', min: 0, max: 10, price: 0 }  
         ]
      }
    ]
  }
];