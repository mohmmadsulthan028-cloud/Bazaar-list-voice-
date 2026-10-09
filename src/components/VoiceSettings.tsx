import React from 'react';
import { VoicePersona, VoiceStylePreset } from '../types/grocery';
import { VOICE_STYLE_PRESETS } from '../data/defaultScript';
import { UserCheck, Sparkles, Sliders, Volume2 } from 'lucide-react';

interface VoiceSettingsProps {
  selectedVoice: VoicePersona;
  onSelectVoice: (v: VoicePersona) => void;
  selectedStyle: VoiceStylePreset;
  onSelectStyle: (s: VoiceStylePreset) => void;
  customStylePrompt: string;
  onChangeCustomStyle: (prompt: string) => void;
}

const VOICE_OPTIONS: { id: VoicePersona; name: string; tag: string; gender: string; desc: string }[] = [
  {
    id: 'Kore',
    name: 'Kore',
    tag: 'Warm & Natural',
    gender: 'Female',
    desc: 'Clear, comforting tone ideal for everyday dictation.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    tag: 'Crisp & Lively',
    gender: 'Male',
    desc: 'Energetic and upbeat, like an active market vendor.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    tag: 'Deep & Resonant',
    gender: 'Male',
    desc: 'Commanding, deep voice with strong clarity.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    tag: 'Brisk & Articulate',
    gender: 'Female',
    desc: 'Speedy, sharp, efficient pronunciation.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    tag: 'Calm & Grounded',
    gender: 'Male',
    desc: 'Steady, deliberate pacing with serene resonance.',
  },
];

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  selectedVoice,
  onSelectVoice,
  selectedStyle,
  onSelectStyle,
  customStylePrompt,
  onChangeCustomStyle,
}) => {
  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-stone-200 uppercase">
            Voice Persona & Reading Style
          </h2>
        </div>
        <span className="rounded-full bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
          Gemini 3.8 Flash TTS
        </span>
      </div>

      {/* Voice Personas */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span>AI Voice Speaker</span>
          <span className="text-[11px] text-stone-500 font-normal">24kHz Studio Audio</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {VOICE_OPTIONS.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVoice(v.id)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 text-stone-100 shadow-md ring-1 ring-emerald-500/50'
                    : 'border-stone-800/90 bg-stone-950/50 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-stone-200">{v.name}</span>
                  <span className="text-[10px] text-stone-500 uppercase">{v.gender}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium mt-0.5">
                  {v.tag}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                  {v.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading Style Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300">
          Delivery Style & Cadence
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {VOICE_STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectStyle(preset);
                  onChangeCustomStyle(preset.instruction);
                }}
                className={`flex items-start space-x-3 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500/80 bg-stone-950 text-stone-100 shadow-sm ring-1 ring-emerald-500/40'
                    : 'border-stone-800/80 bg-stone-950/40 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-xl border ${
                  isSelected ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-stone-800 bg-stone-900 text-stone-400'
                }`}>
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-stone-200">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speech Prompt Directive (Advanced) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-400 font-medium">TTS Direction Prompt</span>
          <span className="text-[11px] text-stone-500">Fine-tune synthesis styling</span>
        </div>
        <textarea
          rows={2}
          value={customStylePrompt}
          onChange={(e) => onChangeCustomStyle(e.target.value)}
          placeholder="Enter natural delivery instructions for speech generation..."
          className="w-full rounded-2xl border border-stone-800 bg-stone-950 p-3 text-xs text-stone-200 placeholder-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
        />
      </div>
    </div>
  );
};
