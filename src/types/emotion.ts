export interface EmotionRecord {
  id: string;
  timestamp: number;
  text: string;
  angerLevel: number;
  duration: number; // 작성하는데 걸린 시간 (초)
  resolved: boolean; // true if user clicked "Feel better now"
  length: number; // 텍스트 길이
}

export interface DailyEmotionStats {
  date: string;
  count: number;
  averageAngerLevel: number;
  resolutionRate: number;
  averageDuration: number;
}

export interface EmotionAnalytics {
  totalCount: number;
  averageAngerLevel: number;
  overallResolutionRate: number;
  averageDuration: number;
  peakHours: number[];
  dailyStats: DailyEmotionStats[];
} 