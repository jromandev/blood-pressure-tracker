import React, { useState } from 'react';
import { useBPContext } from '../../context/BPContext';
import { getBPCategory, getCategoryColor } from '../../constants';
import BPChart from '../BPChart';
import ReadingDetailModal from '../ReadingDetailModal';
import { useToast } from '../Toast';
import { BPLog } from '../../types';

const Dashboard: React.FC = () => {
  const { logs, deleteLog } = useBPContext();
  const [selectedReading, setSelectedReading] = useState<BPLog | null>(null);
  const { showToast } = useToast();

  // Filter logs to last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7DaysLogs = logs.filter(log => new Date(log.timestamp) >= sevenDaysAgo);

  const handleDelete = (id: string) => {
    deleteLog(id);
    showToast('Reading deleted successfully', 'success');
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
          <BPChart logs={last7DaysLogs} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent History</h2>
        <div className="space-y-3">
          {logs.length > 0 ? logs.map((log) => {
            const category = getBPCategory(log.systolic, log.diastolic);
            return (
              <div 
                key={log.id} 
                onClick={() => setSelectedReading(log)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${getCategoryColor(category)} shadow-sm`}>
                    <span className="text-lg font-black">{log.systolic}</span>
                    <span className="text-[10px] font-bold opacity-60 -mt-1">{log.diastolic}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      <span className="text-slate-400 ml-2 font-bold text-[10px] uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${getCategoryColor(category).split(' ')[0]}`}>{category}</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            );
          }) : (
            <div className="py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">Your heartbeat history is empty</p>
            </div>
          )}
        </div>
      </section>

      <ReadingDetailModal 
        isOpen={selectedReading !== null}
        onClose={() => setSelectedReading(null)}
        reading={selectedReading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Dashboard;
