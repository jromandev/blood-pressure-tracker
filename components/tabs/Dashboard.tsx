import React, { useState, useMemo } from 'react';
import { useBPContext } from '../../context/BPContext';
import { getBPCategory, getCategoryColor } from '../../constants';
import BPChart from '../BPChart';
import ReadingDetailModal from '../ReadingDetailModal';
import { useToast } from '../Toast';
import { BPLog } from '../../types';

interface GroupedLogs {
  [date: string]: BPLog[];
}

const Dashboard: React.FC = () => {
  const { logs, deleteLog } = useBPContext();
  const [selectedReading, setSelectedReading] = useState<BPLog | null>(null);
  const { showToast } = useToast();

  // Filter logs to last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7DaysLogs = logs.filter(log => new Date(log.timestamp) >= sevenDaysAgo);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const grouped: GroupedLogs = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  }, [logs]);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleDelete = (id: string) => {
    deleteLog(id);
    showToast('Reading deleted successfully', 'success');
  };

  const getAverage = (readings: BPLog[]) => {
    const avgSys = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
    const avgDia = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
    const avgPulse = Math.round(readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length);
    return { avgSys, avgDia, avgPulse };
  };

  const isToday = (dateString: string) => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return dateString === today;
  };

  const isYesterday = (dateString: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return dateString === yesterdayStr;
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
        <div className="space-y-4">
          {logs.length > 0 ? sortedDates.map((date) => {
            const dayReadings = groupedLogs[date];
            const { avgSys, avgDia, avgPulse } = getAverage(dayReadings);
            const avgCategory = getBPCategory(avgSys, avgDia);
            
            return (
              <div 
                key={date} 
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Date Header */}
                <div className="bg-linear-to-r from-slate-50 to-slate-100/50 px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">
                          {isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : date}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {dayReadings.length} reading{dayReadings.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl ${getCategoryColor(avgCategory)} shadow-sm`}>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-700">
                          {avgSys}<span className="text-[10px] opacity-60">/{avgDia}</span>
                        </p>
                        <p className="text-[9px] font-bold opacity-70">avg</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Readings List */}
                <div className="divide-y divide-slate-100">
                  {dayReadings.map((log, index) => {
                    const category = getBPCategory(log.systolic, log.diastolic);
                    return (
                      <div 
                        key={log.id}
                        onClick={() => setSelectedReading(log)}
                        className="px-5 py-4 flex items-center justify-between group hover:bg-indigo-50/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${getCategoryColor(category)} shadow-sm group-hover:scale-105 transition-transform`}>
                              <span className="text-xl font-black">{log.systolic}</span>
                              <div className="w-6 h-px bg-black/10 my-0.5"></div>
                              <span className="text-sm font-black opacity-60">{log.diastolic}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-wide">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-black text-slate-700">{log.pulse}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">bpm</span>
                                </div>
                              </div>
                              <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${getCategoryColor(category).split(' ')[0]}`}>
                                {category}
                              </p>
                              {log.note && (
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                                  <span className="font-bold">Note:</span> {log.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }) : (
            <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold text-sm">Your heartbeat history is empty</p>
              <p className="text-slate-400 text-xs mt-1">Tap the + button above to add your first reading</p>
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
