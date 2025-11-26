import React from 'react';
import { Component } from '../types';

interface EditorProps {
  component: Component;
  onUpdate: (field: string, value: any, ruleIndex?: number) => void;
}

export const FixedEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="flex items-center gap-3 mt-2">
    <span className="text-sm font-medium text-slate-600">Fixed Price ($):</span>
    <input 
      type="number" 
      step="0.01"
      className="border border-slate-300 rounded-md px-3 py-1.5 w-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
      value={component.price || 0}
      onChange={(e) => onUpdate('price', parseFloat(e.target.value))}
    />
  </div>
);

export const WeightRangeEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-700 font-semibold">
        <tr>
          <th className="p-2 border-r border-slate-200 text-left">Min (lb)</th>
          <th className="p-2 border-r border-slate-200 text-left">Max (lb)</th>
          <th className="p-2 text-left">Price ($)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {component.rules.map((rule, idx) => (
          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.min}</td>
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.max}</td>
            <td className="p-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={rule.price}
                onChange={(e) => onUpdate('price', e.target.value, idx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const VolumeTierEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-700 font-semibold">
        <tr>
          <th className="p-2 border-r border-slate-200 text-left">Box Type</th>
          <th className="p-2 border-r border-slate-200 text-left">Max Vol (in³)</th>
          <th className="p-2 text-left">Price ($)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {component.rules.map((rule, idx) => (
          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
            <td className="p-2 border-r border-slate-200 font-medium text-slate-700">{rule.name}</td>
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.max_volume}</td>
            <td className="p-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={rule.price}
                onChange={(e) => onUpdate('price', e.target.value, idx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FormulaEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border border-slate-200">
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Base Price (1st Item)</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input 
          type="number" 
          step="0.01"
          className="w-full pl-6 pr-3 py-1.5 border border-slate-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          value={component.base_price || 0} 
          onChange={(e) => onUpdate('base_price', parseFloat(e.target.value))}
        />
      </div>
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Incremental Price</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input 
          type="number" 
          step="0.01"
          className="w-full pl-6 pr-3 py-1.5 border border-slate-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          value={component.incremental_price || 0} 
          onChange={(e) => onUpdate('incremental_price', parseFloat(e.target.value))}
        />
      </div>
    </div>
  </div>
);

export const AmazonTierEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-700 font-semibold">
        <tr>
          <th className="p-2 border-r border-slate-200 text-left">Amazon Size Tier</th>
          <th className="p-2 border-r border-slate-200 text-left">Max Wt (lb)</th>
          <th className="p-2 text-left">Price ($)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {component.rules.map((rule, idx) => (
          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
            <td className="p-2 border-r border-slate-200 font-medium text-slate-700 text-xs">{rule.tier_name}</td>
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.max}</td>
            <td className="p-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={rule.price}
                onChange={(e) => onUpdate('price', e.target.value, idx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ShippingZoneEditor: React.FC<EditorProps> = ({ component, onUpdate }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-700 font-semibold">
        <tr>
          <th className="p-2 border-r border-slate-200 text-left">Zone</th>
          <th className="p-2 border-r border-slate-200 text-left">Min (lb)</th>
          <th className="p-2 border-r border-slate-200 text-left">Max (lb)</th>
          <th className="p-2 text-left">Price ($)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {component.rules.map((rule, idx) => (
          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
            <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-800 bg-slate-50">{rule.zone}</td>
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.min}</td>
            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">{rule.max}</td>
            <td className="p-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={rule.price}
                onChange={(e) => onUpdate('price', e.target.value, idx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="p-2 bg-slate-50 text-xs text-slate-500 italic">
        * Shipping rates are typically imported. This is a simplified editor for demo purposes.
    </div>
  </div>
);