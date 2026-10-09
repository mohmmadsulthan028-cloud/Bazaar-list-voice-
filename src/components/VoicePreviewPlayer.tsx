import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Check,
  Sparkles,
  Loader2,
  User,
  Radio,
  Baby,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { VoiceProfile } from '../types/grocery';
import { speakWithBrowserSynthesis } from '../utils/audioUtils';

interface VoicePreviewPlayerProps {
  voices: VoiceProfile[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onConfirmGeneration: (voice: VoiceProfile) => void;
  isGeneratingFullAudio: boolean;
}

export const VoicePreviewPlayer: React.FC<VoicePreviewPlayerProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onConfirmGeneration,
  isGeneratingFullAudio,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [previewAudios, setPreviewAudios] = useState<Record<string, string>>({});
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  // Stop any playing audio when switching or unmounting
  useEffect(() => {
    return () => {
      Object.values(audioElementsRef.current).forEach((audio) => {
        audio.pause();
      });
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPreview = async (voice: VoiceProfile) => {
    // If already playing this voice, pause it
    if (playingVoiceId === voice.id) {
      const audio = audioElementsRef.current[voice.id];
      if (audio) {
        audio.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    // Stop all other audio
    Object.values(audioElementsRef.current).forEach((a) => a.pause());
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // If we already have the audio data URL for this voice
    if (previewAudios[voice.id]) {
      playCachedAudio(voice.id, previewAudios[voice.id]);
      return;
    }

    // Otherwise, fetch preview from server
    setLoadingVoiceId(voice.id);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voice.previewSample,
          voiceName: voice.geminiVoice,
          style: voice.styleInstruction,
          isPreview: true,
          voiceId: voice.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.audioData) {
        setPreviewAudios((prev) => ({ ...prev, [voice.id]: data.audioData }));
        playCachedAudio(voice.id, data.audioData);
      } else {
        // Fallback to browser synthesis
        fallbackToBrowserSpeech(voice);
      }
    } catch (err) {
      console.warn('Preview TTS server fetch failed, using browser synthesis:', err);
      fallbackToBrowserSpeech(voice);
    } finally {
      setLoadingVoiceId(null);
    }
  };

  const playCachedAudio = (voiceId: string, src: string) => {
    let audio = audioElementsRef.current[voiceId];
    if (!audio) {
      audio = new Audio(src);
      audioElementsRef.current[voiceId] = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setPlaybackProgress((prev) => ({ ...prev, [voiceId]: progress }));
        }
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        setPlaybackProgress((prev) => ({ ...prev, [voiceId]: 0 }));
      };

      audio.onerror = () => {
        setPlayingVoiceId(null);
      };
    } else {
      audio.src = src;
      audio.currentTime = 0;
    }

    setPlayingVoiceId(voiceId);
    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      setPlayingVoiceId(null);
    });
  };

  const fallbackToBrowserSpeech = (voice: VoiceProfile) => {
    setPlayingVoiceId(voice.id);
    speakWithBrowserSynthesis({
      text: voice.previewSample,
      voiceProfile: voice,
      onEnd: () => {
        setPlayingVoiceId(null);
        setPlaybackProgress((prev) => ({ ...prev, [voice.id]: 0 }));
      },
      onError: () => {
        setPlayingVoiceId(null);
      },
    });
  };

  const getCategoryIcon = (category: VoiceProfile['category']) => {
    switch (category) {
      case 'female':
        return <User className="h-4 w-4 text-pink-400" />;
      case 'male':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'child':
        return <Baby className="h-4 w-4 text-amber-400" />;
      case 'regional':
        return <Compass className="h-4 w-4 text-emerald-400" />;
      default:
        return <Radio className="h-4 w-4 text-stone-400" />;
    }
  };

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-stone-100 tracking-tight">
              Voice Style Selector & Preview Player
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Listen to a preview of each voice style below before confirming audio generation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-800/60">
            {voices.length} Styles Available
          </span>
        </div>
      </div>

      {/* Grid of Voice Preview Player Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const isPlayingThis = playingVoiceId === voice.id;
          const isLoadingThis = loadingVoiceId === voice.id;
          const progress = playbackProgress[voice.id] || 0;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-stone-900 shadow-lg ring-1 ring-emerald-500/50'
                  : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900/50'
              }`}
            >
              {/* Top Row: Category badge, Voice Title, Radio Selection */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-stone-800/90 border border-stone-700/60`}
                  >
                    {getCategoryIcon(voice.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-stone-100">
                        {voice.name}
                      </h3>
                      <span className="rounded-md bg-stone-800/90 px-1.5 py-0.5 text-[10px] font-medium text-stone-300">
                        {voice.categoryLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block">
                      {voice.title}
                    </span>
                  </div>
                </div>

                {/* Selection Radio Indicator */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500 text-stone-950'
                      : 'border-stone-700 bg-stone-900 text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-stone-400 leading-relaxed">
                {voice.description}
              </p>

              {/* Preview Audio Player Card Bar */}
              <div className="mt-3 rounded-xl border border-stone-800/80 bg-stone-950/80 p-2.5">
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                  <span className="font-mono text-[10px] uppercase text-stone-500">
                    Sample Audio Snippet:
                  </span>
                  {isPlayingThis && (
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[10px]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Playing Preview</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-300 italic mb-2 line-clamp-1">
                  "{voice.previewSample}"
                </p>

                {/* Scrubber progress bar */}
                <div className="relative w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-100 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Player button and Select action */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(voice);
                    }}
                    disabled={isLoadingThis}
                    className={`inline-flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isPlayingThis
                        ? 'bg-emerald-500 text-stone-950 shadow-md'
                        : 'bg-stone-800 text-stone-200 hover:bg-emerald-600 hover:text-stone-950'
                    }`}
                  >
                    {isLoadingThis ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : isPlayingThis ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" />
                        <span>Pause Preview</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Listen Preview</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVoice(voice.id);
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      isSelected
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Use this style'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation & Generation Action Banner */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-stone-950 p-4 border border-emerald-900/40">
        <div className="flex items-center space-x-3 text-stone-200">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400">Selected Voice Style:</div>
            <div className="text-sm font-bold text-stone-100 flex items-center space-x-2">
              <span>{selectedVoice.name} ({selectedVoice.title})</span>
              <span className="rounded bg-emerald-900/80 px-1.5 py-0.5 text-[10px] text-emerald-300 font-mono">
                {selectedVoice.geminiVoice}
              </span>
            </div>
          </div>
        </div>

        {/* Big Confirmation Button */}
        <button
          type="button"
          onClick={() => onConfirmGeneration(selectedVoice)}
          disabled={isGeneratingFullAudio}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-xl transition-all duration-200 hover:scale-102 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isGeneratingFullAudio ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
              <span>Generating Spoken Audio...</span>
            </>
          ) : (
            <>
              <span>Confirm & Generate Full Voice Audio</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
