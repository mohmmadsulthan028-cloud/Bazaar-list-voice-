export interface GroceryItem {
  id: string;
  name: string;
  quantity?: string;
  category: 'dairy' | 'vegetable' | 'herbs' | 'fruit' | 'pantry';
  meaning: string;
  urduScript: string;
  hindiScript: string;
  culinaryNote: string;
  completed: boolean;
}

export type VoicePersona = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceProfile {
  id: string;
  name: string;
  title: string;
  category: 'female' | 'male' | 'child' | 'regional';
  categoryLabel: string;
  geminiVoice: VoicePersona;
  accent: string;
  description: string;
  styleInstruction: string;
  previewSample: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  tagColor: string;
}

export interface GenerationHistoryItem {
  id: string;
  voiceId: string;
  voiceName: string;
  audioUrl: string;
  timestamp: string;
  scriptSnippet: string;
}
