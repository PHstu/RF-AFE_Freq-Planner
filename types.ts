export enum MixerMode {
  BYPASS = 'BYPASS',
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE'
}

export type Language = 'en' | 'zh';

export interface FrequencyBand {
  start: number;
  end: number;
  center: number;
  bw: number;
}

export interface MixerConfig {
  id: number;
  mode: MixerMode;
  loFreq: number; // Current LO
  loStart: number; // For variable slider range
  loEnd: number;   // For variable slider range
}

export interface AppState {
  input: FrequencyBand;
  mixer1: MixerConfig;
  mixer2: MixerConfig;
}

export const FREQ_UNIT = "MHz";