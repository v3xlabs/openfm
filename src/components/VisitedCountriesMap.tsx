import { useMemo, useState, useEffect } from 'react'
import type { FC } from 'react'
import { IoLocationOutline, IoListOutline, IoMapOutline } from 'react-icons/io5'
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet'
import type { StatisticsData } from '../types/dataTypes'
import classnames from 'classnames'
import { loadCountryBoundary } from '../utils/boundaryLoader'

interface VisitedCountriesMapProps {
  quarterlyStatistics: StatisticsData[]
  filteredData: StatisticsData[]
  className?: string
}

// Country information for display
const COUNTRY_INFO: Record<string, { name: string; flag: string }> = {
  'NL': { name: 'Netherlands', flag: '🇳🇱' },
  'BE': { name: 'Belgium', flag: '🇧🇪' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'AT': { name: 'Austria', flag: '🇦🇹' },
  'CH': { name: 'Switzerland', flag: '🇨🇭' },
  'LU': { name: 'Luxembourg', flag: '🇱🇺' },
  'DK': { name: 'Denmark', flag: '🇩🇰' },
  'SE': { name: 'Sweden', flag: '🇸🇪' },
  'NO': { name: 'Norway', flag: '🇳🇴' },
  'FI': { name: 'Finland', flag: '🇫🇮' },
  'PL': { name: 'Poland', flag: '🇵🇱' },
  'CZ': { name: 'Czech Republic', flag: '🇨🇿' },
  'SK': { name: 'Slovakia', flag: '🇸🇰' },
  'HU': { name: 'Hungary', flag: '🇭🇺' },
  'SI': { name: 'Slovenia', flag: '🇸🇮' },
  'HR': { name: 'Croatia', flag: '🇭🇷' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'PT': { name: 'Portugal', flag: '🇵🇹' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'IE': { name: 'Ireland', flag: '🇮🇪' },
}

// Note: Boundary loading is now handled by the boundaryLoader utility

const VisitedCountriesMap: FC<VisitedCountriesMapProps> = ({ 
  quarterlyStatistics, 
  filteredData, 
  className 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [boundaries, setBoundaries] = useState<Map<string, GeoJSON.Feature>>(new Map())
  const [loadingBoundaries, setLoadingBoundaries] = useState<Set<string>>(new Set())

  // Get all countries from filtered data
  const visitedCountries = useMemo(() => {
    return Array.from(new Set(filteredData.flatMap(q => q.countries_visited)))
  }, [filteredData])

  // Get all countries from all data for comparison
  const allCountries = useMemo(() => {
    return Array.from(new Set(quarterlyStatistics.flatMap(q => q.countries_visited)))
  }, [quarterlyStatistics])

  // Get all countries that appear in any data, sorted with visited first
  const relevantCountries = useMemo(() => {
    const countries = Array.from(new Set([...allCountries, ...Object.keys(COUNTRY_INFO)]))
      .filter(code => COUNTRY_INFO[code])
    
    // Sort: visited first, then others, alphabetically within each group
    return countries.sort((a, b) => {
      const aVisited = visitedCountries.includes(a)
      const bVisited = visitedCountries.includes(b)
      
      if (aVisited && !bVisited) return -1
      if (!aVisited && bVisited) return 1
      
      return COUNTRY_INFO[a].name.localeCompare(COUNTRY_INFO[b].name)
    })
  }, [allCountries, visitedCountries])

  // Load boundaries for countries that appear in the data
  useEffect(() => {
    const loadBoundaries = async () => {
      const countriesToLoad = relevantCountries.filter(
        code => !boundaries.has(code) && !loadingBoundaries.has(code)
      )

      if (countriesToLoad.length === 0) return

      // Mark countries as loading
      setLoadingBoundaries(prev => {
        const newSet = new Set(prev)
        countriesToLoad.forEach(code => newSet.add(code))
        return newSet
      })

      // Load boundaries in parallel (no rate limiting needed for local data)
      const loadPromises = countriesToLoad.map(async (countryCode) => {
        try {
          const boundary = await loadCountryBoundary(countryCode)
          return { countryCode, boundary }
        } catch (error) {
          console.warn(`Failed to load boundary for ${countryCode}:`, error)
          return { countryCode, boundary: null }
        }
      })

      const results = await Promise.all(loadPromises)

      // Update boundaries state
      setBoundaries(prev => {
        const newBoundaries = new Map(prev)
        results.forEach(({ countryCode, boundary }) => {
          if (boundary) {
            newBoundaries.set(countryCode, boundary)
          }
        })
        return newBoundaries
      })

      // Remove from loading set
      setLoadingBoundaries(prev => {
        const newSet = new Set(prev)
        countriesToLoad.forEach(code => newSet.delete(code))
        return newSet
      })
    }

    if (viewMode === 'map') {
      loadBoundaries()
    }
  }, [relevantCountries, viewMode, boundaries, loadingBoundaries])

  const getCountryStatus = (countryCode: string) => {
    const isVisited = visitedCountries.includes(countryCode)
    const existsInData = allCountries.includes(countryCode)
    
    if (isVisited) {
      return { 
        status: 'visited', 
        color: 'bg-green-500', 
        textColor: 'text-green-700', 
        label: 'Visited in period',
        fillColor: '#10b981',
        fillOpacity: 0.6,
        strokeColor: '#059669',
        strokeWeight: 2
      }
    } else if (existsInData) {
      return { 
        status: 'other', 
        color: 'bg-gray-400', 
        textColor: 'text-gray-700', 
        label: 'Visited in other periods',
        fillColor: '#9ca3af',
        fillOpacity: 0.4,
        strokeColor: '#6b7280',
        strokeWeight: 1
      }
    } else {
      return { 
        status: 'none', 
        color: 'bg-gray-200', 
        textColor: 'text-gray-500', 
        label: 'Not visited',
        fillColor: '#e5e7eb',
        fillOpacity: 0.2,
        strokeColor: '#d1d5db',
        strokeWeight: 1
      }
    }
  }

  const visitedInPeriod = visitedCountries.length
  const visitedOther = allCountries.filter(c => !visitedCountries.includes(c)).length
  const totalRelevant = relevantCountries.length
  const loadingCount = loadingBoundaries.size

  return (
    <div className={classnames('bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto', className)}>
      {/* Header with toggle */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IoLocationOutline className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Countries Visited</h3>
            <p className="text-sm text-gray-600">
              {visitedInPeriod} visited in period • {visitedOther} in other periods • {totalRelevant} total
              {loadingCount > 0 && (
                <span className="text-blue-600 ml-2">• Loading {loadingCount} maps...</span>
              )}
            </p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={classnames(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
            title="List view"
          >
            <IoListOutline className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={classnames(
              'p-2 rounded-md transition-colors',
              viewMode === 'map' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
            title="Map view"
          >
            <IoMapOutline className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="p-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">Visited in period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-700">Visited in other periods</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <span className="text-gray-700">Not visited</span>
            </div>
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {relevantCountries.map(countryCode => {
              const countryInfo = COUNTRY_INFO[countryCode]
              const status = getCountryStatus(countryCode)
              
              return (
                <div
                  key={countryCode}
                  className={classnames(
                    'flex flex-col items-center p-3 rounded-lg border transition-all duration-200',
                    'hover:shadow-md hover:scale-105',
                    status.status === 'visited' ? 'border-green-300 bg-green-50' :
                    status.status === 'other' ? 'border-gray-300 bg-gray-50' :
                    'border-gray-200 bg-gray-50'
                  )}
                  title={status.label}
                >
                  <div className="text-2xl mb-2">{countryInfo.flag}</div>
                  <div className="text-center">
                    <div className={classnames('text-xs font-medium', status.textColor)}>
                      {countryInfo.name}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="h-96">
          <MapContainer
            center={[54, 10]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render country boundaries */}
            {relevantCountries.map(countryCode => {
              const countryInfo = COUNTRY_INFO[countryCode]
              const status = getCountryStatus(countryCode)
              const boundary = boundaries.get(countryCode)
              
              if (!boundary) return null

              return (
                <GeoJSON
                  key={countryCode}
                  data={boundary}
                  style={{
                    fillColor: status.fillColor,
                    fillOpacity: status.fillOpacity,
                    color: status.strokeColor,
                    weight: status.strokeWeight,
                    opacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-32">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{countryInfo.flag}</span>
                        <span className="font-semibold">{countryInfo.name}</span>
                      </div>
                      <div className={classnames('text-sm', status.textColor)}>
                        {status.label}
                      </div>
                    </div>
                  </Popup>
                </GeoJSON>
              )
            })}
          </MapContainer>
        </div>
      )}
    </div>
  )
}

export default VisitedCountriesMap 