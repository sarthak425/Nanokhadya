import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'hi';

export interface Translations {
  appName: string;
  foodSafetySystem: string;
  dashboard: string;
  newTest: string;
  testHistory: string;
  fieldMap: string;
  comparator: string;
  datasets: string;
  models: string;
  settings: string;
  milk: string;
  honey: string;
  paneer: string;
  safe: string;
  adulterated: string;
  suspected: string;
  cow: string;
  bee: string;
  buffalo: string;
  scanSample: string;
  connectReader: string;
  readerReady: string;
  readerOffline: string;
  recentTests: string;
  totalTests: string;
  bodyImpact: string;
  specimenChamber: string;
  cartridge16Zone: string;
  inspectFoodMatrix: string;
  onlyMyRecords: string;
  deviceLocked: string;
  voiceAlertsOn: string;
  voiceAlertsOff: string;
}

const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    appName: 'NanoTech',
    foodSafetySystem: 'Food Safety System',
    dashboard: 'Dashboard',
    newTest: 'New Test',
    testHistory: 'Test History',
    fieldMap: 'Field Heatmap',
    comparator: 'Purity Comparator',
    datasets: 'Datasets',
    models: 'ML Models',
    settings: 'Settings',
    milk: 'Milk',
    honey: 'Honey',
    paneer: 'Paneer',
    safe: 'SAFE',
    adulterated: 'ADULTERATED',
    suspected: 'SUSPECTED',
    cow: 'Cow',
    bee: 'Bee',
    buffalo: 'Buffalo',
    scanSample: 'Scan & Acquire Sample',
    connectReader: 'Pair BLE Reader',
    readerReady: 'Reader Ready',
    readerOffline: 'BLE Disconnected',
    recentTests: 'Recent Inspections',
    totalTests: 'Total Tests',
    bodyImpact: 'Body Health Impact',
    specimenChamber: '3D Specimen Chamber',
    cartridge16Zone: '16-Zone Cartridge',
    inspectFoodMatrix: 'Select Food Matrix to Inspect',
    onlyMyRecords: 'ONLY MY RECORDS',
    deviceLocked: 'Device Locked',
    voiceAlertsOn: 'Voice Alerts Active',
    voiceAlertsOff: 'Voice Alerts Muted',
  },
  hi: {
    appName: 'नैनोटेक',
    foodSafetySystem: 'खाद्य सुरक्षा प्रणाली',
    dashboard: 'डैशबोर्ड',
    newTest: 'नया परीक्षण',
    testHistory: 'जांच इतिहास',
    fieldMap: 'क्षेत्रीय हॉटस्पॉट मैप',
    comparator: 'शुद्धता तुलना',
    datasets: 'डेटासेट',
    models: 'एआई मॉडल',
    settings: 'सेटिंग्स',
    milk: 'दूध',
    honey: 'शहद',
    paneer: 'पनीर',
    safe: 'सुरक्षित (शुद्ध)',
    adulterated: 'मिलावटी (हानिकारक)',
    suspected: 'संदिग्ध',
    cow: 'गाय',
    bee: 'मधुमक्खी',
    buffalo: 'भैंस',
    scanSample: 'नमूना स्कैन करें',
    connectReader: 'रीडर कनेक्ट करें',
    readerReady: 'सेंसर तैयार है',
    readerOffline: 'ब्लूटूथ डिस्कनेक्ट',
    recentTests: 'हालिया जांच रिपोर्ट',
    totalTests: 'कुल परीक्षण',
    bodyImpact: 'शरीर पर दुष्प्रभाव',
    specimenChamber: '3D जैविक नमूना',
    cartridge16Zone: '16-जोन चिप',
    inspectFoodMatrix: 'जांच के लिए खाद्य चुनें',
    onlyMyRecords: 'केवल मेरे रिकॉर्ड',
    deviceLocked: 'डिवाइस सुरक्षित',
    voiceAlertsOn: 'वॉइस अलर्ट चालू',
    voiceAlertsOff: 'वॉइस अलर्ट बंद',
  },
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  t: (key: keyof Translations) => string;
  speakText: (text: string, lang?: Locale) => void;
  speakTestResult: (foodType: string, label: string, detectedIssue?: string | null) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  voiceEnabled: true,
  setVoiceEnabled: () => {},
  t: (key) => TRANSLATIONS.en[key] || '',
  speakText: () => {},
  speakTestResult: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('nanotech_locale');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nanotech_voice_enabled');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('nanotech_locale', l); } catch {}
  };

  const setVoiceEnabled = (v: boolean) => {
    setVoiceEnabledState(v);
    try { localStorage.setItem('nanotech_voice_enabled', String(v)); } catch {}
  };

  const t = (key: keyof Translations): string => {
    return TRANSLATIONS[locale][key] || TRANSLATIONS.en[key] || String(key);
  };

  // Speech Synthesis Engine
  const speakText = (text: string, lang: Locale = locale) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95; // Slightly slower for clear laboratory annunciations
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const speakTestResult = (foodType: string, label: string, detectedIssue?: string | null) => {
    const isSafe = label === 'SAFE' || label === 'AUTHENTIC';
    const isAdulterated = label === 'ADULTERATED';

    const foodNameHi = foodType === 'Milk' ? 'दूध' : foodType === 'Honey' ? 'शहद' : 'पनीर';

    if (locale === 'hi') {
      if (isSafe) {
        speakText(`${foodNameHi} पूरी तरह शुद्ध और सुरक्षित है। कोई मिलावट नहीं मिली।`, 'hi');
      } else if (isAdulterated) {
        const issueHi = detectedIssue ? detectedIssue : 'रासायनिक';
        speakText(`चेतावनी! ${foodNameHi} में मिलावट पाई गई है! ${issueHi}। यह स्वास्थ्य के लिए हानिकारक है!`, 'hi');
      } else {
        speakText(`${foodNameHi} का नमूना संदिग्ध है। पुष्टि के लिए दोबारा जांच करें।`, 'hi');
      }
    } else {
      if (isSafe) {
        speakText(`${foodType} sample is authentic and verified safe for consumption.`, 'en');
      } else if (isAdulterated) {
        const issue = detectedIssue ? detectedIssue : 'Hazardous adulterants';
        speakText(`Warning! ${foodType} sample is adulterated. ${issue} detected. Harmful to human health!`, 'en');
      } else {
        speakText(`${foodType} sample is suspected of contamination. Please run a secondary scan.`, 'en');
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        voiceEnabled,
        setVoiceEnabled,
        t,
        speakText,
        speakTestResult,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
