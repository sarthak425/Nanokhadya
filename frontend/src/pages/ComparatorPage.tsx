import { useState, useMemo } from 'react';
import {
  GitCompare, Volume2, ShieldCheck, ShieldAlert,
  Info, Award, AlertTriangle, Layers, Flame
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { CARTRIDGE_ZONES_CONFIG } from '../components/CartridgeZoneView';

const WAVELENGTHS = [410, 435, 460, 485, 510, 535, 560, 585, 610, 645, 680, 705, 730, 760, 810, 860, 900, 940];

interface PresetComparison {
  id: string;
  name: string;
  nameHi: string;
  foodType: 'Milk' | 'Honey' | 'Paneer';
  adulterantName: string;
  concentration: string;
  hazardLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  pureCurve: number[];
  adulteratedCurve: number[];
  affectedZones: { zoneName: string; deltaPct: number; shiftReason: string; shiftReasonHi: string }[];
  bioMechanism: string;
  bioMechanismHi: string;
  fssaiRef: string;
  healthThreat: string;
  healthThreatHi: string;
}

const COMPARISON_PRESETS: PresetComparison[] = [
  {
    id: 'milk-urea',
    foodType: 'Milk',
    name: 'Milk vs Urea (2.5%) & Detergent Surfactant',
    nameHi: 'दूध बनाम यूरिया (2.5%) और डिटर्जेंट सर्फेक्टेंट',
    adulterantName: 'Urea + Sodium Alkylbenzene Sulfonate (Detergent)',
    concentration: '2.5 g/L Urea + 0.8% Surfactant',
    hazardLevel: 'CRITICAL',
    // AS7265x raw counts across 18 channels
    pureCurve: [1850, 2120, 2450, 2800, 3100, 3350, 3600, 3850, 4100, 4350, 4600, 4750, 4900, 5050, 5200, 5350, 5450, 5500],
    adulteratedCurve: [1120, 1340, 1690, 2050, 2450, 2800, 3200, 3450, 3750, 4000, 4250, 4400, 4100, 4300, 3950, 3800, 3700, 3650],
    affectedZones: [
      { zoneName: 'Urea', deltaPct: 88, shiftReason: 'Enzymatic urease complexation shifts absorbance peak to 435nm', shiftReasonHi: 'एंजाइमेटिक यूरियास कॉम्प्लेक्सेशन से 435nm पर अवशोषण शिखर बदलता है' },
      { zoneName: 'Detergent/Surfactant', deltaPct: 94, shiftReason: 'Cationic surfactant disrupts lipid micellar scattering in NIR (860nm)', shiftReasonHi: 'सर्फेक्टेंट से एनआईआर (860nm) में वसा मिसेल बिखरने में तीव्र गिरावट आती है' },
      { zoneName: 'pH indicator', deltaPct: 62, shiftReason: 'Alkaline buffer shifts pH from 6.6 to 8.2', shiftReasonHi: 'क्षारीय बफर दूध के पीएच को 6.6 से बढ़ाकर 8.2 कर देता है' },
      { zoneName: 'Salt / Mineral balance', deltaPct: 45, shiftReason: 'Ionic strength surge distorts diffuse reflectance', shiftReasonHi: 'आयनिक वृद्धि से विसरित परावर्तन विकृत होता है' },
    ],
    bioMechanism: 'Exogenous urea artificially spikes non-protein nitrogen (NPN) to inflate crude protein readings in standard tests. Detergent surfactants emulsify adulterated vegetable oil, generating an artificial milky haze that sharply absorbs in the UV band (410-435nm) while causing severe attenuation in NIR colloidal backscattering (860-940nm).',
    bioMechanismHi: 'बाहरी यूरिया कच्चे प्रोटीन की रीडिंग को गलत तरीके से बढ़ाने के लिए नॉन-प्रोटीन नाइट्रोजन (NPN) को कृत्रिम रूप से बढ़ाता है। डिटर्जेंट सर्फेक्टेंट मिलावटी वनस्पति तेल को पायसीकृत करते हैं, जिससे यूवी बैंड (410-435nm) में तीव्र अवशोषण और एनआईआर (860-940nm) में विकृति उत्पन्न होती है।',
    fssaiRef: 'FSSAI Manual of Methods of Analysis of Foods - Milk (01.002:2021) & ISO 14637:2004',
    healthThreat: 'Nephrotoxic strain, glomerular filtration destruction, gastric ulceration, and systemic metabolic acidosis from surfactant ingestion.',
    healthThreatHi: 'गुर्दे (किडनी) की विफलता, गैस्ट्रिक अल्सर और सर्फेक्टेंट के कारण प्रणालीगत एसिडोसिस का गंभीर खतरा।',
  },
  {
    id: 'milk-formalin',
    foodType: 'Milk',
    name: 'Milk vs Formalin (0.5% Toxic Preservative)',
    nameHi: 'दूध बनाम फॉर्मेलिन (0.5% विषैला संरक्षक)',
    adulterantName: 'Formaldehyde solution (Formalin 37%)',
    concentration: '0.5% v/v Formaldehyde',
    hazardLevel: 'CRITICAL',
    pureCurve: [1850, 2120, 2450, 2800, 3100, 3350, 3600, 3850, 4100, 4350, 4600, 4750, 4900, 5050, 5200, 5350, 5450, 5500],
    adulteratedCurve: [1980, 2300, 2750, 3150, 3500, 3800, 4150, 4400, 4700, 4950, 5200, 5400, 5550, 5680, 5780, 5890, 5950, 6000],
    affectedZones: [
      { zoneName: 'Formalin', deltaPct: 96, shiftReason: 'Chromotropic acid complexation forms intense violet fluorophore (580nm)', shiftReasonHi: 'क्रोमोट्रोपिक एसिड के साथ तीव्र बैंगनी फ्लोरोफोर कॉम्प्लेक्स बनता है' },
      { zoneName: 'Protein (non-dairy)', deltaPct: 52, shiftReason: 'Cross-linking of casein micelles alters secondary protein conformation', shiftReasonHi: 'केसीन प्रोटीन का क्रॉस-लिंकिंग संरचना को विकृत करता है' },
      { zoneName: 'Preservatives', deltaPct: 91, shiftReason: 'Aldehyde functional group detection zone turns dark purple', shiftReasonHi: 'एल्डिहाइड का पता लगाने वाला जोन गहरे बैंगनी रंग में बदल जाता है' },
    ],
    bioMechanism: 'Formaldehyde cross-links lysine residues of milk casein micelles, irreversibly locking protein matrix and preventing microbial spoilage for days. This cross-linking suppresses NIR water-protein overtone bands (900-940nm) and causes intense optical density hyperchromicity in short wavelengths (460-560nm).',
    bioMechanismHi: 'फॉर्मेल्डिहाइड दूध के कैसिइन प्रोटीन के लाइसिन अवशेषों को क्रॉस-लिंक कर देता है, जिससे प्रोटीन मैट्रिक्स सख्त हो जाता है और सड़न रुकती है। इससे एनआईआर ओवरटोन बैंड (900-940nm) दब जाते हैं और दृश्य तरंग दैर्ध्य (460-560nm) में हाइपरक्रोमिसिटी दिखाई देती है।',
    fssaiRef: 'FSSAI Method 01.003:2021 & AOAC Official Method 931.08',
    healthThreat: 'Group 1 Human Carcinogen (IARC). Severe gastrointestinal mucosal necrosis, liver cirrhosis, and pulmonary edema upon repeated low-dose exposure.',
    healthThreatHi: 'ग्रुप 1 मानव कार्सिनोजेन (कैंसरकारी)। बार-बार सेवन से पेट के म्यूकोसा का विनाश, लिवर सिरोसिस और श्वसन विफलता।',
  },
  {
    id: 'milk-starch-water',
    foodType: 'Milk',
    name: 'Milk vs 35% Dilution (Water + Starch Thickener)',
    nameHi: 'दूध बनाम 35% मिलावटी पानी और स्टार्च',
    adulterantName: 'Tap Water + Gelatinized Corn Starch',
    concentration: '35% Added Water + 1.2% Starch',
    hazardLevel: 'HIGH',
    pureCurve: [1850, 2120, 2450, 2800, 3100, 3350, 3600, 3850, 4100, 4350, 4600, 4750, 4900, 5050, 5200, 5350, 5450, 5500],
    adulteratedCurve: [1250, 1480, 1750, 2020, 2300, 2600, 2900, 3200, 3500, 3800, 4050, 4200, 4350, 4500, 4650, 4800, 4900, 4950],
    affectedZones: [
      { zoneName: 'Starch', deltaPct: 92, shiftReason: 'Amylose-triiodide helical complex yields intense blue-violet shift at 585nm', shiftReasonHi: 'एमाइलोज-आयोडाइड हेलिकल कॉम्प्लेक्स 585nm पर गहरा नीला-बैंगनी रंग देता है' },
      { zoneName: 'Added water', deltaPct: 84, shiftReason: 'Freezing point depression shift and density reduction indicator', shiftReasonHi: 'घनत्व में कमी और हिमांक बिंदु में परिवर्तन' },
      { zoneName: 'Viscosity modifier', deltaPct: 76, shiftReason: 'Polysaccharide thickening agent changes colloidal rheology', shiftReasonHi: 'पॉलीसेकेराइड गाढ़ा करने वाला एजेंट कोलाइडल गुणों को बदलता है' },
    ],
    bioMechanism: 'Water dilution removes essential milk solids, vitamins, and calcium, while starch is introduced fraudulently to restore viscosity and lactometer density. Starch polysaccharides form amylose-iodine charge-transfer complexes that absorb sharply at 585nm-610nm, while overall NIR scattering decreases across all 18 channels.',
    bioMechanismHi: 'पानी मिलाने से दूध के आवश्यक पोषक तत्व और कैल्शियम कम हो जाते हैं, जबकि गाढ़ापन और लैक्टोमीटर रीडिंग को धोखा देने के लिए स्टार्च डाला जाता है। स्टार्च 585nm-610nm पर गहरा अवशोषण देता है और सभी 18 चैनलों में समग्र एनआईआर बिखरने को कम करता है।',
    fssaiRef: 'FSSAI Manual 01.002:2021 & Indian Standard IS 1479 (Part 1)',
    healthThreat: 'Acute child malnutrition, pathogenic water-borne bacterial infections (E. coli, Salmonella), and gastrointestinal distress.',
    healthThreatHi: 'बच्चों में गंभीर कुपोषण, दूषित पानी से जीवाणु संक्रमण (ई. कोलाई) और पाचन विकार।',
  },
  {
    id: 'honey-c4-syrup',
    foodType: 'Honey',
    name: 'Honey vs 30% C4 Invert Sugar / Corn Syrup',
    nameHi: 'शहद बनाम 30% सी-4 इनवर्ट शुगर / कॉर्न सिरप',
    adulterantName: 'High Fructose Corn Syrup (HFCS-55) / Invert Cane Sugar',
    concentration: '30% v/v C4 Sugar Syrup',
    hazardLevel: 'CRITICAL',
    pureCurve: [950, 1180, 1420, 1750, 2100, 2500, 2950, 3400, 3900, 4400, 4850, 5200, 5500, 5750, 5950, 6100, 6250, 6300],
    adulteratedCurve: [1420, 1680, 1950, 2300, 2750, 3200, 3650, 4100, 4550, 5000, 5350, 5600, 5800, 5950, 6050, 6150, 6200, 6220],
    affectedZones: [
      { zoneName: 'C4 sugar (adulterant)', deltaPct: 95, shiftReason: '13C/12C isotopic proxy surrogate response in NIR sugar overtone bands', shiftReasonHi: 'एनआईआर शर्करा ओवरटोन बैंड में सी-4 आइसोटोप प्रतिक्रिया' },
      { zoneName: 'Fructose/Glucose ratio', deltaPct: 81, shiftReason: 'F/G ratio skewed from 1.25 down to 0.85 by industrial dextrose addition', shiftReasonHi: 'फ्रुक्टोज/ग्लूकोज अनुपात 1.25 से घटकर 0.85 हो जाता है' },
      { zoneName: 'Added sugar (syrup)', deltaPct: 89, shiftReason: 'Enzymatic invertase chromogenic dye shift at 510nm', shiftReasonHi: '510nm पर एंजाइमेटिक इन्वर्टेज क्रोमोजेनिक रंग परिवर्तन' },
      { zoneName: 'HMF (overheating)', deltaPct: 74, shiftReason: 'Thermal processing indicator rises past 80 mg/kg threshold', shiftReasonHi: 'हीटिंग इंडिकेटर एचएमएफ 80 मिलीग्राम/किग्रा सीमा को पार कर जाता है' },
    ],
    bioMechanism: 'C4 plant syrups (maize/cane) possess higher 13C stable isotope abundance and lack authentic floral pollens and diastase enzymes. In spectroscopic analysis, HFCS artificially elevates short-wave visual absorbance (410-485nm) while attenuating the complex phenolic antioxidant fingerprints observed in pure wild honey at 645-730nm.',
    bioMechanismHi: 'सी-4 पौधों (मक्का/गन्ना) के सिरप में असली परागकण और डायस्टेस एंजाइम नहीं होते हैं। स्पेक्ट्रोस्कोपिक विश्लेषण में, एचएफसीएस कृत्रिम रूप से यूवी/नीले अवशोषण (410-485nm) को बढ़ाता है और शुद्ध शहद के फेनोलिक एंटीऑक्सीडेंट फिंगरप्रिंट को दबा देता है।',
    fssaiRef: 'FSSAI Honey Specification (2020 Gazetted) & AOAC Method 998.12 (SCIRA)',
    healthThreat: 'Severe glycemic spikes, accelerated non-alcoholic fatty liver disease (NAFLD), insulin resistance, and diabetes exacerbation.',
    healthThreatHi: 'रक्त शर्करा में तीव्र उछाल, फैटी लिवर रोग (NAFLD), इंसुलिन प्रतिरोध और मधुमेह का गंभीर जोखिम।',
  },
  {
    id: 'paneer-synthetic',
    foodType: 'Paneer',
    name: 'Paneer vs Synthetic Paneer (Starch + Hydrogenated Fat)',
    nameHi: 'पनीर बनाम सिंथेटिक पनीर (स्टार्च व डालडा वसा)',
    adulterantName: 'Hydrogenated Vegetable Oil (Vanaspati) + Starch + Chemical Curdler',
    concentration: '40% Dairy Fat Replacement + 4% Starch',
    hazardLevel: 'CRITICAL',
    pureCurve: [2100, 2350, 2680, 3050, 3420, 3750, 4100, 4420, 4750, 5050, 5300, 5500, 5650, 5800, 5920, 6050, 6150, 6200],
    adulteratedCurve: [1550, 1780, 2050, 2400, 2800, 3200, 3600, 3950, 4300, 4650, 4950, 5150, 5280, 5400, 5500, 5600, 5700, 5750],
    affectedZones: [
      { zoneName: 'Vegetable fat/oil', deltaPct: 91, shiftReason: 'Trans-fat and unsaturated fatty acid lipid shift in 730nm-810nm band', shiftReasonHi: '730nm-810nm बैंड में ट्रांस-फैट और वनस्पति वसा का विकृत स्पेक्ट्रम' },
      { zoneName: 'Starch', deltaPct: 87, shiftReason: 'Amylose binding reaction yields dark iodine stain response', shiftReasonHi: 'एमाइलोज बाइंडिंग से गहरा आयोडीन प्रतिक्रिया दिखाई देती है' },
      { zoneName: 'Non-dairy protein', deltaPct: 69, shiftReason: 'Soy/caseinate analogue protein precipitation profile shift', shiftReasonHi: 'सोया/कैसीनेट गैर-डेयरी प्रोटीन का प्रोफाइल बदलाव' },
    ],
    bioMechanism: 'Synthetic paneer completely substitutes rich milk cream and desi ghee with cheap hydrogenated vegetable fat (vanaspati) loaded with hazardous trans fats, structured using starch paste and curdled with industrial acids. Spectral reflectance drops sharply across 410-610nm due to optical yellowing and trans-isomer fatty acid double bonds.',
    bioMechanismHi: 'सिंथेटिक पनीर में असली दूध की मलाई और घी की जगह ट्रांस फैट युक्त सस्ता वनस्पति तेल (डालडा) और स्टार्च मिलाया जाता है। 410-610nm में परावर्तन में तीव्र गिरावट आती है क्योंकि ट्रांस-फैटी एसिड दोहरे बॉन्ड प्रकाश को अवशोषित करते हैं।',
    fssaiRef: 'FSSAI Food Safety and Standards (Food Products Standards and Food Additives) Regulations',
    healthThreat: 'Atherosclerosis, coronary artery disease, elevated LDL bad cholesterol, vascular inflammation, and acute stroke risks.',
    healthThreatHi: 'धमनियों में रुकावट (एथेरोस्क्लेरोसिस), दिल का दौरा, खराब एलडीएल कोलेस्ट्रॉल में वृद्धि और स्ट्रोक का खतरा।',
  },
];

export function ComparatorPage() {
  const { locale, speakText } = useLanguage();
  const isHi = locale === 'hi';

  const [selectedFood, setSelectedFood] = useState<'Milk' | 'Honey' | 'Paneer'>('Milk');
  const availablePresets = useMemo(() => {
    return COMPARISON_PRESETS.filter(p => p.foodType === selectedFood);
  }, [selectedFood]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(availablePresets[0]?.id || 'milk-urea');

  // Sync preset if food changes
  const activePreset = useMemo(() => {
    const found = availablePresets.find(p => p.id === selectedPresetId);
    if (found) return found;
    return availablePresets[0] || COMPARISON_PRESETS[0];
  }, [availablePresets, selectedPresetId]);

  // Handle food tab switch
  const handleFoodSwitch = (food: 'Milk' | 'Honey' | 'Paneer') => {
    setSelectedFood(food);
    const firstMatch = COMPARISON_PRESETS.find(p => p.foodType === food);
    if (firstMatch) {
      setSelectedPresetId(firstMatch.id);
    }
  };

  // Chart data formatting
  const chartData = useMemo(() => {
    return WAVELENGTHS.map((wl, index) => {
      const pure = activePreset.pureCurve[index] ?? 0;
      const adult = activePreset.adulteratedCurve[index] ?? 0;
      const delta = adult - pure;
      const deltaPct = pure > 0 ? ((delta / pure) * 100).toFixed(1) : '0';
      return {
        wavelength: wl,
        pure,
        adulterated: adult,
        delta,
        deltaPct: Number(deltaPct),
      };
    });
  }, [activePreset]);

  // Overall statistics
  const maxDeltaWavelength = useMemo(() => {
    let maxDiff = 0;
    let targetWl = 410;
    chartData.forEach(pt => {
      const diff = Math.abs(pt.pure - pt.adulterated);
      if (diff > maxDiff) {
        maxDiff = diff;
        targetWl = pt.wavelength;
      }
    });
    return targetWl;
  }, [chartData]);

  // Cartridge zone lookup for side-by-side
  const cartridgeConfig = CARTRIDGE_ZONES_CONFIG[selectedFood] || [];

  // Voice narration trigger
  const handleVoiceNarration = () => {
    if (isHi) {
      const readout = `शुद्ध ${isHi ? (selectedFood === 'Milk' ? 'दूध' : selectedFood === 'Honey' ? 'शहद' : 'पनीर') : selectedFood} और ${activePreset.nameHi} की तुलना। सबसे बड़ा स्पेक्ट्रल विचलन ${maxDeltaWavelength} नैनोमीटर पर पाया गया। ${activePreset.healthThreatHi}`;
      speakText(readout, 'hi');
    } else {
      const readout = `Comparison between pure ${selectedFood} and ${activePreset.name}. Maximum spectral deviation identified at ${maxDeltaWavelength} nanometers. Biological risk: ${activePreset.healthThreat}`;
      speakText(readout, 'en');
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 48 }}>
      {/* Top Banner & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(56, 139, 253, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(56, 139, 253, 0.3)',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(56, 139, 253, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#58a6ff',
              }}
            >
              <GitCompare size={20} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {isHi ? 'स्पेक्ट्रम व 16-जोन चिप शुद्धता तुलना' : 'Side-by-Side Purity & Spectral Comparator'}
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(63, 185, 80, 0.18)',
                color: '#3fb950',
                border: '1px solid rgba(63, 185, 80, 0.3)',
              }}
            >
              AS7265x Tri-Spectral NIRS
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 750, lineHeight: 1.5 }}>
            {isHi
              ? '100% प्रमाणित शुद्ध नमूने और रासायनिक मिलावटी नमूनों के बीच 18-चैनल स्पेक्ट्रल तरंग दैर्ध्य (410nm - 940nm) और 16-जोन नैनोकेमिकल चिप के रंग परिवर्तनों की सीधी तुलना करें।'
              : 'Directly benchmark 100% certified pure baseline samples against known adulterated formulations across all 18 optical channels (410nm–940nm) and 16-zone colorimetric micro-assays.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleVoiceNarration}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#d2a8ff',
            }}
          >
            <Volume2 size={16} />
            {isHi ? 'तुलना विश्लेषण सुनें' : 'Audio Readout'}
          </button>
        </div>
      </div>

      {/* Food Matrix & Preset Selection Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Matrix Picker */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
            {isHi ? '1. खाद्य मैट्रिक्स चुनें' : '1. Select Food Matrix'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {(['Milk', 'Honey', 'Paneer'] as const).map(food => (
              <button
                key={food}
                onClick={() => handleFoodSwitch(food)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: selectedFood === food ? '2px solid #58a6ff' : '1px solid var(--border-color)',
                  background: selectedFood === food ? 'rgba(56, 139, 253, 0.15)' : 'var(--bg-secondary)',
                  color: selectedFood === food ? '#58a6ff' : 'var(--text-secondary)',
                  fontWeight: selectedFood === food ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{food === 'Milk' ? '🥛' : food === 'Honey' ? '🍯' : '🧀'}</span>
                <span>{isHi ? (food === 'Milk' ? 'दूध' : food === 'Honey' ? 'शहद' : 'पनीर') : food}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Adulterant Preset Picker */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
            {isHi ? '2. मिलावट का प्रकार चुनें' : '2. Select Adulterant Formulation'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {availablePresets.map(preset => {
              const active = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    textAlign: 'left',
                    border: active ? '1px solid #f85149' : '1px solid var(--border-color)',
                    background: active ? 'rgba(248, 81, 73, 0.12)' : 'var(--bg-secondary)',
                    color: active ? '#ff7b72' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isHi ? preset.nameHi : preset.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: preset.hazardLevel === 'CRITICAL' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(210, 153, 34, 0.2)',
                      color: preset.hazardLevel === 'CRITICAL' ? '#f85149' : '#d29922',
                      fontWeight: 700,
                    }}
                  >
                    {preset.hazardLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Benchmark Delta KPI */}
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
              {isHi ? 'अधिकतम वर्णक्रमीय अंतर' : 'Peak Spectral Disruption'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f85149', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span>{maxDeltaWavelength} nm</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {maxDeltaWavelength <= 535 ? '(AS72653 UV/Vis)' : maxDeltaWavelength <= 680 ? '(AS72652 Vis)' : '(AS72651 NIR)'}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{isHi ? 'परीक्षण एकाग्रता: ' : 'Target Dose: '}</span>
            {activePreset.concentration}
          </div>
        </div>
      </div>

      {/* Main Dual Spectral Curve Chart */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              {isHi ? '18-चैनल ओवरले स्पेक्ट्रल वक्र (Pure vs Adulterated)' : 'Dual 18-Channel Spectral Curve Overlay (Pure vs Adulterated)'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isHi
                ? 'हरा वक्र = 100% शुद्ध प्रमाणित नमूना | लाल वक्र = मिलावटी नमूने का स्पेक्ट्रम (AS7265x रॉ काउंट्स)'
                : 'Green curve = 100% Certified Pure Baseline | Red curve = Adulterated Sample Spectrum (Raw Counts)'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 3, background: '#3fb950', display: 'inline-block', borderRadius: 2 }} />
              <span style={{ color: '#3fb950', fontWeight: 600 }}>{isHi ? 'प्रमाणित शुद्ध' : 'Pure Baseline'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 3, background: '#f85149', display: 'inline-block', borderRadius: 2 }} />
              <span style={{ color: '#f85149', fontWeight: 600 }}>{isHi ? 'मिलावटी नमूना' : 'Adulterated Sample'}</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis
              dataKey="wavelength"
              tickFormatter={v => `${v}nm`}
              tick={{ fill: '#8b949e', fontSize: 11 }}
              stroke="#30363d"
              label={{
                value: 'Tri-Spectral Optical Wavelength λ (410nm UV → 940nm NIR)',
                position: 'insideBottom',
                offset: -15,
                fill: '#6e7681',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
              stroke="#30363d"
              label={{ value: 'Raw Sensor Counts (16-bit ADC)', angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 10,
                fontSize: 12,
                color: '#e6edf3',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
              formatter={(value: any, name: any) => [
                `${Number(value).toLocaleString()} counts`,
                name === 'pure' ? (isHi ? 'शुद्ध संदर्भ' : 'Pure Baseline') : (isHi ? 'मिलावटी' : 'Adulterated'),
              ]}
              labelFormatter={(l: any) => {
                const num = Number(l) || 0;
                return `Wavelength: ${num} nm (${num <= 535 ? 'UV/Blue' : num <= 680 ? 'Visible Green/Red' : 'Near-Infrared'})`;
              }}
            />
            <Line
              type="monotone"
              dataKey="pure"
              stroke="#3fb950"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3fb950', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#2ea043' }}
              name="pure"
            />
            <Line
              type="monotone"
              dataKey="adulterated"
              stroke="#f85149"
              strokeWidth={3}
              strokeDasharray="4 2"
              dot={{ r: 4, fill: '#f85149', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#da3633' }}
              name="adulterated"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Optical Band Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          <div style={{ padding: '8px 12px', background: 'rgba(56, 139, 253, 0.08)', borderRadius: 8, border: '1px solid rgba(56, 139, 253, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#58a6ff' }}>AS72653 · UV / VIS (410 – 535 nm)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isHi ? 'यूरिया, प्रोटीन व रंग वर्णक अवशोषण' : 'Proteins, synthetic dyes & NPN compounds'}
            </div>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(63, 185, 80, 0.08)', borderRadius: 8, border: '1px solid rgba(63, 185, 80, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3fb950' }}>AS72652 · VISIBLE (560 – 680 nm)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isHi ? 'स्टार्च-आयोडीन, मैलाकाइट ग्रीन व कैरोटीनॉयड' : 'Starch-iodine, carotenoids & chlorophyll'}
            </div>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(163, 113, 247, 0.08)', borderRadius: 8, border: '1px solid rgba(163, 113, 247, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d2a8ff' }}>AS72651 · NIR (705 – 940 nm)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isHi ? 'वसा मिसेल, पानी का फैलाव व हाइड्रोकार्बन' : 'Fat globules, moisture & surfactant micellar scatter'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side 16-Zone Cartridge Reaction */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#58a6ff" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {isHi ? '16-जोन नैनोकेमिकल चिप तुलना (Pure vs Contaminated)' : '16-Zone Micro-Assay Cartridge Comparison'}
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {isHi
              ? 'प्रत्येक गोल क्षेत्र एक विशिष्ट रासायनिक प्रतिक्रिया का प्रतिनिधित्व करता है। मिलावटी नमूने में सक्रिय रंग परिवर्तन स्पष्ट रूप से दिखाई देते हैं।'
              : 'Each micro-fluidic microwell represents a target chemical assay. Highlighting distinct chromogenic shift in contaminated state.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Left: Pure Sample Cartridge */}
          <div
            style={{
              background: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(63, 185, 80, 0.3)',
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#3fb950" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#3fb950' }}>
                  {isHi ? '100% शुद्ध प्रमाणित चिप' : '100% Pure Certified Cartridge'}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' }}>
                {isHi ? 'सभी 16 जोन सुरक्षित' : 'All 16 Zones Safe'}
              </span>
            </div>

            {/* 4x4 Grid for Pure */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {cartridgeConfig.map((zone, idx) => (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: zone.defaultColor,
                      marginBottom: 4,
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: 1.1, overflow: 'hidden', maxHeight: 24 }}>
                    {zone.name}
                  </span>
                  <span style={{ position: 'absolute', top: 3, right: 4, fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>
                    Z{idx + 1}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {isHi ? '✓ कोई रासायनिक रंग परिवर्तन नहीं — संदर्भ सीमा सामान्य' : '✓ No chromogenic shift — baseline optical equilibrium'}
            </div>
          </div>

          {/* Right: Adulterated Cartridge */}
          <div
            style={{
              background: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(248, 81, 73, 0.4)',
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color="#f85149" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ff7b72' }}>
                  {isHi ? 'मिलावटी नमूने की चिप प्रतिक्रिया' : 'Adulterated Sample Reaction'}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(248, 81, 73, 0.2)', color: '#ff7b72', fontWeight: 600 }}>
                {activePreset.affectedZones.length} {isHi ? 'जोन सक्रिय' : 'Active Shifts'}
              </span>
            </div>

            {/* 4x4 Grid for Adulterated */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {cartridgeConfig.map((zone, idx) => {
                const isAffected = activePreset.affectedZones.some(az => az.zoneName === zone.name);
                const affectedInfo = activePreset.affectedZones.find(az => az.zoneName === zone.name);
                return (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 10,
                      background: isAffected ? 'rgba(248, 81, 73, 0.12)' : 'var(--bg-secondary)',
                      border: isAffected ? '2px solid #f85149' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isAffected ? zone.activeColor : zone.defaultColor,
                        marginBottom: 4,
                        boxShadow: isAffected ? `0 0 10px ${zone.activeColor}` : 'inset 0 1px 3px rgba(0,0,0,0.4)',
                        border: isAffected ? '2px solid #fff' : 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.62rem', color: isAffected ? '#ff7b72' : 'var(--text-secondary)', fontWeight: isAffected ? 700 : 400, lineHeight: 1.1, overflow: 'hidden', maxHeight: 24 }}>
                      {zone.name}
                    </span>
                    {isAffected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: '#f85149',
                          color: '#fff',
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          borderRadius: 3,
                          padding: '0 3px',
                        }}
                      >
                        +{affectedInfo?.deltaPct}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#ff7b72', textAlign: 'center', fontWeight: 600 }}>
              {isHi
                ? `🚨 तीव्र रंग परिवर्तन: ${activePreset.affectedZones.map(z => z.zoneName).join(', ')}`
                : `🚨 Severe Chromogenic Shift in: ${activePreset.affectedZones.map(z => z.zoneName).join(', ')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Biochemical & FSSAI Reference Dossier */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Biochemical Mechanism */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56, 139, 253, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#58a6ff' }}>
              <Info size={18} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              {isHi ? 'जैव-रासायनिक एवं स्पेक्ट्रोस्कोपिक क्रियाविधि' : 'Biochemical & Spectroscopic Mechanism'}
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {isHi ? activePreset.bioMechanismHi : activePreset.bioMechanism}
          </p>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              {isHi ? 'सक्रिय चिप जोन विश्लेषण' : 'Zone Delta Breakdown'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activePreset.affectedZones.map((az, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 8, fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    <span>{az.zoneName}</span>
                    <span style={{ color: '#f85149' }}>Δ +{az.deltaPct}%</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    {isHi ? az.shiftReasonHi : az.shiftReason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory & Health Impact */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248, 81, 73, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f85149' }}>
                <Flame size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#ff7b72' }}>
                {isHi ? 'स्वास्थ्य जोखिम और एफएसएसएआई संदर्भ' : 'Health Threat & Regulatory Standards'}
              </h3>
            </div>

            <div style={{ background: 'rgba(248, 81, 73, 0.08)', border: '1px solid rgba(248, 81, 73, 0.25)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f85149', fontWeight: 700, fontSize: '0.8rem', marginBottom: 6 }}>
                <AlertTriangle size={15} />
                {isHi ? 'मानव शरीर पर दुष्प्रभाव:' : 'Human Body Hazard Profile:'}
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {isHi ? activePreset.healthThreatHi : activePreset.healthThreat}
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#58a6ff', fontWeight: 700, fontSize: '0.78rem', marginBottom: 6 }}>
              <Award size={15} />
              {isHi ? 'मानक संदर्भ विधि:' : 'Official Reference Benchmark:'}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              {activePreset.fssaiRef}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
