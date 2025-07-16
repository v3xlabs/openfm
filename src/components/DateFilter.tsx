import { useMemo } from 'react'
import type { FC } from 'react'
import { IoCalendarOutline, IoChevronDownOutline } from 'react-icons/io5'
import type { StatisticsData } from '../types/dataTypes'
import classnames from 'classnames'

interface DateFilterProps {
  quarterlyStatistics: StatisticsData[]
  selectedFilter: DateFilterType
  onFilterChange: (filter: DateFilterType) => void
  className?: string
}

export interface DateFilterType {
  type: 'all' | 'year' | 'quarter' | 'custom'
  value?: string
  label: string
}

const DateFilter: FC<DateFilterProps> = ({ 
  quarterlyStatistics, 
  selectedFilter, 
  onFilterChange, 
  className 
}) => {
  // Generate available filter options based on data
  const filterOptions = useMemo(() => {
    const options: DateFilterType[] = [
      { type: 'all', label: 'All Time' }
    ]

    // Extract years and quarters from data
    const years = new Set<string>()
    const quarters = new Set<string>()
    
    quarterlyStatistics.forEach(stat => {
      quarters.add(stat.quarter)
      const year = stat.quarter.split('-')[0]
      years.add(year)
    })

    // Add year options
    Array.from(years).sort((a, b) => b.localeCompare(a)).forEach(year => {
      options.push({
        type: 'year',
        value: year,
        label: `Year ${year}`
      })
    })

    // Add quarter options
    Array.from(quarters).sort((a, b) => b.localeCompare(a)).forEach(quarter => {
      const [year, q] = quarter.split('-')
      const quarterName = `Q${q} ${year}`
      options.push({
        type: 'quarter',
        value: quarter,
        label: quarterName
      })
    })

    return options
  }, [quarterlyStatistics])

  // Quick filter buttons for common selections
  const quickFilters = useMemo(() => {
    const currentYear = new Date().getFullYear().toString()
    const lastYear = (new Date().getFullYear() - 1).toString()
    
    const available = filterOptions.map(f => f.value || 'all')
    
    return [
      { type: 'all' as const, label: 'All' },
      ...(available.includes(currentYear) ? [{ type: 'year' as const, value: currentYear, label: currentYear }] : []),
      ...(available.includes(lastYear) ? [{ type: 'year' as const, value: lastYear, label: lastYear }] : [])
    ]
  }, [filterOptions])

  const handleQuickFilter = (filter: { type: 'all' | 'year', value?: string, label: string }) => {
    const fullFilter: DateFilterType = {
      type: filter.type,
      value: filter.value,
      label: filter.type === 'all' ? 'All Time' : `Year ${filter.value}`
    }
    onFilterChange(fullFilter)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        {/* Filter Label */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <IoCalendarOutline className="h-4 w-4" />
          Time Period:
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          {quickFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => handleQuickFilter(filter)}
              className={classnames(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                selectedFilter.type === filter.type && selectedFilter.value === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Dropdown for all options */}
        <div className="relative">
          <select
            value={JSON.stringify(selectedFilter)}
            onChange={(e) => onFilterChange(JSON.parse(e.target.value))}
            className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.map((option, index) => (
              <option key={index} value={JSON.stringify(option)}>
                {option.label}
              </option>
            ))}
          </select>
          <IoChevronDownOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Selected Filter Display */}
        <div className="text-sm text-gray-600">
          Showing: <span className="font-medium text-gray-900">{selectedFilter.label}</span>
        </div>
      </div>

      {/* Data Range Info */}
      {quarterlyStatistics.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Available data: {quarterlyStatistics[quarterlyStatistics.length - 1]?.quarter} to {quarterlyStatistics[0]?.quarter}
          {' '}({quarterlyStatistics.length} quarters)
        </div>
      )}
    </div>
  )
}

export default DateFilter 