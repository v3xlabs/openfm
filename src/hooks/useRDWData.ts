import { useQuery } from '@tanstack/react-query';
import type { RDWVehicleResponse } from '../types/rdwTypes';

const RDW_API_BASE = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';

async function fetchRDWVehicleData(kenteken: string): Promise<RDWVehicleResponse> {
  if (!kenteken || kenteken.trim() === '') {
    throw new Error('Kenteken is required');
  }

  // Clean up kenteken (remove spaces, dashes, etc.)
  const cleanKenteken = kenteken.replace(/[-\s]/g, '').toUpperCase();
  
  const response = await fetch(`${RDW_API_BASE}?kenteken=${cleanKenteken}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RDW data: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

export function useRDWVehicleData(kenteken: string | undefined) {
  return useQuery({
    queryKey: ['rdw-vehicle', kenteken],
    queryFn: () => fetchRDWVehicleData(kenteken!),
    enabled: !!kenteken && kenteken.trim() !== '',
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 days - data is static
    gcTime: 1000 * 60 * 60 * 24 * 90, // 90 days - keep in cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook to fetch multiple vehicles at once
export function useRDWVehicleDataMultiple(kentekenList: string[]) {
  return useQuery({
    queryKey: ['rdw-vehicles-multiple', kentekenList.sort()],
    queryFn: async () => {
      const results = await Promise.allSettled(
        kentekenList.map(kenteken => fetchRDWVehicleData(kenteken))
      );
      
      return results.map((result, index) => ({
        kenteken: kentekenList[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    },
    enabled: kentekenList.length > 0,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 days
    gcTime: 1000 * 60 * 60 * 24 * 90, // 90 days
    retry: 2,
  });
} 