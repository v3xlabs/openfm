import type { FC } from 'react';
import classnames from 'classnames';
import {
  IoCarSportOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoMapOutline
} from 'react-icons/io5';
import { MdDateRange } from 'react-icons/md';
import type { Trip } from '../types';
import TripThumbnail from './TripThumbnail';
import { analyzeSpeedTrapsByType } from '../utils/speedTrapHelpers';

interface TripListProps {
  trips: Trip[];
  selectedTrip?: Trip | null;
  onTripSelect: (trip: Trip) => void;
  className?: string;
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown date';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown time';
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid time';
  }
};

const formatDistance = (distanceKm: number | undefined): string => {
  if (typeof distanceKm !== 'number') return 'Unknown distance';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
};

const calculateDuration = (startTime: string | undefined, endTime: string | undefined): string => {
  if (!startTime || !endTime) return 'Unknown duration';
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.round(durationMs / (1000 * 60));

    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  } catch {
    return 'Invalid duration';
  }
};

const TripList: FC<TripListProps> = ({ trips, selectedTrip, onTripSelect, className }) => {
  if (trips.length === 0) {
    return (
      <div className={classnames('p-8 text-center', className)}>
        <IoCarSportOutline className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No trips found in the data export.</p>
      </div>
    );
  }

  return (
    <div className={classnames('overflow-y-auto overflow-x-hidden', className)}>
      <div className="py-3">
        <div className="flex items-center gap-3 mb-3 pl-4 justify-between">
          <div className="flex items-center gap-3">
          <IoCarSportOutline className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Trips ({trips.length})
          </h2>
          </div>
          {selectedTrip && (
            <button
              onClick={() => onTripSelect(null as unknown as Trip)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              <IoMapOutline className="h-4 w-4" />
              View All Trips
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {trips.map((trip, index) => {
            const isSelected = selectedTrip?.startTime === trip.startTime && selectedTrip?.endTime === trip.endTime;
            const speedTrapAnalysis = trip.speedTrapEvents ? analyzeSpeedTrapsByType(trip.speedTrapEvents) : null;

            return (
              <button
                key={`${trip.startTime}-${trip.endTime}-${index}`}
                onClick={() => onTripSelect(trip)}
                className={classnames(
                  'w-full text-left p-2 transition-all duration-200 hover:shadow-md',
                  {
                    'border-blue-500 bg-white': isSelected,
                    'border-transparent hover:border-gray-300 hover:bg-gray-50': !isSelected,
                    'bg-neutral-100': !isSelected && selectedTrip,
                  }
                )}
              >
                <div className="flex gap-4">
                  {/* Trip Thumbnail */}
                  <div className="flex-shrink-0">
                    <TripThumbnail
                      trip={trip}
                      isSelected={isSelected}
                      className="border rounded-lg overflow-hidden"
                    />
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <MdDateRange className="h-4 w-4 text-gray-500" />
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDate(trip.startTime)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IoTimeOutline className="h-4 w-4" />
                      <span>{formatTime(trip.startTime)} → {formatTime(trip.endTime)}</span>
                    </div>

                    {/* Addresses */}
                    {(trip.startAddress || trip.endAddress) && (
                      <div className="space-y-2">
                        {trip.startAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="truncate">{trip.startAddress}</span>
                          </div>
                        )}
                        {trip.endAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span className="truncate">{trip.endAddress}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <IoLocationOutline className="h-4 w-4" />
                          <span>{formatDistance(trip.distanceKm)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IoTimeOutline className="h-4 w-4" />
                          <span>{calculateDuration(trip.startTime, trip.endTime)}</span>
                        </div>
                      </div>

                      {/* Speed trap indicators by type */}
                      {speedTrapAnalysis && Object.keys(speedTrapAnalysis).length > 0 && (
                        <div className="flex items-center gap-1">
                          {Object.entries(speedTrapAnalysis)
                            .sort(([, a], [, b]) => b.total - a.total) // Sort by most common first
                            .map(([typeKey, stats]) => {
                              const IconComponent = stats.type.icon;

                              // Determine color based on violation status
                              let colorClass = 'text-green-600 bg-green-100'; // Default: all compliant
                              if (stats.violations > 0) {
                                colorClass = 'text-red-600 bg-red-100'; // Has violations
                              } else if (stats.warnings > 0) {
                                colorClass = 'text-yellow-600 bg-yellow-100'; // Has warnings
                              } else if (stats.unknown > 0 && stats.compliant === 0) {
                                colorClass = 'text-gray-600 bg-gray-100'; // Only unknown cases
                              }

                              return (
                                <div
                                  key={typeKey}
                                  className={classnames(
                                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                                    colorClass
                                  )}
                                  title={`${stats.type.name}: ${stats.total} detected (${stats.compliant} compliant, ${stats.warnings} warnings, ${stats.violations} violations, ${stats.unknown} unknown speed limits)`}
                                >
                                  <IconComponent className="h-3 w-3" />
                                  <span>{stats.total}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TripList; 