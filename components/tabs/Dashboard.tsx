import React from 'react';
import { useBPContext } from '../../context/BPContext';
import { getBPCategory, getCategoryColor } from '../../constants';
import BPChart from '../BPChart';
import { useToast } from '../Toast';

const Dashboard: React.FC = () => {
  const { logs, deleteLog } = useBPContext();
  const { showToast } = useToast();

  const handleDelete = (id: string, timestamp: string) => {
    const date = new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    deleteLog(id);
    showToast(`Reading from ${date} deleted`, 'success');
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Health Trends</h2>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" aria-label="Systolic indicator"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500" aria-label="Diastolic indicator"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <BPChart logs={logs} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent History</h2>
        <div className="space-y-3">
          {logs.length > 0 ? logs.map((log) => {
            const category = getBPCategory(log.systolic, log.diastolic);
            return (
              <div key={log.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-slate-300 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${getCategoryColor(category)} shadow-sm`}>
                    <span className="text-lg font-black">{log.systolic}</span>
                    <span className="text-[10px] font-bold opacity-60 mt-[-4px]">{log.diastolic}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      <span className="text-slate-400 ml-2 font-bold text-[10px] uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${getCategoryColor(category).split(' ')[0]}`}>{category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(log.id, log.timestamp)} 
                  className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                  aria-label={`Delete reading from ${new Date(log.timestamp).toLocaleDateString()}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          }) : (
            <div className="py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">Your heartbeat history is empty</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
