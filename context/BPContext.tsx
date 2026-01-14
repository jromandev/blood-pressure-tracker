import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BPLog, InsightData, UserProfile } from '../types';
import { getHealthInsights } from '../services/geminiService';

interface BPContextType {
  logs: BPLog[];
  profile: UserProfile;
  insights: InsightData | null;
  isAnalysing: boolean;
  addLog: (newLog: Omit<BPLog, 'id'>) => void;
  deleteLog: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  generateInsights: () => Promise<void>;
  clearInsights: () => void;
}

const BPContext = createContext<BPContextType | undefined>(undefined);

export const useBPContext = () => {
  const context = useContext(BPContext);
  if (!context) {
    throw new Error('useBPContext must be used within a BPProvider');
  }
  return context;
};

interface BPProviderProps {
  children: ReactNode;
}

export const BPProvider: React.FC<BPProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<BPLog[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    age: '30',
    gender: 'Other',
    weight: '150',
    height: '5.08',
    conditions: '',
    geminiApiKey: ''
  });

  // Sort utility for descending order (newest first)
  const sortLogsDescending = (data: BPLog[]) => {
    return [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Load from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('bp_logs');
    const savedProfile = localStorage.getItem('user_profile');
    const savedInsights = localStorage.getItem('bp_insights');
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setLogs(sortLogsDescending(parsed));
    }
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedInsights) setInsights(JSON.parse(savedInsights));
  }, []);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem('bp_logs', JSON.stringify(logs));
  }, [logs]);

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  // Save insights to localStorage
  useEffect(() => {
    if (insights) {
      localStorage.setItem('bp_insights', JSON.stringify(insights));
    }
  }, [insights]);

  const addLog = (newLog: Omit<BPLog, 'id'>) => {
    const logWithId: BPLog = { ...newLog, id: crypto.randomUUID() };
    const updatedLogs = sortLogsDescending([...logs, logWithId]);
    setLogs(updatedLogs);
    // Clear insights when new data is added
    setInsights(null);
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
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

  const clearInsights = () => {
    setInsights(null);
    localStorage.removeItem('bp_insights');
  };

  const value: BPContextType = {
    logs,
    profile,
    insights,
    isAnalysing,
    addLog,
    deleteLog,
    updateProfile,
    generateInsights,
    clearInsights
  };

  return <BPContext.Provider value={value}>{children}</BPContext.Provider>;
};
