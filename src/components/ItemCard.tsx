import React, { useState } from 'react';
import { Volume2, Check, Loader2 } from 'lucide-react';
import { GroceryItem, VoiceProfile } from '../types/grocery';
import { speakWithBrowserSynthesis } from '../utils/audioUtils';

interface ItemCardProps {
  item: GroceryItem;
  onToggleComplete: (id: string) => void;
  index: number;
  currentVoice?: VoiceProfile;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onToggleComplete,
  index,
  currentVoice,
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState<boolean>(false);

  const handleSpeakItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingLocal(true);
    speakWithBrowserSynthesis({
      text: item.name,
      voiceProfile: currentVoice,
      onEnd: () => setIsPlayingLocal(false),
      onError: () => setIsPlayingLocal(false),
    });
  };

  const getCategoryColor = (category: GroceryItem['category']) => {
    switch (category) {
      case 'dairy':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/50';
      case 'vegetable':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
      case 'herbs':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/50';
      case 'fruit':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      default:
        return 'bg-stone-900 text-stone-300 border-stone-800';
    }
  };

  return (
    <div
      onClick={() => onToggleComplete(item.id)}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer p-4 ${
        item.completed
          ? 'border-stone-800/70 bg-stone-950/40 opacity-60'
          : 'border-stone-800 bg-stone-900/70 hover:border-emerald-600/50 hover:bg-stone-900 shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox + details */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(item.id);
            }}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
              item.completed
                ? 'border-emerald-500 bg-emerald-500 text-stone-950'
                : 'border-stone-700 bg-stone-950 hover:border-emerald-400 text-transparent'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-500">
                #{index + 1}
              </span>
              <h3
                className={`font-semibold text-base transition-colors ${
                  item.completed
                    ? 'text-stone-500 line-through'
                    : 'text-stone-100 group-hover:text-emerald-300'
                }`}
              >
                {item.name}
              </h3>

              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getCategoryColor(
                  item.category
                )}`}
              >
                {item.category}
              </span>
            </div>

            {/* Translation & Asian Scripts */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-stone-400">
              <span className="text-emerald-400 font-medium">{item.meaning}</span>
              {item.urduScript && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-300 font-medium">
                    {item.urduScript}
                  </span>
                </>
              )}
              {item.hindiScript && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-400 font-medium">
                    {item.hindiScript}
                  </span>
                </>
              )}
            </div>

            {/* Culinary Context Note */}
            <p className="mt-2 text-xs text-stone-400 line-clamp-2">
              {item.culinaryNote}
            </p>
          </div>
        </div>

        {/* Right: Sound button for this item */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={handleSpeakItem}
            title={`Listen pronunciation of "${item.name}"`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              isPlayingLocal
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-pulse'
                : 'border-stone-800 bg-stone-950/80 text-stone-400 hover:border-emerald-600/50 hover:bg-stone-800 hover:text-emerald-300'
            }`}
          >
            {isPlayingLocal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
