import React, { useState, useMemo } from 'react';
import { Settings, Plus, LayoutGrid, Calculator } from 'lucide-react';
import { INITIAL_RATE_CARDS } from './constants';
import { RateCard } from './types';
import ConfigView from './components/ConfigView';
import SimulatorView from './components/SimulatorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'simulate'>('config');
  const [rateCards, setRateCards] = useState<RateCard[]>(INITIAL_RATE_CARDS);
  const [selectedRateCardId, setSelectedRateCardId] = useState<string>(INITIAL_RATE_CARDS[0].id);

  const activeRateCard = useMemo(() => 
    rateCards.find(rc => rc.id === selectedRateCardId), 
  [rateCards, selectedRateCardId]);

  // Handle updates from ConfigView
  const handleUpdateComponent = (componentId: string, ruleIndex: number | null, field: string, value: any) => {
    if (!activeRateCard) return;

    setRateCards(prevCards => prevCards.map(rc => {
      if (rc.id !== selectedRateCardId) return rc;
      
      const updatedComponents = rc.components.map(comp => {
        if (comp.id !== componentId) return comp;
        
        // Update simple field (e.g., fixed price, formula base)
        if (ruleIndex === null) {
          return { ...comp, [field]: value };
        } 
        
        // Update Rule inside array
        const newRules = [...comp.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], [field]: parseFloat(value) };
        return { ...comp, rules: newRules };
      });

      return { ...rc, components: updatedComponents };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-md">
                    <Settings size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">FFM Cost Engine</h1>
                    <p className="text-xs text-slate-500 font-medium">Logistics Pricing & Simulation</p>
                </div>
            </div>
            
            <nav className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                        activeTab === 'config' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <LayoutGrid size={16} /> Rate Configuration
                </button>
                <button 
                    onClick={() => setActiveTab('simulate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                        activeTab === 'simulate' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <Calculator size={16} /> Simulator
                </button>
            </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
            
            {/* SIDEBAR: Rate Card Selector */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rate Cards</h3>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{rateCards.length}</span>
                    </div>
                    <div className="space-y-3">
                        {rateCards.map(rc => (
                            <div 
                                key={rc.id}
                                onClick={() => setSelectedRateCardId(rc.id)}
                                className={`group p-3.5 rounded-xl cursor-pointer border transition-all duration-200 relative ${
                                    selectedRateCardId === rc.id 
                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`font-bold text-sm mb-1 ${selectedRateCardId === rc.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {rc.vendor}
                                </div>
                                <div className="text-xs text-slate-500 leading-tight">{rc.name}</div>
                                {selectedRateCardId === rc.id && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                )}
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-5 py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> New Vendor
                    </button>
                 </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9">
                {activeTab === 'config' && activeRateCard && (
                    <ConfigView 
                        rateCard={activeRateCard} 
                        onUpdateComponent={handleUpdateComponent} 
                    />
                )}
                {activeTab === 'simulate' && activeRateCard && (
                    <SimulatorView rateCard={activeRateCard} />
                )}
            </div>
        </div>
      </main>
    </div>
  );
}