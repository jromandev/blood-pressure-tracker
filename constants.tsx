
import { BPCategory } from './types';

export const getBPCategory = (systolic: number, diastolic: number): BPCategory => {
  // Hypertensive Crisis: Higher than 180 AND/OR Higher than 120
  if (systolic > 180 || diastolic > 120) return BPCategory.CRISIS;
  
  // Hypertension Stage 2: 140 or higher OR 90 or higher
  if (systolic >= 140 || diastolic >= 90) return BPCategory.STAGE2;
  
  // Hypertension Stage 1: 130-139 OR 80-89
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return BPCategory.STAGE1;
  }
  
  // Elevated: 120-129 AND Less than 80
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return BPCategory.ELEVATED;
  
  // Normal: Less than 120 AND Less than 80
  return BPCategory.NORMAL;
};

export const getCategoryColor = (category: BPCategory): string => {
  switch (category) {
    case BPCategory.NORMAL: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case BPCategory.ELEVATED: return 'text-amber-600 bg-amber-50 border-amber-200';
    case BPCategory.STAGE1: return 'text-orange-600 bg-orange-50 border-orange-200';
    case BPCategory.STAGE2: return 'text-red-600 bg-red-50 border-red-200';
    case BPCategory.CRISIS: return 'text-purple-700 bg-purple-50 border-purple-300';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusDotColor = (category: BPCategory): string => {
  switch (category) {
    case BPCategory.NORMAL: return 'bg-emerald-500';
    case BPCategory.ELEVATED: return 'bg-amber-500';
    case BPCategory.STAGE1: return 'bg-orange-500';
    case BPCategory.STAGE2: return 'bg-red-500';
    case BPCategory.CRISIS: return 'bg-purple-600 animate-pulse';
    default: return 'bg-gray-400';
  }
};
