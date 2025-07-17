import React, { useMemo, useState } from 'react';
import type { FC } from 'react';
import classnames from 'classnames';
import { 
  IoSpeedometerOutline, 
  IoCheckmarkCircleOutline, 
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoStatsChartOutline
} from 'react-icons/io5';
import { PiSecurityCamera } from 'react-icons/pi';
import type { Trip } from '../types';
import { 
  calculateSpeedCalibrationFactor, 
  getSpeedCalibrationSummary,
  type SpeedCalibrationResult 
} from '../utils/speedTrapHelpers';

interface SpeedCalibrationProps {
  trips: Trip[];
  className?: string;
  onCalibrationApplied?: (factor: number) => void;
}

const SpeedCalibration: FC<SpeedCalibrationProps> = ({ 
  trips, 
  className,
  onCalibrationApplied 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedFactor, setAppliedFactor] = useState(1.0);

  // Calculate calibration data
  const calibrationResult: SpeedCalibrationResult = useMemo(() => {
    return calculateSpeedCalibrationFactor(trips);
  }, [trips]);

  const handleApplyCalibration = () => {
    setAppliedFactor(calibrationResult.optimalFactor);
    onCalibrationApplied?.(calibrationResult.optimalFactor);
  };

  const handleResetCalibration = () => {
    setAppliedFactor(1.0);
    onCalibrationApplied?.(1.0);
  };

  // Determine status and styling
  const getStatusInfo = () => {
    if (calibrationResult.matchedCameras === 0) {
      return {
        status: 'No Data',
        color: 'gray',
        icon: IoInformationCircleOutline,
        message: 'No speed cameras found within range of trip segments'
      };
    }

    if (calibrationResult.confidence < 0.3) {
      return {
        status: 'Low Confidence',
        color: 'red',
        icon: IoAlertCircleOutline,
        message: `Low confidence (${Math.round(calibrationResult.confidence * 100)}%) - need more data`
      };
    }

    if (calibrationResult.confidence < 0.7) {
      return {
        status: 'Moderate',
        color: 'yellow',
        icon: IoAlertCircleOutline,
        message: `Moderate confidence (${Math.round(calibrationResult.confidence * 100)}%)`
      };
    }

    return {
      status: 'High Confidence',
      color: 'green',
      icon: IoCheckmarkCircleOutline,
      message: `High confidence (${Math.round(calibrationResult.confidence * 100)}%)`
    };
  };

  const statusInfo = getStatusInfo();
  const isFactorApplied = Math.abs(appliedFactor - calibrationResult.optimalFactor) < 0.001;

  return (
    <div className={classnames('bg-white rounded-lg shadow p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IoSpeedometerOutline className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Speed Calibration</h2>
            <p className="text-sm text-gray-600">Optimize speed calculations using speed camera data</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <PiSecurityCamera className="h-5 w-5 text-gray-600" />
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {calibrationResult.matchedCameras}/{calibrationResult.totalCameras}
            </div>
            <div className="text-sm text-gray-600">Cameras Matched</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <statusInfo.icon className={classnames('h-5 w-5', {
            'text-green-600': statusInfo.color === 'green',
            'text-yellow-600': statusInfo.color === 'yellow',
            'text-red-600': statusInfo.color === 'red',
            'text-gray-600': statusInfo.color === 'gray'
          })} />
          <div>
            <div className="text-lg font-semibold text-gray-900">{statusInfo.status}</div>
            <div className="text-sm text-gray-600">{statusInfo.message}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <IoStatsChartOutline className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {calibrationResult.optimalFactor.toFixed(3)}
            </div>
            <div className="text-sm text-gray-600">
              Optimal Factor ({((calibrationResult.optimalFactor - 1) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {calibrationResult.matchedCameras > 0 && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleApplyCalibration}
            disabled={isFactorApplied}
            className={classnames(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isFactorApplied
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <IoCheckmarkCircleOutline className="h-4 w-4" />
            {isFactorApplied ? 'Calibration Applied' : 'Apply Calibration'}
          </button>

          {appliedFactor !== 1.0 && (
            <button
              onClick={handleResetCalibration}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <IoRefreshOutline className="h-4 w-4" />
              Reset to Default
            </button>
          )}
        </div>
      )}

      {/* Detailed Analysis */}
      {isExpanded && (
        <div className="space-y-6">
          {calibrationResult.matchedCameras > 0 && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Calibration Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {getSpeedCalibrationSummary(calibrationResult)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Speed Camera Matches ({calibrationResult.cameraMatches.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {calibrationResult.cameraMatches.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <PiSecurityCamera className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="font-medium">
                            {match.event.roadName || 'Unknown Road'}
                          </div>
                          <div className="text-gray-600">
                            {match.event.speedTrapType} • {match.distanceFromSegment.toFixed(0)}m from segment
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          Recorded: {match.recordedSpeed.toFixed(1)} km/h
                        </div>
                        <div className="text-gray-600">
                          Estimated: {match.estimatedSpeed.toFixed(1)} km/h
                        </div>
                        <div className={classnames('text-xs', {
                          'text-red-600': Math.abs(match.difference) > 10,
                          'text-yellow-600': Math.abs(match.difference) > 5,
                          'text-green-600': Math.abs(match.difference) <= 5
                        })}>
                          Δ {match.difference > 0 ? '+' : ''}{match.difference.toFixed(1)} km/h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {calibrationResult.matchedCameras === 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center py-8">
                <IoInformationCircleOutline className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Calibration Data Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Speed cameras need to be within 100 meters of trip segments to perform calibration. 
                  Try importing trips with more speed camera events to enable this feature.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeedCalibration; 