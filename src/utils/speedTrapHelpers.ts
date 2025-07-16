import { IoHelpCircleOutline } from 'react-icons/io5';
import { PiSecurityCamera, PiPoliceCarFill, PiSpeedometerFill } from 'react-icons/pi';
import type { SpeedTrapEvent } from '../types';

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