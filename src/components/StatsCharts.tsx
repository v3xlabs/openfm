import type { FC } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts'
import type { StatisticsData } from '../types/dataTypes'
import type { Trip } from '../types'
import classnames from 'classnames'
import { IoSpeedometerOutline, IoTimeOutline, IoPhonePortraitOutline, IoNavigateOutline, IoInformationCircleOutline, IoCalendarOutline } from 'react-icons/io5'

interface StatsChartsProps {
  quarterlyStatistics: StatisticsData[]
  trips?: Trip[]
  className?: string
}

const StatsCharts: FC<StatsChartsProps> = ({ quarterlyStatistics, trips, className }) => {
  // Process data for charts
  const chartData = quarterlyStatistics.map(quarter => {
    const avgSpeed = quarter.sec_driven > 0 ? Math.round((quarter.km_driven / (quarter.sec_driven / 3600))) : 0
    const drivingHours = Math.round(quarter.sec_driven / 3600 * 10) / 10  // Round to 1 decimal
    const appHours = Math.round(quarter.session_sec / 3600 * 10) / 10  // Round to 1 decimal
    
    return {
      quarter: quarter.quarter,
      topSpeed: quarter.top_speed,
      avgSpeed,
      distanceKm: quarter.km_driven,
      drivingHours,
      appHours,
      sessionsStarted: quarter.sessions_started,
      // Calculate driving frequency as sessions per week (approximate)
      drivingFrequency: Math.round((quarter.sessions_started / 13) * 10) / 10, // ~13 weeks per quarter
    }
  })

  // Process trip data for detailed charts
  const processTripsData = () => {
    if (!trips || trips.length === 0) return { dailyData: [], weeklyData: [], monthlyData: [] }

    // Group trips by date periods
    const dailyTotals = new Map<string, number>()
    const weeklyTotals = new Map<string, number>()
    const monthlyTotals = new Map<string, number>()

    trips.forEach(trip => {
      if (!trip.distanceKm || !trip.startTime) return

      const date = new Date(trip.startTime)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Get week start (Monday)
      const weekStart = new Date(date)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) // adjust for Sunday
      weekStart.setDate(diff)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      // Get month key
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // Add distance to totals
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + trip.distanceKm)
      weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) || 0) + trip.distanceKm)
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + trip.distanceKm)
    })

    // Convert to chart data and sort by date
    const dailyData = Array.from(dailyTotals.entries())
      .map(([date, distance]) => ({ date, distance: Math.round(distance * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const weeklyData = Array.from(weeklyTotals.entries())
      .map(([date, distance]) => ({ 
        date, 
        distance: Math.round(distance * 10) / 10,
        weekOf: `Week of ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthlyData = Array.from(monthlyTotals.entries())
      .map(([date, distance]) => ({ 
        date, 
        distance: Math.round(distance * 10) / 10,
        monthName: new Date(date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { dailyData, weeklyData, monthlyData }
  }

  const { dailyData, weeklyData, monthlyData } = processTripsData()
  const hasTripsData = trips && trips.length > 0

  const ProPlusNote: FC = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <IoInformationCircleOutline className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Flitsmeister Pro Plus Required</p>
          <p>
            Trip information and detailed driving statistics are only available with Flitsmeister Pro Plus subscription. 
            Some users may see limited data if they don't have this subscription level.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className={classnames('space-y-8', className)}>
      {/* Only show Pro Plus note if no trips data */}
      {!hasTripsData && <ProPlusNote />}
      
      {/* Detailed Distance Charts - Only when trip data is available */}
      {hasTripsData && (
        <>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Trip Analysis</h3>
            <p className="text-gray-600">Daily, weekly, and monthly distance breakdowns from your trip data</p>
          </div>
          
          {/* Daily Distance */}
          {dailyData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IoCalendarOutline className="h-5 w-5 text-teal-600" />
                Daily Distance ({dailyData.length} days)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} km`, 'Distance']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="distance" 
                    stroke="#0d9488" 
                    fill="#0d9488"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly Distance */}
          {weeklyData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IoCalendarOutline className="h-5 w-5 text-indigo-600" />
                Weekly Distance ({weeklyData.length} weeks)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekOf" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} km`, 'Weekly Distance']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar 
                    dataKey="distance" 
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Distance */}
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IoCalendarOutline className="h-5 w-5 text-purple-600" />
                Monthly Distance ({monthlyData.length} months)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="monthName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} km`, 'Monthly Distance']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar 
                    dataKey="distance" 
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
      
      {/* Top Speed Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoSpeedometerOutline className="h-6 w-6 text-orange-600" />
          Top Speed by Quarter
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [`${value} km/h`, 'Top Speed']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="topSpeed" 
              stroke="#ea580c" 
              strokeWidth={3}
              dot={{ fill: '#ea580c', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Average Speed Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoSpeedometerOutline className="h-6 w-6 text-blue-600" />
          Average Speed by Quarter
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [`${value} km/h`, 'Average Speed']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="avgSpeed" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distance Driven by Quarter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoNavigateOutline className="h-6 w-6 text-green-600" />
          Distance Driven by Quarter
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [`${value} km`, 'Distance Driven']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar 
              dataKey="distanceKm" 
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Driving Frequency */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoTimeOutline className="h-6 w-6 text-purple-600" />
          Driving Frequency by Quarter
        </h3>
        <div className="mb-4 text-sm text-gray-600">
          Shows average driving sessions per week in each quarter
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Sessions per week', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [`${value} sessions/week`, 'Driving Frequency']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="drivingFrequency" 
              stroke="#7c3aed" 
              strokeWidth={3}
              dot={{ fill: '#7c3aed', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* App Opening Frequency */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoPhonePortraitOutline className="h-6 w-6 text-indigo-600" />
          App Usage by Quarter
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value} hours`, 
                name === 'drivingHours' ? 'Driving Time' : 'App Time'
              ]}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Bar 
              dataKey="drivingHours" 
              name="Driving Time"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="appHours" 
              name="App Time"
              fill="#6366f1"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Combined Speed Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoSpeedometerOutline className="h-6 w-6 text-gray-600" />
          Speed Comparison by Quarter
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quarter" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value} km/h`, 
                name === 'topSpeed' ? 'Top Speed' : 'Average Speed'
              ]}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="topSpeed" 
              name="Top Speed"
              stroke="#ea580c" 
              strokeWidth={3}
              dot={{ fill: '#ea580c', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgSpeed" 
              name="Average Speed"
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StatsCharts 