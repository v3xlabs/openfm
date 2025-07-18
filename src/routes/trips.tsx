import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { 
  IoMapOutline,
  IoSpeedometerOutline,
  IoSettingsOutline,
  IoLocationOutline,
  IoCarSportOutline,
  IoEyeOutline
} from 'react-icons/io5'
import TripMap from '../components/TripMap'
import TripList from '../components/TripList'
import { SpeedCalibration } from '../components'
import type { Trip } from '../types'
import { useData } from '../hooks/useData'

interface FocusCamera {
  lat: number;
  lng: number;
  type: string;
  name: string;
}

interface FocusTripCamera {
  tripCreated: string;
  lat: number;
  lng: number;
  type: string;
  name: string;
}

interface TripsSearch {
  view?: 'all' | 'trip' | 'camera' | 'trip-camera';
  tripCreated?: string; // Trip created timestamp
  focusCamera?: FocusCamera;
  focusTripCamera?: FocusTripCamera;
}

const TripsComponent: FC = () => {
  const { data } = useData()
  const navigate = useNavigate()
  const { view = 'all', tripCreated, focusCamera, focusTripCamera } = Route.useSearch()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [speedCalibrationFactor, setSpeedCalibrationFactor] = useState(1.0)
  const [showCalibration, setShowCalibration] = useState(false)

  const handleTripSelect = (trip: Trip | null) => {
    if (trip === null) {
      // Deselect trip - go to all trips view and clear all focus
      navigate({
        to: '/trips',
        search: {
          view: 'all'
        }
      })
    } else {
      // Select trip - clear any camera focus and go to trip view
      navigate({
        to: '/trips',
        search: {
          view: 'trip',
          tripCreated: trip.created || trip.startTime
        }
      })
    }
    setSelectedTrip(trip)
    console.log('Trip selected:', trip ? `${trip.startTime} - ${trip.endTime}` : 'None');
  }

  const handleCalibrationFactorChange = (factor: number) => {
    setSpeedCalibrationFactor(factor);
  };

  // Handle URL-based trip selection
  useEffect(() => {
    if (!data?.trips) return;

    if (view === 'trip' && tripCreated) {
      // Find trip by created timestamp
      const trip = data.trips.find(t => t.created === tripCreated);
      if (trip) {
        setSelectedTrip(trip);
      }
    } else if (view === 'trip-camera' && focusTripCamera) {
      // Select specific trip for trip-camera view
      const trip = data.trips.find(t => t.created === focusTripCamera.tripCreated);
      if (trip) {
        setSelectedTrip(trip);
      }
    } else {
      // Clear selection for all trips or camera views
      setSelectedTrip(null);
    }
  }, [view, tripCreated, focusTripCamera, data]);

  if (!data) {
    return <div>Loading...</div> // This should not happen with AppWrapper but just in case
  }

  const trips = data.trips || []

  // Determine what to display in header
  const getHeaderInfo = () => {
    switch (view) {
      case 'trip':
        return {
          title: 'Selected Trip',
          subtitle: '• Viewing single trip',
          icon: IoCarSportOutline
        };
      case 'camera':
        return {
          title: `Camera: ${focusCamera?.name || 'Unknown'}`,
          subtitle: `• ${focusCamera?.type || 'Unknown'} camera`,
          icon: IoLocationOutline
        };
      case 'trip-camera':
        return {
          title: `Camera: ${focusTripCamera?.name || 'Unknown'}`,
          subtitle: `• In specific trip • ${focusTripCamera?.type || 'Unknown'}`,
          icon: IoLocationOutline
        };
      default:
        return {
          title: 'All Trips',
          subtitle: '• Overview mode',
          icon: IoEyeOutline
        };
    }
  };

  const headerInfo = getHeaderInfo();

  console.log('Current view:', view, 'selectedTrip:', selectedTrip ? `${selectedTrip.startTime} - ${selectedTrip.endTime}` : 'None');

  return (
    <div className="h-[calc(100vh-94px)] overflow-hidden">
      {/* Speed Calibration Overlay */}
      {showCalibration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Speed Calibration</h2>
              <button
                onClick={() => setShowCalibration(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <SpeedCalibration 
                trips={trips}
                onCalibrationApplied={handleCalibrationFactorChange}
              />
            </div>
          </div>
        </div>
      )}

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
                        {headerInfo.title}
                        <span className="ml-3 text-base font-normal text-gray-600">
                          {headerInfo.subtitle}
                        </span>
                      </h3>
                    </div>
                    
                    {/* Speed Calibration Controls */}
                    <div className="flex items-center gap-3">
                      {(view === 'camera' || view === 'trip-camera') && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          <IoLocationOutline className="h-4 w-4" />
                          <span>Camera Focus</span>
                        </div>
                      )}
                      {view === 'trip' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          <IoCarSportOutline className="h-4 w-4" />
                          <span>Trip Focus</span>
                        </div>
                      )}
                      {speedCalibrationFactor !== 1.0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          <IoSpeedometerOutline className="h-4 w-4" />
                          <span>Calibrated ({(speedCalibrationFactor * 100).toFixed(1)}%)</span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowCalibration(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        <IoSettingsOutline className="h-4 w-4" />
                        Speed Calibration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map Component */}
              <TripMap 
                trips={selectedTrip ? [selectedTrip] : trips}
                selectedTrip={selectedTrip}
                speedCalibrationFactor={speedCalibrationFactor}
                viewMode={view}
                focusCamera={focusCamera}
                focusTripCamera={focusTripCamera}
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
  validateSearch: (search: Record<string, unknown>): TripsSearch => ({
    view: (search.view as 'all' | 'trip' | 'camera' | 'trip-camera') || 'all',
    tripCreated: search.tripCreated as string | undefined,
    focusCamera: search.focusCamera as FocusCamera | undefined,
    focusTripCamera: search.focusTripCamera as FocusTripCamera | undefined,
  })
}) 