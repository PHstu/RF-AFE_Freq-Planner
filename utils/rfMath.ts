import { FrequencyBand, MixerMode } from '../types';

/**
 * Creates a band from center and bandwidth
 */
export const createBand = (center: number, bw: number): FrequencyBand => {
  return {
    center,
    bw,
    start: center - bw / 2,
    end: center + bw / 2,
  };
};

/**
 * Calculates mixing products for a given input band and LO.
 * Returns the Sum band, Difference band, and the Image band (relative to input).
 */
export const calculateMixing = (input: FrequencyBand, loFreq: number, mode: MixerMode) => {
  if (mode === MixerMode.BYPASS) {
    return {
      sum: null,
      diff: input, // Pass through
      image: null,
    };
  }

  // Mixing: |Input ± LO|
  
  // 1. Difference Product (Down-conversion typically, or Up if LO is high)
  // Logic: The band flips if LO > Input, but for spectrum visualization start must be < end.
  // Band edges: |Start - LO| and |End - LO|
  const diffEdge1 = Math.abs(input.start - loFreq);
  const diffEdge2 = Math.abs(input.end - loFreq);
  
  const diff: FrequencyBand = {
    start: Math.min(diffEdge1, diffEdge2),
    end: Math.max(diffEdge1, diffEdge2),
    center: Math.abs(input.center - loFreq),
    bw: input.bw
  };

  // 2. Sum Product (Up-conversion)
  const sum: FrequencyBand = {
    start: input.start + loFreq,
    end: input.end + loFreq,
    center: input.center + loFreq,
    bw: input.bw
  };

  // 3. Image Frequency Band
  // The image is the band that WOULD mix to the same IF as the current input.
  // IF = |Input - LO|
  // Image satisfies |Image - LO| = IF
  // Usually Image = 2*LO - Input  (if High side injection)
  // or Image = Input - 2*LO (if Input > 2*LO)
  // or Image = 2*LO + Input (if mixing to same IF on other side)
  
  // We'll calculate the primary image (High/Low side injection mirror)
  // Image Center = 2 * LO - InputCenter
  const imgCenter = 2 * loFreq - input.center;
  // If imgCenter is negative, it mirrors back, but physical image is usually treated at absolute value for planning
  const imageBand: FrequencyBand = createBand(Math.abs(imgCenter), input.bw);

  return { sum, diff, image: imageBand };
};

/**
 * Helper to determine graph domain bounds
 */
export const calculateDomain = (bands: (FrequencyBand | null)[]) => {
  let min = Infinity;
  let max = -Infinity;

  bands.forEach(b => {
    if (b) {
      if (b.start < min) min = b.start;
      if (b.end > max) max = b.end;
    }
  });

  if (min === Infinity) return { min: 0, max: 1000 };

  // Add 10% padding
  const padding = (max - min) * 0.1;
  // Ensure we start at 0 if min is close to 0
  const finalMin = Math.max(0, min - padding); 
  const finalMax = max + padding;

  return { min: finalMin, max: finalMax };
};

/**
 * Generates "nice" tick values for an axis between min and max
 */
export const getNiceTicks = (min: number, max: number, maxTicks = 10): number[] => {
  const range = max - min;
  if (range <= 0) return [min];
  
  // Calculate rough step size
  const roughStep = range / (maxTicks - 1);
  // Normalize to 1.0
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / Math.pow(10, exponent);
  
  // Round to 1, 2, or 5
  let niceFraction;
  if (fraction < 1.5) niceFraction = 1;
  else if (fraction < 3) niceFraction = 2;
  else if (fraction < 7) niceFraction = 5;
  else niceFraction = 10;
  
  const step = niceFraction * Math.pow(10, exponent);
  
  // Generate ticks
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) {
    ticks.push(Number(t.toFixed(2))); // Prevent floating point ugliness
  }
  return ticks;
};