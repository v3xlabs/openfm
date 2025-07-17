import React from 'react';
import type { FC } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { createRoot } from 'react-dom/client';
import { PiSecurityCamera, PiPoliceCarFill, PiSpeedometerFill } from 'react-icons/pi';
import classnames from 'classnames';

interface CameraThumbnailProps {
  latitude: number;
  longitude: number;
  speedTrapType: string;
  hasViolations: boolean;
  hasWarnings: boolean;
  onClick?: () => void;
  className?: string;
}

const getCameraIcon = (speedTrapType: string) => {
  const type = speedTrapType.toLowerCase();
  if (type === 'speedcam') return PiSecurityCamera;
  if (type === 'speedtrap') return PiPoliceCarFill;
  if (type === 'averagespeedcheck') return PiSpeedometerFill;
  return PiSecurityCamera;
};

const createCameraMarkerIcon = (speedTrapType: string, hasViolations: boolean, hasWarnings: boolean) => {
  const iconContainer = document.createElement('div');
  iconContainer.className = 'camera-thumbnail-marker';
  
  const root = createRoot(iconContainer);
  const IconComponent = getCameraIcon(speedTrapType);
  
  // Determine color based on violation status
  const bgColor = hasViolations ? 'bg-red-500' : 
                  hasWarnings ? 'bg-yellow-500' : 'bg-green-500';
  
  root.render(
    <div className="relative">
      <div className={classnames('w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white', bgColor)}>
        <IconComponent className="w-3 h-3 text-white" />
      </div>
    </div>
  );
  
  return divIcon({
    html: iconContainer,
    className: 'custom-camera-thumbnail-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const CameraThumbnail: FC<CameraThumbnailProps> = ({ 
  latitude, 
  longitude, 
  speedTrapType, 
  hasViolations, 
  hasWarnings, 
  onClick,
  className 
}) => {
  return (
    <div 
      className={classnames(
        'relative w-32 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200',
        'hover:border-blue-400 hover:shadow-lg',
        hasViolations ? 'border-red-200' : hasWarnings ? 'border-yellow-200' : 'border-green-200',
        className
      )}
      onClick={onClick}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[latitude, longitude]}
          icon={createCameraMarkerIcon(speedTrapType, hasViolations, hasWarnings)}
        />
      </MapContainer>
      
      {/* Overlay with camera type indicator */}
      <div className="absolute top-1 right-1 px-1 py-0.5 bg-black bg-opacity-70 text-white text-xs rounded">
        {speedTrapType.charAt(0).toUpperCase()}
      </div>
      
      {/* Click indicator */}
      <div className="absolute inset-0 bg-blue-500 bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
        <div className="opacity-0 hover:opacity-100 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded transition-opacity">
          Click to view trips
        </div>
      </div>
    </div>
  );
};

export default CameraThumbnail; 