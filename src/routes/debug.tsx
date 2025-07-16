import { createFileRoute } from '@tanstack/react-router'
import type { FC } from 'react'
import { IoCodeOutline, IoDocumentTextOutline, IoEyeOutline } from 'react-icons/io5'
import { useData } from '../hooks/useData'

const DebugComponent: FC = () => {
  const { data } = useData()

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <IoCodeOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your data to see the debug information.</p>
        </div>
      </div>
    )
  }

  const renderJsonData = (title: string, data: unknown, icon: React.ComponentType<{ className: string }>) => {
    const IconComponent = icon
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">
              {data ? `(${Array.isArray(data) ? data.length : Object.keys(data).length} items)` : '(No data)'}
            </span>
          </div>
        </div>
        <div className="p-6">
          {data ? (
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 italic">No data available</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Information</h1>
        <p className="text-gray-600">
          Raw data from your Flitsmeister export files for debugging purposes.
        </p>
      </div>

      <div className="grid gap-6">
        {/* File Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoDocumentTextOutline className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Import Information</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">File Name</label>
                <p className="text-lg font-semibold text-gray-900">{data.fileName || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Import Date</label>
                <p className="text-lg font-semibold text-gray-900">
                  {data.importDate ? new Date(data.importDate).toLocaleString() : 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data Keys</label>
                <p className="text-lg font-semibold text-gray-900">{Object.keys(data).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Data */}
        {renderJsonData('User Data (user.csv)', data.userData, IoEyeOutline)}

        {/* Vehicles Data */}
        {renderJsonData('Vehicles Data (vehicles.json)', data.vehicles, IoEyeOutline)}

        {/* Payments Data */}
        {renderJsonData('Payments Data (payments.json)', data.payments, IoEyeOutline)}

        {/* Products Data */}
        {renderJsonData('Products Data (products.json)', data.products, IoEyeOutline)}

        {/* Statistics Data */}
        {renderJsonData('Statistics Data (statistics.json)', data.quarterlyStatistics, IoEyeOutline)}

        {/* Trips Data (first 3 trips only for brevity) */}
        {renderJsonData(
          'Trips Data (trips.json - first 3 items)', 
          data.trips ? data.trips.slice(0, 3) : null, 
          IoEyeOutline
        )}

        {/* Marketing Data */}
        {renderJsonData('Marketing Data (marketing.json)', (data as unknown as Record<string, unknown>).marketing, IoEyeOutline)}

        {/* Reports Data */}
        {renderJsonData('Reports Data (reports.json)', (data as unknown as Record<string, unknown>).reports, IoEyeOutline)}

        {/* Raw Data Structure */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <IoCodeOutline className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Complete Data Structure</h3>
            </div>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify(data, (_, value) => {
                // Truncate large arrays for readability
                if (Array.isArray(value) && value.length > 3) {
                  return `[${value.length} items] ${JSON.stringify(value.slice(0, 2))}...`
                }
                return value
              }, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/debug')({
  component: DebugComponent,
}) 