import React from 'react';
import { useBPContext } from '../../context/BPContext';

const AIAnalysis: React.FC = () => {
  const { insights, isAnalysing, generateInsights } = useBPContext();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Insights</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Powered by Gemini AI</p>
      </div>

      <div className={`bg-gradient-to-br from-indigo-600 to-violet-800 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden`}>
        {isAnalysing ? (
          <div className="space-y-6 animate-pulse py-8 text-center" role="status" aria-live="polite">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto animate-bounce"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded-full w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/20 rounded-full w-full"></div>
            </div>
            <p className="text-indigo-200 font-black uppercase tracking-widest text-xs">Deep Analysis in progress...</p>
          </div>
        ) : insights ? (
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded-full">Report</span>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${insights.trend === 'improving' ? 'bg-emerald-400 text-emerald-900' : 'bg-amber-400 text-amber-900'}`}>{insights.trend}</span>
            </div>
            <p className="text-lg font-medium leading-relaxed italic">"{insights.summary}"</p>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Action Plan</p>
              <ul className="space-y-3">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <span className="w-6 h-6 bg-emerald-400 text-emerald-900 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">{i+1}</span>
                    <span className="text-sm font-bold">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black">Unlock AI Analysis</p>
              <p className="text-indigo-200 text-sm px-8 font-medium">Gemini will analyze your trends and profile to give you personalized heart health tips.</p>
            </div>
            <button 
              onClick={generateInsights}
              className="bg-white text-indigo-700 font-black px-8 py-4 rounded-full shadow-lg active:scale-95 transition-all uppercase text-xs tracking-widest"
              aria-label="Generate AI health report"
            >
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
