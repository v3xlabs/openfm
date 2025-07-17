import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { FC } from 'react'
import { 
  IoStatsChartOutline,
  IoTimeOutline,
  IoSpeedometerOutline,
  IoWarningOutline,
  IoPhonePortraitOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoFlashOutline,
  IoNavigateOutline,
  IoShieldCheckmarkOutline,
  IoFlagOutline
} from 'react-icons/io5'
import { MdDashboard, MdReport, MdEmail } from 'react-icons/md'
import { useData } from '../hooks/useData'
import VisitedCountriesMap from '../components/VisitedCountriesMap'
import VisitedProvincesMap from '../components/VisitedProvincesMap'
import DateFilter from '../components/DateFilter'
import StatsCharts from '../components/StatsCharts'
import type { DateFilterType } from '../components/DateFilter'
import classnames from 'classnames'

const StatsComponent: FC = () => {
  const { data } = useData()
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterType>({
    type: 'all',
    label: 'All Time'
  })

  // Filter statistics based on selected date range
  const filteredStatistics = useMemo(() => {
    if (!data?.quarterlyStatistics) return []
    
    if (dateFilter.type === 'all') {
      return data.quarterlyStatistics
    }
    
    if (dateFilter.type === 'year' && dateFilter.value) {
      return data.quarterlyStatistics.filter(stat => 
        stat.quarter.startsWith(dateFilter.value!)
      )
    }
    
    if (dateFilter.type === 'quarter' && dateFilter.value) {
      return data.quarterlyStatistics.filter(stat => 
        stat.quarter === dateFilter.value
      )
    }
    
    return data.quarterlyStatistics
  }, [data?.quarterlyStatistics, dateFilter])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <IoStatsChartOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data loaded</h3>
          <p className="text-gray-600">Please upload your Flitsmeister data to view statistics.</p>
        </div>
      </div>
    )
  }

  const { quarterlyStatistics, marketingData, reportsData, userData, trips, vehicles } = data

  // Calculate totals across filtered quarters
  const totalStats = filteredStatistics?.reduce((acc, quarter) => ({
    kmDriven: acc.kmDriven + quarter.km_driven,
    secDriven: acc.secDriven + quarter.sec_driven,
    sessionSec: acc.sessionSec + quarter.session_sec,
    sessionsStarted: acc.sessionsStarted + quarter.sessions_started,
    finesAvoided: acc.finesAvoided + quarter.fines_avoided,
    topSpeed: Math.max(acc.topSpeed, quarter.top_speed),
    totalRatings: acc.totalRatings + quarter.total_ratings,
    navigationStarted: acc.navigationStarted + quarter.navigation_started,
    navigationFinished: acc.navigationFinished + quarter.navigation_finished,
    timesInTraffic: acc.timesInTraffic + quarter.times_in_traffic,
    topConsecutiveDays: Math.max(acc.topConsecutiveDays, quarter.top_consecutive_days),
    speedcams: acc.speedcams + (quarter.app_warnings?.speedcams || 0),
    speedtraps: acc.speedtraps + (quarter.app_warnings?.speedtraps || 0),
    incidents: acc.incidents + Object.values(quarter.app_warnings?.incidents || {}).reduce((sum, val) => sum + val, 0),
    hotspots: acc.hotspots + (quarter.app_warnings?.hotspots || 0)
  }), {
    kmDriven: 0,
    secDriven: 0,
    sessionSec: 0,
    sessionsStarted: 0,
    finesAvoided: 0,
    topSpeed: 0,
    totalRatings: 0,
    navigationStarted: 0,
    navigationFinished: 0,
    timesInTraffic: 0,
    topConsecutiveDays: 0,
    speedcams: 0,
    speedtraps: 0,
    incidents: 0,
    hotspots: 0
  }) || {
    kmDriven: 0,
    secDriven: 0,
    sessionSec: 0,
    sessionsStarted: 0,
    finesAvoided: 0,
    topSpeed: 0,
    totalRatings: 0,
    navigationStarted: 0,
    navigationFinished: 0,
    timesInTraffic: 0,
    topConsecutiveDays: 0,
    speedcams: 0,
    speedtraps: 0,
    incidents: 0,
    hotspots: 0
  }

  // Marketing stats
  const sessionStarts = marketingData?.events?.filter(e => e.type === 'session_start').length || 0
  const emailOpens = marketingData?.events?.filter(e => e.type === 'email_open').length || 0
  const humanEmailOpens = marketingData?.events?.filter(e => e.type === 'email_open' && e.human_open).length || 0

  // Report type mapping
  const reportTypeNames: Record<number, string> = {
    1: 'Fixed Speed Camera',
    3: 'Speed Trap',
    4: 'Mobile Speed Camera', 
    5: 'Traffic Light Camera',
    12: 'Unknown/Other'
  }

  const reportsByType = reportsData?.reduce((acc, report) => {
    const typeName = reportTypeNames[report.type] || `Type ${report.type}`
    acc[typeName] = (acc[typeName] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}



  // Device info
  const deviceInfo = marketingData?.attributes

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Flitsmeister Statistics</h1>
        <p className="text-gray-600">Comprehensive overview of your driving data and app usage</p>
      </div>

      {/* Date Filter */}
      {quarterlyStatistics && quarterlyStatistics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <DateFilter
            quarterlyStatistics={quarterlyStatistics}
            selectedFilter={dateFilter}
            onFilterChange={setDateFilter}
          />
        </div>
      )}

      {/* Charts Section */}
      {filteredStatistics && filteredStatistics.length > 0 && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance & Usage Trends</h2>
            <p className="text-gray-600">Visual analysis of your driving patterns and app usage over time</p>
          </div>
          <StatsCharts quarterlyStatistics={filteredStatistics} trips={trips} />
        </div>
      )}

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<IoSpeedometerOutline className="h-8 w-8" />}
          title="Total Distance"
          value={`${totalStats.kmDriven.toLocaleString()} km`}
          subtitle={`${Math.round(totalStats.kmDriven * 0.621371)} miles`}
          color="blue"
        />
        <StatCard
          icon={<IoTimeOutline className="h-8 w-8" />}
          title="Driving Time"
          value={`${Math.round(totalStats.secDriven / 3600)} hours`}
          subtitle={`${Math.round(totalStats.secDriven / 60)} minutes total`}
          color="green"
        />
        <StatCard
          icon={<IoFlashOutline className="h-8 w-8" />}
          title="Top Speed"
          value={`${totalStats.topSpeed} km/h`}
          subtitle={`${Math.round(totalStats.topSpeed * 0.621371)} mph`}
          color="orange"
        />
        <StatCard
          icon={<IoShieldCheckmarkOutline className="h-8 w-8" />}
          title="Fines Avoided"
          value={totalStats.finesAvoided.toString()}
          subtitle="Potential violations prevented"
          color="green"
        />
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MdDashboard className="h-6 w-6 text-blue-600" />
          App Usage Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IoNavigateOutline className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalStats.sessionsStarted}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IoTimeOutline className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(totalStats.sessionSec / 3600)}</div>
            <div className="text-sm text-gray-600">App Hours</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IoNavigateOutline className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalStats.navigationStarted}</div>
            <div className="text-sm text-gray-600">Navigation Started</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IoFlagOutline className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalStats.navigationFinished}</div>
            <div className="text-sm text-gray-600">Navigation Finished</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IoTrophyOutline className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalStats.topConsecutiveDays}</div>
            <div className="text-sm text-gray-600">Max Consecutive Days</div>
          </div>
        </div>
      </div>

      {/* Safety & Warnings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoWarningOutline className="h-6 w-6 text-orange-600" />
          Safety & Warnings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{totalStats.speedcams}</div>
            <div className="text-sm text-orange-700">Speed Camera Warnings</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-900">{totalStats.speedtraps}</div>
            <div className="text-sm text-red-700">Speed Trap Warnings</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-900">{totalStats.incidents}</div>
            <div className="text-sm text-yellow-700">Incident Reports</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">{totalStats.hotspots}</div>
            <div className="text-sm text-purple-700">Traffic Hotspots</div>
          </div>
        </div>
      </div>

      {/* Interactive Maps Section */}
      {quarterlyStatistics && quarterlyStatistics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VisitedCountriesMap
            quarterlyStatistics={quarterlyStatistics}
            filteredData={filteredStatistics}
            className="h-96"
          />
          <VisitedProvincesMap
            quarterlyStatistics={quarterlyStatistics}
            filteredData={filteredStatistics}
            className="h-96"
          />
        </div>
      )}

      {/* Device & Marketing Info */}
      {deviceInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <IoPhonePortraitOutline className="h-6 w-6 text-gray-600" />
            Device Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Device</div>
              <div className="font-medium">{deviceInfo.model}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Platform</div>
              <div className="font-medium">{deviceInfo.platform} {deviceInfo.os_version}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">App Version</div>
              <div className="font-medium">{deviceInfo.app_version}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Location</div>
              <div className="font-medium">{deviceInfo.city}, {deviceInfo.country}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Language</div>
              <div className="font-medium">{deviceInfo.device_language}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Timezone</div>
              <div className="font-medium">{deviceInfo.timezone}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Install Date</div>
              <div className="font-medium">{new Date(deviceInfo.mobile_install_date).toLocaleDateString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Carrier</div>
              <div className="font-medium">{deviceInfo.carrier}</div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Activity */}
      {marketingData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdEmail className="h-6 w-6 text-blue-600" />
            Marketing Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{sessionStarts}</div>
              <div className="text-sm text-blue-700">App Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{emailOpens}</div>
              <div className="text-sm text-green-700">Email Opens (Total)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{humanEmailOpens}</div>
              <div className="text-sm text-purple-700">Human Email Opens</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports by Type */}
      {reportsData && Object.keys(reportsByType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdReport className="h-6 w-6 text-red-600" />
            Your Reports ({reportsData.length} total)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{type}</span>
                <span className="text-xl font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quarterly Breakdown */}
      {quarterlyStatistics && quarterlyStatistics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <IoCalendarOutline className="h-6 w-6 text-purple-600" />
            Quarterly Breakdown
          </h2>
          <div className="space-y-4">
            {quarterlyStatistics.map((quarter, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{quarter.quarter}</h3>
                  {quarter.ambassador && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Ambassador
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Distance</div>
                    <div className="font-semibold">{quarter.km_driven} km</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Top Speed</div>
                    <div className="font-semibold">{quarter.top_speed} km/h</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Sessions</div>
                    <div className="font-semibold">{quarter.sessions_started}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Fines Avoided</div>
                    <div className="font-semibold">{quarter.fines_avoided}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Ratings</div>
                    <div className="font-semibold">{quarter.total_ratings}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Traffic Times</div>
                    <div className="font-semibold">{quarter.times_in_traffic}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data Sections - Adding everything else */}
      {userData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Profile Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(userData).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 border-b">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Data Dump */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Total Trips</div>
            <div className="text-lg font-bold">{trips?.length || 0}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Total Vehicles</div>
            <div className="text-lg font-bold">{vehicles?.length || 0}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Total Ratings Given</div>
            <div className="text-lg font-bold">{totalStats.totalRatings}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Avg Speed</div>
            <div className="text-lg font-bold">
              {totalStats.secDriven > 0 ? Math.round((totalStats.kmDriven / (totalStats.secDriven / 3600))) : 0} km/h
            </div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Navigation Success Rate</div>
            <div className="text-lg font-bold">
              {totalStats.navigationStarted > 0 ? Math.round((totalStats.navigationFinished / totalStats.navigationStarted) * 100) : 0}%
            </div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-gray-600">Total Marketing Events</div>
            <div className="text-lg font-bold">{marketingData?.events?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}

const StatCard: FC<StatCardProps> = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={classnames('w-12 h-12 rounded-lg flex items-center justify-center mb-4', colorClasses[color])}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  )
}

export const Route = createFileRoute('/stats')({
  component: StatsComponent,
}) 