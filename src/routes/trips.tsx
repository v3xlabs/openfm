import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { FC } from 'react'
import { 
  IoMapOutline
} from 'react-icons/io5'
import TripMap from '../components/TripMap'
import TripList from '../components/TripList'
import type { Trip } from '../types'
import { useData } from '../hooks/useData'

const TripsComponent: FC = () => {
  const { data } = useData()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip)
    console.log('Trip selected:', trip.startTime, trip.endTime);
  }

  if (!data) {
    return <div>Loading...</div> // This should not happen with AppWrapper but just in case
  }

  const trips = data.trips || []

  console.log('Current selectedTrip:', selectedTrip ? `${selectedTrip.startTime} - ${selectedTrip.endTime}` : 'None');

  return (
    <div className="h-[calc(100vh-94px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex h-full">
        {trips.length > 0 ? (
          <>
            {/* Map - Full screen */}
            <div className="flex-1 relative">
              {/* Map Header */}
              <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm border-b border-gray-200 z-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IoMapOutline className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedTrip ? 'Selected Trip' : 'Trip Map'}
                        {selectedTrip && (
                          <span className="ml-3 text-base font-normal text-gray-600">
                            • Viewing single trip
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map Component */}
              <TripMap 
                trips={selectedTrip ? [selectedTrip] : trips}
                selectedTrip={selectedTrip}
                className="h-full"
              />
            </div>

            {/* Sidebar */}
            <div className="w-[32rem] bg-white border-l border-gray-200 flex flex-col">
              <TripList 
                trips={trips}
                selectedTrip={selectedTrip}
                onTripSelect={handleTripSelect}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <IoMapOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600">
                Your data doesn't contain any trip information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/trips')({
  component: TripsComponent,
}) 