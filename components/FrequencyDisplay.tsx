import React, { useMemo } from 'react';
import { AppState, FREQ_UNIT, MixerMode, Language } from '../types';
import { calculateMixing, calculateDomain, getNiceTicks } from '../utils/rfMath';
import { t } from '../utils/i18n';

interface Props {
  state: AppState;
  lang: Language;
}

interface ChartItem {
  start: number;
  end: number;
  center: number;
  name: string;
  fill: string;
  stroke: string;
  opacity?: number;
}

interface MarkerItem {
  x: number;
  label: string;
  color: string;
}

const SpectrumRow = ({ 
  title, 
  data, 
  domain, 
  markers = []
}: { 
  title: string, 
  data: ChartItem[], 
  domain: [number, number], 
  markers?: MarkerItem[]
}) => {
  const [min, max] = domain;
  const range = max - min || 1;
  
  // Generate ticks
  const ticks = useMemo(() => getNiceTicks(min, max, 8), [min, max]);

  // Coordinate mapper: Value -> Percentage (0-100)
  const getX = (val: number) => ((val - min) / range) * 100;

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-lg flex flex-col w-full mb-6">
      <h3 className="text-slate-300 text-sm font-semibold mb-4 px-2 bg-slate-800/80 rounded backdrop-blur-sm">
        {title}
      </h3>
      
      {/* Chart Container */}
      <div className="relative h-32 w-full select-none">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid Lines */}
          {ticks.map((tick) => (
            <g key={`grid-${tick}`}>
              <line 
                x1={`${getX(tick)}%`} 
                x2={`${getX(tick)}%`} 
                y1="0" 
                y2="100%" 
                stroke="#334155" 
                strokeDasharray="3 3" 
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Bands */}
          {data.map((item, idx) => {
            const x1 = getX(item.start);
            const x2 = getX(item.end);
            const width = Math.max(0.5, x2 - x1); // Ensure visible even if narrow
            
            return (
              <g key={idx}>
                {/* Rect */}
                <rect
                  x={`${x1}%`}
                  y="20%"
                  width={`${width}%`}
                  height="60%"
                  fill={item.fill}
                  fillOpacity={item.opacity || 0.6}
                  stroke={item.stroke}
                  strokeWidth="2"
                  rx="4"
                />
                {/* Center Frequency Label */}
                <text
                  x={`${x1 + width / 2}%`}
                  y="50%"
                  dy="5"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md"
                >
                  {Math.round(item.center)}
                </text>
                {/* Band Name Label */}
                <text
                  x={`${x1 + width / 2}%`}
                  y="15%"
                  textAnchor="middle"
                  fill={item.stroke}
                  fontSize="10"
                  className="pointer-events-none"
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          {/* Markers (LO) */}
          {markers.map((m, idx) => (
             <g key={`marker-${idx}`}>
                <line 
                  x1={`${getX(m.x)}%`} 
                  x2={`${getX(m.x)}%`} 
                  y1="0" 
                  y2="100%" 
                  stroke={m.color} 
                  strokeWidth="2" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={`${getX(m.x)}%`} 
                  y="0" 
                  dy="-5" 
                  textAnchor="middle" 
                  fill={m.color} 
                  fontSize="10"
                  fontWeight="bold"
                >
                  {m.label}
                </text>
             </g>
          ))}
          
          {/* Bottom Axis Line */}
          <line x1="0" x2="100%" y1="100%" y2="100%" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Tick Labels */}
          {ticks.map((tick) => (
             <text 
                key={`label-${tick}`}
                x={`${getX(tick)}%`} 
                y="100%" 
                dy="15" 
                textAnchor="middle" 
                fill="#94a3b8" 
                fontSize="10"
             >
                {tick}
             </text>
          ))}
        </svg>
      </div>
      {/* Spacer for tick labels */}
      <div className="h-4"></div>
    </div>
  );
};

const FrequencyDisplay: React.FC<Props> = ({ state, lang }) => {
  const { input, mixer1, mixer2 } = state;

  // 1. Calculate Mixer 1 Output
  const m1Result = useMemo(() => calculateMixing(input, mixer1.loFreq, mixer1.mode), [input, mixer1]);
  
  // 2. Calculate Mixer 2 Output
  const inputForM2 = m1Result.diff;
  const m2Result = useMemo(() => calculateMixing(inputForM2, mixer2.loFreq, mixer2.mode), [inputForM2, mixer2]);

  // 3. Determine Axis Domain
  const allBands = [
    input,
    m1Result.sum, m1Result.diff, m1Result.image,
    m2Result.sum, m2Result.diff, m2Result.image
  ];
  const { min, max } = calculateDomain(allBands);
  const domain: [number, number] = [min, max];

  // 4. Prepare Data for Charts

  // Chart 1: Input + Potential Image (relative to M1)
  const dataInput: ChartItem[] = [
    { ...input, name: t('legend.input', lang), fill: '#3b82f6', stroke: '#60a5fa' },
  ];
  if (m1Result.image && mixer1.mode !== MixerMode.BYPASS) {
      dataInput.push({ 
          ...m1Result.image, 
          name: t('legend.image', lang), 
          fill: '#ef4444', 
          stroke: '#f87171', 
          opacity: 0.2 // Ghost 
      });
  }

  // Chart 2: Mixer 1 Output
  const dataM1: ChartItem[] = [];
  if (mixer1.mode === MixerMode.BYPASS) {
      dataM1.push({ ...m1Result.diff, name: t('legend.bypass', lang), fill: '#3b82f6', stroke: '#60a5fa', opacity: 0.4 });
  } else {
      if (m1Result.diff) dataM1.push({ ...m1Result.diff, name: t('legend.if', lang), fill: '#10b981', stroke: '#34d399' });
      if (m1Result.sum) dataM1.push({ ...m1Result.sum, name: t('legend.sum', lang), fill: '#8b5cf6', stroke: '#a78bfa', opacity: 0.5 });
  }

  // Chart 3: Mixer 2 Output
  const dataM2: ChartItem[] = [];
  if (mixer2.mode === MixerMode.BYPASS) {
      dataM2.push({ ...m2Result.diff, name: t('legend.bypass', lang), fill: '#10b981', stroke: '#34d399', opacity: 0.4 });
  } else {
      if (m2Result.diff) dataM2.push({ ...m2Result.diff, name: t('legend.out', lang), fill: '#f59e0b', stroke: '#fbbf24' });
      if (m2Result.sum) dataM2.push({ ...m2Result.sum, name: t('legend.sum', lang), fill: '#d946ef', stroke: '#e879f9', opacity: 0.5 });
  }

  // Markers
  const markersM1: MarkerItem[] = mixer1.mode !== MixerMode.BYPASS ? [{ x: mixer1.loFreq, label: t('marker.lo1', lang), color: '#4ade80' }] : [];
  const markersM2: MarkerItem[] = mixer2.mode !== MixerMode.BYPASS ? [{ x: mixer2.loFreq, label: t('marker.lo2', lang), color: '#f472b6' }] : [];


  return (
    <div className="flex-1 p-6 bg-slate-950 overflow-y-auto flex flex-col">
      
      {/* Header Info */}
      <div className="flex justify-between items-end mb-6">
         <div>
            <h2 className="text-2xl font-bold text-white">{t('chart.title', lang)}</h2>
            <p className="text-slate-400 text-sm">{t('chart.desc', lang)}</p>
         </div>
      </div>

      {/* Row 1: Input */}
      <SpectrumRow 
        title={t('stage1', lang)}
        data={dataInput} 
        domain={domain} 
        markers={markersM1}
      />

      {/* Connection Graphic */}
      <div className="pl-8 -my-2">
         <div className="h-6 border-l-2 border-dashed border-slate-700"></div>
      </div>

      {/* Row 2: Mixer 1 */}
      <SpectrumRow 
        title={t('stage2', lang)} 
        data={dataM1} 
        domain={domain}
        markers={markersM2} 
      />

      {/* Connection Graphic */}
      <div className="pl-8 -my-2">
         <div className="h-6 border-l-2 border-dashed border-slate-700"></div>
      </div>

      {/* Row 3: Mixer 2 */}
      <SpectrumRow 
        title={t('stage3', lang)} 
        data={dataM2} 
        domain={domain} 
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-auto pt-4 text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
         <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded mr-2"></span> {t('legend.input', lang)}</div>
         <div className="flex items-center"><span className="w-3 h-3 bg-red-500/50 rounded mr-2"></span> {t('legend.image', lang)}</div>
         <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-2"></span> {t('legend.if', lang)}</div>
         <div className="flex items-center"><span className="w-3 h-3 bg-purple-500/50 rounded mr-2"></span> {t('legend.sum', lang)}</div>
         <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded mr-2"></span> {t('legend.out', lang)}</div>
      </div>

    </div>
  );
};

export default FrequencyDisplay;