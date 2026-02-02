
import React, { useState } from 'react';
import { BPProvider, useBPContext } from './context/BPContext';
import { ToastProvider } from './components/Toast';
import { BPLog } from './types';
import Dashboard from './components/tabs/Dashboard';
import AIAnalysis from './components/tabs/AIAnalysis';
import Settings from './components/tabs/Settings';
import LogModal from './components/LogModal';
import { exportLast7DaysReadingsToPDF, exportAHABloodPressureLog } from './services/pdfExportService';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addLog, logs, profile } = useBPContext();

  const handleAddLog = (newLog: Omit<BPLog, 'id'>) => {
    console.log('🟢 handleAddLog called in App.tsx', newLog);
    try {
      addLog(newLog);
      console.log('✅ addLog completed');
      console.log('🔴 Setting isModalOpen to false');
      setIsModalOpen(false);
      console.log('✅ isModalOpen set to false');
    } catch (error) {
      console.error('❌ Error adding log:', error);
    }
  };

  const handleExportPDF = async () => {
    await exportLast7DaysReadingsToPDF(logs);
  };

  const handleExportAHALog = async () => {
    await exportAHABloodPressureLog(logs, profile);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai':
        return <AIAnalysis />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* App Header */}
      <header className="fixed top-0 inset-x-0 bg-white px-6 pt-14 pb-6 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hearth<span className="text-red-500">Pulse</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{activeTab.replace(/([A-Z])/g, ' $1')}</p>
          </div>
          {activeTab === 'dashboard' && (
            <div className="flex gap-3">
              <button 
                onClick={handleExportAHALog}
                className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 active:scale-90 transition-transform"
                aria-label="Export AHA Blood Pressure Log"
                title="Export AHA Log"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button 
                onClick={handleExportPDF}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
                aria-label="Export last 7 days readings to PDF"
                title="Export PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 active:scale-90 transition-transform"
                aria-label="Add new blood pressure reading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 pt-32">
        {renderTab()}
      </main>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-40" role="navigation" aria-label="Main navigation">
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

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-2xl p-2 ${active ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
      aria-label={`Navigate to ${label}`}
      aria-current={active ? 'page' : undefined}
      tabIndex={0}
    >
      <div className={`rounded-2xl ${active ? 'bg-indigo-50' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
};

const App: React.FC = () => {
  return (
    <BPProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BPProvider>
  );
};

export default App;
