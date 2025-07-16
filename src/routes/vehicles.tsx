import { createFileRoute } from '@tanstack/react-router'
import type { FC } from 'react'
import { useState } from 'react'
import { IoCarSportOutline, IoSearchOutline, IoInformationCircleOutline } from 'react-icons/io5'
import { FaSpinner } from 'react-icons/fa'
import { useData } from '../hooks/useData'
import { useRDWVehicleData } from '../hooks/useRDWData'
import { RDWVehicleDetails } from '../components/RDWVehicleDetails'
import type { Vehicle } from '../types'

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
}

const VehicleCard: FC<VehicleCardProps> = ({ vehicle, index }) => {
  const [showRDWData, setShowRDWData] = useState(false);
  const rdwQuery = useRDWVehicleData(showRDWData ? vehicle.licensePlate : undefined);

  const handleToggleRDWData = () => {
    setShowRDWData(!showRDWData);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IoCarSportOutline className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : `Vehicle ${index + 1}`}
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {vehicle.type || 'Unknown Type'}
            </span>
          </div>
          {vehicle.licensePlate && (
            <button
              onClick={handleToggleRDWData}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              disabled={rdwQuery.isLoading}
            >
              {rdwQuery.isLoading ? (
                <FaSpinner className="h-3 w-3 animate-spin" />
              ) : (
                <IoSearchOutline className="h-3 w-3" />
              )}
              {showRDWData ? 'Hide RDW Data' : 'Load RDW Data'}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Flitsmeister Vehicle Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">License Plate</label>
            <p className="text-lg font-semibold text-gray-900">{vehicle.licensePlate || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Country</label>
            <p className="text-lg font-semibold text-gray-900">{vehicle.licensePlateCountry || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mileage</label>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.mileageInKilometer ? `${vehicle.mileageInKilometer.toFixed(1)} km` : 'Not provided'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mileage Rate</label>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.mileageReimbursementRate ? `€${vehicle.mileageReimbursementRate}/km` : 'Not provided'}
            </p>
          </div>
          {vehicle.hasTrailer !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Has Trailer</label>
              <p className="text-lg font-semibold text-gray-900">{vehicle.hasTrailer ? 'Yes' : 'No'}</p>
            </div>
          )}
          {vehicle.trailerWeight !== undefined && vehicle.trailerWeight > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Trailer Weight</label>
              <p className="text-lg font-semibold text-gray-900">{vehicle.trailerWeight} kg</p>
            </div>
          )}
        </div>

        {/* RDW Data Section */}
        {showRDWData && (
          <div className="border-t border-gray-200 pt-6">
            {rdwQuery.isLoading && (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="h-6 w-6 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Loading RDW data...</span>
              </div>
            )}

            {rdwQuery.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <IoInformationCircleOutline className="h-5 w-5 text-red-600" />
                  <h3 className="text-red-800 font-semibold">Error Loading RDW Data</h3>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  {rdwQuery.error instanceof Error ? rdwQuery.error.message : 'Failed to load vehicle data from RDW'}
                </p>
              </div>
            )}

            {rdwQuery.data && rdwQuery.data.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <IoInformationCircleOutline className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-yellow-800 font-semibold">No RDW Data Found</h3>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  No vehicle information found in the RDW database for license plate: {vehicle.licensePlate}
                </p>
              </div>
            )}

            {rdwQuery.data && rdwQuery.data.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RDW Vehicle Information</h3>
                <RDWVehicleDetails vehicleData={rdwQuery.data[0]} kenteken={vehicle.licensePlate!} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VehiclesComponent: FC = () => {
  const { data } = useData()

  if (!data || !data.vehicles || data.vehicles.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles</h1>
          <p className="text-gray-600">
            View your vehicle information from your Flitsmeister data export.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <IoCarSportOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Data Available</h3>
          <p className="text-gray-600">Vehicle information will appear here when available in your data export.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles</h1>
        <p className="text-gray-600">
          Your registered vehicles from Flitsmeister. Click "Load RDW Data" to see detailed vehicle information from the Dutch RDW database.
        </p>
      </div>

      <div className="grid gap-6">
        {data.vehicles.map((vehicle: Vehicle, index: number) => (
          <VehicleCard key={index} vehicle={vehicle} index={index} />
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/vehicles')({
  component: VehiclesComponent,
})
