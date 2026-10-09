import { GroceryItem, VoiceProfile } from '../types/grocery';

/**
 * Downloads audio data URL or blob URL as a file
 */
export function downloadAudioFile(audioSrc: string, filename = 'grocery-voice-audio.wav') {
  const link = document.createElement('a');
  link.href = audioSrc;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Speaks text using the browser's speech synthesis engine, customized by voice profile
 */
export function speakWithBrowserSynthesis({
  text,
  voiceProfile,
  onStart,
  onEnd,
  onError,
}: {
  text: string;
  voiceProfile?: VoiceProfile;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError(new Error('Browser Speech Synthesis is not supported in this environment.'));
    return null;
  }

  // Cancel prior speech
  window.speechSynthesis.cancel();

  // Clean lines into distinct speech sentences
  const cleaned = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('. ');

  const utterance = new SpeechSynthesisUtterance(cleaned);

  // Apply voice profile characteristics
  if (voiceProfile) {
    utterance.pitch = voiceProfile.pitchMultiplier || 1.0;
    utterance.rate = voiceProfile.rateMultiplier || 0.95;

    const voices = window.speechSynthesis.getVoices();
    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (voiceProfile.category === 'female') {
      matchedVoice = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('kavya') ||
            v.lang.includes('en-IN')) &&
          !v.name.toLowerCase().includes('male')
      );
    } else if (voiceProfile.category === 'male') {
      matchedVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('rishi') ||
          v.name.toLowerCase().includes('george')
      );
    } else if (voiceProfile.category === 'child') {
      // For child voice, use higher pitch on any bright voice
      utterance.pitch = 1.4;
      utterance.rate = 1.05;
      matchedVoice = voices.find((v) => v.name.toLowerCase().includes('junior') || v.lang.includes('en-IN'));
    } else if (voiceProfile.category === 'regional') {
      matchedVoice = voices.find(
        (v) =>
          v.lang.includes('en-IN') ||
          v.lang.includes('hi-IN') ||
          v.name.toLowerCase().includes('india')
      );
    }

    if (!matchedVoice) {
      matchedVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.startsWith('en')) || voices[0];
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Parses user multiline grocery text into structured items
 */
export function parseScriptToItems(scriptText: string): GroceryItem[] {
  const lines = scriptText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    const lower = line.toLowerCase();
    let category: GroceryItem['category'] = 'vegetable';
    let meaning = line;
    let urduScript = '';
    let hindiScript = '';
    let culinaryNote = 'Fresh grocery item.';

    if (lower.includes('dahi') || lower.includes('curd') || lower.includes('yogurt') || lower.includes('milk')) {
      category = 'dairy';
      meaning = 'Curd / Yogurt';
      urduScript = 'دہی';
      hindiScript = 'दही';
      culinaryNote = 'Rich curd for marinades, cooling raita, and lassi.';
    } else if (lower.includes('tamate') || lower.includes('tomato')) {
      category = 'vegetable';
      meaning = 'Tomatoes (Dakhni/Hyderabadi)';
      urduScript = 'ٹماٹر (تماٹے)';
      hindiScript = 'टमाटर';
      culinaryNote = 'Juicy tomatoes for curries, dalcha, and chutneys.';
    } else if (lower.includes('aloo') || lower.includes('potato')) {
      category = 'vegetable';
      meaning = 'Potatoes';
      urduScript = 'آلو';
      hindiScript = 'आलू';
      culinaryNote = 'Versatile staple for aloo fry and thick gravies.';
    } else if (lower.includes('seem') || lower.includes('phalli') || lower.includes('sem')) {
      category = 'vegetable';
      meaning = 'Broad Beans / Flat Green Beans';
      urduScript = 'سیم کی پھلی';
      hindiScript = 'सेम की फली';
      culinaryNote = 'Tender flat green pods, ideal for Seem ki Phalli Gosht or dry sabzi.';
    } else if (lower.includes('bhendi') || lower.includes('bhindi') || lower.includes('okra')) {
      category = 'vegetable';
      meaning = 'Lady’s Finger / Okra';
      urduScript = 'بھینڈی';
      hindiScript = 'भिंडी';
      culinaryNote = 'Crispy fry or masala gravy favorite.';
    } else if (lower.includes('pudina') || lower.includes('mint')) {
      category = 'herbs';
      meaning = 'Fresh Mint Leaves';
      urduScript = 'پودینہ';
      hindiScript = 'पुदीना';
      culinaryNote = 'Fragrant leaves indispensable for Biryani aroma and raita.';
    } else if (lower.includes('kotmeer') || lower.includes('kothmir') || lower.includes('coriander') || lower.includes('dhaniya')) {
      category = 'herbs';
      meaning = 'Fresh Coriander / Cilantro';
      urduScript = 'کوتمیر';
      hindiScript = 'कोथमीर / हरा धनिया';
      culinaryNote = 'Traditional fragrant garnish sprinkled over all Indian curries.';
    } else if (lower.includes('lemon') || lower.includes('nimbu') || lower.includes('neembu')) {
      category = 'fruit';
      meaning = 'Fresh Lemons / Citrus';
      urduScript = 'لیموں';
      hindiScript = 'नींबू';
      culinaryNote = 'Zesty citrus juice for marinades and refreshing sherbet.';
    }

    return {
      id: `item-${idx}-${line.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: line,
      category,
      meaning,
      urduScript,
      hindiScript,
      culinaryNote,
      completed: false,
    };
  });
}
