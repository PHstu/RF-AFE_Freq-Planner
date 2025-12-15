import React from 'react';
import { AppState, MixerMode, FREQ_UNIT, Language } from '../types';
import { Settings2, Activity, Radio, Languages } from 'lucide-react';
import { t } from '../utils/i18n';

interface ControlPanelProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  lang: Language;
  setLang: (l: Language) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, setState, lang, setLang }) => {
  
  const updateInput = (key: keyof typeof state.input, value: number) => {
    setState(prev => ({
      ...prev,
      input: {
        ...prev.input,
        [key]: value,
        start: key === 'center' ? value - prev.input.bw / 2 : prev.input.center - value / 2,
        end: key === 'center' ? value + prev.input.bw / 2 : prev.input.center + value / 2,
      }
    }));
  };

  const updateMixer = (mixerId: 1 | 2, key: string, value: any) => {
    setState(prev => {
      const mixerKey = mixerId === 1 ? 'mixer1' : 'mixer2';
      return {
        ...prev,
        [mixerKey]: {
          ...prev[mixerKey],
          [key]: value
        }
      };
    });
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-700 h-full overflow-y-auto text-slate-100 flex-shrink-0">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Activity className="text-blue-400" />
            <h1 className="text-lg font-bold">{t('app.title', lang)}</h1>
        </div>
        <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Switch Language"
        >
            <Languages className="w-5 h-5" />
        </button>
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center">
          <Radio className="w-4 h-4 mr-2" /> {t('input.title', lang)}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">{t('input.center', lang)} ({FREQ_UNIT})</label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                min="0" max="6000" step="10"
                value={state.input.center}
                onChange={(e) => updateInput('center', Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={state.input.center}
                onChange={(e) => updateInput('center', Number(e.target.value))}
                className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">{t('input.bw', lang)} ({FREQ_UNIT})</label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                min="10" max="1000" step="10"
                value={state.input.bw}
                onChange={(e) => updateInput('bw', Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={state.input.bw}
                onChange={(e) => updateInput('bw', Number(e.target.value))}
                className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mixer 1 */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center">
          <Settings2 className="w-4 h-4 mr-2" /> {t('mixer1.title', lang)}
        </h2>
        
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">{t('mode', lang)}</label>
          <div className="flex bg-slate-800 rounded p-1">
            {Object.values(MixerMode).map(mode => (
              <button
                key={mode}
                onClick={() => updateMixer(1, 'mode', mode)}
                className={`flex-1 text-xs py-1 rounded transition-colors ${
                  state.mixer1.mode === mode 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === MixerMode.BYPASS ? t('mode.bypass', lang) : mode === MixerMode.VARIABLE ? t('mode.variable', lang) : t('mode.fixed', lang)}
              </button>
            ))}
          </div>
        </div>

        {state.mixer1.mode !== MixerMode.BYPASS && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
             <label className="text-xs text-slate-400">{t('lo.freq', lang)} ({FREQ_UNIT})</label>
             <div className="flex items-center space-x-2 mt-1">
               <input 
                 type="range" 
                 min={state.mixer1.loStart} max={state.mixer1.loEnd} step="10"
                 value={state.mixer1.loFreq}
                 onChange={(e) => updateMixer(1, 'loFreq', Number(e.target.value))}
                 className="flex-1 accent-green-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
               />
               <input
                 type="number"
                 value={state.mixer1.loFreq}
                 onChange={(e) => updateMixer(1, 'loFreq', Number(e.target.value))}
                 className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
               />
             </div>
             
             {state.mixer1.mode === MixerMode.VARIABLE && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-slate-500">{t('min', lang)}</label>
                        <input
                            type="number"
                            value={state.mixer1.loStart}
                            onChange={(e) => updateMixer(1, 'loStart', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500">{t('max', lang)}</label>
                        <input
                            type="number"
                            value={state.mixer1.loEnd}
                            onChange={(e) => updateMixer(1, 'loEnd', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                        />
                    </div>
                </div>
             )}
          </div>
        )}
      </div>

      {/* Mixer 2 */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center">
          <Settings2 className="w-4 h-4 mr-2" /> {t('mixer2.title', lang)}
        </h2>
        
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">{t('mode', lang)}</label>
          <div className="flex bg-slate-800 rounded p-1">
            {Object.values(MixerMode).map(mode => (
              <button
                key={mode}
                onClick={() => updateMixer(2, 'mode', mode)}
                className={`flex-1 text-xs py-1 rounded transition-colors ${
                  state.mixer2.mode === mode 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-400 hover:text-white'
                }`}
              >
                 {mode === MixerMode.BYPASS ? t('mode.bypass', lang) : mode === MixerMode.VARIABLE ? t('mode.variable', lang) : t('mode.fixed', lang)}
              </button>
            ))}
          </div>
        </div>

        {state.mixer2.mode !== MixerMode.BYPASS && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
             <label className="text-xs text-slate-400">{t('lo.freq', lang)} ({FREQ_UNIT})</label>
             <div className="flex items-center space-x-2 mt-1">
               <input 
                 type="range" 
                 min={state.mixer2.loStart} max={state.mixer2.loEnd} step="10"
                 value={state.mixer2.loFreq}
                 onChange={(e) => updateMixer(2, 'loFreq', Number(e.target.value))}
                 className="flex-1 accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
               />
               <input
                 type="number"
                 value={state.mixer2.loFreq}
                 onChange={(e) => updateMixer(2, 'loFreq', Number(e.target.value))}
                 className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
               />
             </div>
             {state.mixer2.mode === MixerMode.VARIABLE && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-slate-500">{t('min', lang)}</label>
                        <input
                            type="number"
                            value={state.mixer2.loStart}
                            onChange={(e) => updateMixer(2, 'loStart', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500">{t('max', lang)}</label>
                        <input
                            type="number"
                            value={state.mixer2.loEnd}
                            onChange={(e) => updateMixer(2, 'loEnd', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                        />
                    </div>
                </div>
             )}
          </div>
        )}
      </div>

      <div className="p-4 text-xs text-slate-500">
        <p>Values in {FREQ_UNIT}.</p>
        <p className="mt-2">Mixer output shows both Sum (f_in + f_lo) and Difference (|f_in - f_lo|).</p>
      </div>

    </div>
  );
};

export default ControlPanel;