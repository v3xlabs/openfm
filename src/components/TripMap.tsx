import React, { useEffect, useState, useMemo } from 'react';
import type { FC } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, divIcon } from 'leaflet';
import classnames from 'classnames';
import { 
  IoLocationOutline, 
  IoFlagOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoMapOutline,
  IoLogoGoogle,
  IoLogoApple,
  IoOpenOutline 
} from 'react-icons/io5';
import { PiSecurityCamera, PiPoliceCarFill, PiSpeedometerFill } from 'react-icons/pi';
import { createRoot } from 'react-dom/client';
import { useNavigate } from '@tanstack/react-router';
import type { Trip, SpeedTrapEvent } from '../types';
import { decodePolyline, getCoordinatesFromTrip, calculateSegmentSpeeds, getSpeedColor, calculateDistance } from '../utils/dataParser';
import { 
  getSpeedTrapStyling, 
  roundSpeedToNearest12,
  VIOLATION_COLORS 
} from '../utils/speedTrapHelpers';

interface FocusCamera {
  lat: number;
  lng: number;
  type: string;
  name: string;
}

interface FocusTripCamera {
  tripStartTime: string;
  tripEndTime: string;
  lat: number;
  lng: number;
  type: string;
  name: string;
}

interface TripMapProps {
  trips: Trip[];
  selectedTrip?: Trip | null;
  className?: string;
  speedCalibrationFactor?: number;
  viewMode?: 'all' | 'trip' | 'camera' | 'trip-camera';
  focusCamera?: FocusCamera;
  focusTripCamera?: FocusTripCamera;
}

interface MapLegendState {
  showTripPaths: boolean;
  showStartEndMarkers: boolean;
  showAllCameras: boolean;
  showSpeedCams: boolean;
  showSpeedTraps: boolean;
  showAverageSpeedChecks: boolean;
}

// Create a custom flag marker for start/end points
const createFlagIcon = (type: 'start' | 'end') => {
  const iconContainer = document.createElement('div');
  iconContainer.className = 'trip-flag-marker';
  
  const root = createRoot(iconContainer);
  const color = type === 'start' ? 'text-green-600' : 'text-red-600';
  
  root.render(
    <div className="relative">
      <div className={`${color} drop-shadow-md`}>
        <IoFlagOutline className="w-5 h-5" />
      </div>
    </div>
  );
  
  return divIcon({
    html: iconContainer,
    className: `custom-flag-icon ${type}`,
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    popupAnchor: [0, -18],
  });
};

// Create a custom speed camera icon based on violation level
const createSpeedCameraIcon = (violationLevel: keyof typeof VIOLATION_COLORS, IconComponent: React.ComponentType<{ className: string }>) => {
  const iconContainer = document.createElement('div');
  iconContainer.className = 'speed-camera-marker';
  
  const root = createRoot(iconContainer);
  
  // Map violation levels to background colors
  const bgColor = violationLevel === 'COMPLIANT' ? 'bg-green-500' :
                  violationLevel === 'WARNING' ? 'bg-yellow-500' : 
                  violationLevel === 'VIOLATION' ? 'bg-red-500' : 'bg-gray-500';
  
  const shouldPulse = violationLevel === 'VIOLATION';
  
  root.render(
    <div className="relative">
      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center shadow-lg border-2 border-white ${shouldPulse ? 'animate-pulse' : ''}`}>
        <IconComponent className="w-4 h-4 text-white" />
      </div>
    </div>
  );
  
  return divIcon({
    html: iconContainer,
    className: `custom-speed-camera-icon ${violationLevel.toLowerCase()}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map Bounds Updater Component
const MapBoundsUpdater: FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);

  return null;
};

// Map Legend Component
const MapLegend: FC<{
  legendState: MapLegendState;
  onToggle: (key: keyof MapLegendState) => void;
}> = ({ legendState, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const legendItems = [
    {
      key: 'showTripPaths' as keyof MapLegendState,
      label: 'Trip Routes',
      icon: IoMapOutline,
      color: 'text-blue-600'
    },
    {
      key: 'showStartEndMarkers' as keyof MapLegendState,
      label: 'Start/End Flags',
      icon: IoFlagOutline,
      color: 'text-green-600'
    },
    {
      key: 'showAllCameras' as keyof MapLegendState,
      label: 'All Cameras',
      icon: IoEyeOutline,
      color: 'text-gray-600',
      isMaster: true
    },
    {
      key: 'showSpeedCams' as keyof MapLegendState,
      label: 'Speed Cameras',
      icon: PiSecurityCamera,
      color: 'text-orange-600',
      isSubItem: true
    },
    {
      key: 'showSpeedTraps' as keyof MapLegendState,
      label: 'Speed Traps',
      icon: PiPoliceCarFill,
      color: 'text-red-600',
      isSubItem: true
    },
    {
      key: 'showAverageSpeedChecks' as keyof MapLegendState,
      label: 'Average Speed',
      icon: PiSpeedometerFill,
      color: 'text-purple-600',
      isSubItem: true
    }
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 max-w-64">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoMapOutline className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900 text-sm">Map Legend</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? (
            <IoEyeOutline className="h-4 w-4 text-gray-500" />
          ) : (
            <IoEyeOffOutline className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Legend Items */}
      {!isCollapsed && (
        <div className="p-3 space-y-2">
          {legendItems.map((item) => (
            <div 
              key={item.key}
              className={classnames(
                'flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors',
                {
                  'ml-4': item.isSubItem,
                  'font-medium': item.isMaster,
                  'opacity-50': item.key === 'showAllCameras' ? false : 
                    (item.isSubItem && !legendState.showAllCameras) ||
                    (item.key.startsWith('show') && !legendState[item.key])
                }
              )}
              onClick={() => onToggle(item.key)}
            >
                             <div className="flex items-center">
                 <input
                   type="checkbox"
                   checked={legendState[item.key]}
                   onChange={() => {}} // Handled by parent div onClick
                   className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                   disabled={item.isSubItem && !legendState.showAllCameras}
                   readOnly
                 />
                 <item.icon className={`h-4 w-4 ${item.color}`} />
               </div>
              <span className="text-sm text-gray-700 select-none">
                {item.label}
              </span>
            </div>
          ))}
          
          {/* Color Legend */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-2">Speed Status</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Violation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TripMap: FC<TripMapProps> = ({ trips, selectedTrip, className, speedCalibrationFactor = 1.0, viewMode = 'all', focusCamera, focusTripCamera }) => {
  const navigate = useNavigate();
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [legendState, setLegendState] = useState<MapLegendState>({
    showTripPaths: true,
    showStartEndMarkers: true,
    showAllCameras: true,
    showSpeedCams: true,
    showSpeedTraps: true,
    showAverageSpeedChecks: true
  });

  // Aggregate camera data for "all trips" view
  const combinedCameras = useMemo(() => {
    if (viewMode !== 'all' || selectedTrip) return [];

    const cameraMap = new Map<string, {
      latitude: number;
      longitude: number;
      speedTrapType: string;
      roadName: string;
      encounters: Array<{
        event: SpeedTrapEvent;
        trip: Trip;
        date: string;
      }>;
      totalEncounters: number;
      violations: number;
      warnings: number;
      compliant: number;
    }>();

    const proximityThreshold = 0.05; // 50 meters

    for (const trip of trips) {
      if (!trip.speedTrapEvents) continue;

      for (const event of trip.speedTrapEvents) {
        if (!event.latitude || !event.longitude || !event.speed) continue;

        // Find existing camera within proximity threshold
        let existingCamera = null;
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
          
          // Update violation counts
          const styling = getSpeedTrapStyling(event);
          if (styling.isViolation) existingCamera.violations++;
          else if (styling.isWarning) existingCamera.warnings++;
          else if (styling.isCompliant) existingCamera.compliant++;
        } else {
          // Create new camera entry
          const cameraId = `${event.latitude.toFixed(6)}_${event.longitude.toFixed(6)}_${event.speedTrapType}`;
          const styling = getSpeedTrapStyling(event);
          
          const newCamera = {
            latitude: event.latitude,
            longitude: event.longitude,
            speedTrapType: event.speedTrapType,
            roadName: event.roadName || 'Unknown Road',
            encounters: [encounter],
            totalEncounters: 1,
            violations: styling.isViolation ? 1 : 0,
            warnings: styling.isWarning ? 1 : 0,
            compliant: styling.isCompliant ? 1 : 0,
          };
          
          cameraMap.set(cameraId, newCamera);
        }
      }
    }

    return Array.from(cameraMap.values());
  }, [trips, viewMode, selectedTrip]);

  const handleLegendToggle = (key: keyof MapLegendState) => {
    setLegendState(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      
      // If "All Cameras" is toggled off, turn off all camera subtypes
      if (key === 'showAllCameras' && !newState.showAllCameras) {
        newState.showSpeedCams = false;
        newState.showSpeedTraps = false;
        newState.showAverageSpeedChecks = false;
      }
      
      // If "All Cameras" is toggled on, turn on all camera subtypes
      if (key === 'showAllCameras' && newState.showAllCameras) {
        newState.showSpeedCams = true;
        newState.showSpeedTraps = true;
        newState.showAverageSpeedChecks = true;
      }
      
      return newState;
    });
  };

  useEffect(() => {
    // If focusing on a specific camera, center on that camera
    if (focusCamera) {
      const cameraPoint: [number, number] = [focusCamera.lat, focusCamera.lng];
      const cameraBounds = new LatLngBounds([cameraPoint]);
      setBounds(cameraBounds);
      return;
    }
    
    // If focusing on a camera within a trip, center on that camera
    if (focusTripCamera) {
      const cameraPoint: [number, number] = [focusTripCamera.lat, focusTripCamera.lng];
      const cameraBounds = new LatLngBounds([cameraPoint]);
      setBounds(cameraBounds);
      return;
    }
    
    if (trips.length === 0) return;
    
    const allPoints: [number, number][] = [];
    
    // If a specific trip is selected, only calculate bounds for that trip
    const tripsToProcess = selectedTrip ? [selectedTrip] : trips;
    
    tripsToProcess.forEach(trip => {
      if (trip.polyline && legendState.showTripPaths) {
        const points = decodePolyline(trip.polyline);
        allPoints.push(...points);
      }
      
      // Also include speed trap event coordinates
      if (trip.speedTrapEvents && legendState.showAllCameras) {
        trip.speedTrapEvents.forEach(event => {
          if (event.latitude && event.longitude) {
            allPoints.push([event.latitude, event.longitude]);
          }
          
          // Include trajectory points for average speed checks
          if (event.trajectory && legendState.showAverageSpeedChecks) {
            const trajectoryPoints = decodePolyline(event.trajectory);
            allPoints.push(...trajectoryPoints);
          }
        });
      }
    });
    
    if (allPoints.length > 0) {
      const bounds = new LatLngBounds(allPoints);
      setBounds(bounds);
    }
  }, [trips, selectedTrip, legendState, focusCamera, focusTripCamera]);

  // Helper function to determine if a camera type should be shown
  const shouldShowCamera = (speedTrapType: string): boolean => {
    if (!legendState.showAllCameras) return false;
    
    const type = speedTrapType.toLowerCase();
    if (type === 'speedcam') return legendState.showSpeedCams;
    if (type === 'speedtrap') return legendState.showSpeedTraps;
    if (type === 'averagespeedcheck') return legendState.showAverageSpeedChecks;
    
    return true; // Show unknown types if cameras are enabled
  };

  if (!bounds) {
    return (
      <div className={classnames('flex items-center justify-center bg-gray-100 rounded-xl', className)}>
        <div className="text-center">
          <IoLocationOutline className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No trip data to display</p>
          <p className="text-gray-400 text-sm">Upload data with polyline information to see the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classnames('rounded-xl overflow-hidden z-0 shadow-inner relative', className)}>
      <MapContainer
        center={bounds ? bounds.getCenter() : [50.8503, 4.3517]} // Default to Brussels
        zoom={bounds ? 10 : 6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapBoundsUpdater bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Main trip polylines with speed segments */}
        {legendState.showTripPaths && trips.map((trip, index) => {
          if (!trip.polyline) return null;
          
          const points = decodePolyline(trip.polyline);
          if (points.length === 0) return null;
          
          const isSelected = selectedTrip?.startTime === trip.startTime && selectedTrip?.endTime === trip.endTime;
          
          // If this is the selected trip, render individual segments with speed tooltips
          if (isSelected) {
            const segments = calculateSegmentSpeeds(trip, speedCalibrationFactor);
            
            return segments.map((segment, segmentIndex) => (
              <Polyline
                key={`segment-${trip.startTime}-${trip.endTime}-${segmentIndex}`}
                positions={[
                  [segment.startLat, segment.startLng],
                  [segment.endLat, segment.endLng]
                ]}
                color={getSpeedColor(segment.speedKmh)}
                weight={5}
                opacity={1}
                eventHandlers={{
                  mouseover: (e) => {
                    const popup = e.target.bindPopup(
                      `<div style="font-family: system-ui, sans-serif; line-height: 1.4;">
                        <strong>Segment ${segmentIndex + 1}</strong><br/>
                        <span style="color: #6b7280;">Speed:</span> <strong>~${Math.round(segment.speedKmh)} km/h</strong><br/>
                        <span style="color: #6b7280;">Distance:</span> ${(segment.distanceKm * 1000).toFixed(0)}m
                      </div>`,
                      {
                        closeButton: false,
                        className: 'speed-segment-tooltip'
                      }
                    );
                    popup.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  }
                }}
              />
            ));
          } else {
            // For non-selected trips, render as a single polyline with average speed color
            const segments = calculateSegmentSpeeds(trip, speedCalibrationFactor);
            const avgSpeed = segments.length > 0 
              ? segments.reduce((sum, seg) => sum + seg.speedKmh, 0) / segments.length 
              : 0;
            
            return (
              <Polyline
                key={`trip-${trip.startTime}-${trip.endTime}-${index}`}
                positions={points}
                color={getSpeedColor(avgSpeed)}
                weight={3}
                opacity={0.8}
              />
            );
          }
        })}
        
        {/* Average speed check trajectory polylines */}
        {legendState.showAverageSpeedChecks && trips.map((trip) => {
          if (!trip.speedTrapEvents) return null;
          
          return trip.speedTrapEvents.map((event, eventIndex) => {
            // Only render trajectory for average speed checks
            if (event.speedTrapType.toLowerCase() !== 'averagespeedcheck' || !event.trajectory) return null;
            if (!shouldShowCamera(event.speedTrapType)) return null;
            
            const trajectoryPoints = decodePolyline(event.trajectory);
            if (trajectoryPoints.length === 0) return null;
            
            const isSelectedTrip = selectedTrip?.startTime === trip.startTime && selectedTrip?.endTime === trip.endTime;
            const styling = getSpeedTrapStyling(event);
            
            // Color based on violation level
            const trajectoryColor = styling.isCompliant ? '#10b981' : 
                                   styling.isWarning ? '#f59e0b' : 
                                   styling.isViolation ? '#ef4444' : '#6b7280'; // grey for unknown
            
            const lineWeight = isSelectedTrip ? 6 : 4;
            const outlineWeight = lineWeight + 6; // Outline is 6px wider (thicker than before)
            
            return (
              <React.Fragment key={`trajectory-fragment-${trip.startTime}-${eventIndex}`}>
                {/* Yellow outline polyline - rendered first (behind main line) */}
                <Polyline
                  key={`trajectory-outline-${trip.startTime}-${eventIndex}`}
                  positions={trajectoryPoints}
                  color="#eab308" // Yellow color
                  weight={outlineWeight}
                  opacity={0.9}
                />
                
                {/* Main trajectory polyline */}
                <Polyline
                  key={`trajectory-main-${trip.startTime}-${eventIndex}`}
                  positions={trajectoryPoints}
                  color={trajectoryColor}
                  weight={lineWeight}
                  opacity={0.95}
                />
              </React.Fragment>
            );
          });
        })}
        
        {/* Combined camera markers for "all trips" view */}
        {viewMode === 'all' && !selectedTrip && combinedCameras.map((camera, index) => {
          if (!shouldShowCamera(camera.speedTrapType)) return null;
          
          // Determine overall violation status for the camera
          const hasViolations = camera.violations > 0;
          const hasWarnings = camera.warnings > 0;
          const violationLevel = hasViolations ? 'VIOLATION' : hasWarnings ? 'WARNING' : 'COMPLIANT';
          
          // Get appropriate icon
          const IconComponent = camera.speedTrapType.toLowerCase() === 'speedcam' ? PiSecurityCamera :
                               camera.speedTrapType.toLowerCase() === 'speedtrap' ? PiPoliceCarFill :
                               camera.speedTrapType.toLowerCase() === 'averagespeedcheck' ? PiSpeedometerFill :
                               PiSecurityCamera;
          
          return (
            <Marker
              key={`combined-camera-${index}`}
              position={[camera.latitude, camera.longitude]}
              icon={createSpeedCameraIcon(violationLevel, IconComponent)}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="font-semibold mb-3 flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {camera.roadName}
                    <span className="text-sm font-normal text-gray-600">({camera.speedTrapType})</span>
                  </div>
                  
                  <div className="mb-3 text-sm">
                    <div className="font-medium text-gray-900">{camera.totalEncounters} encounters</div>
                    <div className="flex gap-3 text-xs mt-1">
                      {camera.violations > 0 && <span className="text-red-600">{camera.violations} violations</span>}
                      {camera.warnings > 0 && <span className="text-yellow-600">{camera.warnings} warnings</span>}
                      {camera.compliant > 0 && <span className="text-green-600">{camera.compliant} compliant</span>}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="font-medium text-gray-700 mb-2">Click an encounter to view in trip:</div>
                    {camera.encounters
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
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
                                  tripStartTime: encounter.trip.startTime,
                                  tripEndTime: encounter.trip.endTime,
                                  lat: camera.latitude,
                                  lng: camera.longitude,
                                  type: camera.speedTrapType,
                                  name: camera.roadName
                                }
                              }
                            })}
                            className="block w-full text-left p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{new Date(encounter.date).toLocaleDateString()}</span>
                              <span className={classnames('font-semibold', {
                                'text-red-600': styling.isViolation,
                                'text-yellow-600': styling.isWarning,
                                'text-green-600': styling.isCompliant
                              })}>
                                {encounter.event.speed.toFixed(1)} km/h
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    {camera.encounters.length > 5 && (
                      <div className="text-xs text-gray-500 mt-2">
                        +{camera.encounters.length - 5} more encounters
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Individual speed trap event markers for specific trip views */}
        {(viewMode !== 'all' || selectedTrip) && trips.map((trip) => {
          if (!trip.speedTrapEvents) return null;
          
          return trip.speedTrapEvents.map((event, eventIndex) => {
            if (!event.latitude || !event.longitude) return null;
            if (!shouldShowCamera(event.speedTrapType)) return null;
            
            const isSelectedTrip = selectedTrip?.startTime === trip.startTime && selectedTrip?.endTime === trip.endTime;
            const styling = getSpeedTrapStyling(event);
            const roundedSpeed = roundSpeedToNearest12(event.speed);
            const roundedMaxSpeed = roundSpeedToNearest12(event.maxSpeed);
            const roundedSpeedDifference = roundSpeedToNearest12(styling.speedDifference);
            
            return (
              <Marker
                key={`speed-trap-${trip.startTime}-${eventIndex}`}
                position={[event.latitude, event.longitude]}
                icon={createSpeedCameraIcon(styling.violationLevel, styling.icon)}
                opacity={isSelectedTrip ? 1 : 0.7}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <div className={`font-semibold mb-3 flex items-center gap-2 ${styling.colors.text}`}>
                      <styling.icon className="h-4 w-4" />
                      {styling.iconName}
                      {styling.isCompliant && <span className="text-green-600"> - Compliant</span>}
                      {styling.isWarning && <span className="text-yellow-600"> - Warning</span>}
                      {styling.isViolation && <span className="text-red-600"> - Violation</span>}
                      {styling.isUnknown && <span className="text-gray-600"> - Unknown Speed Limit</span>}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{event.speedTrapType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Speed:</span>
                        <span className={`font-medium ${styling.colors.text}`}>
                          {roundedSpeed.toFixed(2)} km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Speed Limit:</span>
                        <span className="font-medium">
                          {isNaN(event.maxSpeed) ? 'Unknown' : `${roundedMaxSpeed.toFixed(2)} km/h`}
                        </span>
                      </div>
                      {!styling.isCompliant && !styling.isUnknown && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Over by:</span>
                          <span className={`font-medium ${styling.colors.text}`}>
                            +{roundedSpeedDifference.toFixed(2)} km/h
                          </span>
                        </div>
                      )}
                      {event.roadName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Road:</span>
                          <span className="font-medium">{event.roadName}</span>
                        </div>
                      )}
                      {event.trajectory && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Section:</span>
                          <span className="font-medium text-blue-600">Trajectory shown</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${event.stationary ? 'text-orange-600' : 'text-blue-600'}`}>
                          {event.stationary ? 'Stationary' : 'Mobile'}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Streetview Links */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-2">View Location:</div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                            title="View in Google Street View"
                          >
                            <IoLogoGoogle className="h-3 w-3" />
                            Street View
                          </a>
                          <a
                            href={`https://www.mapillary.com/app/?lat=${event.latitude}&lng=${event.longitude}&z=17`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="View in Mapillary Street View"
                          >
                            <IoEyeOutline className="h-3 w-3" />
                            Mapillary
                          </a>
                          <a
                            href={`http://maps.apple.com/?ll=${event.latitude},${event.longitude}&q=${event.latitude},${event.longitude}&t=k`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                            title="View in Apple Maps"
                          >
                            <IoLogoApple className="h-3 w-3" />
                            Apple Maps
                          </a>
                          <a
                            href={`https://www.google.com/maps/place/${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                            title="View location on Google Maps"
                          >
                            <IoOpenOutline className="h-3 w-3" />
                            Maps
                          </a>
                        </div>
                      </div>
                    </div>
                    {!styling.isCompliant && !styling.isUnknown && (
                      <div className={`mt-3 p-2 rounded ${styling.colors.bg} ${styling.colors.border} border`}>
                        <div className={`text-xs font-medium ${styling.colors.text}`}>
                          {styling.isWarning ? '⚠️ Minor speed violation' : '🚨 Speed limit exceeded'}
                        </div>
                      </div>
                    )}
                    {styling.isUnknown && (
                      <div className={`mt-3 p-2 rounded ${styling.colors.bg} ${styling.colors.border} border`}>
                        <div className={`text-xs font-medium ${styling.colors.text}`}>
                          ❓ Speed limit data unavailable
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          });
        })}
        
        {/* Trip start markers */}
        {legendState.showStartEndMarkers && trips.map((trip, index) => {
          const coords = getCoordinatesFromTrip(trip);
          if (!coords.start) return null;
          
          return (
            <Marker
              key={`start-${trip.startTime}-${index}`}
              position={coords.start}
              icon={createFlagIcon('start')}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <IoFlagOutline className="h-4 w-4" />
                    Trip Start
                  </div>
                  {trip.startAddress && (
                    <p className="text-sm text-gray-700 mb-2">{trip.startAddress}</p>
                  )}
                  {trip.startTime && (
                    <p className="text-xs text-gray-500">
                      {new Date(trip.startTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Trip end markers */}
        {legendState.showStartEndMarkers && trips.map((trip, index) => {
          const coords = getCoordinatesFromTrip(trip);
          if (!coords.end) return null;
          
          return (
            <Marker
              key={`end-${trip.endTime}-${index}`}
              position={coords.end}
              icon={createFlagIcon('end')}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <IoFlagOutline className="h-4 w-4" />
                    Trip End
                  </div>
                  {trip.endAddress && (
                    <p className="text-sm text-gray-700 mb-2">{trip.endAddress}</p>
                  )}
                  {trip.endTime && (
                    <p className="text-xs text-gray-500">
                      {new Date(trip.endTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        

      </MapContainer>
      
      {/* Map Legend */}
      <MapLegend 
        legendState={legendState} 
        onToggle={handleLegendToggle} 
      />
    </div>
  );
};

export default TripMap; 