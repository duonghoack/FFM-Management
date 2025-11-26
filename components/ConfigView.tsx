import React from 'react';
import { Plus, Trash2, Save, Tags, Scale, Box, Calculator, Truck, ShoppingBag, X } from 'lucide-react';
import { RateCard, Component, ApplyLevel, CalculationType } from '../types';
import { CALCULATION_TYPES } from '../constants';
import { FixedEditor, WeightRangeEditor, VolumeTierEditor, FormulaEditor, AmazonTierEditor, ShippingZoneEditor } from './RuleEditors';

interface ConfigViewProps {
  rateCard: RateCard;
  onUpdateComponent: (componentId: string, ruleIndex: number | null, field: string, value: any) => void;
  onAddComponent: (rateCardId: string) => void;
  onDeleteComponent: (rateCardId: string, componentId: string) => void;
  onAddRule: (componentId: string) => void;
  onDeleteRule: (componentId: string, ruleIndex: number) => void;
}

const ConfigView: React.FC<ConfigViewProps> = ({ 
    rateCard, 
    onUpdateComponent, 
    onAddComponent, 
    onDeleteComponent,
    onAddRule,
    onDeleteRule
}) => {
  
  const getIconForType = (type: string) => {
    switch(type) {
        case 'FIXED': return <Tags size={16} />;
        case 'RANGE_WEIGHT': return <Scale size={16} />;
        case 'TIER_VOLUME': return <Box size={16} />;
        case 'AMAZON_FBA': return <ShoppingBag size={16} />;
        case 'SHIPPING_ZONE': return <Truck size={16} />;
        default: return <Calculator size={16} />;
    }
  };

  const handleEditorUpdate = (componentId: string) => (field: string, value: any, ruleIndex?: number) => {
    onUpdateComponent(componentId, ruleIndex ?? null, field, value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{rateCard.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span className="font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
               {rateCard.vendor}
            </span>
            <span>•</span>
            <span>Currency: <strong className="text-slate-700">{rateCard.currency}</strong></span>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 font-medium">
          <Save size={18} /> Save Config
        </button>
      </div>

      <div className="p-6 bg-slate-50/50 min-h-[500px]">
        <div className="space-y-6">
          {rateCard.components.map((comp, idx) => (
            <div key={comp.id} className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-start gap-4 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm border border-blue-100 flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Component Name Input */}
                    <div>
                        <input 
                            className="font-bold text-lg text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 w-full outline-none transition-all"
                            value={comp.name}
                            onChange={(e) => onUpdateComponent(comp.id, null, 'name', e.target.value)}
                        />
                    </div>

                    {/* Logic Type and Apply Level Selectors */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        {/* Logic Type Selector */}
                        <div className="relative group/select">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                {getIconForType(comp.type)}
                            </div>
                            <select 
                                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md py-1.5 pl-8 pr-8 font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                                value={comp.type}
                                onChange={(e) => onUpdateComponent(comp.id, null, 'type', e.target.value)}
                            >
                                {Object.entries(CALCULATION_TYPES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Apply Level Selector */}
                        <select 
                            className={`appearance-none rounded-md py-1.5 px-3 font-medium cursor-pointer border focus:ring-2 focus:ring-offset-1 focus:outline-none transition-colors ${
                                comp.apply_level === 'PER_ITEM' 
                                    ? 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            }`}
                            value={comp.apply_level}
                            onChange={(e) => onUpdateComponent(comp.id, null, 'apply_level', e.target.value)}
                        >
                            <option value="PER_ITEM">Per Item</option>
                            <option value="PER_ORDER">Per Order</option>
                        </select>
                    </div>
                  </div>
                </div>

                <button 
                    onClick={() => onDeleteComponent(rateCard.id, comp.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Delete Component"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Dynamic Editor Area */}
              <div className="pl-0 sm:pl-12">
                {comp.type === 'FIXED' && <FixedEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'RANGE_WEIGHT' && <WeightRangeEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'TIER_VOLUME' && <VolumeTierEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'FORMULA' && <FormulaEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'AMAZON_FBA' && <AmazonTierEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'SHIPPING_ZONE' && <ShippingZoneEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}

                {/* Add Rule Button (for list-based types) */}
                {comp.type !== 'FIXED' && comp.type !== 'FORMULA' && (
                    <div className="mt-2 flex gap-2">
                        <button 
                            onClick={() => onAddRule(comp.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                        >
                            <Plus size={14}/> Add Rule Row
                        </button>
                        {comp.rules.length > 0 && (
                             <button 
                                onClick={() => onDeleteRule(comp.id, comp.rules.length - 1)}
                                className="text-xs font-semibold text-red-400 hover:text-red-600 flex items-center gap-1 py-1 px-2 rounded hover:bg-red-50 transition-colors"
                            >
                                <X size={14}/> Remove Last Row
                            </button>
                        )}
                    </div>
                )}
              </div>
            </div>
          ))}

          <button 
            onClick={() => onAddComponent(rateCard.id)}
            className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group"
          >
            <div className="p-1 rounded-full bg-slate-100 group-hover:bg-blue-200 transition-colors">
                 <Plus size={20} className="text-slate-500 group-hover:text-blue-700"/>
            </div>
            Add New Component
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;