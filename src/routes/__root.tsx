import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import type { FC } from 'react'
import {
  IoCloudUploadOutline,
  IoCarSportOutline,
  IoMapOutline,
  IoPersonOutline,
  IoTrashOutline,
  IoBugOutline,
  IoStatsChartOutline,
  IoSettingsOutline
} from 'react-icons/io5'
import { MdDashboard } from 'react-icons/md'
import classnames from 'classnames'
import { useData } from '../hooks/useData'

const navigationItems = [
  {
    to: "/trips",
    icon: IoMapOutline,
    label: "Trips"
  },
  {
    to: "/stats", 
    icon: IoStatsChartOutline,
    label: "Stats"
  },
  {
    to: "/profile",
    icon: IoPersonOutline,
    label: "Profile"
  },
  {
    to: "/vehicles",
    icon: IoCarSportOutline,
    label: "Vehicles"
  },
  {
    to: "/subscriptions",
    icon: IoSettingsOutline,
    label: "Subscriptions"
  },
  {
    to: "/debug",
    icon: IoBugOutline,
    label: "Debug"
  }
]

const RootComponent: FC = () => {
  const { data, setData, setIsLoading } = useData()

  const handleClearData = () => {
    setData(null)
  }

  const handleNewUpload = () => {
    setIsLoading(true)
    setData(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoCarSportOutline className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Local FM</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                Flitsmeister Data Viewer
              </span>
            </div>

            {/* Data Information */}
            {data && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 flex items-center gap-2 justify-end">
                    <MdDashboard className="h-4 w-4" />
                    {data.fileName} • Imported: {new Date(data.importDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleNewUpload}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <IoCloudUploadOutline className="h-4 w-4" />
                    Upload New Data
                  </button>

                  <button
                    onClick={handleClearData}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <IoTrashOutline className="h-4 w-4" />
                    Clear Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="px-6">
            <div className="flex space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={classnames(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                      "hover:text-blue-500 hover:border-blue-300"
                    )}
                    activeProps={{
                      className: "text-blue-600 border-blue-600"
                    }}
                    inactiveProps={{
                      className: "text-gray-600 border-transparent"
                    }}
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Router Devtools */}
      {/* <TanStackRouterDevtools /> */}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
}) 