import { useMemo, useState, useEffect } from 'react'
import type { FC } from 'react'
import { IoLocationOutline, IoListOutline, IoMapOutline } from 'react-icons/io5'
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet'
import type { StatisticsData } from '../types/dataTypes'
import classnames from 'classnames'
import { loadProvinceBoundary } from '../utils/boundaryLoader'

interface VisitedProvincesMapProps {
  quarterlyStatistics: StatisticsData[]
  filteredData: StatisticsData[]
  className?: string
}

// Province/State information for display
const PROVINCE_INFO: Record<string, { name: string; country: string; emoji: string }> = {
  // Netherlands provinces
  'NL-DR': { name: 'Drenthe', country: 'Netherlands', emoji: '🏞️' },
  'NL-FL': { name: 'Flevoland', country: 'Netherlands', emoji: '🌊' },
  'NL-FR': { name: 'Friesland', country: 'Netherlands', emoji: '🐄' },
  'NL-GE': { name: 'Gelderland', country: 'Netherlands', emoji: '🏰' },
  'NL-GR': { name: 'Groningen', country: 'Netherlands', emoji: '⛽' },
  'NL-LI': { name: 'Limburg', country: 'Netherlands', emoji: '⛰️' },
  'NL-NB': { name: 'North Brabant', country: 'Netherlands', emoji: '🏭' },
  'NL-NH': { name: 'North Holland', country: 'Netherlands', emoji: '🌷' },
  'NL-OV': { name: 'Overijssel', country: 'Netherlands', emoji: '🚲' },
  'NL-UT': { name: 'Utrecht', country: 'Netherlands', emoji: '🏛️' },
  'NL-ZE': { name: 'Zeeland', country: 'Netherlands', emoji: '🌊' },
  'NL-ZH': { name: 'South Holland', country: 'Netherlands', emoji: '🏙️' },
  
  // Belgium regions
  'BE-VAN': { name: 'Antwerp', country: 'Belgium', emoji: '💎' },
  'BE-VWV': { name: 'West Flanders', country: 'Belgium', emoji: '🍺' },
  'BE-VOV': { name: 'East Flanders', country: 'Belgium', emoji: '🏭' },
  'BE-VBR': { name: 'Flemish Brabant', country: 'Belgium', emoji: '🏰' },
  'BE-VLI': { name: 'Limburg', country: 'Belgium', emoji: '⛰️' },
  'BE-WBR': { name: 'Walloon Brabant', country: 'Belgium', emoji: '🏞️' },
  'BE-WHT': { name: 'Hainaut', country: 'Belgium', emoji: '🏭' },
  'BE-WLG': { name: 'Liège', country: 'Belgium', emoji: '🏭' },
  'BE-WLX': { name: 'Luxembourg', country: 'Belgium', emoji: '🌲' },
  'BE-WNA': { name: 'Namur', country: 'Belgium', emoji: '🏰' },
  'BE-BRU': { name: 'Brussels', country: 'Belgium', emoji: '🏛️' },
  
  // German states (common ones)
  'DE-NW': { name: 'North Rhine-Westphalia', country: 'Germany', emoji: '🏭' },
  'DE-BY': { name: 'Bavaria', country: 'Germany', emoji: '🍺' },
  'DE-BW': { name: 'Baden-Württemberg', country: 'Germany', emoji: '🏔️' },
  'DE-NI': { name: 'Lower Saxony', country: 'Germany', emoji: '🚜' },
  'DE-HE': { name: 'Hesse', country: 'Germany', emoji: '🏦' },
  'DE-SN': { name: 'Saxony', country: 'Germany', emoji: '🏛️' },
  'DE-RP': { name: 'Rhineland-Palatinate', country: 'Germany', emoji: '🍷' },
  'DE-TH': { name: 'Thuringia', country: 'Germany', emoji: '🌲' },
  'DE-SH': { name: 'Schleswig-Holstein', country: 'Germany', emoji: '⛵' },
  'DE-ST': { name: 'Saxony-Anhalt', country: 'Germany', emoji: '🏰' },
  'DE-BB': { name: 'Brandenburg', country: 'Germany', emoji: '🌾' },
  'DE-MV': { name: 'Mecklenburg-Vorpommern', country: 'Germany', emoji: '🏖️' },
  'DE-SL': { name: 'Saarland', country: 'Germany', emoji: '⚙️' },
  'DE-BE': { name: 'Berlin', country: 'Germany', emoji: '🏛️' },
  'DE-HB': { name: 'Bremen', country: 'Germany', emoji: '🚢' },
  'DE-HH': { name: 'Hamburg', country: 'Germany', emoji: '⚓' }
}

// Note: Boundary loading is now handled by the boundaryLoader utility

const VisitedProvincesMap: FC<VisitedProvincesMapProps> = ({ 
  quarterlyStatistics, 
  filteredData, 
  className 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [boundaries, setBoundaries] = useState<Map<string, GeoJSON.Feature>>(new Map())
  const [loadingBoundaries, setLoadingBoundaries] = useState<Set<string>>(new Set())

  // Get all provinces from filtered data
  const visitedProvinces = useMemo(() => {
    return Array.from(new Set(filteredData.flatMap(q => q.provinces_visited)))
  }, [filteredData])

  // Get all provinces from all data for comparison
  const allProvinces = useMemo(() => {
    return Array.from(new Set(quarterlyStatistics.flatMap(q => q.provinces_visited)))
  }, [quarterlyStatistics])

  // Get all provinces that appear in any data, grouped by country and sorted with visited first
  const relevantProvincesByCountry = useMemo(() => {
    const provincesByCountry: Record<string, string[]> = {}
    
    Array.from(new Set([...allProvinces, ...Object.keys(PROVINCE_INFO)]))
      .filter(code => PROVINCE_INFO[code])
      .forEach(code => {
        const country = PROVINCE_INFO[code].country
        if (!provincesByCountry[country]) {
          provincesByCountry[country] = []
        }
        provincesByCountry[country].push(code)
      })
    
    // Sort provinces within each country: visited first, then alphabetically
    Object.keys(provincesByCountry).forEach(country => {
      provincesByCountry[country].sort((a, b) => {
        const aVisited = visitedProvinces.includes(a)
        const bVisited = visitedProvinces.includes(b)
        
        if (aVisited && !bVisited) return -1
        if (!aVisited && bVisited) return 1
        
        return PROVINCE_INFO[a].name.localeCompare(PROVINCE_INFO[b].name)
      })
    })
    
    return provincesByCountry
  }, [allProvinces, visitedProvinces])

  // Get all provinces for map view
  const allRelevantProvinces = useMemo(() => {
    const provinces = Array.from(new Set([...allProvinces, ...Object.keys(PROVINCE_INFO)]))
      .filter(code => PROVINCE_INFO[code])
    
    // Sort: visited first, then others, alphabetically within each group
    return provinces.sort((a, b) => {
      const aVisited = visitedProvinces.includes(a)
      const bVisited = visitedProvinces.includes(b)
      
      if (aVisited && !bVisited) return -1
      if (!aVisited && bVisited) return 1
      
      return PROVINCE_INFO[a].name.localeCompare(PROVINCE_INFO[b].name)
    })
  }, [allProvinces, visitedProvinces])

  // Load boundaries for provinces that appear in the data
  useEffect(() => {
    const loadBoundaries = async () => {
      const provincesToLoad = allRelevantProvinces.filter(
        code => !boundaries.has(code) && !loadingBoundaries.has(code)
      )

      if (provincesToLoad.length === 0) return

      // Mark provinces as loading
      setLoadingBoundaries(prev => {
        const newSet = new Set(prev)
        provincesToLoad.forEach(code => newSet.add(code))
        return newSet
      })

      // Load boundaries in parallel (no rate limiting needed for local data)
      const loadPromises = provincesToLoad.map(async (provinceCode) => {
        
        try {
          const boundary = await loadProvinceBoundary(provinceCode)
          return { provinceCode, boundary }
        } catch (error) {
          console.warn(`Failed to load boundary for ${provinceCode}:`, error)
          return { provinceCode, boundary: null }
        }
      })

      const results = await Promise.all(loadPromises)

      // Update boundaries state
      setBoundaries(prev => {
        const newBoundaries = new Map(prev)
        results.forEach(({ provinceCode, boundary }) => {
          if (boundary) {
            newBoundaries.set(provinceCode, boundary)
          }
        })
        return newBoundaries
      })

      // Remove from loading set
      setLoadingBoundaries(prev => {
        const newSet = new Set(prev)
        provincesToLoad.forEach(code => newSet.delete(code))
        return newSet
      })
    }

    if (viewMode === 'map') {
      loadBoundaries()
    }
  }, [allRelevantProvinces, viewMode, boundaries, loadingBoundaries])

  const getProvinceStatus = (provinceCode: string) => {
    const isVisited = visitedProvinces.includes(provinceCode)
    const existsInData = allProvinces.includes(provinceCode)
    
    if (isVisited) {
      return { 
        status: 'visited', 
        color: 'bg-blue-500', 
        textColor: 'text-blue-700', 
        label: 'Visited in period',
        fillColor: '#3b82f6',
        fillOpacity: 0.6,
        strokeColor: '#2563eb',
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

  const visitedInPeriod = visitedProvinces.length
  const visitedOther = allProvinces.filter(p => !visitedProvinces.includes(p)).length
  const totalRelevant = allRelevantProvinces.length
  const loadingCount = loadingBoundaries.size

  return (
    <div className={classnames('bg-white rounded-xl shadow-sm border border-gray-100 overflow-auto', className)}>
      {/* Header with toggle */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IoLocationOutline className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Provinces Visited</h3>
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
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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

          {/* Provinces by Country */}
          <div className="space-y-6">
            {Object.entries(relevantProvincesByCountry).map(([country, provinces]) => {
              const countryVisited = provinces.filter(p => visitedProvinces.includes(p)).length
              const countryTotal = provinces.length
              
              return (
                <div key={country} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{country}</h4>
                      <span className="text-sm text-gray-600">
                        {countryVisited} of {countryTotal} visited
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {provinces.map(provinceCode => {
                        const provinceInfo = PROVINCE_INFO[provinceCode]
                        const status = getProvinceStatus(provinceCode)
                        
                        return (
                          <div
                            key={provinceCode}
                            className={classnames(
                              'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                              'hover:shadow-md',
                              status.status === 'visited' ? 'border-blue-300 bg-blue-50' :
                              status.status === 'other' ? 'border-gray-300 bg-gray-50' :
                              'border-gray-200 bg-gray-50'
                            )}
                            title={status.label}
                          >
                            <div className="text-lg flex-shrink-0">{provinceInfo.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className={classnames('font-medium text-sm', status.textColor)}>
                                {provinceInfo.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {provinceCode}
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
            center={[52, 5]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render province boundaries */}
            {allRelevantProvinces.map(provinceCode => {
              const provinceInfo = PROVINCE_INFO[provinceCode]
              const status = getProvinceStatus(provinceCode)
              const boundary = boundaries.get(provinceCode)
              
              if (!boundary) return null

              return (
                <GeoJSON
                  key={provinceCode}
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
                        <span className="text-lg">{provinceInfo.emoji}</span>
                        <div>
                          <div className="font-semibold">{provinceInfo.name}</div>
                          <div className="text-sm text-gray-600">{provinceInfo.country}</div>
                        </div>
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

export default VisitedProvincesMap 