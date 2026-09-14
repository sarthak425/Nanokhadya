import { useState } from 'react';
import {
  AlertTriangle, ShieldAlert,
  Skull, CheckCircle2, Zap
} from 'lucide-react';

export interface ChemicalHazard {
  name: string;
  foodSource: string;
  category: string;
  hazardLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  formula?: string;
  whyAdded: string;
  targetOrgans: Array<'brain' | 'face' | 'heart' | 'stomach' | 'liver' | 'kidney'>;
  acuteSymptoms: string[];
  chronicRisks: string[];
  firstAid: string;
  fssaiStandard: string;
}

export const CHEMICAL_HAZARD_DATABASE: Record<string, ChemicalHazard> = {
  'Formalin': {
    name: 'Formalin (Formaldehyde 37%)',
    foodSource: 'Milk / Dairy Products',
    category: 'Toxic Industrial Preservative / Disinfectant',
    hazardLevel: 'CRITICAL',
    formula: 'CH₂O',
    whyAdded: 'Extends milk shelf life by several days in hot climates without refrigeration.',
    targetOrgans: ['face', 'stomach', 'liver', 'kidney'],
    acuteSymptoms: [
      'Burning sensation in eyes, face, mouth, and throat',
      'Severe abdominal cramps, vomiting with blood',
      'Corrosion of mucous membranes and esophagus',
      'Respiratory distress and facial edema',
    ],
    chronicRisks: [
      'Class 1 Proven Human Carcinogen (Nasopharyngeal & Gastric cancer)',
      'Severe irreversible liver cirrhosis and renal tubule necrosis',
      'Immune system suppression and mutagenic cellular damage',
    ],
    firstAid: 'Immediate gastric lavage; administer milk or activated charcoal. Seek emergency medical toxicology care.',
    fssaiStandard: 'ZERO TOLERANCE (0.0 mg/L) under FSSAI Regulations. Strict criminal liability.',
  },
  'Urea': {
    name: 'Urea (Synthetic Nitrogen)',
    foodSource: 'Milk & Paneer',
    category: 'Fertilizer / Artificial SNF Booster',
    hazardLevel: 'HIGH',
    formula: 'CH₄N₂O',
    whyAdded: 'Artificially inflates non-protein nitrogen (SNF) readings to mimic rich, thick milk.',
    targetOrgans: ['kidney', 'stomach', 'heart'],
    acuteSymptoms: [
      'Intense nausea, acid indigestion, and acute gastritis',
      'Dehydration and electrolyte imbalance',
      'Elevated blood urea nitrogen (BUN)',
      'Headache and dizziness',
    ],
    chronicRisks: [
      'Chronic Kidney Disease (CKD) and renal filter overload',
      'Damage to glomerular filtration rate (GFR)',
      'Gastric ulcers and metabolic acidosis',
      'Cardiovascular strain due to sodium/nitrogen retention',
    ],
    firstAid: 'Drink copious pure water; take antacids. Consult nephrologist if symptoms persist.',
    fssaiStandard: 'Natural milk ceiling: 700 mg/L. Added urea is strictly prohibited.',
  },
  'Detergent': {
    name: 'Detergent & Surfactants',
    foodSource: 'Synthetic Milk & Paneer',
    category: 'Industrial Cleanser / Emulsifier',
    hazardLevel: 'HIGH',
    formula: 'Alkyl Benzene Sulfonate',
    whyAdded: 'Emulsifies cheap vegetable oil with water to create fake frothy white milk lather.',
    targetOrgans: ['face', 'stomach', 'liver'],
    acuteSymptoms: [
      'Severe stomach cramps and violent diarrhea',
      'Mucosal irritation in oral cavity, tongue, and throat',
      'Nausea and gastrointestinal burning sensation',
    ],
    chronicRisks: [
      'Erosion of protective stomach mucosal lining (ulcerative enteritis)',
      'Hepatic cell inflammation and impaired digestive enzyme secretion',
      'Malabsorption syndrome and chronic colitis',
    ],
    firstAid: 'Do not induce vomiting. Administer demulcent liquids like fresh coconut water or egg whites.',
    fssaiStandard: 'ZERO TOLERANCE. Presence indicates counterfeit synthetic milk.',
  },
  'Melamine': {
    name: 'Melamine',
    foodSource: 'Milk Powder & Dairy Formulations',
    category: 'Industrial Resin / Protein Spiker',
    hazardLevel: 'CRITICAL',
    formula: 'C₃H₆N₆',
    whyAdded: 'Contains 66% nitrogen by mass, spoofing standard Kjeldahl protein tests.',
    targetOrgans: ['kidney', 'stomach'],
    acuteSymptoms: [
      'Acute urinary tract obstruction and severe flank pain',
      'Hematuria (blood in urine) and painful urination',
      'High blood pressure and irritability',
    ],
    chronicRisks: [
      'Formation of insoluble melamine-cyanurate crystals in kidney nephrons',
      'Acute renal failure requiring emergency hemodialysis',
      'Permanent chronic kidney damage and bladder urolithiasis',
    ],
    firstAid: 'Immediate hospitalization and urinary alkalinization therapy.',
    fssaiStandard: 'Ceiling limit: 1.0 mg/kg in infant formula, 2.5 mg/kg in liquid milk.',
  },
  'Starch': {
    name: 'Starch & Flour Hydrolysate',
    foodSource: 'Milk & Paneer',
    category: 'Carbohydrate Thickener',
    hazardLevel: 'MODERATE',
    formula: '(C₆H₁₀O₅)n',
    whyAdded: 'Increases density and viscosity of diluted water-thinned milk and paneer weight.',
    targetOrgans: ['stomach', 'heart'],
    acuteSymptoms: [
      'Bloating, stomach heaviness, and abdominal distension',
      'Sudden blood glucose spikes in diabetic patients',
      'Indigestion and flatulence',
    ],
    chronicRisks: [
      'Exacerbation of Type 2 Diabetes and metabolic syndrome',
      'Gut microbiome dysbiosis and colon bacterial overgrowth',
      'Loss of expected calcium/protein bioavailability for children',
    ],
    firstAid: 'Digestive enzyme support, maintain hydration.',
    fssaiStandard: 'Strictly prohibited as an adulterant in pure milk and paneer.',
  },
  'C4 sugar (adulterant)': {
    name: 'C4 Sugars / High Fructose Corn Syrup',
    foodSource: 'Honey',
    category: 'Industrial Starch Syrup',
    hazardLevel: 'MODERATE',
    formula: 'Fructose/Glucose Polymer',
    whyAdded: 'Cheaply extends natural raw honey volume; passes rudimentary physical tests.',
    targetOrgans: ['liver', 'heart', 'stomach'],
    acuteSymptoms: [
      'Rapid glycemic index spike',
      'Excessive thirst and fatigue',
    ],
    chronicRisks: [
      'Non-Alcoholic Fatty Liver Disease (NAFLD)',
      'Severe insulin resistance and visceral obesity',
      'Increased risk of coronary heart disease and elevated triglycerides',
    ],
    firstAid: 'Hydration and blood sugar monitoring.',
    fssaiStandard: 'Maximum allowable C4 sugar in honey: < 7% (FSSAI/Codex standard).',
  },
  'Vegetable fat/oil': {
    name: 'Hydrogenated Vegetable Oil / Palm Oil',
    foodSource: 'Paneer & Cheese Formulations',
    category: 'Trans Fat Substitute',
    hazardLevel: 'HIGH',
    formula: 'Hydrogenated Triglycerides',
    whyAdded: 'Replaces expensive pure milk fat with cheap processed vegetable grease.',
    targetOrgans: ['heart', 'liver', 'stomach'],
    acuteSymptoms: [
      'Acid reflux, heavy sluggish digestion, and nausea',
      'Abdominal discomfort and bloating',
    ],
    chronicRisks: [
      'Drastic rise in LDL (bad cholesterol) and arterial plaque buildup',
      'Atherosclerosis, coronary artery disease, and heart attack risk',
      'Fatty liver and gallbladder strain',
    ],
    firstAid: 'Dietary fiber and lipid profile assessment.',
    fssaiStandard: 'Paneer fat must be 100% milk fat. Foreign fat addition is illegal.',
  },
};

interface ChemicalBodyImpactViewProps {
  selectedChemical?: string;
  foodType?: 'Milk' | 'Honey' | 'Paneer';
  onClose?: () => void;
}

export function ChemicalBodyImpactView({
  selectedChemical = 'Formalin',
  foodType = 'Milk',
}: ChemicalBodyImpactViewProps) {
  // Normalize chemical key
  const availableKeys = Object.keys(CHEMICAL_HAZARD_DATABASE);
  const matchedKey = availableKeys.find(
    k => k.toLowerCase() === selectedChemical.toLowerCase() ||
         selectedChemical.toLowerCase().includes(k.toLowerCase())
  ) || (foodType === 'Honey' ? 'C4 sugar (adulterant)' : foodType === 'Paneer' ? 'Vegetable fat/oil' : 'Formalin');

  const [activeChemKey, setActiveChemKey] = useState<string>(matchedKey);
  const [selectedOrgan, setSelectedOrgan] = useState<'brain' | 'face' | 'heart' | 'stomach' | 'liver' | 'kidney'>('stomach');

  const hazard = CHEMICAL_HAZARD_DATABASE[activeChemKey] || CHEMICAL_HAZARD_DATABASE['Formalin'];

  const ORGAN_DETAILS = {
    brain: {
      label: 'Brain & Nervous System',
      icon: '🧠',
      impact: 'Headaches, dizziness, and neurotoxic stress from synthetic compound ingestion.',
    },
    face: {
      label: 'Face, Eyes & Mucous Membranes',
      icon: '👤',
      impact: 'Corrosive burning of oral tissues, throat edema, eye tearing, and facial swelling.',
    },
    heart: {
      label: 'Heart & Cardiovascular System',
      icon: '🫀',
      impact: 'Arterial plaque formation, high blood pressure, and trans-fat coronary strain.',
    },
    stomach: {
      label: 'Stomach & Gastrointestinal Tract',
      icon: '🫄',
      impact: 'Acid corrosion of mucosal lining, acute ulcers, bloody diarrhea, and cramps.',
    },
    liver: {
      label: 'Liver (Hepatic Filtration)',
      icon: '🩺',
      impact: 'Severe hepatocyte overload, toxin accumulation, fatty liver, and cirrhosis.',
    },
    kidney: {
      label: 'Kidneys & Renal Tubules',
      icon: '🫘',
      impact: 'Tubular necrosis, chemical crystal stones, GFR failure, and chronic renal disease.',
    },
  };

  const isOrganAffected = (organ: 'brain' | 'face' | 'heart' | 'stomach' | 'liver' | 'kidney') => {
    return hazard.targetOrgans.includes(organ);
  };

  const badgeColor = hazard.hazardLevel === 'CRITICAL' ? '#ef4444' : hazard.hazardLevel === 'HIGH' ? '#f59e0b' : '#38bdf8';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
      border: `1px solid ${badgeColor}40`,
      borderRadius: '20px',
      padding: '16px',
      color: '#f8fafc',
      boxShadow: `0 10px 30px -10px ${badgeColor}25`,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: `${badgeColor}20`,
            border: `1px solid ${badgeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldAlert size={18} color={badgeColor} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#f8fafc' }}>
              Chemical & Human Body Impact
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Clinical Hazard Telemetry & Anatomical Organ Mapping
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '12px',
          background: `${badgeColor}20`,
          border: `1px solid ${badgeColor}`,
          color: badgeColor,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Skull size={12} />
          <span>{hazard.hazardLevel} TOXICITY</span>
        </div>
      </div>

      {/* Chemical Switcher Pills */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
          Select Chemical / Adulterant to inspect biological effects:
        </div>
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {availableKeys.map(key => {
            const isSel = key === activeChemKey;
            const h = CHEMICAL_HAZARD_DATABASE[key];
            const color = h.hazardLevel === 'CRITICAL' ? '#ef4444' : h.hazardLevel === 'HIGH' ? '#f59e0b' : '#38bdf8';
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveChemKey(key);
                  setSelectedOrgan(h.targetOrgans[0] || 'stomach');
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: isSel ? `${color}25` : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isSel ? color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isSel ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout (Body Anatomical Map + Clinical Telemetry) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
        alignItems: 'stretch',
      }}>
        {/* Left: Interactive Anatomical Organ Map */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', alignSelf: 'flex-start' }}>
            Anatomical Threat Target Map
          </div>

          {/* Stylized Human Body Silhouette with Organ Nodes */}
          <div style={{
            position: 'relative',
            width: '180px',
            height: '240px',
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* SVG Silhouette Outline */}
            <svg viewBox="0 0 100 160" style={{ width: '100%', height: '100%', opacity: 0.35, filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.2))' }}>
              {/* Head */}
              <circle cx="50" cy="18" r="12" fill="#38bdf8" />
              {/* Neck */}
              <rect x="47" y="30" width="6" height="8" fill="#38bdf8" />
              {/* Torso */}
              <path d="M 32 38 Q 50 35 68 38 L 64 92 Q 50 94 36 92 Z" fill="#38bdf8" />
              {/* Arms */}
              <path d="M 32 38 L 20 80 Q 18 84 22 84 L 28 80 L 35 48 Z" fill="#38bdf8" />
              <path d="M 68 38 L 80 80 Q 82 84 78 84 L 72 80 L 65 48 Z" fill="#38bdf8" />
              {/* Legs */}
              <path d="M 36 92 L 34 150 Q 34 154 39 154 L 44 150 L 48 94 Z" fill="#38bdf8" />
              <path d="M 64 92 L 66 150 Q 66 154 61 154 L 56 150 L 52 94 Z" fill="#38bdf8" />
            </svg>

            {/* Interactive Organ Hotspots positioned over silhouette */}
            {[
              { id: 'face', top: '16%', left: '50%', label: 'Face / Mucosa', icon: '👤' },
              { id: 'heart', top: '34%', left: '44%', label: 'Heart', icon: '🫀' },
              { id: 'stomach', top: '46%', left: '52%', label: 'Stomach', icon: '🫄' },
              { id: 'liver', top: '44%', left: '38%', label: 'Liver', icon: '🩺' },
              { id: 'kidney', top: '56%', left: '46%', label: 'Kidneys', icon: '🫘' },
            ].map(organ => {
              const organKey = organ.id as 'brain' | 'face' | 'heart' | 'stomach' | 'liver' | 'kidney';
              const affected = isOrganAffected(organKey);
              const isSelected = selectedOrgan === organKey;

              return (
                <button
                  key={organ.id}
                  type="button"
                  onClick={() => setSelectedOrgan(organKey)}
                  title={`${organ.label}: ${affected ? 'HIGH DAMAGE ZONE' : 'Safe'}`}
                  style={{
                    position: 'absolute',
                    top: organ.top,
                    left: organ.left,
                    transform: 'translate(-50%, -50%)',
                    width: isSelected ? '34px' : '26px',
                    height: isSelected ? '34px' : '26px',
                    borderRadius: '50%',
                    background: affected ? (isSelected ? badgeColor : `${badgeColor}35`) : 'rgba(51, 65, 85, 0.6)',
                    border: `2px solid ${affected ? badgeColor : '#475569'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSelected ? '14px' : '11px',
                    cursor: 'pointer',
                    zIndex: isSelected ? 5 : 2,
                    boxShadow: affected ? `0 0 14px ${badgeColor}` : 'none',
                    animation: affected ? 'pulse 2s infinite' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {organ.icon}
                </button>
              );
            })}
          </div>

          {/* Active Selected Organ Badge */}
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            textAlign: 'center',
            background: `${badgeColor}15`,
            border: `1px solid ${badgeColor}40`,
            borderRadius: '8px',
            padding: '4px 10px',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <strong style={{ color: badgeColor }}>{ORGAN_DETAILS[selectedOrgan].icon} {ORGAN_DETAILS[selectedOrgan].label}:</strong>{' '}
            <span style={{ color: isOrganAffected(selectedOrgan) ? '#fca5a5' : '#94a3b8' }}>
              {isOrganAffected(selectedOrgan) ? 'DIRECT TOXIC DAMAGE' : 'Minimal Direct Toxicity'}
            </span>
          </div>
        </div>

        {/* Right: Clinical Toxicity & Risk Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Chemical Info Box */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                {hazard.name}
              </div>
              {hazard.formula && (
                <span className="mono" style={{ fontSize: '11px', color: badgeColor, background: `${badgeColor}15`, padding: '2px 6px', borderRadius: '4px' }}>
                  {hazard.formula}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>
              {hazard.category} · Found in: <strong>{hazard.foodSource}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong>Adulteration Motive:</strong> {hazard.whyAdded}
            </div>
          </div>

          {/* Acute / Immediate Symptoms */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} color="#ef4444" />
              <span>Immediate / Acute Symptoms (Within Hours):</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4 }}>
              {hazard.acuteSymptoms.map((sym, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>{sym}</li>
              ))}
            </ul>
          </div>

          {/* Chronic Long-term Hazards */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="#f59e0b" />
              <span>Long-Term Chronic Health Hazards (Years):</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4 }}>
              {hazard.chronicRisks.map((risk, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>{risk}</li>
              ))}
            </ul>
          </div>

          {/* FSSAI Standard & Medical Guidance */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '10px 12px',
            fontSize: '11px',
            color: '#a7f3d0',
            lineHeight: 1.4,
          }}>
            <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} color="#10b981" />
              <span>FSSAI Regulatory Directive:</span>
            </div>
            <div>{hazard.fssaiStandard}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
