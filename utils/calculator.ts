import { RateCard, OrderItem, SimulationResult, CostDetail, RoutingCandidate } from '../types';
import { MOCK_ZONE_MAPPING } from '../constants';

const calculateVolume = (l: number, w: number, h: number) => l * w * h;

// Helper to determine zone from zipcode (Mock logic)
const getZoneFromZip = (zip: string): number => {
  const prefix = zip.substring(0, 3);
  return MOCK_ZONE_MAPPING[prefix] || 8; // Default to Zone 8 (Cross country) if not found
};

// Helper: Determine Amazon Size Tier
const getAmazonSizeTier = (item: OrderItem) => {
  // Simplified Logic based on Amazon US standards
  const longest = Math.max(item.l, item.w, item.h);
  const median = [item.l, item.w, item.h].sort((a,b) => a-b)[1];
  const shortest = Math.min(item.l, item.w, item.h);
  
  // Logic order matters (Smallest first)
  if (item.weight <= 0.25 && longest <= 15 && median <= 12 && shortest <= 0.75) return 'Small Standard (up to 4oz)';
  if (item.weight <= 0.5 && longest <= 15 && median <= 12 && shortest <= 0.75) return 'Small Standard (up to 8oz)';
  if (item.weight <= 1 && longest <= 18 && median <= 14 && shortest <= 8) return 'Large Standard (up to 1lb)';
  if (item.weight <= 1.5 && longest <= 18 && median <= 14 && shortest <= 8) return 'Large Standard (1lb to 1.5lb)';
  if (item.weight <= 2 && longest <= 18 && median <= 14 && shortest <= 8) return 'Large Standard (1.5lb to 2lb)';
  
  return 'Small Oversize'; // Fallback
};

// --- SINGLE RATE CARD CALCULATOR ---
const calculateSingleCard = (rateCard: RateCard, orderItems: OrderItem[], zipcode: string): RoutingCandidate => {
  let totalCost = 0;
  let details: CostDetail[] = [];
  
  const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const totalWeight = orderItems.reduce((sum, item) => sum + (item.weight * item.qty), 0);
  const totalVolume = orderItems.reduce((sum, item) => sum + (calculateVolume(item.l, item.w, item.h) * item.qty), 0) * 1.2;
  
  // Determine Zone
  const zone = getZoneFromZip(zipcode);

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
        orderItems.forEach(item => {
          const rule = comp.rules.find(r => 
            item.weight > (r.min || 0) && item.weight <= (r.max || 99999)
          );
          if (rule && rule.price !== undefined) {
            const subTotal = rule.price * item.qty;
            componentCost += subTotal;
            explanation += `${item.name} (${item.weight}lb): $${rule.price} x ${item.qty}; `;
          }
        });
      } else {
        const rule = comp.rules.find(r => 
          totalWeight > (r.min || 0) && totalWeight <= (r.max || 99999)
        );
        if (rule && rule.price !== undefined) {
          componentCost = rule.price;
          explanation = `Total Weight ${totalWeight.toFixed(2)}lb in range ${rule.min}-${rule.max}lb`;
        }
      }
    }

    // 3. LOGIC: TIER_VOLUME (Material)
    else if (comp.type === 'TIER_VOLUME') {
      const sortedRules = [...comp.rules].sort((a, b) => (a.max_volume || 0) - (b.max_volume || 0));
      const suitableBox = sortedRules.find(r => (r.max_volume || 0) >= totalVolume);
      
      if (suitableBox && suitableBox.price !== undefined) {
        componentCost = suitableBox.price;
        explanation = `Volume ${totalVolume.toFixed(0)} in³ fits ${suitableBox.name}`;
      } else if (sortedRules.length > 0) {
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

    // 5. LOGIC: AMAZON_FBA (Size Tier Bundle)
    else if (comp.type === 'AMAZON_FBA') {
        orderItems.forEach(item => {
            // Determine tier for this item
            const sizeTier = getAmazonSizeTier(item);
            // Look up price in rules
            const rule = comp.rules.find(r => r.tier_name === sizeTier);
            if (rule && rule.price) {
                const subTotal = rule.price * item.qty;
                componentCost += subTotal;
                explanation += `${item.qty}x ${item.name} mapped to [${sizeTier}] @ $${rule.price}; `;
            } else {
                // Fallback for oversize
                const oversizeRule = comp.rules.find(r => r.tier_name === 'Small Oversize');
                if (oversizeRule && oversizeRule.price) {
                     componentCost += oversizeRule.price * item.qty;
                     explanation += `${item.qty}x ${item.name} mapped to Fallback [Oversize]; `;
                }
            }
        });
    }

    // 6. LOGIC: SHIPPING_ZONE
    else if (comp.type === 'SHIPPING_ZONE') {
        // Find rule matching Zone AND Weight
        // We look for rule where zone matches (as string) and weight is within range
        const rule = comp.rules.find(r => 
            r.zone === zone.toString() && 
            totalWeight > (r.min || 0) && 
            totalWeight <= (r.max || 99999)
        );

        if (rule && rule.price !== undefined) {
            componentCost = rule.price;
            explanation = `Zone ${zone} (Zip ${zipcode}), Weight ${totalWeight}lb -> Rate $${rule.price}`;
        } else {
            // Check if there is a flat rate or fallback
            componentCost = 0;
            explanation = `No shipping rate found for Zone ${zone}, Weight ${totalWeight}lb`;
        }
    }

    details.push({
      name: comp.name,
      cost: componentCost,
      note: explanation
    });
    totalCost += componentCost;
  });

  return { 
      rateCardId: rateCard.id,
      vendorName: rateCard.vendor,
      totalCost, 
      details, 
      totalWeight, 
      totalVolume 
  };
};

// --- ROUTING ENGINE (MAIN EXPORT) ---
export const runRoutingEngine = (
    rateCards: RateCard[], 
    orderItems: OrderItem[], 
    zipcode: string
): SimulationResult => {
    
    // 1. Calculate for all candidates
    const candidates = rateCards.map(rc => calculateSingleCard(rc, orderItems, zipcode));

    // 2. Logic: In-House Fleet Priority (Zone 1)
    // If zipcode is Zone 1 AND Owned Warehouse is a candidate, we might prioritize it
    // Per PRD: "If Zone 1 ... Assign to Owned Warehouse + In-house Fleet"
    const zone = getZoneFromZip(zipcode);
    const ownedCandidate = candidates.find(c => c.vendorName.includes('Owned') || c.vendorName.includes('In-House'));
    
    if (zone === 1 && ownedCandidate) {
        ownedCandidate.isPriority = true;
        ownedCandidate.details.push({
            name: "ROUTING PRIORITY",
            cost: 0,
            note: "Hard Constraint: Zone 1 assigned to In-house Fleet"
        });
        // We force it to be the winner in the UI logic, or sort it first
    }

    // 3. Sort by Total Cost (LCR - Least Cost Routing)
    // If priority exists, it goes to top regardless of cost (unless we want strict LCR, but PRD says Priority 1 is Hard Constraint)
    candidates.sort((a, b) => {
        if (a.isPriority) return -1;
        if (b.isPriority) return 1;
        return a.totalCost - b.totalCost;
    });

    return {
        candidates,
        winner: candidates[0] || null
    };
};