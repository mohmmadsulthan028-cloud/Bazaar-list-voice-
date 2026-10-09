import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Sparkles,
  Loader2,
  Mic,
  Share2,
  Check,
  Radio,
} from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { downloadAudioFile } from '../utils/audioUtils';
import { VoiceProfile } from '../types/grocery';

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  onPlayBrowserSynthesis: () => void;
  isBrowserSpeaking: boolean;
  voiceProfile: VoiceProfile;
  scriptSnippet: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  isLoading,
  onGenerate,
  onPlayBrowserSynthesis,
  isBrowserSpeaking,
  voiceProfile,
  scriptSnippet,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync audio source
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      onGenerate();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (!isLooping) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    downloadAudioFile(audioUrl, `grocery-voice-${voiceProfile.id}.wav`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isVisualizerActive = isPlaying || isBrowserSpeaking;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-6 shadow-2xl text-stone-100">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        loop={isLooping}
        preload="auto"
      />

      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-3 w-3 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isVisualizerActive ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isVisualizerActive ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
            />
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
            {isBrowserSpeaking
              ? 'Local Speech Engine Active'
              : isPlaying
              ? 'Playing Voice Audio'
              : audioUrl
              ? 'Full Audio Ready'
              : 'Voice Audio'}
          </span>
          <span className="text-stone-600">•</span>
          <span className="text-xs text-stone-400">
            Voice Style: <strong className="text-stone-200">{voiceProfile.name}</strong> ({voiceProfile.title})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {audioUrl && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-950 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900 hover:text-emerald-100 transition-colors shadow-sm"
              title="Download 24kHz Studio WAV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download WAV</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1 rounded-full bg-stone-800 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-700 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sound Waveform Visualizer */}
      <div className="my-2">
        <WaveformVisualizer isPlaying={isVisualizerActive} accentColor="#10b981" />
      </div>

      {/* Timeline scrubber */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-stone-500">
            {duration > 0 ? formatTime(duration) : audioUrl ? '0:08' : '--:--'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={duration || 10}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          disabled={!audioUrl}
          className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
        />
      </div>

      {/* Controls Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        {/* Speed Selector */}
        <div className="flex items-center space-x-1 rounded-2xl bg-stone-950 p-1 border border-stone-800">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                playbackRate === rate
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center: Replay, Hero Play/Pause, Loop */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRestart}
            disabled={!audioUrl}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white disabled:opacity-40 transition-colors"
            title="Replay from beginning"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Large Hero Play / Generate Button */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
              isLoading
                ? 'bg-stone-800 cursor-not-allowed text-stone-500'
                : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-stone-950 hover:scale-105 active:scale-95 hover:shadow-emerald-500/25'
            }`}
            title={isPlaying ? 'Pause' : audioUrl ? 'Play audio' : 'Generate voice audio'}
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7 fill-stone-950 text-stone-950" />
            ) : (
              <Play className="h-7 w-7 fill-stone-950 text-stone-950 ml-1" />
            )}
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isLooping
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
            }`}
            title={isLooping ? 'Loop enabled' : 'Loop disabled'}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Volume & Regenerate */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-stone-400 hover:text-stone-200 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-stone-950 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{audioUrl ? 'Regenerate Audio' : 'Generate Full Voice'}</span>
          </button>
        </div>
      </div>

      {/* Fallback Browser Speech Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-stone-950/70 p-2.5 border border-stone-800/70 text-xs">
        <div className="flex items-center space-x-2 text-stone-400">
          <Mic className="h-3.5 w-3.5 text-amber-400" />
          <span>Local Browser Speech alternative:</span>
        </div>
        <button
          onClick={onPlayBrowserSynthesis}
          className={`font-semibold transition-colors ${
            isBrowserSpeaking
              ? 'text-amber-400 underline'
              : 'text-stone-300 hover:text-amber-300'
          }`}
        >
          {isBrowserSpeaking ? '■ Stop Browser Voice' : `▶ Play via Browser (${voiceProfile.name})`}
        </button>
      </div>
    </div>
  );
};
