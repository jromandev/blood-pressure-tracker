
export enum BPCategory {
  NORMAL = 'Normal',
  ELEVATED = 'Elevated',
  STAGE1 = 'Hypertension Stage 1',
  STAGE2 = 'Hypertension Stage 2',
  CRISIS = 'Hypertensive Crisis'
}

export interface UserProfile {
  age: string;
  gender: string;
  weight: string;
  height: string;
  conditions: string;
  geminiApiKey: string;
}

export interface BPLog {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: string;
  note?: string;
}

export interface InsightData {
  summary: string;
  recommendations: string[];
  trend: 'improving' | 'declining' | 'stable' | 'insufficient';
  generatedAt: string;
}
