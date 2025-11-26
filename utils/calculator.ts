import { RateCard, OrderItem, SimulationResult, CostDetail } from '../types';

const calculateVolume = (l: number, w: number, h: number) => l * w * h;

export const calculateCost = (rateCard: RateCard, orderItems: OrderItem[]): SimulationResult | null => {
  if (!rateCard) return null;

  let totalCost = 0;
  let details: CostDetail[] = [];
  
  const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const totalWeight = orderItems.reduce((sum, item) => sum + (item.weight * item.qty), 0);
  // Assume 20% void fill for packaging
  const totalVolume = orderItems.reduce((sum, item) => sum + (calculateVolume(item.l, item.w, item.h) * item.qty), 0) * 1.2;

  rateCard.components.forEach(comp => {
    let componentCost = 0;
    let explanation = "";

    // 1. LOGIC: FIXED
    if (comp.type === 'FIXED') {
      const price = comp.price || 0;
      componentCost = price;
      explanation = `Fixed fee: $${price.toFixed(2)}`;
    }

    // 2. LOGIC: RANGE_WEIGHT (Picking / Packing)
    else if (comp.type === 'RANGE_WEIGHT') {
      if (comp.apply_level === 'PER_ITEM') {
        // Iterate per SKU
        orderItems.forEach(item => {
          const rule = comp.rules.find(r => 
            item.weight > (r.min || 0) && item.weight <= (r.max || 99999)
          );
          if (rule && rule.price !== undefined) {
            const subTotal = rule.price * item.qty;
            componentCost += subTotal;
            explanation += `${item.name} (${item.weight}lb): $${rule.price} x ${item.qty}; `;
          } else {
             explanation += `${item.name}: No matching range; `;
          }
        });
      } else {
        // PER_ORDER (Total Weight)
        const rule = comp.rules.find(r => 
          totalWeight > (r.min || 0) && totalWeight <= (r.max || 99999)
        );
        if (rule && rule.price !== undefined) {
          componentCost = rule.price;
          explanation = `Total Weight ${totalWeight.toFixed(2)}lb in range ${rule.min}-${rule.max}lb`;
        } else {
            explanation = `Total Weight ${totalWeight.toFixed(2)}lb: No matching range`;
        }
      }
    }

    // 3. LOGIC: TIER_VOLUME (Material)
    else if (comp.type === 'TIER_VOLUME') {
      // Find smallest box that fits
      const sortedRules = [...comp.rules].sort((a, b) => (a.max_volume || 0) - (b.max_volume || 0));
      const suitableBox = sortedRules.find(r => (r.max_volume || 0) >= totalVolume);
      
      if (suitableBox && suitableBox.price !== undefined) {
        componentCost = suitableBox.price;
        explanation = `Volume ${totalVolume.toFixed(0)} in³ fits ${suitableBox.name}`;
      } else if (sortedRules.length > 0) {
        // Fallback to largest box
        const largestBox = sortedRules[sortedRules.length - 1];
        if (largestBox && largestBox.price !== undefined) {
            componentCost = largestBox.price;
            explanation = `Oversized, using largest box ${largestBox.name}`;
        }
      }
    }

    // 4. LOGIC: FORMULA (Gearment style)
    else if (comp.type === 'FORMULA') {
      if (totalItems > 0) {
        const base = comp.base_price || 0;
        const incr = comp.incremental_price || 0;
        componentCost = base + (Math.max(0, totalItems - 1) * incr);
        explanation = `Base $${base} + (${totalItems - 1} extra items x $${incr})`;
      }
    }

    details.push({
      name: comp.name,
      cost: componentCost,
      note: explanation
    });
    totalCost += componentCost;
  });

  return { totalCost, details, totalWeight, totalVolume };
};