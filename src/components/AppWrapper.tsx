import type { FC } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { 
  IoCarSportOutline
} from 'react-icons/io5'
import { useData } from '../hooks/useData'
import FileUpload from './FileUpload'
import type { ExtendedFlitsmeisterData } from '../types/dataTypes'

interface AppWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any
}

const AppWrapper: FC<AppWrapperProps> = ({ router }) => {
  const { data, setData, isLoading, setIsLoading } = useData()

  const handleDataLoaded = (newData: ExtendedFlitsmeisterData) => {
    setData(newData)
    setIsLoading(false)
  }

  // Show upload interface if no data is loaded
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IoCarSportOutline className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Local FM</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  Flitsmeister Data Viewer
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Upload Interface */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-2xl">
                <IoCarSportOutline className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Local Flitsmeister
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Import and visualize your Flitsmeister GDPR data export. 
              View your trips on an interactive map, explore your driving patterns, 
              and analyze your journey history in beautiful detail.
            </p>
          </div>
          
          <FileUpload 
            onDataLoaded={handleDataLoaded} 
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }

  // Show main app with router when data is loaded
  return <RouterProvider router={router} />
}

export default AppWrapper 