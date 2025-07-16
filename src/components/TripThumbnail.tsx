import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../utils/dataParser';
import type { Trip } from '../types';

interface TripThumbnailProps {
  trip: Trip;
  className?: string;
  isSelected?: boolean;
}

const TripThumbnail: FC<TripThumbnailProps> = ({ trip, className = '', isSelected = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !trip.polyline) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const points = decodePolyline(trip.polyline);
    if (points.length === 0) return;

    // Create mini map
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.6,
    }).addTo(map);

    // Add polyline
    const polyline = L.polyline(points, {
      color: isSelected ? '#ef4444' : '#3b82f6',
      weight: 2,
      opacity: 0.8,
    }).addTo(map);

    // Add start marker
    L.circleMarker(points[0], {
      radius: 3,
      fillColor: '#10b981',
      color: 'white',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map);

    // Add end marker
    L.circleMarker(points[points.length - 1], {
      radius: 3,
      fillColor: '#ef4444',
      color: 'white',
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map);

    // Fit to bounds
    map.fitBounds(polyline.getBounds(), {
      padding: [2, 2]
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip.polyline, isSelected]);

  if (!trip.polyline) {
    return (
      <div className={`w-32 h-32 bg-gray-100 rounded flex items-center justify-center ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`w-32 h-32 rounded overflow-hidden ${className} ${isSelected ? 'ring-2 ring-red-500' : ''}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default TripThumbnail; 