import React, { useState } from 'react';
import { Edit3, RotateCcw, Plus, Check } from 'lucide-react';
import { USER_EXACT_SCRIPT } from '../data/defaultScript';

interface ScriptEditorProps {
  script: string;
  onChangeScript: (newScript: string) => void;
  onResetOriginal: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onChangeScript,
  onResetOriginal,
}) => {
  const [newItem, setNewItem] = useState<string>('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const updated = script.trim() + '\n' + newItem.trim();
    onChangeScript(updated);
    setNewItem('');
  };

  const linesCount = script
    .split('\n')
    .filter((l) => l.trim().length > 0).length;

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          <Edit3 className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-wide text-stone-200 uppercase">
            Grocery Script Text
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-stone-400">
            {linesCount} items
          </span>
          <button
            type="button"
            onClick={onResetOriginal}
            className="inline-flex items-center space-x-1 rounded-xl bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
            title="Reset to User's Original Script"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Script</span>
          </button>
        </div>
      </div>

      <div>
        <textarea
          rows={8}
          value={script}
          onChange={(e) => onChangeScript(e.target.value)}
          className="w-full rounded-2xl border border-stone-800 bg-stone-950 p-4 font-mono text-sm leading-relaxed text-stone-100 placeholder-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none shadow-inner"
          placeholder="Enter one grocery item per line..."
        />
      </div>

      {/* Quick Add Extra Item */}
      <form onSubmit={handleAddItem} className="flex items-center space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add extra item (e.g. Pyaz 1 kg, Adrak...)"
          className="flex-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newItem.trim()}
          className="inline-flex items-center space-x-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-stone-950 hover:bg-emerald-500 disabled:opacity-40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
