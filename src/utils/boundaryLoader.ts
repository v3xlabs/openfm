// Utility for loading geographic boundaries
import type { Feature, FeatureCollection } from 'geojson';

// Cache for loaded boundaries and promises
const boundaryCache = new Map<string, Feature>();
const promiseCache = new Map<string, Promise<FeatureCollection>>();

/**
 * Load detailed world boundaries with promise caching
 */
async function loadWorldBoundaries(): Promise<FeatureCollection> {
  const cacheKey = 'world_detailed';
  
  if (promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey)!;
  }

  const promise = fetch('/boundaries/world_detailed.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load world boundaries: ${response.status}`);
      }
      return response.json() as Promise<FeatureCollection>;
    })
    .catch(error => {
      console.error('Error loading world boundaries:', error);
      // Remove failed promise from cache so it can be retried
      promiseCache.delete(cacheKey);
      // Return empty collection if loading fails
      return { type: 'FeatureCollection', features: [] } as FeatureCollection;
    });

  promiseCache.set(cacheKey, promise);
  return promise;
}

/**
 * Load detailed Benelux province boundaries with promise caching
 */
async function loadBeneluxBoundaries(): Promise<FeatureCollection> {
  const cacheKey = 'benelux_provinces';
  
  if (promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey)!;
  }

  const promise = fetch('/boundaries/benelux_provinces.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load Benelux boundaries: ${response.status}`);
      }
      return response.json() as Promise<FeatureCollection>;
    })
    .catch(error => {
      console.error('Error loading Benelux boundaries:', error);
      // Remove failed promise from cache so it can be retried
      promiseCache.delete(cacheKey);
      // Return empty collection if loading fails
      return { type: 'FeatureCollection', features: [] } as FeatureCollection;
    });

  promiseCache.set(cacheKey, promise);
  return promise;
}

/**
 * Load detailed Natural Earth data with promise caching
 */
async function loadNaturalEarthBoundaries(): Promise<FeatureCollection> {
  const cacheKey = 'natural_earth';
  
  if (promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey)!;
  }

  const promise = fetch('/boundaries/natural_earth.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load Natural Earth boundaries: ${response.status}`);
      }
      return response.json() as Promise<FeatureCollection>;
    })
    .catch(error => {
      console.error('Error loading Natural Earth boundaries:', error);
      // Remove failed promise from cache so it can be retried
      promiseCache.delete(cacheKey);
      // Return empty collection if loading fails
      return { type: 'FeatureCollection', features: [] } as FeatureCollection;
    });

  promiseCache.set(cacheKey, promise);
  return promise;
}

/**
 * Load country boundary from the world dataset
 */
export async function loadCountryBoundary(countryCode: string): Promise<Feature | null> {
  const cacheKey = `country-${countryCode}`;
  
  if (boundaryCache.has(cacheKey)) {
    return boundaryCache.get(cacheKey)!;
  }

  try {
    const worldData = await loadWorldBoundaries();
    
    const countryMap: Record<string, string> = {
      'NL': 'Netherlands',
      'BE': 'Belgium', 
      'LU': 'Luxembourg',
      'DE': 'Germany',
      'FR': 'France',
      'AT': 'Austria',
      'CH': 'Switzerland',
      'DK': 'Denmark',
      'SE': 'Sweden',
      'NO': 'Norway',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'SK': 'Slovakia',
      'HU': 'Hungary',
      'SI': 'Slovenia',
      'HR': 'Croatia',
      'IT': 'Italy',
      'ES': 'Spain',
      'PT': 'Portugal',
      'GB': 'United Kingdom',
      'IE': 'Ireland'
    };

    const countryName = countryMap[countryCode];
    if (!countryName) {
      console.warn(`Unknown country code: ${countryCode}`);
      return null;
    }

    const feature = worldData.features?.find((f: Feature) => 
      f.properties?.name === countryName || 
      f.properties?.NAME === countryName ||
      f.properties?.admin === countryName
    );

    if (feature) {
      boundaryCache.set(cacheKey, feature);
      return feature;
    }

    console.warn(`Country boundary not found: ${countryName} (${countryCode})`);
    return null;

  } catch (error) {
    console.error(`Error loading country boundary for ${countryCode}:`, error);
    return null;
  }
}

/**
 * Load detailed province boundary from the appropriate dataset
 */
export async function loadProvinceBoundary(provinceCode: string): Promise<Feature | null> {
  const cacheKey = `province-${provinceCode}`;
  
  if (boundaryCache.has(cacheKey)) {
    return boundaryCache.get(cacheKey)!;
  }

  try {
    // Province code mapping to actual names in the dataset
    const provinceMap: Record<string, { country: string; name: string }> = {
      // Netherlands
      'NL-DR': { country: 'Netherlands', name: 'Drenthe' },
      'NL-FL': { country: 'Netherlands', name: 'Flevoland' },
      'NL-FR': { country: 'Netherlands', name: 'Friesland' },
      'NL-GE': { country: 'Netherlands', name: 'Gelderland' },
      'NL-GR': { country: 'Netherlands', name: 'Groningen' },
      'NL-LI': { country: 'Netherlands', name: 'Limburg' },
      'NL-NB': { country: 'Netherlands', name: 'Noord-Brabant' },
      'NL-NH': { country: 'Netherlands', name: 'Noord-Holland' },
      'NL-OV': { country: 'Netherlands', name: 'Overijssel' },
      'NL-UT': { country: 'Netherlands', name: 'Utrecht' },
      'NL-ZE': { country: 'Netherlands', name: 'Zeeland' },
      'NL-ZH': { country: 'Netherlands', name: 'Zuid-Holland' },
      
      // Belgium
      'BE-VAN': { country: 'Belgium', name: 'Antwerp' },
      'BE-BRU': { country: 'Belgium', name: 'Brussels' },
      'BE-VOV': { country: 'Belgium', name: 'East Flanders' },
      'BE-VBR': { country: 'Belgium', name: 'Flemish Brabant' },
      'BE-WHT': { country: 'Belgium', name: 'Hainaut' },
      'BE-WLG': { country: 'Belgium', name: 'Liege' },
      'BE-VLI': { country: 'Belgium', name: 'Limburg' },
      'BE-WLX': { country: 'Belgium', name: 'Luxembourg' },
      'BE-WNA': { country: 'Belgium', name: 'Namur' },
      'BE-WBR': { country: 'Belgium', name: 'Walloon Brabant' },
      'BE-VWV': { country: 'Belgium', name: 'West Flanders' },
      
      // Luxembourg
      'LU-D': { country: 'Luxembourg', name: 'Diekirch' },
      'LU-G': { country: 'Luxembourg', name: 'Grevenmacher' },
      'LU-L': { country: 'Luxembourg', name: 'Luxembourg' },
      
      // German states
      'DE-BW': { country: 'Germany', name: 'Baden-Württemberg' },
      'DE-BY': { country: 'Germany', name: 'Bavaria' },
      'DE-BE': { country: 'Germany', name: 'Berlin' },
      'DE-BB': { country: 'Germany', name: 'Brandenburg' },
      'DE-HB': { country: 'Germany', name: 'Bremen' },
      'DE-HH': { country: 'Germany', name: 'Hamburg' },
      'DE-HE': { country: 'Germany', name: 'Hesse' },
      'DE-MV': { country: 'Germany', name: 'Mecklenburg-Western Pomerania' },
      'DE-NI': { country: 'Germany', name: 'Lower Saxony' },
      'DE-NW': { country: 'Germany', name: 'North Rhine-Westphalia' },
      'DE-RP': { country: 'Germany', name: 'Rhineland-Palatinate' },
      'DE-SL': { country: 'Germany', name: 'Saarland' },
      'DE-SN': { country: 'Germany', name: 'Saxony' },
      'DE-ST': { country: 'Germany', name: 'Saxony-Anhalt' },
      'DE-SH': { country: 'Germany', name: 'Schleswig-Holstein' },
      'DE-TH': { country: 'Germany', name: 'Thuringia' }
    };

    const provinceInfo = provinceMap[provinceCode];
    if (!provinceInfo) {
      console.warn(`Unknown province code: ${provinceCode}`);
      return null;
    }

    // For Benelux provinces, use the detailed boundaries
    if (['Netherlands', 'Belgium', 'Luxembourg'].includes(provinceInfo.country)) {
      const beneluxData = await loadBeneluxBoundaries();
      const feature = beneluxData.features?.find((f: Feature) => 
        f.properties?.admin === provinceInfo.country &&
        f.properties?.name === provinceInfo.name
      );

      if (feature) {
        boundaryCache.set(cacheKey, feature);
        return feature;
      }
    }

    // For German states, try to load from Natural Earth data
    if (provinceInfo.country === 'Germany') {
      const naturalEarthData = await loadNaturalEarthBoundaries();
      const feature = naturalEarthData.features?.find((f: Feature) => 
        f.properties?.admin === 'Germany' &&
        (f.properties?.name === provinceInfo.name ||
         f.properties?.name_en === provinceInfo.name)
      );

      if (feature) {
        boundaryCache.set(cacheKey, feature);
        return feature;
      }
    }

    console.warn(`Province boundary not found: ${provinceInfo.name} in ${provinceInfo.country}`);
    return null;

  } catch (error) {
    console.error(`Error loading province boundary for ${provinceCode}:`, error);
    return null;
  }
}

/**
 * Load multiple boundaries in parallel
 */
export async function loadBoundariesBatch(codes: string[]): Promise<(Feature | null)[]> {
  const promises = codes.map(code => {
    if (code.includes('-')) {
      return loadProvinceBoundary(code);
    } else {
      return loadCountryBoundary(code);
    }
  });

  return Promise.all(promises);
}

// Clear boundary cache
export const clearBoundaryCache = (): void => {
  boundaryCache.clear()
}

// Get cache statistics
export const getBoundaryCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: boundaryCache.size,
    keys: Array.from(boundaryCache.keys())
  }
} 