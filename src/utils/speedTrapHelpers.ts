import { IoHelpCircleOutline } from 'react-icons/io5';
import { PiSecurityCamera, PiPoliceCarFill, PiSpeedometerFill } from 'react-icons/pi';
import type { SpeedTrapEvent, Trip } from '../types';
import { calculateSegmentSpeeds, calculateDistance } from './dataParser';

// Constants for speed violation thresholds
export const SPEED_THRESHOLDS = {
  TOLERANCE: 4, // km/h tolerance before warning
  WARNING: 4,   // km/h over limit for yellow warning
} as const;

// Speed trap type definitions with their corresponding icons
export const SPEED_TRAP_TYPES = {
  SPEEDCAM: {
    keywords: ['speedcam'],
    icon: PiSecurityCamera,
    name: 'Speed Camera'
  },
  SPEEDTRAP: {
    keywords: ['speedtrap'],
    icon: PiPoliceCarFill,
    name: 'Speed Trap'
  },
  AVERAGE_SPEED_CHECK: {
    keywords: ['averagespeedcheck'],
    icon: PiSpeedometerFill,
    name: 'Average Speed Check'
  },
  UNKNOWN: {
    keywords: [],
    icon: IoHelpCircleOutline,
    name: 'Unknown Camera'
  }
} as const;

// Color classes for different violation levels
export const VIOLATION_COLORS = {
  COMPLIANT: {
    text: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
    ring: 'ring-green-500'
  },
  WARNING: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-100', 
    border: 'border-yellow-200',
    ring: 'ring-yellow-500'
  },
  VIOLATION: {
    text: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
    ring: 'ring-red-500'
  },
  UNKNOWN: {
    text: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    ring: 'ring-gray-500'
  }
} as const;

/**
 * Determines the speed trap type based on the speedTrapType string
 */
export const getSpeedTrapType = (speedTrapType: string) => {
  const type = speedTrapType.toLowerCase();
  
  // Check for speedcam
  if (type === 'speedcam') {
    return { key: 'SPEEDCAM', ...SPEED_TRAP_TYPES.SPEEDCAM };
  }
  
  // Check for speedtrap
  if (type === 'speedtrap') {
    return { key: 'SPEEDTRAP', ...SPEED_TRAP_TYPES.SPEEDTRAP };
  }
  
  // Check for averageSpeedCheck
  if (type === 'averagespeedcheck') {
    return { key: 'AVERAGE_SPEED_CHECK', ...SPEED_TRAP_TYPES.AVERAGE_SPEED_CHECK };
  }
  
  // Fallback to unknown
  return { key: 'UNKNOWN', ...SPEED_TRAP_TYPES.UNKNOWN };
};

/**
 * Determines the violation level based on speed difference
 */
export const getViolationLevel = (actualSpeed: number, speedLimit: number): keyof typeof VIOLATION_COLORS => {
  // Handle NaN speed limit cases
  if (isNaN(speedLimit) || isNaN(actualSpeed)) {
    return 'UNKNOWN';
  }
  
  const speedDifference = actualSpeed - speedLimit;
  
  if (speedDifference <= 0) {
    return 'COMPLIANT';
  } else if (speedDifference <= SPEED_THRESHOLDS.WARNING) {
    return 'WARNING';
  } else {
    return 'VIOLATION';
  }
};

/**
 * Gets the appropriate icon component for a speed trap event
 */
export const getSpeedTrapIcon = (speedTrapEvent: SpeedTrapEvent) => {
  const trapType = getSpeedTrapType(speedTrapEvent.speedTrapType);
  return trapType.icon;
};

/**
 * Gets the appropriate color classes for a speed trap event
 */
export const getSpeedTrapColors = (speedTrapEvent: SpeedTrapEvent) => {
  const violationLevel = getViolationLevel(speedTrapEvent.speed, speedTrapEvent.maxSpeed);
  return VIOLATION_COLORS[violationLevel];
};

/**
 * Gets combined styling information for a speed trap event
 */
export const getSpeedTrapStyling = (speedTrapEvent: SpeedTrapEvent) => {
  const trapType = getSpeedTrapType(speedTrapEvent.speedTrapType);
  const colors = getSpeedTrapColors(speedTrapEvent);
  const violationLevel = getViolationLevel(speedTrapEvent.speed, speedTrapEvent.maxSpeed);
  const speedDifference = speedTrapEvent.speed - speedTrapEvent.maxSpeed;
  
  return {
    icon: trapType.icon,
    iconName: trapType.name,
    colors,
    violationLevel: violationLevel as keyof typeof VIOLATION_COLORS,
    speedDifference,
    isCompliant: violationLevel === 'COMPLIANT',
    isWarning: violationLevel === 'WARNING',
    isViolation: violationLevel === 'VIOLATION',
    isUnknown: violationLevel === 'UNKNOWN'
  };
};

/**
 * Helper function to round speed to nearest 0.12
 */
export const roundSpeedToNearest12 = (speed: number): number => {
  return Math.round(speed / 0.12) * 0.12;
};

/**
 * Analyzes multiple speed trap events by type and violation level
 */
export const analyzeSpeedTrapsByType = (speedTrapEvents: SpeedTrapEvent[]) => {
  const analysis = speedTrapEvents.reduce((acc, event) => {
    const trapType = getSpeedTrapType(event.speedTrapType);
    const violationLevel = getViolationLevel(event.speed, event.maxSpeed);
    const speedDifference = event.speed - event.maxSpeed;
    
    if (!acc[trapType.key]) {
      acc[trapType.key] = {
        type: trapType,
        total: 0,
        compliant: 0,
        warnings: 0,
        violations: 0,
        unknown: 0,
        maxViolation: 0,
        events: []
      };
    }
    
    const group = acc[trapType.key];
    group.total++;
    group.events.push(event);
    
    if (violationLevel === 'COMPLIANT') {
      group.compliant++;
    } else if (violationLevel === 'WARNING') {
      group.warnings++;
    } else if (violationLevel === 'VIOLATION') {
      group.violations++;
      // Only track max violation if speedDifference is not NaN
      if (!isNaN(speedDifference)) {
        group.maxViolation = Math.max(group.maxViolation, speedDifference);
      }
    } else if (violationLevel === 'UNKNOWN') {
      group.unknown++;
    }
    
    return acc;
  }, {} as Record<string, {
    type: ReturnType<typeof getSpeedTrapType>;
    total: number;
    compliant: number;
    warnings: number;
    violations: number;
    unknown: number;
    maxViolation: number;
    events: SpeedTrapEvent[];
  }>);
  
  return analysis;
};

/**
 * Speed calibration result interface
 */
export interface SpeedCalibrationResult {
  optimalFactor: number;
  confidence: number;
  matchedCameras: number;
  totalCameras: number;
  averageError: number;
  beforeCalibration: {
    averageError: number;
    standardDeviation: number;
  };
  afterCalibration: {
    averageError: number;
    standardDeviation: number;
  };
  cameraMatches: Array<{
    event: SpeedTrapEvent;
    estimatedSpeed: number;
    recordedSpeed: number;
    difference: number;
    distanceFromSegment: number;
  }>;
}

/**
 * Finds the closest segment to a speed camera location
 */
const findClosestSegment = (cameraLat: number, cameraLng: number, segments: ReturnType<typeof calculateSegmentSpeeds>) => {
  let closestSegment = null;
  let minDistance = Infinity;
  
  for (const segment of segments) {
    // Calculate distance to segment start and end points
    const distanceToStart = calculateDistance(cameraLat, cameraLng, segment.startLat, segment.startLng);
    const distanceToEnd = calculateDistance(cameraLat, cameraLng, segment.endLat, segment.endLng);
    
    // Calculate distance to segment midpoint for better accuracy
    const midLat = (segment.startLat + segment.endLat) / 2;
    const midLng = (segment.startLng + segment.endLng) / 2;
    const distanceToMid = calculateDistance(cameraLat, cameraLng, midLat, midLng);
    
    const minSegmentDistance = Math.min(distanceToStart, distanceToEnd, distanceToMid);
    
    if (minSegmentDistance < minDistance) {
      minDistance = minSegmentDistance;
      closestSegment = { segment, distance: minSegmentDistance };
    }
  }
  
  return closestSegment;
};

/**
 * Analyzes speed camera data to determine optimal calibration factor for speed calculations
 */
export const calculateSpeedCalibrationFactor = (trips: Trip[]): SpeedCalibrationResult => {
  const cameraMatches: SpeedCalibrationResult['cameraMatches'] = [];
  const maxDistanceThreshold = 0.1; // 100 meters max distance from segment to camera
  
  // Collect all speed camera events with their estimated speeds
  for (const trip of trips) {
    if (!trip.speedTrapEvents || trip.speedTrapEvents.length === 0) continue;
    
    const segments = calculateSegmentSpeeds(trip);
    if (segments.length === 0) continue;
    
    for (const event of trip.speedTrapEvents) {
      // Only process events with valid recorded speeds
      if (!event.latitude || !event.longitude || !event.speed || isNaN(event.speed)) continue;
      
      // Find the closest segment to this camera
      const closestMatch = findClosestSegment(event.latitude, event.longitude, segments);
      
      if (closestMatch && closestMatch.distance <= maxDistanceThreshold) {
        cameraMatches.push({
          event,
          estimatedSpeed: closestMatch.segment.speedKmh,
          recordedSpeed: event.speed,
          difference: event.speed - closestMatch.segment.speedKmh,
          distanceFromSegment: closestMatch.distance
        });
      }
    }
  }
  
  if (cameraMatches.length === 0) {
    return {
      optimalFactor: 1.0,
      confidence: 0,
      matchedCameras: 0,
      totalCameras: trips.reduce((sum, trip) => sum + (trip.speedTrapEvents?.length || 0), 0),
      averageError: 0,
      beforeCalibration: { averageError: 0, standardDeviation: 0 },
      afterCalibration: { averageError: 0, standardDeviation: 0 },
      cameraMatches: []
    };
  }
  
  // Calculate statistics before calibration
  const beforeErrors = cameraMatches.map(match => Math.abs(match.difference));
  const beforeAverageError = beforeErrors.reduce((sum, err) => sum + err, 0) / beforeErrors.length;
  const beforeVariance = beforeErrors.reduce((sum, err) => sum + Math.pow(err - beforeAverageError, 2), 0) / beforeErrors.length;
  const beforeStandardDeviation = Math.sqrt(beforeVariance);
  
  // Calculate optimal calibration factor using least squares regression
  // We want to find factor such that: recordedSpeed = factor * estimatedSpeed
  let numerator = 0;
  let denominator = 0;
  
  for (const match of cameraMatches) {
    numerator += match.recordedSpeed * match.estimatedSpeed;
    denominator += match.estimatedSpeed * match.estimatedSpeed;
  }
  
  const optimalFactor = denominator > 0 ? numerator / denominator : 1.0;
  
  // Clamp factor to reasonable bounds (0.5 to 2.0)
  const clampedFactor = Math.max(0.5, Math.min(2.0, optimalFactor));
  
  // Calculate statistics after calibration
  const afterErrors = cameraMatches.map(match => Math.abs(match.recordedSpeed - (match.estimatedSpeed * clampedFactor)));
  const afterAverageError = afterErrors.reduce((sum, err) => sum + err, 0) / afterErrors.length;
  const afterVariance = afterErrors.reduce((sum, err) => sum + Math.pow(err - afterAverageError, 2), 0) / afterErrors.length;
  const afterStandardDeviation = Math.sqrt(afterVariance);
  
  // Calculate confidence based on number of samples and improvement
  const sampleConfidence = Math.min(1.0, cameraMatches.length / 20); // Higher confidence with more samples
  const improvementRatio = beforeAverageError > 0 ? (beforeAverageError - afterAverageError) / beforeAverageError : 0;
  const improvementConfidence = Math.max(0, Math.min(1.0, improvementRatio * 2)); // Up to 50% improvement gives full confidence
  const confidence = (sampleConfidence + improvementConfidence) / 2;
  
  return {
    optimalFactor: clampedFactor,
    confidence,
    matchedCameras: cameraMatches.length,
    totalCameras: trips.reduce((sum, trip) => sum + (trip.speedTrapEvents?.length || 0), 0),
    averageError: afterAverageError,
    beforeCalibration: {
      averageError: beforeAverageError,
      standardDeviation: beforeStandardDeviation
    },
    afterCalibration: {
      averageError: afterAverageError,
      standardDeviation: afterStandardDeviation
    },
    cameraMatches
  };
};

/**
 * Gets a formatted summary of speed calibration results
 */
export const getSpeedCalibrationSummary = (calibration: SpeedCalibrationResult): string => {
  if (calibration.matchedCameras === 0) {
    return `No speed cameras found within range of trip segments. Cannot determine calibration factor.`;
  }
  
  const factorPercentage = (calibration.optimalFactor - 1) * 100;
  const confidencePercentage = (calibration.confidence * 100).toFixed(0);
  const errorImprovement = calibration.beforeCalibration.averageError > 0 
    ? (((calibration.beforeCalibration.averageError - calibration.afterCalibration.averageError) / calibration.beforeCalibration.averageError) * 100).toFixed(1)
    : '0';
  
  return `Speed Calibration Analysis:
• Optimal calibration factor: ${calibration.optimalFactor.toFixed(3)} (${factorPercentage > 0 ? '+' : ''}${factorPercentage.toFixed(1)}%)
• Matched ${calibration.matchedCameras} cameras out of ${calibration.totalCameras} total
• Confidence level: ${confidencePercentage}%
• Average speed error reduced from ${calibration.beforeCalibration.averageError.toFixed(1)} km/h to ${calibration.afterCalibration.averageError.toFixed(1)} km/h
• Error improvement: ${errorImprovement}%`;
}; 