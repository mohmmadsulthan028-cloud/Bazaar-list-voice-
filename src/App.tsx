/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { USER_EXACT_SCRIPT, INITIAL_GROCERY_ITEMS } from './data/defaultScript';
import { VOICE_PROFILES } from './data/voiceProfiles';
import { GroceryItem, VoiceProfile } from './types/grocery';
import { parseScriptToItems, speakWithBrowserSynthesis } from './utils/audioUtils';
import { VoicePreviewPlayer } from './components/VoicePreviewPlayer';
import { AudioPlayer } from './components/AudioPlayer';
import { ItemCard } from './components/ItemCard';
import { ScriptEditor } from './components/ScriptEditor';

export default function App() {
  const [script, setScript] = useState<string>(USER_EXACT_SCRIPT);
  const [items, setItems] = useState<GroceryItem[]>(INITIAL_GROCERY_ITEMS);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_PROFILES[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isBrowserSpeaking, setIsBrowserSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voices' | 'checklist' | 'script'>('voices');

  const selectedVoice =
    VOICE_PROFILES.find((v) => v.id === selectedVoiceId) || VOICE_PROFILES[0];

  // Update items whenever script is modified
  useEffect(() => {
    const parsed = parseScriptToItems(script);
    setItems((prev) => {
      // Preserve completed flags if IDs match
      const map = new Map(prev.map((i) => [i.name.toLowerCase().trim(), i.completed]));
      return parsed.map((item) => ({
        ...item,
        completed: map.get(item.name.toLowerCase().trim()) || false,
      }));
    });
  }, [script]);

  // Generate full voice audio for the script with the selected voice profile
  const handleGenerateFullAudio = async (voiceToUse?: VoiceProfile) => {
    const voice = voiceToUse || selectedVoice;
    setIsGenerating(true);
    setErrorMessage(null);

    // Cancel any running browser synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsBrowserSpeaking(false);
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voiceName: voice.geminiVoice,
          style: voice.styleInstruction,
          isPreview: false,
          voiceId: voice.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.audioData) {
        setAudioUrl(data.audioData);
      } else {
        // Show informative message and fallback
        const err = data.error || 'Speech generation encountered an issue.';
        setErrorMessage(
          `${err} Using browser audio synthesis as fallback for instant playback.`
        );
        handlePlayBrowserSynthesis(voice);
      }
    } catch (err: any) {
      console.warn('Full TTS generation failed, falling back to browser synthesis:', err);
      setErrorMessage(
        'Could not reach speech synthesis server. Playing via browser synthesis.'
      );
      handlePlayBrowserSynthesis(voice);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayBrowserSynthesis = (voiceToUse?: VoiceProfile) => {
    const voice = voiceToUse || selectedVoice;

    if (isBrowserSpeaking) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsBrowserSpeaking(false);
      return;
    }

    setIsBrowserSpeaking(true);
    speakWithBrowserSynthesis({
      text: script,
      voiceProfile: voice,
      onEnd: () => setIsBrowserSpeaking(false),
      onError: () => setIsBrowserSpeaking(false),
    });
  };

  const handleToggleItemComplete = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-stone-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-stone-950 shadow-md shadow-emerald-500/20 font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-stone-100">
                  BazaarVoice
                </h1>
                <span className="rounded-md bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400 tracking-wide uppercase">
                  Voice Synthesizer
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Choose Voice Style • Listen Preview • Generate Studio Audio
              </p>
            </div>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center space-x-1 rounded-2xl bg-stone-900 p-1 border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('voices')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'voices'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Voice Styles & Previews
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              List ({completedCount}/{items.length})
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'script'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Script
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner with script summary */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900/90 to-emerald-950/40 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Script: 8 Subcontinental Grocery Items</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
                Spoken Voice Audio for Grocery List
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Featuring authentic subcontinental items: <strong className="text-emerald-400">Dahi 1 kg</strong>,{' '}
                <strong className="text-emerald-400">Tamate</strong>, <strong className="text-emerald-400">Aloo</strong>,{' '}
                <strong className="text-emerald-400">Seem ki phalli</strong>, <strong className="text-emerald-400">Bhendi</strong>,{' '}
                <strong className="text-emerald-400">Pudina</strong>, <strong className="text-emerald-400">Kotmeer</strong>, and{' '}
                <strong className="text-emerald-400">Lemons</strong>.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <div className="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-2.5 text-center">
                <div className="text-xs text-stone-500 font-mono">SELECTED VOICE</div>
                <div className="text-sm font-bold text-emerald-400">{selectedVoice.name}</div>
                <div className="text-[10px] text-stone-400">{selectedVoice.categoryLabel}</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-2.5 text-center">
                <div className="text-xs text-stone-500 font-mono">CHECKLIST</div>
                <div className="text-sm font-bold text-stone-200">
                  {completedCount} / {items.length}
                </div>
                <div className="text-[10px] text-stone-400">Items bought</div>
              </div>
            </div>
          </div>
        </section>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="rounded-2xl border border-amber-800/60 bg-amber-950/40 p-4 text-xs text-amber-200 flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Master Audio Player (Always visible or updated once generated) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>Full Script Spoken Audio</span>
            </h3>
            {audioUrl && (
              <span className="text-xs text-emerald-400 font-mono">
                ✓ Generated with {selectedVoice.name}
              </span>
            )}
          </div>

          <AudioPlayer
            audioUrl={audioUrl}
            isLoading={isGenerating}
            onGenerate={() => handleGenerateFullAudio()}
            onPlayBrowserSynthesis={() => handlePlayBrowserSynthesis()}
            isBrowserSpeaking={isBrowserSpeaking}
            voiceProfile={selectedVoice}
            scriptSnippet={script}
          />
        </section>

        {/* Tab 1: Voice Style Selector & Previews Component */}
        {activeTab === 'voices' && (
          <section className="space-y-4">
            <VoicePreviewPlayer
              voices={VOICE_PROFILES}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={(id) => setSelectedVoiceId(id)}
              onConfirmGeneration={(voice) => handleGenerateFullAudio(voice)}
              isGeneratingFullAudio={isGenerating}
            />
          </section>
        )}

        {/* Tab 2: Interactive Grocery Checklist & Item Pronunciations */}
        {activeTab === 'checklist' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Grocery Checklist & Pronunciations</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Click on any item to hear its individual pronunciation or toggle as purchased.
                </p>
              </div>

              <div className="text-xs font-semibold text-stone-400">
                {completedCount === items.length && items.length > 0 ? (
                  <span className="text-emerald-400">🎉 All items collected!</span>
                ) : (
                  <span>
                    {items.length - completedCount} items remaining in cart
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onToggleComplete={handleToggleItemComplete}
                  currentVoice={selectedVoice}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: Script Editor */}
        {activeTab === 'script' && (
          <section className="space-y-4">
            <ScriptEditor
              script={script}
              onChangeScript={(s) => setScript(s)}
              onResetOriginal={() => setScript(USER_EXACT_SCRIPT)}
            />
          </section>
        )}

        {/* Sub-grid of Checklist items if on voices tab so user also sees the grocery context */}
        {activeTab === 'voices' && (
          <section className="mt-8 pt-6 border-t border-stone-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300">
                  Script Item Breakdown ({items.length} items)
                </h3>
                <p className="text-xs text-stone-500">
                  Listen to individual item pronunciations or check them off as you shop.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('checklist')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Full Checklist →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {items.map((item, idx) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onToggleComplete={handleToggleItemComplete}
                  currentVoice={selectedVoice}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <p>BazaarVoice • High-fidelity Neural Speech for Grocery Lists & Mandi Errands</p>
      </footer>
    </div>
  );
}
