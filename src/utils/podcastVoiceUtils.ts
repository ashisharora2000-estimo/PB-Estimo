import { PodcastAccent } from '../types';

export interface AccentOption {
  id: PodcastAccent;
  label: string;
  flag: string;
  langCode: string;
  description: string;
  host1Label: string;
  host2Label: string;
}

export const PODCAST_ACCENTS: AccentOption[] = [
  {
    id: 'en-IN',
    label: 'Indian English',
    flag: '🇮🇳',
    langCode: 'en-IN',
    description: 'Indian Accent (Priya & Rohan / Global Delivery COE)',
    host1Label: 'Alex (Priya)',
    host2Label: 'Jordan (Rohan)'
  },
  {
    id: 'en-US',
    label: 'US English',
    flag: '🇺🇸',
    langCode: 'en-US',
    description: 'American Accent (Alex & Jordan)',
    host1Label: 'Alex',
    host2Label: 'Jordan'
  },
  {
    id: 'en-GB',
    label: 'British English',
    flag: '🇬🇧',
    langCode: 'en-GB',
    description: 'British Accent (Emma & Oliver)',
    host1Label: 'Alex (Emma)',
    host2Label: 'Jordan (Oliver)'
  },
  {
    id: 'en-AU',
    label: 'Australian English',
    flag: '🇦🇺',
    langCode: 'en-AU',
    description: 'Australian Accent (Chloe & Liam)',
    host1Label: 'Alex (Chloe)',
    host2Label: 'Jordan (Liam)'
  }
];

export function findOptimalVoices(
  voices: SpeechSynthesisVoice[],
  accent: PodcastAccent = 'en-IN'
): { female: SpeechSynthesisVoice | null; male: SpeechSynthesisVoice | null } {
  if (!voices || voices.length === 0) {
    return { female: null, male: null };
  }

  if (accent === 'en-IN') {
    // Look for Indian English or Indian regional TTS voices
    const indianVoices = voices.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      return (
        l === 'en-in' ||
        l === 'hi-in' ||
        l.includes('-in') ||
        n.includes('india') ||
        n.includes('indian') ||
        n.includes('heera') ||
        n.includes('neerja') ||
        n.includes('veena') ||
        n.includes('sangeeta') ||
        n.includes('ravi') ||
        n.includes('prabhat') ||
        n.includes('rishi') ||
        n.includes('aditi')
      );
    });

    if (indianVoices.length > 0) {
      // Find female Indian voice
      const femaleIndian =
        indianVoices.find(v => {
          const n = v.name.toLowerCase();
          return (
            n.includes('female') ||
            n.includes('heera') ||
            n.includes('neerja') ||
            n.includes('veena') ||
            n.includes('sangeeta') ||
            n.includes('aditi') ||
            n.includes('priya')
          );
        }) || indianVoices[0];

      // Find male Indian voice
      const maleIndian =
        indianVoices.find(v => {
          const n = v.name.toLowerCase();
          return (
            (n.includes('male') ||
              n.includes('ravi') ||
              n.includes('prabhat') ||
              n.includes('rishi') ||
              n.includes('aravind')) &&
            v.name !== femaleIndian.name
          );
        }) ||
        indianVoices.find(v => v.name !== femaleIndian.name) ||
        indianVoices[0];

      return { female: femaleIndian, male: maleIndian };
    }
  } else if (accent === 'en-GB') {
    const gbVoices = voices.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      return l === 'en-gb' || n.includes('united kingdom') || n.includes('british') || n.includes('uk');
    });
    if (gbVoices.length > 0) {
      const female = gbVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Victoria') || v.name.includes('Libby') || v.name.includes('Sonia')) || gbVoices[0];
      const male = gbVoices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Ryan')) && v.name !== female.name) || gbVoices[0];
      return { female, male };
    }
  } else if (accent === 'en-AU') {
    const auVoices = voices.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      return l === 'en-au' || n.includes('australia') || n.includes('australian');
    });
    if (auVoices.length > 0) {
      const female = auVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Karen') || v.name.includes('Catherine')) || auVoices[0];
      const male = auVoices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('Russell') || v.name.includes('Hayden')) && v.name !== female.name) || auVoices[0];
      return { female, male };
    }
  }

  // Fallback to standard English voices
  const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
  const pool = enVoices.length > 0 ? enVoices : voices;

  const female =
    pool.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('female') || n.includes('samantha') || n.includes('zira') || n.includes('victoria') || n.includes('karen');
    }) || pool[0];

  const male =
    pool.find(v => {
      const n = v.name.toLowerCase();
      return (n.includes('male') || n.includes('david') || n.includes('alex') || n.includes('daniel') || n.includes('george')) && v.name !== female?.name;
    }) ||
    pool.find(v => v.name !== female?.name) ||
    pool[0];

  return { female: female || null, male: male || null };
}
