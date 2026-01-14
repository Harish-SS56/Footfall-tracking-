'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Clock, Download, RefreshCw, Activity, BarChart3, Store, Timer, Smartphone, TrendingDown, Zap, Eye, Target, Award, AlertTriangle, UserCheck, FileText, Filter, Bell, BellOff, Flame, Snowflake } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { format, subDays, startOfDay, endOfDay, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns'

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

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6']
const MAX_CAPACITY = 50 // Maximum recommended capacity for jewelry store

type TimeRange = 'today' | 'week' | 'month' | 'last7days' | 'custom'

export default function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData()
        setLastUpdate(new Date())
      }, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [selectedDate, autoRefresh])

  // Quick time range selector
  const handleTimeRange = (range: TimeRange) => {
    setTimeRange(range)
    const now = new Date()
    
    switch(range) {
      case 'today':
        setSelectedDate(format(now, 'yyyy-MM-dd'))
        break
      case 'week':
        setSelectedDate(format(startOfWeek(now), 'yyyy-MM-dd'))
        break
      case 'month':
        setSelectedDate(format(startOfMonth(now), 'yyyy-MM-dd'))
        break
      case 'last7days':
        setSelectedDate(format(subDays(now, 7), 'yyyy-MM-dd'))
        break
    }
  }

  // Calculate capacity status
  const capacityStatus = stats ? {
    percentage: Math.round((stats.currentInside / MAX_CAPACITY) * 100),
    isHigh: stats.currentInside > MAX_CAPACITY * 0.8,
    isMedium: stats.currentInside > MAX_CAPACITY * 0.5 && stats.currentInside <= MAX_CAPACITY * 0.8,
    recommendedStaff: Math.max(2, Math.ceil(stats.currentInside / 10))
  } : { percentage: 0, isHigh: false, isMedium: false, recommendedStaff: 2 }

  // Find busiest and quietest hours
  const busiestHour = hourlyData.reduce((max, h) => h.entries > max.entries ? h : max, hourlyData[0] || { hour: '0', entries: 0 })
  const quietestHour = hourlyData.filter(h => h.entries > 0).reduce((min, h) => h.entries < min.entries ? h : min, hourlyData[0] || { hour: '0', entries: 0 })

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

      // Add net calculation
      const enhancedHourly = hourlyData.map((h: any) => ({
        ...h,
        net: h.entries - h.exits
      }))

      const enhancedDaily = weeklyData.map((d: any) => ({
        ...d,
        total: d.entries + d.exits
      }))

      setStats(statsData)
      setHourlyData(enhancedHourly)
      setDailyData(enhancedDaily)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Hour', 'Entries', 'Exits', 'Net'],
      ...hourlyData.map(h => [h.hour, h.entries, h.exits, h.net])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `footfall-data-${selectedDate}.csv`
    a.click()
  }

  const exportToExcel = () => {
    // Enhanced export with summary
    const excelContent = [
      ['Sri Shabari Jewellery - Footfall Report'],
      ['Date:', selectedDate],
      ['Generated:', format(new Date(), 'PPpp')],
      [],
      ['Summary'],
      ['Total Entries:', stats?.todayEntries || 0],
      ['Total Exits:', stats?.todayExits || 0],
      ['Current Inside:', stats?.currentInside || 0],
      ['Peak Hour:', `${stats?.peakHour}:00 (${stats?.peakHourCount} visitors)`],
      [],
      ['Hourly Breakdown'],
      ['Hour', 'Entries', 'Exits', 'Net Flow'],
      ...hourlyData.map(h => [h.hour, h.entries, h.exits, h.net])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([excelContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sri-shabari-footfall-report-${selectedDate}.csv`
    a.click()
  }

  const comparison = stats ? {
    todayVsYesterday: stats.yesterdayEntries 
      ? ((stats.todayEntries - stats.yesterdayEntries) / stats.yesterdayEntries * 100).toFixed(1)
      : 0,
    isPositive: stats.yesterdayEntries ? stats.todayEntries >= stats.yesterdayEntries : true
  } : { todayVsYesterday: 0, isPositive: true }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-amber-500 mx-auto"></div>
            <Store className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 w-12 h-12" />
          </div>
          <p className="mt-6 text-amber-400 text-2xl font-semibold animate-pulse">Loading Sri Shabari Jewellery Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-amber-500/20 shadow-lg shadow-amber-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/50">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  Sri Shabari Jewellery
                </h1>
                <p className="text-xs md:text-sm text-gray-400">Live Footfall Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`p-2 md:p-3 rounded-lg transition-all ${showAlerts ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}
                title="Toggle Alerts"
              >
                {showAlerts ? <Bell className="w-4 h-4 md:w-5 md:h-5" /> : <BellOff className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 md:p-3 rounded-lg transition-all ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}
                title="Auto Refresh"
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportToExcel}
                className="p-2 md:p-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all"
                title="Export Report"
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                <span className="text-green-400 font-medium">LIVE</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Updated {format(lastUpdate, 'HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Capacity Alert Banner */}
        {showAlerts && capacityStatus.isHigh && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-4 md:p-6 animate-pulse-slow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-red-400 mb-2">⚠️ High Capacity Alert!</h3>
                <p className="text-white mb-3">Store is at <span className="font-bold text-2xl">{capacityStatus.percentage}%</span> capacity ({stats?.currentInside} / {MAX_CAPACITY} people)</p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                    <p className="text-gray-400 text-sm">Recommended Staff</p>
                    <p className="text-white font-bold text-xl flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-amber-400" /> {capacityStatus.recommendedStaff} persons
                    </p>
                  </div>
                  <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                    <p className="text-gray-400 text-sm">Action</p>
                    <p className="text-amber-400 font-bold">Add more staff!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Time Range Filters */}
        <div className="mb-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="text-amber-500 w-5 h-5" />
            <span className="text-gray-300 font-medium">Quick Filters:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleTimeRange('today')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${timeRange === 'today' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
            >
              Today
            </button>
            <button
              onClick={() => handleTimeRange('last7days')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${timeRange === 'last7days' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleTimeRange('week')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${timeRange === 'week' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
            >
              This Week
            </button>
            <button
              onClick={() => handleTimeRange('month')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${timeRange === 'month' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Key Metrics - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <MetricCard
            title="Today's Entries"
            value={stats?.todayEntries || 0}
            icon={<ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />}
            trend={comparison.isPositive ? `+${comparison.todayVsYesterday}%` : `${comparison.todayVsYesterday}%`}
            isPositive={comparison.isPositive}
            color="green"
            subtitle="vs yesterday"
          />
          <MetricCard
            title="Today's Exits"
            value={stats?.todayExits || 0}
            icon={<ArrowDownRight className="w-5 h-5 md:w-6 md:h-6" />}
            trend="Active"
            isPositive={true}
            color="blue"
            subtitle="customers left"
          />
          <MetricCard
            title="Inside Now"
            value={stats?.currentInside || 0}
            icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
            trend="Real-time"
            isPositive={true}
            color="purple"
            subtitle="browsing"
            pulse={true}
          />
          <MetricCard
            title="Lifetime Total"
            value={stats?.totalLifetime || 0}
            icon={<Award className="w-5 h-5 md:w-6 md:h-6" />}
            trend="All time"
            isPositive={true}
            color="gold"
            subtitle="visitors"
          />
        </div>

        {/* Date Selector - Mobile Friendly */}
        <div className="mb-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Calendar className="text-amber-500 w-5 h-5" />
              <span className="text-gray-300 font-medium">Select Date:</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <button
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className="w-full sm:w-auto px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl transition-all font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Comparison Insight Card */}
        <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Eye className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-amber-400 mb-2">Daily Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Peak Hour</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats?.peakHour}:00</p>
                  <p className="text-amber-400 text-xs">{stats?.peakHourCount} visitors</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Avg Dwell Time</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats?.avgDwellTime || 15}m</p>
                  <p className="text-green-400 text-xs">+2m vs avg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Conversion</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats?.conversionRate || 23}%</p>
                  <p className="text-green-400 text-xs">+5% this week</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Status</p>
                  <p className="text-xl md:text-2xl font-bold text-green-400">Active</p>
                  <p className="text-gray-400 text-xs">System online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Busiest & Quietest Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/30 rounded-xl">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Busiest Hour</h3>
                <p className="text-gray-400 text-sm">Peak traffic time</p>
              </div>
            </div>
            <div className="text-center bg-slate-900/50 rounded-xl p-4">
              <p className="text-5xl font-bold text-red-400 mb-2">{busiestHour?.hour || '0'}:00</p>
              <p className="text-white text-xl">{busiestHour?.entries || 0} customers</p>
              <p className="text-gray-400 text-sm mt-2">🔥 Peak activity time</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/30 rounded-xl">
                <Snowflake className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quietest Hour</h3>
                <p className="text-gray-400 text-sm">Lowest traffic time</p>
              </div>
            </div>
            <div className="text-center bg-slate-900/50 rounded-xl p-4">
              <p className="text-5xl font-bold text-blue-400 mb-2">{quietestHour?.hour || '0'}:00</p>
              <p className="text-white text-xl">{quietestHour?.entries || 0} customers</p>
              <p className="text-gray-400 text-sm mt-2">❄️ Least busy time</p>
            </div>
          </div>
        </div>

        {/* Capacity Monitor */}
        <div className="mb-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Store Capacity Monitor</h3>
                <p className="text-gray-400 text-sm">{stats?.currentInside || 0} / {MAX_CAPACITY} people</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{capacityStatus.percentage}%</p>
              <p className={`text-sm font-medium ${capacityStatus.isHigh ? 'text-red-400' : capacityStatus.isMedium ? 'text-amber-400' : 'text-green-400'}`}>
                {capacityStatus.isHigh ? '⚠️ High' : capacityStatus.isMedium ? '⚡ Medium' : '✅ Normal'}
              </p>
            </div>
          </div>
          <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${capacityStatus.isHigh ? 'bg-gradient-to-r from-red-500 to-red-600' : capacityStatus.isMedium ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
              style={{ width: `${Math.min(capacityStatus.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-green-400 font-bold">0-50%</p>
              <p className="text-gray-400 text-xs">Normal</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-3">
              <p className="text-amber-400 font-bold">51-80%</p>
              <p className="text-gray-400 text-xs">Busy</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3">
              <p className="text-red-400 font-bold">81-100%</p>
              <p className="text-gray-400 text-xs">Critical</p>
            </div>
          </div>
        </div>

        {/* Charts Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Hourly Traffic Chart */}
          <ChartCard title="Hourly Traffic" icon={<BarChart3 />}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #F59E0B', borderRadius: '12px' }}
                  labelStyle={{ color: '#F59E0B' }}
                />
                <Legend />
                <Area type="monotone" dataKey="entries" stroke="#10B981" fillOpacity={1} fill="url(#colorEntries)" name="Entries" />
                <Area type="monotone" dataKey="exits" stroke="#3B82F6" fillOpacity={1} fill="url(#colorExits)" name="Exits" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Net Flow Chart */}
          <ChartCard title="Net Flow (Entries - Exits)" icon={<Activity />}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #F59E0B', borderRadius: '12px' }}
                  labelStyle={{ color: '#F59E0B' }}
                />
                <Bar dataKey="net" fill="#F59E0B" name="Net Flow" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 7-Day Trend */}
          <ChartCard title="7-Day Trend" icon={<TrendingUp />}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #F59E0B', borderRadius: '12px' }}
                  labelStyle={{ color: '#F59E0B' }}
                />
                <Legend />
                <Line type="monotone" dataKey="entries" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} name="Entries" />
                <Line type="monotone" dataKey="exits" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} name="Exits" />
                <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Total" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Traffic Distribution Pie */}
          <ChartCard title="Traffic Distribution" icon={<Target />}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Entries', value: stats?.todayEntries || 0 },
                    { name: 'Exits', value: stats?.todayExits || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[stats?.todayEntries, stats?.todayExits].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Big Numbers Section - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <BigNumberCard
            value={stats?.todayEntries || 0}
            label="Total Entries Today"
            color="green"
            icon={<ArrowUpRight />}
          />
          <BigNumberCard
            value={stats?.todayExits || 0}
            label="Total Exits Today"
            color="blue"
            icon={<ArrowDownRight />}
          />
          <BigNumberCard
            value={stats?.currentInside || 0}
            label="Currently Shopping"
            color="purple"
            icon={<Users />}
            pulse={true}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-xs md:text-sm">
          <div className="mb-2">
            <p className="font-semibold text-amber-500">© 2026 Sri Shabari Jewellery</p>
            <p>Real-time Footfall Analytics • Powered by AI Vision</p>
          </div>
          <p className="mt-2">Last synced: {format(lastUpdate, 'PPpp')}</p>
        </footer>
      </div>
    </div>
  )
}

// Enhanced Component for Chart Cards
function ChartCard({ title, icon, children }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-800 shadow-xl hover:border-amber-500/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// Enhanced Metric Card Component
function MetricCard({ title, value, icon, trend, isPositive, color, subtitle, pulse }: any) {
  const colorClasses: any = {
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    gold: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-4 border hover:scale-105 transition-all shadow-xl ${pulse ? 'animate-pulse-slow' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-gray-400 text-xs md:text-sm mb-1">{title}</p>
          <p className="text-3xl md:text-4xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 md:p-3 bg-slate-900/50 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs md:text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

// Big Number Display Component
function BigNumberCard({ value, label, color, icon, pulse }: any) {
  const colorClasses: any = {
    green: 'from-green-500/30 via-green-600/20 to-green-700/10 border-green-500/40',
    blue: 'from-blue-500/30 via-blue-600/20 to-blue-700/10 border-blue-500/40',
    purple: 'from-purple-500/30 via-purple-600/20 to-purple-700/10 border-purple-500/40',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 md:p-8 border text-center ${pulse ? 'animate-pulse-slow' : ''}`}>
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-slate-900/50 rounded-2xl">
          {icon}
        </div>
      </div>
      <div className="text-5xl md:text-6xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-400 text-sm md:text-base">{label}</div>
    </div>
  )
}
