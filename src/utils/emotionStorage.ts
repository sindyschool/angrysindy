import { EmotionRecord, EmotionAnalytics, DailyEmotionStats } from '../types/emotion';

const STORAGE_KEY = 'emotion_records';

export const saveEmotionRecord = (record: Omit<EmotionRecord, 'id'>) => {
  const records = getEmotionRecords();
  const newRecord: EmotionRecord = {
    ...record,
    id: Date.now().toString(),
  };
  
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
};

export const getEmotionRecords = (): EmotionRecord[] => {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
};

export const getEmotionAnalytics = (days: number = 30): EmotionAnalytics => {
  const records = getEmotionRecords();
  const now = Date.now();
  const filteredRecords = records.filter(
    (record) => now - record.timestamp < days * 24 * 60 * 60 * 1000
  );

  // 일별 통계 계산
  const dailyStats: { [key: string]: DailyEmotionStats } = {};
  const daysArray = Array.from({ length: days }, (_, i) => {
    const date = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    dailyStats[date] = {
      date,
      count: 0,
      averageAngerLevel: 0,
      resolutionRate: 0,
      averageDuration: 0,
    };
    return date;
  });

  // 시간대별 카운트
  const hourCounts: { [key: number]: number } = {};

  // 레코드 처리
  filteredRecords.forEach((record) => {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    const hour = new Date(record.timestamp).getHours();
    
    // 시간대별 카운트 업데이트
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    // 일별 통계 업데이트
    if (dailyStats[date]) {
      const stats = dailyStats[date];
      stats.count++;
      stats.averageAngerLevel = (stats.averageAngerLevel * (stats.count - 1) + record.angerLevel) / stats.count;
      stats.resolutionRate = (stats.resolutionRate * (stats.count - 1) + (record.resolved ? 1 : 0)) / stats.count;
      stats.averageDuration = (stats.averageDuration * (stats.count - 1) + record.duration) / stats.count;
    }
  });

  // 피크 시간 계산
  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // 전체 통계 계산
  const totalCount = filteredRecords.length;
  const averageAngerLevel = totalCount
    ? filteredRecords.reduce((sum, record) => sum + record.angerLevel, 0) / totalCount
    : 0;
  const overallResolutionRate = totalCount
    ? filteredRecords.filter((record) => record.resolved).length / totalCount
    : 0;
  const averageDuration = totalCount
    ? filteredRecords.reduce((sum, record) => sum + record.duration, 0) / totalCount
    : 0;

  return {
    totalCount,
    averageAngerLevel,
    overallResolutionRate,
    averageDuration,
    peakHours,
    dailyStats: daysArray.map((date) => dailyStats[date]),
  };
}; 