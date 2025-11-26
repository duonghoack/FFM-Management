import React from 'react';
import { Plus, Trash2, Save, Tags, Scale, Box, Calculator } from 'lucide-react';
import { RateCard, Component } from '../types';
import { CALCULATION_TYPES } from '../constants';
import { FixedEditor, WeightRangeEditor, VolumeTierEditor, FormulaEditor } from './RuleEditors';

interface ConfigViewProps {
  rateCard: RateCard;
  onUpdateComponent: (componentId: string, ruleIndex: number | null, field: string, value: any) => void;
}

const ConfigView: React.FC<ConfigViewProps> = ({ rateCard, onUpdateComponent }) => {
  
  const getIconForType = (type: string) => {
    switch(type) {
        case 'FIXED': return <Tags size={16} />;
        case 'RANGE_WEIGHT': return <Scale size={16} />;
        case 'TIER_VOLUME': return <Box size={16} />;
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
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm border border-blue-100">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        {comp.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs mt-1.5">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 border border-slate-200 font-medium">
                        {getIconForType(comp.type)}
                        {CALCULATION_TYPES[comp.type]?.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md border font-medium ${
                        comp.apply_level === 'PER_ITEM' 
                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {comp.apply_level === 'PER_ITEM' ? 'Per Item' : 'Per Order'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Dynamic Editor Area */}
              <div className="pl-12">
                {comp.type === 'FIXED' && <FixedEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'RANGE_WEIGHT' && <WeightRangeEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'TIER_VOLUME' && <VolumeTierEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
                {comp.type === 'FORMULA' && <FormulaEditor component={comp} onUpdate={handleEditorUpdate(comp.id)} />}
              </div>
            </div>
          ))}

          <button className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group">
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
