
export type Role = 'user' | 'model';
export type Language = 'en' | 'ar';

export interface User {
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string;
  video?: string;
  audio?: string;
  timestamp: Date;
  isThinking?: boolean;
  groundingChunks?: any[];
}

export interface ProgressGoal {
  current: number;
  total: number;
  labelEn: string;
  labelAr: string;
}

export interface ReportItem {
  id: string;
  titleEn: string;
  titleAr: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: string;
  summaryEn: string;
  summaryAr: string;
}

export type AppMode = 'login' | 'student' | 'parent';
