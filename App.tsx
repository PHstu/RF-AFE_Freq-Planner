import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import FrequencyDisplay from './components/FrequencyDisplay';
import { AppState, MixerMode, Language } from './types';
import { createBand } from './utils/rfMath';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  
  // Initial State
  const [state, setState] = useState<AppState>({
    input: createBand(1000, 100), // Center 1000 MHz, 100 MHz BW
    mixer1: {
      id: 1,
      mode: MixerMode.FIXED,
      loFreq: 800,
      loStart: 100,
      loEnd: 3000
    },
    mixer2: {
      id: 2,
      mode: MixerMode.BYPASS,
      loFreq: 200,
      loStart: 10,
      loEnd: 1000
    }
  });

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <ControlPanel state={state} setState={setState} lang={lang} setLang={setLang} />
      <FrequencyDisplay state={state} lang={lang} />
    </div>
  );
};

export default App;