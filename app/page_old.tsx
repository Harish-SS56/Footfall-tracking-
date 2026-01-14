'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Clock, Download, RefreshCw, Activity, BarChart3, Store, Timer, Smartphone, TrendingDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts'
import { format, subDays, startOfDay, endOfDay, parseISO, isToday, isYesterday } from 'date-fns'

interface DashboardStats {
  todayEntries: number
  todayExits: number
  currentInside: number
  totalLifetime: number
  peakHour: number
  peakHourCount: number
  yesterdayEntries?: number
  yesterdayExits?: number
  avgDwellTime?: number
  conversionRate?: number
}

interface HourlyData {
  hour: string
  entries: number
  exits: number
  net: number
}

interface DailyData {
  date: string
  entries: number
  exits: number
  total: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedDate])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, hourlyRes, weeklyRes] = await Promise.all([
        fetch('/api/stats'),
        fetch(`/api/hourly?date=${selectedDate}`),
        fetch('/api/weekly')
      ])

      const statsData = await statsRes.json()
      const hourlyData = await hourlyRes.json()
      const weeklyData = await weeklyRes.json()

      setStats(statsData)
      setHourlyData(hourlyData)
      setDailyData(weeklyData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gold-500 text-xl">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Sri Shabari Jewellery
          </h1>
          <div className="flex items-center gap-2 text-gold-500">
            <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
        <p className="text-gray-400 text-lg">Footfall Analytics Dashboard</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Entries"
          value={stats?.todayEntries || 0}
          icon={<ArrowUpRight className="text-green-500" />}
          trend="+12%"
          color="green"
        />
        <StatCard
          title="Today's Exits"
          value={stats?.todayExits || 0}
          icon={<ArrowDownRight className="text-blue-500" />}
          trend="+8%"
          color="blue"
        />
        <StatCard
          title="Currently Inside"
          value={stats?.currentInside || 0}
          icon={<Users className="text-purple-500" />}
          trend="Real-time"
          color="purple"
        />
        <StatCard
          title="Lifetime Total"
          value={stats?.totalLifetime || 0}
          icon={<TrendingUp className="text-gold-500" />}
          trend="All time"
          color="gold"
        />
      </div>

      {/* Date Selector */}
      <div className="mb-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gold-500/20">
        <div className="flex items-center gap-4">
          <Calendar className="text-gold-500" />
          <label className="text-gray-300">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none"
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly Breakdown */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gold-500/20">
          <h2 className="text-2xl font-bold mb-4 text-gold-400">Hourly Breakdown</h2>
          <p className="text-gray-400 mb-4">Peak Hour: {stats?.peakHour}:00 ({stats?.peakHourCount} visitors)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #D97706', borderRadius: '8px' }}
                labelStyle={{ color: '#F59E0B' }}
              />
              <Legend />
              <Bar dataKey="entries" fill="#10B981" name="Entries" />
              <Bar dataKey="exits" fill="#3B82F6" name="Exits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gold-500/20">
          <h2 className="text-2xl font-bold mb-4 text-gold-400">7-Day Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #D97706', borderRadius: '8px' }}
                labelStyle={{ color: '#F59E0B' }}
              />
              <Legend />
              <Line type="monotone" dataKey="entries" stroke="#10B981" strokeWidth={3} name="Entries" />
              <Line type="monotone" dataKey="exits" stroke="#3B82F6" strokeWidth={3} name="Exits" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Entry vs Exit Comparison */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gold-500/20">
        <h2 className="text-2xl font-bold mb-4 text-gold-400">Entry vs Exit Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-500 mb-2">{stats?.todayEntries || 0}</div>
            <div className="text-gray-400">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-500 mb-2">{stats?.todayExits || 0}</div>
            <div className="text-gray-400">Total Exits</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-500 mb-2">{stats?.currentInside || 0}</div>
            <div className="text-gray-400">Inside Now</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2026 Sri Shabari Jewellery - Real-time Footfall Tracking System</p>
        <p className="mt-1">Last updated: {format(new Date(), 'PPpp')}</p>
      </footer>
    </div>
  )
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    gold: 'from-gold-500/20 to-gold-600/20 border-gold-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg rounded-xl p-6 border`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-sm text-gray-400">{trend}</div>
    </div>
  )
}
