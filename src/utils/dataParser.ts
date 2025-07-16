import JSZip from 'jszip';
import type { UserData, Trip } from '../types';
import type { ExtendedFlitsmeisterData } from '../types/dataTypes';

export const parseFlitsmeisterZip = async (file: File): Promise<ExtendedFlitsmeisterData> => {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file);
  
  const data: ExtendedFlitsmeisterData = {
    importDate: new Date().toISOString(),
    fileName: file.name,
  };

  // Parse user.csv - it's in key-value format, not standard CSV
  const userFile = zipData.file('user.csv');
  if (userFile) {
    const userContent = await userFile.async('text');
    const lines = userContent.trim().split('\n');
    const userObj: UserData = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(',');
      const value = valueParts.join(','); // Rejoin in case value contains commas
      if (key && value !== undefined) {
        userObj[key] = value;
      }
    });
    
    data.userData = userObj;
  }

  // Parse trips.json - has structure with clientData and trips array
  const tripsFile = zipData.file('trips.json');
  if (tripsFile) {
    const tripsContent = await tripsFile.async('text');
    try {
      const tripsData = JSON.parse(tripsContent);
      data.clientData = tripsData.clientData;
      data.trips = tripsData.trips || [];
    } catch (error) {
      console.error('Error parsing trips.json:', error);
    }
  }

  // Parse vehicles.json
  const vehiclesFile = zipData.file('vehicles.json');
  if (vehiclesFile) {
    const vehiclesContent = await vehiclesFile.async('text');
    try {
      data.vehicles = JSON.parse(vehiclesContent);
    } catch (error) {
      console.error('Error parsing vehicles.json:', error);
    }
  }

  // Parse products.json
  const productsFile = zipData.file('products.json');
  if (productsFile) {
    const productsContent = await productsFile.async('text');
    try {
      data.products = JSON.parse(productsContent);
    } catch (error) {
      console.error('Error parsing products.json:', error);
    }
  }

  // Parse payments.json
  const paymentsFile = zipData.file('payments.json');
  if (paymentsFile) {
    const paymentsContent = await paymentsFile.async('text');
    try {
      data.payments = JSON.parse(paymentsContent);
    } catch (error) {
      console.error('Error parsing payments.json:', error);
    }
  }

  // Parse reports.json
  const reportsFile = zipData.file('reports.json');
  if (reportsFile) {
    const reportsContent = await reportsFile.async('text');
    try {
      data.reportsData = JSON.parse(reportsContent);
    } catch (error) {
      console.error('Error parsing reports.json:', error);
    }
  }

  // Parse statistics.json
  const statisticsFile = zipData.file('statistics.json');
  if (statisticsFile) {
    const statisticsContent = await statisticsFile.async('text');
    try {
      data.quarterlyStatistics = JSON.parse(statisticsContent);
    } catch (error) {
      console.error('Error parsing statistics.json:', error);
    }
  }

  // Parse marketing.json
  const marketingFile = zipData.file('marketing.json');
  if (marketingFile) {
    const marketingContent = await marketingFile.async('text');
    try {
      data.marketingData = JSON.parse(marketingContent);
    } catch (error) {
      console.error('Error parsing marketing.json:', error);
    }
  }

  return data;
};

// Decode polyline (Google's algorithm implementation)
export const decodePolyline = (encoded: string): [number, number][] => {
  if (!encoded) return [];
  
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b;

    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);

    lat += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

    result = 1;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);

    lng += (result & 1) !== 0 ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

// Helper function to get coordinates from address objects
export const getCoordinatesFromTrip = (trip: Trip): { start?: [number, number], end?: [number, number] } => {
  const result: { start?: [number, number], end?: [number, number] } = {};
  
  // For real Flitsmeister data, we'd need to extract coordinates from polyline or other sources
  // since startAddressObj/endAddressObj don't seem to contain lat/lng directly
  if (trip.polyline) {
    const points = decodePolyline(trip.polyline);
    if (points.length > 0) {
      result.start = points[0];
      result.end = points[points.length - 1];
    }
  }
  
  return result;
};

// Haversine formula to calculate distance between two lat/lng points in kilometers
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Segment with speed information
export interface PolylineSegment {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distanceKm: number;
  speedKmh: number;
  index: number;
}

// Calculate speed for each segment of a trip
export const calculateSegmentSpeeds = (trip: Trip): PolylineSegment[] => {
  if (!trip.polyline || !trip.startTime || !trip.endTime) {
    return [];
  }

  const points = decodePolyline(trip.polyline);
  if (points.length < 2) {
    return [];
  }

  // Calculate total duration in seconds
  const startTime = new Date(trip.startTime).getTime();
  const endTime = new Date(trip.endTime).getTime();
  const totalDurationSeconds = (endTime - startTime) / 1000;

  if (totalDurationSeconds <= 0) {
    return [];
  }

  // First pass: calculate raw segments with distances
  const rawSegments: PolylineSegment[] = [];
  let totalCalculatedDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const [startLat, startLng] = points[i];
    const [endLat, endLng] = points[i + 1];
    
    const distanceKm = calculateDistance(startLat, startLng, endLat, endLng);
    totalCalculatedDistance += distanceKm;
    
    rawSegments.push({
      startLat,
      startLng,
      endLat,
      endLng,
      distanceKm,
      speedKmh: 0, // Will calculate after filtering
      index: i
    });
  }

  // Filter out very short segments (likely GPS noise) and merge them with next segment
  const filteredSegments: PolylineSegment[] = [];
  const minSegmentDistance = 0.005; // 5 meters minimum

  let accumulatedDistance = 0;
  let segmentStartIndex = 0;

  for (let i = 0; i < rawSegments.length; i++) {
    accumulatedDistance += rawSegments[i].distanceKm;
    
    // If we've accumulated enough distance or we're at the last segment, create a filtered segment
    if (accumulatedDistance >= minSegmentDistance || i === rawSegments.length - 1) {
      const startSegment = rawSegments[segmentStartIndex];
      const endSegment = rawSegments[i];
      
      filteredSegments.push({
        startLat: startSegment.startLat,
        startLng: startSegment.startLng,
        endLat: endSegment.endLat,
        endLng: endSegment.endLng,
        distanceKm: accumulatedDistance,
        speedKmh: 0, // Will calculate next
        index: filteredSegments.length
      });
      
      accumulatedDistance = 0;
      segmentStartIndex = i + 1;
    }
  }

  if (filteredSegments.length === 0) {
    return [];
  }

  // Calculate speeds based on uniform time distribution across filtered segments
  const timePerSegment = totalDurationSeconds / filteredSegments.length;
  
  // Use the actual trip distance if available, otherwise use calculated distance
  const referenceDistance = trip.distanceKm || totalCalculatedDistance;
  const referenceTotalSpeed = referenceDistance / (totalDurationSeconds / 3600); // Average speed for entire trip

  // Calculate initial speeds
  for (let i = 0; i < filteredSegments.length; i++) {
    const segment = filteredSegments[i];
    segment.speedKmh = segment.distanceKm / (timePerSegment / 3600);
  }

  // Apply smoothing with moving average (window of 3 segments)
  const smoothedSpeeds: number[] = [];
  const windowSize = Math.min(3, filteredSegments.length);
  
  for (let i = 0; i < filteredSegments.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - Math.floor(windowSize / 2)); 
         j <= Math.min(filteredSegments.length - 1, i + Math.floor(windowSize / 2)); 
         j++) {
      sum += filteredSegments[j].speedKmh;
      count++;
    }
    
    smoothedSpeeds[i] = sum / count;
  }

  // Apply realistic speed constraints and outlier correction
  for (let i = 0; i < filteredSegments.length; i++) {
    let speed = smoothedSpeeds[i];
    
    // Clamp to reasonable bounds (0-250 km/h)
    speed = Math.max(0, Math.min(250, speed));
    
    // If speed is still unrealistic compared to reference speed, adjust it
    const maxDeviationFactor = 3; // Allow up to 3x the average trip speed
    const maxReasonableSpeed = Math.min(250, referenceTotalSpeed * maxDeviationFactor);
    const minReasonableSpeed = Math.max(0, referenceTotalSpeed * 0.1); // Allow very slow speeds
    
    if (speed > maxReasonableSpeed) {
      speed = maxReasonableSpeed;
    } else if (speed < minReasonableSpeed && referenceTotalSpeed > 10) {
      // Only enforce minimum speed if the trip average is reasonable (> 10 km/h)
      speed = minReasonableSpeed;
    }
    
    filteredSegments[i].speedKmh = speed;
  }

  // Final pass: ensure total calculated distance matches expected distance
  const totalFilteredDistance = filteredSegments.reduce((sum, seg) => sum + seg.distanceKm, 0);
  const distanceScaleFactor = referenceDistance / totalFilteredDistance;
  
  // Apply distance scaling to maintain consistency
  if (Math.abs(distanceScaleFactor - 1) > 0.1) { // Only adjust if significant difference
    for (const segment of filteredSegments) {
      segment.distanceKm *= distanceScaleFactor;
    }
  }

  return filteredSegments;
};

// Color interpolation helper
const interpolateColor = (color1: [number, number, number], color2: [number, number, number], factor: number): [number, number, number] => {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * factor),
    Math.round(color1[1] + (color2[1] - color1[1]) * factor),
    Math.round(color1[2] + (color2[2] - color1[2]) * factor)
  ];
};

// Convert RGB to hex
const rgbToHex = (rgb: [number, number, number]): string => {
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
};

// Speed to color mapping function
export const getSpeedColor = (speedKmh: number): string => {
  // Handle edge cases
  if (speedKmh <= 0 || isNaN(speedKmh)) {
    return '#6B7280'; // Gray for invalid speeds
  }

  // Define color points [R, G, B]
  const colorPoints: Array<[number, [number, number, number]]> = [
    [0, [135, 206, 235]],    // Light blue for very low speeds
    [30, [135, 206, 235]],   // Light blue for 30 km/h
    [50, [59, 130, 246]],    // Blue for 50 km/h  
    [70, [251, 191, 36]],    // Yellow for 70 km/h
    [90, [249, 115, 22]],    // Orange for 90 km/h
    [110, [239, 68, 68]],    // Red for 110 km/h
    [130, [185, 28, 28]],    // Dark red for 130 km/h
    [150, [127, 29, 29]],    // Darker red for 150 km/h
    [200, [69, 10, 10]]      // Very dark red for high speeds
  ];

  // Find the appropriate color range
  for (let i = 0; i < colorPoints.length - 1; i++) {
    const [speed1, color1] = colorPoints[i];
    const [speed2, color2] = colorPoints[i + 1];
    
    if (speedKmh >= speed1 && speedKmh <= speed2) {
      // Interpolate between the two colors
      const factor = (speedKmh - speed1) / (speed2 - speed1);
      const interpolatedColor = interpolateColor(color1, color2, factor);
      return rgbToHex(interpolatedColor);
    }
  }

  // If speed is higher than our highest point, return the darkest color
  return rgbToHex(colorPoints[colorPoints.length - 1][1]);
}; 