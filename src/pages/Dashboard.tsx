import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EmotionAnalytics } from '../types/emotion';
import { getEmotionAnalytics } from '../utils/emotionStorage';

const COLORS = ['#ef4444', '#f97316', '#84cc16', '#06b6d4'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<EmotionAnalytics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days'>('30days');

  useEffect(() => {
    // 실제 데이터 불러오기
    const data = getEmotionAnalytics(selectedTimeframe === '7days' ? 7 : 30);
    setAnalytics(data);
  }, [selectedTimeframe]);

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500" />
      </div>
    );
  }

  const filteredStats = analytics.dailyStats.slice(
    selectedTimeframe === '7days' ? -7 : -30
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">Emotion Dashboard</h1>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedTimeframe === '7days'
                  ? 'bg-red-500 text-white'
                  : 'text-red-500 border border-red-500'
              }`}
              onClick={() => setSelectedTimeframe('7days')}
            >
              7 Days
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedTimeframe === '30days'
                  ? 'bg-red-500 text-white'
                  : 'text-red-500 border border-red-500'
              }`}
              onClick={() => setSelectedTimeframe('30days')}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 mb-2">Total Sessions</h3>
            <p className="text-4xl font-light">{analytics.totalCount}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 mb-2">Average Anger Level</h3>
            <p className="text-4xl font-light text-red-500">{analytics.averageAngerLevel}%</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 mb-2">Resolution Rate</h3>
            <p className="text-4xl font-light text-green-500">
              {(analytics.overallResolutionRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 mb-2">Avg. Duration</h3>
            <p className="text-4xl font-light">{Math.floor(analytics.averageDuration / 60)}m</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Activity */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-light mb-6">Daily Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anger Level Distribution */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-light mb-6">Anger Level Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High', value: 30 },
                      { name: 'Medium', value: 45 },
                      { name: 'Low', value: 25 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-light mb-6">Peak Hours</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.peakHours.map((hour) => ({
                    hour: `${hour}:00`,
                    count: Math.floor(Math.random() * 10),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar dataKey="count" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolution Rate Trend */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-light mb-6">Resolution Rate Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                    formatter={(value: number) => [value, '분노 지수']}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolutionRate"
                    stroke="#84CC16"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 