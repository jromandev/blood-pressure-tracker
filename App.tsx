
import React, { useState, useEffect } from 'react';
import { BPLog, InsightData, UserProfile } from './types';
import { getBPCategory, getCategoryColor } from './constants';
import { getHealthInsights } from './services/geminiService';
import BPChart from './components/BPChart';
import CategoryChart from './components/CategoryChart';
import LogModal from './components/LogModal';

const App: React.FC = () => {
  const [logs, setLogs] = useState<BPLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'status' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    age: '30',
    gender: 'Other',
    weight: '70',
    conditions: ''
  });

  // Sort utility for descending order (newest first)
  const sortLogsDescending = (data: BPLog[]) => {
    return [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  useEffect(() => {
    const savedLogs = localStorage.getItem('bp_logs');
    const savedProfile = localStorage.getItem('user_profile');
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setLogs(sortLogsDescending(parsed));
    }
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('bp_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  const handleAddLog = (newLog: Omit<BPLog, 'id'>) => {
    const logWithId: BPLog = { ...newLog, id: crypto.randomUUID() };
    const updatedLogs = sortLogsDescending([...logs, logWithId]);
    setLogs(updatedLogs);
    // Clear insights when new data is added
    setInsights(null);
  };

  const generateInsights = async () => {
    if (logs.length === 0) return;
    setIsAnalysing(true);
    try {
      const result = await getHealthInsights(logs, profile);
      setInsights(result);
    } finally {
      setIsAnalysing(false);
    }
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const latestLog = logs[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* App Header */}
      <header className="bg-white px-6 pt-8 pb-6 sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hearth<span className="text-red-500">Pulse</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{activeTab.replace(/([A-Z])/g, ' $1')}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Health Trends</h2>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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
                      <button onClick={() => deleteLog(log.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
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
        )}

        {/* Tab 2: AI Analysis */}
        {activeTab === 'ai' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Insights</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Powered by Gemini AI</p>
            </div>

            <div className={`bg-gradient-to-br from-indigo-600 to-violet-800 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden`}>
              {isAnalysing ? (
                <div className="space-y-6 animate-pulse py-8 text-center">
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
                  >
                    Generate Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Status / Categories */}
        {activeTab === 'status' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Radar</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Where you stand today</p>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <CategoryChart latestLog={latestLog} />
              
              {latestLog && (
                <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between border border-slate-100">
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
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Profile</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Help AI understand you better</p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Conditions</label>
                <textarea
                  value={profile.conditions}
                  onChange={(e) => setProfile({...profile, conditions: e.target.value})}
                  placeholder="e.g. Diabetes, Type 2"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none focus:ring-4 focus:ring-slate-100 transition-all h-32"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={() => alert("Profile updated!")}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-xs"
                >
                  Update Information
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
            label="Home"
          />
          <TabButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            label="Analysis"
          />
          <TabButton 
            active={activeTab === 'status'} 
            onClick={() => setActiveTab('status')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Radar"
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            label="Profile"
          />
        </div>
      </nav>

      <LogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddLog} 
      />
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
  >
    <div className={`p-2 rounded-2xl ${active ? 'bg-indigo-50' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;
