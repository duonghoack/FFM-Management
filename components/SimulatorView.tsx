import React, { useState, useEffect } from 'react';
import { Package, Calculator, RefreshCw, Box, Layers, Trash2 } from 'lucide-react';
import { RateCard, OrderItem, SimulationResult } from '../types';
import { calculateCost } from '../utils/calculator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SimulatorViewProps {
  rateCard: RateCard;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SimulatorView: React.FC<SimulatorViewProps> = ({ rateCard }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: 1, name: 'T-Shirt (Cotton)', weight: 0.5, l: 10, w: 8, h: 1, qty: 2 },
    { id: 2, name: 'Sneakers (Boxed)', weight: 2.5, l: 12, w: 8, h: 5, qty: 1 }
  ]);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleCalculate = () => {
    const res = calculateCost(rateCard, orderItems);
    setResult(res);
  };

  // Auto calculate when rate card changes
  useEffect(() => {
    if (result) handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateCard]);

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

  const chartData = result?.details.map(d => ({ name: d.name, value: d.cost })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* INPUT FORM */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-5 flex items-center gap-2 text-lg">
            <Package className="text-blue-500" size={24} /> 
            Order Composition
          </h3>
          
          <div className="space-y-4">
            {orderItems.map((item, idx) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group transition-all hover:border-blue-300 hover:shadow-sm">
                <button 
                    onClick={() => removeItem(idx)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 size={16} />
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
                <Calculator size={20} /> Calculate Costs
            </button>
          </div>
        </div>
      </div>

      {/* OUTPUT RESULT */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                    <RefreshCw className="text-emerald-500" size={24}/> Cost Breakdown
                </h3>
                {result && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                        {rateCard.currency}
                    </span>
                )}
            </div>

            {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Layers size={48} className="text-slate-300"/>
                    </div>
                    <p className="text-lg font-medium">Ready to Simulate</p>
                    <p className="text-sm">Enter items and click Calculate to view estimates</p>
                </div>
            ) : (
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Applied Rate Card</p>
                            <p className="font-bold text-slate-800 text-lg">{rateCard.name}</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                <div className="flex items-center gap-1"><Box size={14}/> Weight: {result.totalWeight.toFixed(2)} lbs</div>
                                <div className="flex items-center gap-1"><Package size={14}/> Vol: {result.totalVolume.toFixed(0)} in³</div>
                            </div>
                        </div>
                        <div className="text-right mt-4 sm:mt-0">
                            <p className="text-sm text-slate-500 font-medium">Total Landed Cost</p>
                            <p className="text-4xl font-extrabold text-emerald-600 tracking-tight">${result.totalCost.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-0 text-sm border border-slate-100 rounded-lg overflow-hidden">
                            <div className="bg-slate-100/80 p-3 font-semibold text-slate-600 text-xs uppercase tracking-wide flex justify-between">
                                <span>Component</span>
                                <span>Cost</span>
                            </div>
                            {result.details.map((detail, idx) => (
                                <div key={idx} className="border-t border-slate-100 p-3 flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium text-slate-800">{detail.name}</div>
                                        <div className="font-bold text-slate-700">${detail.cost.toFixed(2)}</div>
                                    </div>
                                    <div className="text-xs text-slate-500 italic leading-relaxed">{detail.note}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="h-48 md:h-auto min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} layout="vertical" align="right" verticalAlign="middle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SimulatorView;
