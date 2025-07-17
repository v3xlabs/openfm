import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { FC } from 'react';
import classnames from 'classnames';
import { 
  IoStatsChartOutline,
  IoFilterOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { PiSecurityCamera, PiPoliceCarFill, PiSpeedometerFill } from 'react-icons/pi';
import { useData } from '../hooks/useData';
import { getSpeedTrapStyling } from '../utils/speedTrapHelpers';
import { calculateDistance } from '../utils/dataParser';
import { CameraThumbnail } from '../components';
import type { SpeedTrapEvent, Trip } from '../types';

interface CameraEncounter {
  id: string;
  latitude: number;
  longitude: number;
  roadName: string;
  speedTrapType: string;
  encounters: Array<{
    event: SpeedTrapEvent;
    trip: Trip;
    date: string;
  }>;
  totalEncounters: number;
  averageSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  averageSpeedLimit: number;
  violations: number;
  warnings: number;
  compliant: number;
  lastEncounter: string;
  firstEncounter: string;
}

type SortOption = 'frequency' | 'recent' | 'violations' | 'speed' | 'name';
type FilterOption = 'all' | 'violations' | 'warnings' | 'compliant' | 'speedcam' | 'speedtrap' | 'averagespeedcheck';

const CamsComponent: FC = () => {
  const { data } = useData();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('frequency');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Process and aggregate camera data
  const cameraData = useMemo(() => {
    if (!data?.trips) return [];

    const cameraMap = new Map<string, CameraEncounter>();
    const proximityThreshold = 0.05; // 50 meters - group nearby cameras as same location

    for (const trip of data.trips) {
      if (!trip.speedTrapEvents) continue;

      for (const event of trip.speedTrapEvents) {
        if (!event.latitude || !event.longitude || !event.speed) continue;

        // Find existing camera within proximity threshold
        let existingCamera: CameraEncounter | null = null;

        for (const [, camera] of cameraMap.entries()) {
          const distance = calculateDistance(
            event.latitude, event.longitude,
            camera.latitude, camera.longitude
          );
          
          if (distance <= proximityThreshold && 
              event.speedTrapType.toLowerCase() === camera.speedTrapType.toLowerCase()) {
            existingCamera = camera;
            break;
          }
        }

        const encounter = {
          event,
          trip,
          date: new Date(event.timestamp || trip.startTime).toISOString()
        };

        if (existingCamera) {
          // Add to existing camera
          existingCamera.encounters.push(encounter);
          existingCamera.totalEncounters++;
          
          // Update aggregated stats
          const speeds = existingCamera.encounters.map(e => e.event.speed);
          const speedLimits = existingCamera.encounters
            .map(e => e.event.maxSpeed)
            .filter(s => !isNaN(s));
          
          existingCamera.averageSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
          existingCamera.maxSpeed = Math.max(...speeds);
          existingCamera.minSpeed = Math.min(...speeds);
          existingCamera.averageSpeedLimit = speedLimits.length > 0 
            ? speedLimits.reduce((sum, s) => sum + s, 0) / speedLimits.length 
            : NaN;
          
          // Update violation counts
          const styling = getSpeedTrapStyling(event);
          if (styling.isViolation) existingCamera.violations++;
          else if (styling.isWarning) existingCamera.warnings++;
          else if (styling.isCompliant) existingCamera.compliant++;
          
          // Update dates
          const encounterDate = new Date(encounter.date);
          if (encounterDate > new Date(existingCamera.lastEncounter)) {
            existingCamera.lastEncounter = encounter.date;
          }
          if (encounterDate < new Date(existingCamera.firstEncounter)) {
            existingCamera.firstEncounter = encounter.date;
          }
        } else {
          // Create new camera entry
          const cameraId = `${event.latitude.toFixed(6)}_${event.longitude.toFixed(6)}_${event.speedTrapType}`;
          const styling = getSpeedTrapStyling(event);
          
          const newCamera: CameraEncounter = {
            id: cameraId,
            latitude: event.latitude,
            longitude: event.longitude,
            roadName: event.roadName || 'Unknown Road',
            speedTrapType: event.speedTrapType,
            encounters: [encounter],
            totalEncounters: 1,
            averageSpeed: event.speed,
            maxSpeed: event.speed,
            minSpeed: event.speed,
            averageSpeedLimit: isNaN(event.maxSpeed) ? NaN : event.maxSpeed,
            violations: styling.isViolation ? 1 : 0,
            warnings: styling.isWarning ? 1 : 0,
            compliant: styling.isCompliant ? 1 : 0,
            lastEncounter: encounter.date,
            firstEncounter: encounter.date
          };
          
          cameraMap.set(cameraId, newCamera);
        }
      }
    }

    return Array.from(cameraMap.values());
  }, [data]);

  // Filter cameras based on selected filter
  const filteredCameras = useMemo(() => {
    return cameraData.filter(camera => {
      switch (filterBy) {
        case 'violations':
          return camera.violations > 0;
        case 'warnings':
          return camera.warnings > 0;
        case 'compliant':
          return camera.compliant > 0 && camera.violations === 0 && camera.warnings === 0;
        case 'speedcam':
          return camera.speedTrapType.toLowerCase() === 'speedcam';
        case 'speedtrap':
          return camera.speedTrapType.toLowerCase() === 'speedtrap';
        case 'averagespeedcheck':
          return camera.speedTrapType.toLowerCase() === 'averagespeedcheck';
        default:
          return true;
      }
    });
  }, [cameraData, filterBy]);

  // Sort cameras based on selected sort option
  const sortedCameras = useMemo(() => {
    return [...filteredCameras].sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.totalEncounters - a.totalEncounters;
        case 'recent':
          return new Date(b.lastEncounter).getTime() - new Date(a.lastEncounter).getTime();
        case 'violations':
          return (b.violations + b.warnings) - (a.violations + a.warnings);
        case 'speed':
          return b.averageSpeed - a.averageSpeed;
        case 'name':
          return a.roadName.localeCompare(b.roadName);
        default:
          return 0;
      }
    });
  }, [filteredCameras, sortBy]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalEncounters = cameraData.reduce((sum, cam) => sum + cam.totalEncounters, 0);
    const totalViolations = cameraData.reduce((sum, cam) => sum + cam.violations, 0);
    const totalWarnings = cameraData.reduce((sum, cam) => sum + cam.warnings, 0);
    const totalCompliant = cameraData.reduce((sum, cam) => sum + cam.compliant, 0);
    
    return {
      uniqueCameras: cameraData.length,
      totalEncounters,
      totalViolations,
      totalWarnings,
      totalCompliant,
      violationRate: totalEncounters > 0 ? (totalViolations / totalEncounters) * 100 : 0,
      complianceRate: totalEncounters > 0 ? (totalCompliant / totalEncounters) * 100 : 0
    };
  }, [cameraData]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const getCameraIcon = (speedTrapType: string) => {
    const type = speedTrapType.toLowerCase();
    if (type === 'speedcam') return PiSecurityCamera;
    if (type === 'speedtrap') return PiPoliceCarFill;
    if (type === 'averagespeedcheck') return PiSpeedometerFill;
    return PiSecurityCamera;
  };

  const getViolationColor = (camera: CameraEncounter) => {
    if (camera.violations > 0) return 'text-red-600 bg-red-100';
    if (camera.warnings > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speed Camera Analysis</h1>
          <p className="text-gray-600 mt-1">
            Analysis of {stats.totalEncounters} encounters across {stats.uniqueCameras} unique camera locations
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <PiSecurityCamera className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.uniqueCameras}</div>
              <div className="text-sm text-gray-600">Unique Cameras</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <IoTrendingUpOutline className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEncounters}</div>
              <div className="text-sm text-gray-600">Total Encounters</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <IoWarningOutline className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalViolations}</div>
              <div className="text-sm text-gray-600">Violations ({stats.violationRate.toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCompliant}</div>
              <div className="text-sm text-gray-600">Compliant ({stats.complianceRate.toFixed(1)}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <IoStatsChartOutline className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="frequency">Most Frequent</option>
              <option value="recent">Most Recent</option>
              <option value="violations">Most Violations</option>
              <option value="speed">Highest Speed</option>
              <option value="name">Road Name</option>
            </select>
          </div>

          {/* Filter Options */}
          <div className="flex items-center gap-2">
            <IoFilterOutline className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Filter:</span>
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Cameras</option>
              <option value="violations">Violations Only</option>
              <option value="warnings">Warnings Only</option>
              <option value="compliant">Compliant Only</option>
              <option value="speedcam">Speed Cameras</option>
              <option value="speedtrap">Speed Traps</option>
              <option value="averagespeedcheck">Average Speed Checks</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {sortedCameras.length} of {stats.uniqueCameras} cameras
          </div>
        </div>
      </div>

      {/* Camera List */}
      <div className="space-y-4">
              {sortedCameras.map((camera) => {
        const IconComponent = getCameraIcon(camera.speedTrapType);
        
        return (
            <div key={camera.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Camera Thumbnail */}
                  <CameraThumbnail
                    latitude={camera.latitude}
                    longitude={camera.longitude}
                    speedTrapType={camera.speedTrapType}
                    hasViolations={camera.violations > 0}
                    hasWarnings={camera.warnings > 0}
                    onClick={() => navigate({
                      to: '/trips',
                      search: {
                        view: 'camera',
                        focusCamera: {
                          lat: camera.latitude,
                          lng: camera.longitude,
                          type: camera.speedTrapType,
                          name: camera.roadName
                        }
                      }
                    })}
                  />
                  
                  <div className={classnames(
                    'p-3 rounded-lg',
                    getViolationColor(camera)
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {camera.roadName}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {camera.speedTrapType}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Encounters:</span>
                        <div className="font-semibold text-gray-900">{camera.totalEncounters}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Speed:</span>
                        <div className="font-semibold text-gray-900">
                          {camera.averageSpeed.toFixed(1)} km/h
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Speed Range:</span>
                        <div className="font-semibold text-gray-900">
                          {camera.minSpeed.toFixed(1)} - {camera.maxSpeed.toFixed(1)} km/h
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Seen:</span>
                        <div className="font-semibold text-gray-900">
                          {new Date(camera.lastEncounter).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Violation Summary */}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {camera.violations > 0 && (
                        <span className="text-red-600">
                          {camera.violations} violation{camera.violations !== 1 ? 's' : ''}
                        </span>
                      )}
                      {camera.warnings > 0 && (
                        <span className="text-yellow-600">
                          {camera.warnings} warning{camera.warnings !== 1 ? 's' : ''}
                        </span>
                      )}
                      {camera.compliant > 0 && (
                        <span className="text-green-600">
                          {camera.compliant} compliant
                        </span>
                      )}
                      {!isNaN(camera.averageSpeedLimit) && (
                        <span className="text-gray-600">
                          Speed limit: {camera.averageSpeedLimit.toFixed(0)} km/h
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">#{sortedCameras.indexOf(camera) + 1}</div>
                  <div className="text-xs text-gray-500">Most {sortBy}</div>
                </div>
              </div>

              {/* Recent Encounters Preview */}
              {camera.totalEncounters > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">
                    Recent encounters (click to view in trip context):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {camera.encounters
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                      .map((encounter, idx) => {
                        const styling = getSpeedTrapStyling(encounter.event);
                        return (
                          <button
                            key={idx}
                            onClick={() => navigate({
                              to: '/trips',
                              search: {
                                view: 'trip-camera',
                                focusTripCamera: {
                                  tripCreated: encounter.trip.created || encounter.trip.startTime,
                                  lat: camera.latitude,
                                  lng: camera.longitude,
                                  type: camera.speedTrapType,
                                  name: camera.roadName
                                }
                              }
                            })}
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs transition-colors cursor-pointer text-left"
                          >
                            <div className="font-medium">
                              {new Date(encounter.date).toLocaleDateString()}
                            </div>
                            <div className={classnames('font-semibold', {
                              'text-red-600': styling.isViolation,
                              'text-yellow-600': styling.isWarning,
                              'text-green-600': styling.isCompliant
                            })}>
                              {encounter.event.speed.toFixed(1)} km/h
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Click to view trip →
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedCameras.length === 0 && (
        <div className="text-center py-12">
          <PiSecurityCamera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras found</h3>
          <p className="text-gray-600">
            {filterBy === 'all' 
              ? "No speed camera data found in your trips."
              : `No cameras match the selected filter: ${filterBy}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/cams')({
  component: CamsComponent,
}); 