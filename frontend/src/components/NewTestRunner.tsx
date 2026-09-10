import React, { useState, useEffect } from 'react';
import { TestSessionRecord, OverallResult, ZoneReading, FoodCategory } from '../types';
import { COMMODITY_TEMPLATES } from '../mockData';
import { Play, CheckCircle, AlertCircle, RefreshCw, Cpu, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface NewTestRunnerProps {
  onCompleteTest: (record: TestSessionRecord) => void;
  onCancel: () => void;
}

export const NewTestRunner: React.FC<NewTestRunnerProps> = ({ onCompleteTest, onCancel }) => {
  // Category & Commodity selection
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('DAIRY');
  const [selectedCommodityKey, setSelectedCommodityKey] = useState<string>('MILK');

  // Active template
  const activeTemplate = COMMODITY_TEMPLATES[selectedCommodityKey] || COMMODITY_TEMPLATES['MILK'];

  // Form State
  const [sampleCode, setSampleCode] = useState('MILK-ANAND-03');
  const [milkType, setMilkType] = useState<'COW' | 'BUFFALO' | 'MIXED' | 'NOT_APPLICABLE'>('COW');
  const [collectionSource, setCollectionSource] = useState(activeTemplate.defaultSource);
  const [batchLot, setBatchLot] = useState(activeTemplate.defaultLot);
  const [deviceSerial, setDeviceSerial] = useState('READER-ESP32S3-001');
  const [cartridgeUid, setCartridgeUid] = useState('MC-9021');

  // Simulation Preset
  const [selectedScenario, setSelectedScenario] = useState<string>('SAFE');

  // Run State
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [currentStage, setCurrentStage] = useState<'IDLE' | 'INCUBATING' | 'IMAGING' | 'ANALYZING' | 'DONE'>('IDLE');

  // Dynamic Well Colors during reaction
  const [wellColors, setWellColors] = useState({
    z1: '#b91c1c',
    z2: '#f1f5f9',
    z3: '#f59e0b',
    z4: '#eab308',
    z5: '#84cc16',
    z6: '#ffffff'
  });

  // When commodity changes, update defaults
  useEffect(() => {
    const tmpl = COMMODITY_TEMPLATES[selectedCommodityKey];
    if (tmpl) {
      setSampleCode(`${selectedCommodityKey}-${Math.floor(100 + Math.random() * 900)}`);
      setCollectionSource(tmpl.defaultSource);
      setBatchLot(tmpl.defaultLot);
      setSelectedScenario('SAFE');

      // Set initial safe well colors from template
      setWellColors({
        z1: `rgb(${tmpl.zones[0]?.safeColor.r || 200}, ${tmpl.zones[0]?.safeColor.g || 50}, ${tmpl.zones[0]?.safeColor.b || 50})`,
        z2: `rgb(${tmpl.zones[1]?.safeColor.r || 220}, ${tmpl.zones[1]?.safeColor.g || 220}, ${tmpl.zones[1]?.safeColor.b || 220})`,
        z3: `rgb(${tmpl.zones[2]?.safeColor.r || 215}, ${tmpl.zones[2]?.safeColor.g || 195}, ${tmpl.zones[2]?.safeColor.b || 55})`,
        z4: `rgb(${tmpl.zones[3]?.safeColor.r || 205}, ${tmpl.zones[3]?.safeColor.g || 182}, ${tmpl.zones[3]?.safeColor.b || 68})`,
        z5: `rgb(${tmpl.zones[4]?.safeColor.r || 184}, ${tmpl.zones[4]?.safeColor.g || 192}, ${tmpl.zones[4]?.safeColor.b || 62})`,
        z6: '#ffffff'
      });

      if (tmpl.category === 'DAIRY' && selectedCommodityKey === 'MILK') {
        setMilkType('COW');
      } else {
        setMilkType('NOT_APPLICABLE');
      }
    }
  }, [selectedCommodityKey]);

  // Handle Category Click
  const handleCategorySelect = (cat: FoodCategory) => {
    setSelectedCategory(cat);
    // Find first commodity key in this category
    const firstKey = Object.keys(COMMODITY_TEMPLATES).find(k => COMMODITY_TEMPLATES[k].category === cat) || 'MILK';
    setSelectedCommodityKey(firstKey);
  };

  const handleStartTest = () => {
    sound.start();
    setIsRunning(true);
    setCurrentStage('INCUBATING');
    setCountdown(8);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            sound.tick();
          }
          return prev - 1;
        });

        // If scenario is adulterated, transition well colors progressively
        const tmpl = activeTemplate;
        if (selectedScenario === 'ADULTERATED_PRIMARY' && tmpl.zones[0]) {
          const c = tmpl.zones[0].adulteratedColor;
          setWellColors(prev => ({ ...prev, z1: `rgb(${c.r}, ${c.g}, ${c.b})` }));
        } else if (selectedScenario === 'ADULTERATED_SECONDARY' && tmpl.zones[1]) {
          const c = tmpl.zones[1].adulteratedColor;
          setWellColors(prev => ({ ...prev, z2: `rgb(${c.r}, ${c.g}, ${c.b})` }));
        } else if (selectedScenario === 'ADULTERATED_MULTI') {
          if (tmpl.zones[0]) {
            const c0 = tmpl.zones[0].adulteratedColor;
            setWellColors(prev => ({ ...prev, z1: `rgb(${c0.r}, ${c0.g}, ${c0.b})` }));
          }
          if (tmpl.zones[1]) {
            const c1 = tmpl.zones[1].adulteratedColor;
            setWellColors(prev => ({ ...prev, z2: `rgb(${c1.r}, ${c1.g}, ${c1.b})` }));
          }
        }
      }, 1000);
    } else if (isRunning && countdown === 0) {
      setCurrentStage('IMAGING');
      setTimeout(() => {
        sound.scan();
        setCurrentStage('ANALYZING');
        setTimeout(() => {
          finalizeTest();
        }, 1200);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, countdown, selectedScenario, activeTemplate]);

  const finalizeTest = () => {
    setIsRunning(false);
    setCurrentStage('DONE');

    const tmpl = activeTemplate;
    const isAdulterated = selectedScenario.startsWith('ADULTERATED');
    const isExpired = selectedScenario === 'EXPIRED';

    const overall: OverallResult = isExpired
      ? 'INVALID_TEST'
      : isAdulterated
      ? 'POSITIVE_SCREENING'
      : 'PASS_SCREENING';

    const validity = isExpired ? 'INVALID_EXPIRED_CARTRIDGE' : 'VALID';

    if (overall === 'PASS_SCREENING') {
      sound.success();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.alert();
    }

    const readings: ZoneReading[] = tmpl.zones.map((zone, idx) => {
      let isZoneAdulterated = false;
      if (selectedScenario === 'ADULTERATED_PRIMARY' && idx === 0) isZoneAdulterated = true;
      if (selectedScenario === 'ADULTERATED_SECONDARY' && idx === 1) isZoneAdulterated = true;
      if (selectedScenario === 'ADULTERATED_MULTI' && (idx === 0 || idx === 1)) isZoneAdulterated = true;

      const rgb = isZoneAdulterated ? zone.adulteratedColor : zone.safeColor;
      const deltaE = isZoneAdulterated ? (9.5 + Math.random() * 4.0) : (0.6 + Math.random() * 0.8);
      
      let estConc = 0;
      let rationale = `Within compliant baseline limits. ${zone.description}`;

      if (isZoneAdulterated) {
        if (zone.code === 'MELAMINE') {
          estConc = Math.round((4.5 + Math.random() * 2.0) * 10.0) / 10.0;
          rationale = `Melamine LSPR peak shift detected: ${estConc} ppm exceeds FSSAI MRL (${zone.threshold} ppm)`;
        } else if (zone.code === 'H2O2') {
          estConc = Math.round((12.0 + Math.random() * 8.0) * 10.0) / 10.0;
          rationale = `Peroxidase nanozyme catalytic oxidation positive: ${estConc} ppm H2O2 detected (FSSAI prohibits any added H2O2)`;
        } else if (zone.code === 'STARCH') {
          estConc = Math.round((0.25 + Math.random() * 0.5) * 100.0) / 100.0;
          rationale = `Polyiodide amylose complexation positive: ~${estConc}% w/w exogenous starch / flour detected`;
        } else if (zone.code === 'UREA') {
          estConc = Math.round(1200 + Math.random() * 500);
          rationale = `Synthetic urea detected: ${estConc} mg/L exceeds safe physiological limit (700 mg/L)`;
        } else if (zone.code === 'NEUTRALIZER') {
          estConc = 7.6;
          rationale = `Alkaline neutralization detected (pH 7.6). Caustic alkalis or detergent surfactants present`;
        } else if (zone.code === 'METANIL_YELLOW') {
          estConc = Math.round((0.55 + Math.random() * 0.3) * 1000.0) / 1000.0;
          rationale = `Hazardous non-permitted Metanil Yellow coal-tar dye detected (~${estConc}% w/w). Strictly prohibited under FSSAI`;
        } else if (zone.code === 'SUDAN_DYE') {
          estConc = Math.round((2.8 + Math.random() * 2.0) * 10.0) / 10.0;
          rationale = `Industrial carcinogenic Sudan I-IV synthetic colorant detected (~${estConc} ppm). Zero tolerance under FSSAI`;
        } else if (zone.code === 'ARGEMONE_OIL') {
          estConc = Math.round((0.45 + Math.random() * 0.3) * 1000.0) / 1000.0;
          rationale = `Toxic Argemone oil alkaloid (Sanguinarine) detected (~${estConc}%). Causes epidemic dropsy; strictly prohibited`;
        } else if (zone.code === 'INVERT_SUGAR') {
          estConc = Math.round((18.0 + Math.random() * 6.0) * 10.0) / 10.0;
          rationale = `Exogenous sugar syrup / elevated HMF detected (~${estConc}%). Fails FSSAI pure honey authenticity standards`;
        } else if (zone.code === 'MALACHITE_GREEN') {
          estConc = Math.round((2.5 + Math.random() * 1.8) * 10.0) / 10.0;
          rationale = `Toxic industrial dye (Malachite Green) detected (~${estConc} ppm) on fresh vegetables. Strictly prohibited under FSSAI`;
        } else if (zone.code === 'VANASPATI_GHEE') {
          estConc = Math.round((14.0 + Math.random() * 8.0) * 10.0) / 10.0;
          rationale = `Baudouin chromogen reaction positive: ~${estConc}% hydrogenated vegetable fat (Vanaspati) detected in Desi Ghee`;
        } else {
          estConc = 1.0;
          rationale = `Adulteration detected in Zone ${zone.zoneIndex}: ${zone.analyteName} exceeds statutory limit`;
        }
      }

      return {
        zoneIndex: zone.zoneIndex,
        analyteName: zone.analyteName,
        code: zone.code,
        nanomaterial: zone.nanomaterial,
        rawR: rgb.r,
        rawG: rgb.g,
        rawB: rgb.b,
        cielabL: isZoneAdulterated ? 42.0 : 75.0,
        cielabA: isZoneAdulterated ? 25.0 : 2.0,
        cielabB: isZoneAdulterated ? -15.0 : 15.0,
        deltaE: Math.round(deltaE * 10.0) / 10.0,
        estimatedConcentration: estConc,
        unit: zone.unit,
        threshold: zone.threshold,
        status: isZoneAdulterated ? 'POSITIVE_ADULTERATED' : 'SAFE_WITHIN_LIMITS',
        rationale
      };
    });

    const newRecord: TestSessionRecord = {
      id: 'sess-' + Date.now(),
      sessionCode: 'TEST-' + Date.now().toString().slice(-6),
      sampleCode,
      foodCategory: tmpl.category,
      foodItem: tmpl.foodItem,
      milkType,
      collectionSource,
      batchLotNumber: batchLot,
      deviceSerial,
      cartridgeUid: isExpired ? 'MC-EXPIRED-01' : cartridgeUid,
      operatorName: 'Field Quality Inspector',
      overallResult: overall,
      validityStatus: validity,
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      readings
    };

    onCompleteTest(newRecord);
  };

  // Commodities in the selected category
  const categoryCommodities = Object.entries(COMMODITY_TEMPLATES).filter(
    ([_, tmpl]) => tmpl.category === selectedCategory
  );

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-safe">
                <Sparkles size={13} /> Multi-Commodity Platform
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MoFPI SIH Problem #26235</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Run Rapid Food Adulterant Screening</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '680px' }}>
              Screen daily essential foods for hazardous adulterants directly on-site using multiplex microfluidics & optical colorimetry.
            </p>
          </div>
          <button onClick={onCancel} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            Cancel
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            1. SELECT DAILY FOOD COMMODITY CATEGORY
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCategorySelect('DAIRY')}
              disabled={isRunning}
              className={selectedCategory === 'DAIRY' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              🥛 Dairy Products (Milk, Paneer, Dahi)
            </button>
            <button
              onClick={() => handleCategorySelect('HONEY')}
              disabled={isRunning}
              className={selectedCategory === 'HONEY' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              🍯 Pure Honey (Madh)
            </button>
            <button
              onClick={() => handleCategorySelect('SPICES')}
              disabled={isRunning}
              className={selectedCategory === 'SPICES' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              🌶️ Spices (Turmeric, Red Chilli)
            </button>
            <button
              onClick={() => handleCategorySelect('EDIBLE_OILS')}
              disabled={isRunning}
              className={selectedCategory === 'EDIBLE_OILS' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              🛢️ Edible Cooking Oils & Desi Ghee
            </button>
            <button
              onClick={() => handleCategorySelect('VEGETABLES')}
              disabled={isRunning}
              className={selectedCategory === 'VEGETABLES' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            >
              🥬 Fresh Green Vegetables
            </button>
          </div>
        </div>

        {/* Commodity Sub-Item Selection */}
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            2. SELECT SPECIFIC FOOD PRODUCT
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categoryCommodities.map(([key, tmpl]) => (
              <button
                key={key}
                onClick={() => setSelectedCommodityKey(key)}
                disabled={isRunning}
                className={selectedCommodityKey === key ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  background: selectedCommodityKey === key ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'
                }}
              >
                {tmpl.foodItem}
              </button>
            ))}
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Target sample preparation: {activeTemplate.sampleDescription}
          </p>
        </div>

        {/* Configuration Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Sample Identifier Code
            </label>
            <input
              type="text"
              value={sampleCode}
              onChange={e => setSampleCode(e.target.value)}
              disabled={isRunning}
              className="form-input"
            />
          </div>

          {selectedCommodityKey === 'MILK' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Milk Matrix Origin
              </label>
              <select
                value={milkType}
                onChange={e => setMilkType(e.target.value as any)}
                disabled={isRunning}
                className="form-input"
              >
                <option value="COW">Bovine Cow Milk</option>
                <option value="BUFFALO">Buffalo Milk</option>
                <option value="MIXED">Mixed Dairy Milk</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Collection Mandi / Depot / Source
            </label>
            <input
              type="text"
              value={collectionSource}
              onChange={e => setCollectionSource(e.target.value)}
              disabled={isRunning}
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Batch / Lot Number
            </label>
            <input
              type="text"
              value={batchLot}
              onChange={e => setBatchLot(e.target.value)}
              disabled={isRunning}
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Portable Electronic Reader
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={deviceSerial}
                onChange={e => setDeviceSerial(e.target.value)}
                disabled={isRunning}
                className="form-input"
              />
              <span className="dot dot-safe" title="Connected"></span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Demonstration Test Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={e => setSelectedScenario(e.target.value)}
              disabled={isRunning}
              className="form-input"
              style={{ borderColor: selectedScenario !== 'SAFE' ? 'var(--color-warning)' : 'var(--border-subtle)' }}
            >
              <option value="SAFE">✅ 100% Pure & Authentic (Pass FSSAI Screening)</option>
              <option value="ADULTERATED_PRIMARY">
                ⚠️ Primary Adulterant: {activeTemplate.zones[0]?.analyteName} (Positive Spike)
              </option>
              <option value="ADULTERATED_SECONDARY">
                ⚠️ Secondary Adulterant: {activeTemplate.zones[1]?.analyteName} (Positive Spike)
              </option>
              <option value="ADULTERATED_MULTI">
                🚨 Multi-Adulterant Spike ({activeTemplate.zones[0]?.analyteName} + {activeTemplate.zones[1]?.analyteName})
              </option>
              <option value="EXPIRED">❌ Expired Cartridge Simulation (Validity Gate Rejection)</option>
            </select>
          </div>
        </div>

        {/* Live Cartridge Optical Plate Visualization */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--color-primary)" />
              CLOSED OPTICAL CHAMBER 6-WELL CASSETTE ({activeTemplate.foodItem.toUpperCase()})
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              OV2640 High-CRI Optical Field
            </span>
          </div>

          <div className="cartridge-plate">
            {activeTemplate.zones.map((zone, idx) => {
              const wellKey = `z${idx + 1}` as keyof typeof wellColors;
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    className="cartridge-well"
                    style={{
                      backgroundColor: wellColors[wellKey],
                      transition: 'background-color 0.8s ease'
                    }}
                  ></div>
                  <span style={{ display: 'block', marginTop: '8px', fontSize: '0.72rem', fontWeight: 600 }}>
                    Z{zone.zoneIndex}: {zone.analyteName}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{zone.nanomaterial}</span>
                </div>
              );
            })}

            {/* Zone 6: Calibration Reference */}
            <div style={{ textAlign: 'center' }}>
              <div className="cartridge-well" style={{ backgroundColor: wellColors.z6, border: '3px solid #3b82f6' }}></div>
              <span style={{ display: 'block', marginTop: '8px', fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6' }}>
                Z6: Ref White
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>BaSO4 Standard</span>
            </div>
          </div>
        </div>

        {/* Reaction Progress / Trigger Action */}
        {!isRunning && currentStage !== 'DONE' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleStartTest}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }}
            >
              <Play size={18} fill="#ffffff" /> Start Rapid Test for {activeTemplate.foodItem}
            </button>
          </div>
        )}

        {isRunning && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {currentStage === 'INCUBATING' && `Capillary Flow & Chromogenic Incubation: ${countdown}s remaining`}
              {currentStage === 'IMAGING' && 'Capturing High-CRI Optical Frame via ESP32-S3 OV2640...'}
              {currentStage === 'ANALYZING' && `Running CIELAB Homography & FSSAI Screening for ${activeTemplate.foodItem}...`}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Optical chamber light locked at 5000K daylight CRI 98+. Background normalization in progress...
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              marginTop: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((8 - countdown) / 8) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                transition: 'width 1s linear'
              }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
