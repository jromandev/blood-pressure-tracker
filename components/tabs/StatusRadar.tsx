import React from 'react';
import { useBPContext } from '../../context/BPContext';
import { getBPCategory } from '../../constants';
import CategoryChart from '../CategoryChart';

const StatusRadar: React.FC = () => {
  const { logs } = useBPContext();
  const latestLog = logs[0] || null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Radar</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Where you stand today</p>
      </div>
      
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <CategoryChart latestLog={latestLog} />
        
        {latestLog && (
          <div className="mt-8 p-6 bg-slate-50 rounded-4xl flex items-center justify-between border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Zone</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">{getBPCategory(latestLog.systolic, latestLog.diastolic)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reading</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">{latestLog.systolic}/{latestLog.diastolic}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusRadar;
