import { RateCard } from './types';

export const CALCULATION_TYPES = {
  FIXED: { label: 'Cố định (Fixed)', unit: '$ / order' },
  RANGE_WEIGHT: { label: 'Theo dải cân nặng (Weight Range)', unit: '$ / unit (or lb)' },
  TIER_VOLUME: { label: 'Theo thể tích/Loại hộp (Volume Tier)', unit: '$ / box' },
  FORMULA: { label: 'Công thức lũy tiến (Formula)', unit: 'Base + Incremental' },
  AMAZON_TIER: { label: 'Amazon Size Tier', unit: 'Bundle Price' }
};

export const INITIAL_RATE_CARDS: RateCard[] = [
  {
    id: 'rc_yqn_01',
    vendor: 'YQN Logistics',
    name: 'YQN US Fulfillment Standard',
    currency: 'USD',
    components: [
      {
        id: 'comp_yqn_pick',
        name: 'Picking Fee',
        type: 'RANGE_WEIGHT',
        apply_level: 'PER_ITEM',
        unit: 'lb',
        rules: [
          { min: 0, max: 5, price: 0.80 },
          { min: 5, max: 10, price: 1.00 },
          { min: 10, max: 20, price: 1.20 },
          { min: 20, max: 50, price: 3.20 },
          { min: 150, max: 9999, price: 7.50 }
        ]
      },
      {
        id: 'comp_yqn_label',
        name: 'Label Fee',
        type: 'FIXED',
        apply_level: 'PER_ORDER',
        price: 0.20,
        rules: []
      },
      {
        id: 'comp_yqn_pack',
        name: 'Packaging Service Fee',
        type: 'RANGE_WEIGHT',
        apply_level: 'PER_ORDER', // Calculated on total order weight
        unit: 'lb',
        rules: [
          { min: 0, max: 5, price: 1.00 },
          { min: 5, max: 10, price: 2.00 },
          { min: 10, max: 20, price: 2.00 },
          { min: 20, max: 50, price: 3.00 },
          { min: 150, max: 9999, price: 7.00 }
        ]
      },
      {
        id: 'comp_yqn_mat',
        name: 'Material Fee (Carton)',
        type: 'TIER_VOLUME',
        apply_level: 'PER_ORDER',
        rules: [
          { name: 'Small Box (10x6x6)', max_volume: 360, price: 1.50 },
          { name: 'Medium Box (18x14x8)', max_volume: 2016, price: 3.00 },
          { name: 'Large Box (22x16x16)', max_volume: 5632, price: 4.80 }
        ]
      }
    ]
  },
  {
    id: 'rc_gearment_01',
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
         id: 'comp_gear_ship_base',
         name: 'Base Shipping (Zone 1-4)',
         type: 'FIXED',
         apply_level: 'PER_ORDER', 
         price: 5.50,
         rules: []
      }
    ]
  }
];