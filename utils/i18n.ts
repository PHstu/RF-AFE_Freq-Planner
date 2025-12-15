import { Language } from '../types';

export const t = (key: string, lang: Language): string => {
  const dict: Record<string, { en: string; zh: string }> = {
    'app.title': { en: 'RF Frequency Planner', zh: '射频频率规划工具' },
    'input.title': { en: 'Input Signal', zh: '输入信号' },
    'input.center': { en: 'Center Freq', zh: '中心频率' },
    'input.bw': { en: 'Bandwidth', zh: '带宽' },
    
    'mixer1.title': { en: 'Mixer 1', zh: '混频器 1' },
    'mixer2.title': { en: 'Mixer 2', zh: '混频器 2' },
    'mode': { en: 'Mode', zh: '模式' },
    'mode.bypass': { en: 'Thru', zh: '直通' },
    'mode.fixed': { en: 'Fix', zh: '固定' },
    'mode.variable': { en: 'Var', zh: '可变' },
    
    'lo.freq': { en: 'LO Freq', zh: '本振频率' },
    'min': { en: 'Min', zh: '最小' },
    'max': { en: 'Max', zh: '最大' },
    
    'chart.title': { en: 'Frequency Domain View', zh: '频域视图' },
    'chart.desc': { en: 'Real-time spectrum analysis of up/down conversion.', zh: '上下变频实时频谱分析。' },
    
    'stage1': { en: 'Stage 1: Input & Image', zh: '第一级：输入与镜像' },
    'stage2': { en: 'Stage 2: Mixer 1 Output', zh: '第二级：混频器1输出' },
    'stage3': { en: 'Stage 3: Mixer 2 Output', zh: '第三级：混频器2输出' },
    
    'legend.input': { en: 'Input', zh: '输入' },
    'legend.image': { en: 'Image Warning', zh: '镜像风险' },
    'legend.if': { en: 'Difference (IF)', zh: '差频 (IF)' },
    'legend.sum': { en: 'Sum', zh: '和频' },
    'legend.out': { en: 'Output', zh: '输出' },
    'legend.bypass': { en: 'Bypass', zh: '直通' },
    
    'marker.lo1': { en: 'LO1', zh: '本振1' },
    'marker.lo2': { en: 'LO2', zh: '本振2' },
  };

  return dict[key]?.[lang] || key;
};