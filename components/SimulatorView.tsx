import React, { useState } from 'react';
import { Package, Calculator, MapPin, Truck, Trophy, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RateCard, OrderItem, SimulationResult, RoutingCandidate } from '../types';
import { runRoutingEngine } from '../utils/calculator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { INITIAL_RATE_CARDS } from '../constants';

interface SimulatorViewProps {
  rateCard: RateCard; // kept for legacy props, but we use all cards now
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface CandidateCardProps {
  candidate: RoutingCandidate;
  isWinner: boolean;
  expandedCandidate: string | null;
  setExpandedCandidate: (id: string | null) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isWinner, expandedCandidate, setExpandedCandidate }) => {
  const isExpanded = expandedCandidate === candidate.rateCardId;
  const chartData = candidate.details.map(d => ({ name: d.name, value: d.cost }));

  return (
    <div className={`border rounded-xl mb-4 transition-all duration-300 ${isWinner ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:shadow-sm'}`}>
      <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedCandidate(isExpanded ? null : candidate.rateCardId)}
      >
        <div className="flex items-center gap-4">
           {isWinner ? (
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <Trophy size={20} />
               </div>
           ) : (
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <Truck size={20} />
               </div>
           )}
           <div>
               <h4 className={`font-bold text-lg ${isWinner ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {candidate.vendorName}
               </h4>
               {candidate.isPriority && (
                   <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1">
                       <AlertCircle size={10} /> Priority Route
                   </span>
               )}
           </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Landed Cost</p>
                <p className={`text-2xl font-bold ${isWinner ? 'text-emerald-600' : 'text-slate-700'}`}>
                    ${candidate.totalCost.toFixed(2)}
                </p>
            </div>
            {isExpanded ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
        </div>
      </div>

      {isExpanded && (
          <div className="p-4 border-t border-slate-100 bg-white/50 rounded-b-xl grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1 text-sm">
                  {candidate.details.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-start p-2 hover:bg-slate-50 rounded">
                          <div className="flex-1">
                              <div className="font-medium text-slate-700">{d.name}</div>
                              <div className="text-xs text-slate-400">{d.note}</div>
                          </div>
                          <div className="font-bold text-slate-700 ml-4">${d.cost.toFixed(2)}</div>
                      </div>
                  ))}
               </div>
               <div className="h-40">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      </PieChart>
                  </ResponsiveContainer>
               </div>
          </div>
      )}
    </div>
  );
};

const SimulatorView: React.FC<SimulatorViewProps> = () => {
  // We use the global constant for demo purposes to access all vendors
  // In a real implementation, props should carry allRateCards
  const allRateCards = INITIAL_RATE_CARDS; 

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: 1, name: 'T-Shirt (Cotton)', weight: 0.5, l: 10, w: 8, h: 1, qty: 1 },
    // { id: 2, name: 'Sneakers (Boxed)', weight: 2.5, l: 12, w: 8, h: 5, qty: 1 }
  ]);
  const [zipcode, setZipcode] = useState('90012'); // Default to LA
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  const handleCalculate = () => {
    const res = runRoutingEngine(allRateCards, orderItems, zipcode);
    setResult(res);
    if (res.winner) setExpandedCandidate(res.winner.rateCardId);
  };

  const updateItem = (idx: number, field: keyof OrderItem, val: any) => {
    const newItems = [...orderItems];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setOrderItems(newItems);
  };

  const removeItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    const nextId = Math.max(...orderItems.map(i => i.id), 0) + 1;
    setOrderItems([...orderItems, { id: nextId, name: 'New Item', weight: 1, l: 5, w: 5, h: 5, qty: 1 }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* INPUT FORM */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                <Package className="text-blue-500" size={24} /> 
                Order Details
            </h3>
          </div>
          
          {/* Zipcode Input */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
             <label className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 block flex items-center gap-1">
                 <MapPin size={12}/> Destination Zipcode
             </label>
             <input 
                type="text" 
                maxLength={5}
                className="w-full text-lg font-mono tracking-widest border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="e.g. 90012"
             />
             <p className="text-xs text-blue-600 mt-2">
                 * Determines Shipping Zone & In-house fleet eligibility.
                 (Try 900xx for Zone 1, 100xx for Zone 8)
             </p>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, idx) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                <button 
                    onClick={() => removeItem(idx)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                    &times;
                </button>
                <div className="mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Item Name</label>
                    <input 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:border-blue-500"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="text-xs text-slate-500 block mb-1">Qty</label>
                    <input 
                      type="number" min="1"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-slate-500 block mb-1">Wt (lb)</label>
                    <input 
                      type="number" step="0.1"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                      value={item.weight}
                      onChange={(e) => updateItem(idx, 'weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="text-xs text-slate-500 block mb-1">Dims (L-W-H)</label>
                    <div className="flex gap-1">
                      <input type="number" className="w-1/3 border border-slate-300 rounded px-1 py-1 text-center text-sm" value={item.l} onChange={(e) => updateItem(idx, 'l', parseFloat(e.target.value))}/>
                      <input type="number" className="w-1/3 border border-slate-300 rounded px-1 py-1 text-center text-sm" value={item.w} onChange={(e) => updateItem(idx, 'w', parseFloat(e.target.value))}/>
                      <input type="number" className="w-1/3 border border-slate-300 rounded px-1 py-1 text-center text-sm" value={item.h} onChange={(e) => updateItem(idx, 'h', parseFloat(e.target.value))}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
                onClick={addItem}
                className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded hover:bg-slate-50 hover:border-slate-400 hover:text-slate-700 text-sm font-medium transition"
            >
                + Add Item
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100">
             <button 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex justify-center items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                onClick={handleCalculate}
            >
                <Calculator size={20} /> Run Routing Engine
            </button>
          </div>
        </div>
      </div>

      {/* OUTPUT RESULT */}
      <div className="lg:col-span-7">
          <div className="mb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 Routing Results
                 {result && <span className="text-sm font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{result.candidates.length} options analyzed</span>}
             </h2>
          </div>

          {!result ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 h-[400px]">
                   <Truck size={48} className="mb-4 text-slate-300"/>
                   <p className="font-medium">Waiting for Input</p>
                   <p className="text-sm">Enter Destination Zip and Items to route.</p>
               </div>
          ) : (
              <div>
                  {/* Winner Banner */}
                  {result.winner && (
                      <div className="bg-emerald-600 text-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center relative overflow-hidden">
                          <div className="relative z-10">
                              <p className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-1">Recommended Route</p>
                              <h3 className="text-2xl font-bold">{result.winner.vendorName}</h3>
                              <p className="text-sm text-emerald-100 mt-1 flex items-center gap-1">
                                  {result.winner.isPriority ? "Selected via Priority Rules" : "Selected via Least Cost Routing"}
                              </p>
                          </div>
                          <div className="text-right relative z-10">
                               <p className="text-3xl font-extrabold">${result.winner.totalCost.toFixed(2)}</p>
                               <p className="text-xs text-emerald-100">Total Landed Cost</p>
                          </div>
                          {/* Decorative */}
                          <Trophy className="absolute -bottom-4 -right-4 text-emerald-500/30 w-32 h-32 rotate-12" />
                      </div>
                  )}

                  {/* Candidates List */}
                  <div className="space-y-4">
                      {result.candidates.map(candidate => (
                          <CandidateCard 
                            key={candidate.rateCardId} 
                            candidate={candidate} 
                            isWinner={result.winner?.rateCardId === candidate.rateCardId}
                            expandedCandidate={expandedCandidate}
                            setExpandedCandidate={setExpandedCandidate}
                          />
                      ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default SimulatorView;
