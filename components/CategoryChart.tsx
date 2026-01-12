
import React from 'react';
import { BPLog } from '../types';

interface CategoryChartProps {
  latestLog: BPLog | null;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ latestLog }) => {
  // Categories boundaries
  // Normal: <120 AND <80
  // Elevated: 120-129 AND <80
  // Stage 1: 130-139 OR 80-89
  // Stage 2: 140+ OR 90+
  // Crisis: 180+ OR 120+

  const renderCategory = (name: string, color: string, description: string) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <div>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">{name}</p>
        <p className="text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );

  // Simple coordinate mapping for visualization
  // X: Diastolic (40-130), Y: Systolic (70-200)
  const getPosition = (sys: number, dia: number) => {
    const x = Math.min(Math.max((dia - 40) / (130 - 40) * 100, 0), 100);
    const y = Math.min(Math.max((sys - 70) / (200 - 70) * 100, 0), 100);
    return { left: `${x}%`, bottom: `${y}%` };
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-square w-full bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-inner">
        {/* Category Zones - CSS simplified visualization */}
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-1">
          {/* Normal Zone */}
          <div className="absolute bottom-0 left-0 w-[44%] h-[38%] bg-emerald-50 border-r border-t border-emerald-100"></div>
          {/* Elevated Zone */}
          <div className="absolute bottom-[38%] left-0 w-[44%] h-[8%] bg-amber-50 border-r border-t border-amber-100"></div>
          {/* Stage 1 Zone - approximate */}
          <div className="absolute bottom-[46%] left-0 w-[55%] h-[8%] bg-orange-50 border-r border-t border-orange-100"></div>
          <div className="absolute bottom-0 left-[44%] w-[11%] h-[46%] bg-orange-50 border-r border-t border-orange-100"></div>
          {/* Stage 2 & Crisis - rest of area */}
          <div className="absolute top-0 right-0 w-full h-full bg-red-50/30 -z-10"></div>
        </div>

        {/* Axis Labels */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Diastolic (mmHg)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Systolic (mmHg)</div>

        {/* User Marker */}
        {latestLog && (
          <div 
            className="absolute w-6 h-6 -ml-3 -mb-3 bg-indigo-600 rounded-full border-4 border-white shadow-xl transition-all duration-1000 flex items-center justify-center animate-bounce"
            style={getPosition(latestLog.systolic, latestLog.diastolic)}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {renderCategory("Normal", "bg-emerald-500", "< 120 / < 80")}
        {renderCategory("Elevated", "bg-amber-500", "120-129 / < 80")}
        {renderCategory("Stage 1", "bg-orange-500", "130-139 / 80-89")}
        {renderCategory("Stage 2", "bg-red-500", "140+ / 90+")}
        {renderCategory("Crisis", "bg-purple-600", "180+ / 120+")}
      </div>
    </div>
  );
};

export default CategoryChart;
