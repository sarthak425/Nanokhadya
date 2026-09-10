import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Filter, 
  Radio, 
  FileText, 
  RefreshCw, 
  Layers, 
  Zap, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Navigation,
  Globe2
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface GeoMandiNode {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  svgX: number; // percentage on map (0-100)
  svgY: number; // percentage on map (0-100)
  category: 'DAIRY' | 'HONEY' | 'SPICES' | 'EDIBLE_OILS' | 'VEGETABLES';
  foodItem: string;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  adulterant: string;
  concentration: string;
  fssaiLimit: string;
  cartridgeUid: string;
  inspector: string;
  complianceRate: number;
  lastTested: string;
  actionTaken: string;
}

export const MANDI_SURVEILLANCE_DATA: GeoMandiNode[] = [
  {
    id: 'MND-MUM-01',
    name: 'Vashi APMC Wholesale Market',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    lat: 19.0770,
    lng: 72.9986,
    svgX: 30,
    svgY: 57,
    category: 'VEGETABLES',
    foodItem: 'Fresh Green Peas & Parwal',
    status: 'CRITICAL',
    adulterant: 'Malachite Green Dye & Copper Sulphate',
    concentration: '14.8 ppm',
    fssaiLimit: '0.00 ppm (Zero Tolerance Prohibited)',
    cartridgeUid: 'CART-NANO-9821-MH',
    inspector: 'Insp. V. Kulkarni (MH-FDA-402)',
    complianceRate: 64.2,
    lastTested: '4 mins ago',
    actionTaken: 'Mandi lot #449 quarantined; MoFPI recall protocol triggered.'
  },
  {
    id: 'MND-MUM-02',
    name: 'Dadar Central Khoya Mandi',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0178,
    lng: 72.8478,
    svgX: 28.5,
    svgY: 59,
    category: 'DAIRY',
    foodItem: 'Fresh Paneer & Khoya',
    status: 'CRITICAL',
    adulterant: 'Starch Bulking & Alkaline Detergent',
    concentration: '3.4% w/w Starch, pH 7.8',
    fssaiLimit: '0.00% (Strictly Prohibited)',
    cartridgeUid: 'CART-NANO-7741-MH',
    inspector: 'Insp. R. Sawant (MH-FDA-118)',
    complianceRate: 58.5,
    lastTested: '12 mins ago',
    actionTaken: 'Supply vehicle intercepted under FSS Act Sec 38.'
  },
  {
    id: 'MND-GUJ-01',
    name: 'Anand Milk Union Bulk Chilling Hub',
    city: 'Anand',
    state: 'Gujarat',
    lat: 22.5645,
    lng: 72.9289,
    svgX: 26,
    svgY: 48,
    category: 'DAIRY',
    foodItem: 'Raw Bovine Milk',
    status: 'SAFE',
    adulterant: 'None Detected (Melamine, H2O2, Urea Safe)',
    concentration: '<0.10 ppm (Baseline Pure)',
    fssaiLimit: '1.00 ppm MRL',
    cartridgeUid: 'CART-NANO-2201-GJ',
    inspector: 'Officer D. Patel (GJ-FDCA-89)',
    complianceRate: 99.1,
    lastTested: '7 mins ago',
    actionTaken: 'Certified Compliant batch cleared for pasteurization packaging.'
  },
  {
    id: 'MND-PUN-01',
    name: 'Amritsar Desi Ghee & Dairy Terminal',
    city: 'Amritsar',
    state: 'Punjab',
    lat: 31.6340,
    lng: 74.8723,
    svgX: 31,
    svgY: 22,
    category: 'DAIRY',
    foodItem: 'Desi Butter & Ghee',
    status: 'CRITICAL',
    adulterant: 'Hydrogenated Vegetable Oil (Vanaspati)',
    concentration: 'Baudouin Chromophore +18.4 nm shift (~15% fat substitution)',
    fssaiLimit: 'Zero Foreign Fat Allowance',
    cartridgeUid: 'CART-NANO-3304-PB',
    inspector: 'Insp. H. Singh (PB-FSA-07)',
    complianceRate: 71.0,
    lastTested: '19 mins ago',
    actionTaken: 'Non-genuine batch flagged; manufacturer notice served.'
  },
  {
    id: 'MND-TEL-01',
    name: 'Nizamabad APMC National Turmeric Terminal',
    city: 'Nizamabad',
    state: 'Telangana',
    lat: 18.6725,
    lng: 78.0941,
    svgX: 43,
    svgY: 59,
    category: 'SPICES',
    foodItem: 'Pure Turmeric Powder (Haldi)',
    status: 'CRITICAL',
    adulterant: 'Metanil Yellow Dye (Industrial Coal-tar)',
    concentration: '84.5 mg/kg',
    fssaiLimit: 'Prohibited Non-Permitted Color (0 ppm)',
    cartridgeUid: 'CART-NANO-8812-TS',
    inspector: 'Officer K. Reddy (TS-FD-204)',
    complianceRate: 62.8,
    lastTested: '2 mins ago',
    actionTaken: 'Wholesale lot seized on-site; FIR lodged for toxic coloring.'
  },
  {
    id: 'MND-AP-01',
    name: 'Guntur Asia Mirchi Yard',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
    svgX: 48,
    svgY: 67,
    category: 'SPICES',
    foodItem: 'Degi Red Chilli Powder',
    status: 'CRITICAL',
    adulterant: 'Sudan Dye I & Sudan IV (Lipophilic Carcinogen)',
    concentration: '22.1 ppm',
    fssaiLimit: '0.00 ppm (Banned Carcinogenic Dye)',
    cartridgeUid: 'CART-NANO-4419-AP',
    inspector: 'Officer M. Rao (AP-FSA-512)',
    complianceRate: 68.4,
    lastTested: '15 mins ago',
    actionTaken: 'Inter-state shipment halted at border toll gate.'
  },
  {
    id: 'MND-RAJ-01',
    name: 'Alwar Cold-Press Oil Mill Cluster',
    city: 'Alwar',
    state: 'Rajasthan',
    lat: 27.5530,
    lng: 76.6346,
    svgX: 35,
    svgY: 36,
    category: 'EDIBLE_OILS',
    foodItem: 'Mustard Cooking Oil (Sarson)',
    status: 'CRITICAL',
    adulterant: 'Argemone Mexicana Oil (Sanguinarine Neurotoxin)',
    concentration: '0.45% w/w (~4500 ppm)',
    fssaiLimit: '0.00 ppm (Causes Epidemic Dropsy)',
    cartridgeUid: 'CART-NANO-5532-RJ',
    inspector: 'Insp. S. Sharma (RJ-FSO-91)',
    complianceRate: 54.0,
    lastTested: '9 mins ago',
    actionTaken: 'Seal placed on cold press expeller #3; public alert issued.'
  },
  {
    id: 'MND-HP-01',
    name: 'Kangra Valley Apiculture Cooperative',
    city: 'Kangra',
    state: 'Himachal Pradesh',
    lat: 32.0998,
    lng: 76.2691,
    svgX: 33,
    svgY: 18,
    category: 'HONEY',
    foodItem: 'Himalayan Wild Forest Honey',
    status: 'WARNING',
    adulterant: 'Invert Sugar / Rice Syrup (HMF Elevation)',
    concentration: 'HMF 88 mg/kg; +35% C4 isotope proxy',
    fssaiLimit: 'HMF Max 80 mg/kg; 0% foreign sugar',
    cartridgeUid: 'CART-NANO-1192-HP',
    inspector: 'Officer P. Thakur (HP-FSA-14)',
    complianceRate: 79.3,
    lastTested: '28 mins ago',
    actionTaken: 'Sample transferred to NABL accredited lab for 13C-EA-IRMS confirmation.'
  },
  {
    id: 'MND-DEL-01',
    name: 'Azadpur National Fruit & Vegetable Mandi',
    city: 'North Delhi',
    state: 'Delhi NCR',
    lat: 28.7118,
    lng: 77.1724,
    svgX: 37,
    svgY: 32,
    category: 'VEGETABLES',
    foodItem: 'Pointed Gourd (Parwal) & Okra',
    status: 'CRITICAL',
    adulterant: 'Synthetic Green Brightener (Malachite Green)',
    concentration: '11.2 ppm optical shift',
    fssaiLimit: '0.00 ppm (Prohibited in Foods)',
    cartridgeUid: 'CART-NANO-9901-DL',
    inspector: 'Chief Insp. A. Verma (DL-FSSAI-01)',
    complianceRate: 61.5,
    lastTested: '1 min ago',
    actionTaken: 'Auction lot stopped; wholesale merchant summoned.'
  },
  {
    id: 'MND-KAR-01',
    name: 'Yeshwanthpur Wholesale APMC Hub',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 13.0285,
    lng: 77.5458,
    svgX: 41,
    svgY: 77,
    category: 'DAIRY',
    foodItem: 'Pasteurized Dairy Curd & Milk',
    status: 'SAFE',
    adulterant: 'None (Pure / Preservative-Free)',
    concentration: 'Negative across all 5 cartridge wells',
    fssaiLimit: 'FSSAI Schedule IV Compliant',
    cartridgeUid: 'CART-NANO-6610-KA',
    inspector: 'Insp. S. Hegde (KA-FDA-302)',
    complianceRate: 98.7,
    lastTested: '11 mins ago',
    actionTaken: 'Clean certificate awarded to cooperative distribution cold chain.'
  },
  {
    id: 'MND-WB-01',
    name: 'Posta Bazar Wholesale Commodity Hub',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5831,
    lng: 88.3540,
    svgX: 68,
    svgY: 48,
    category: 'EDIBLE_OILS',
    foodItem: 'Blended Mustard & Sesame Oil',
    status: 'WARNING',
    adulterant: 'Cheap Rice Bran Oil Dilution & Artificial Pungency',
    concentration: 'Unlabeled Refined Oil ~24% blend',
    fssaiLimit: 'Mandatory Multi-Source Edible Oil Labeling',
    cartridgeUid: 'CART-NANO-7711-WB',
    inspector: 'Officer D. Banerjee (WB-FSA-82)',
    complianceRate: 74.5,
    lastTested: '34 mins ago',
    actionTaken: 'Misbranding violation notice served under Food Safety Act.'
  },
  {
    id: 'MND-UP-01',
    name: 'Varanasi Sigra Food Grain & Ghee Mandi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    svgX: 52,
    svgY: 42,
    category: 'DAIRY',
    foodItem: 'Traditional Desi Ghee',
    status: 'CRITICAL',
    adulterant: 'Animal Body Tallow & Hydrogenated Fats',
    concentration: 'Cholesterol/Phytosterol abnormal ratio detected',
    fssaiLimit: '0.00% Non-Milk Fat',
    cartridgeUid: 'CART-NANO-4521-UP',
    inspector: 'Insp. R. Tripathi (UP-FSDA-19)',
    complianceRate: 59.8,
    lastTested: '8 mins ago',
    actionTaken: 'Stock sealed in warehouse pending penal inquiry.'
  }
];

export const NationalGeoMapView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<GeoMandiNode>(MANDI_SURVEILLANCE_DATA[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Radar sweep animation
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarAngle(prev => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Live surveillance ticker simulation
  useEffect(() => {
    const initialLogs = [
      '📡 [08:44:12] ESP32 Reader #MH-402 connected via 4G/LTE from Vashi APMC Mandi',
      '⚠️ [08:44:15] POSITIVE_ALERT: Malachite Green detected in green vegetable sample (lot #449)',
      '✅ [08:44:19] Anand Gujarat bulk dairy station cleared 10,000L bovine milk (Zero Melamine)',
      '🚨 [08:44:24] CRITICAL: Metanil Yellow coal-tar dye flagged at Nizamabad Turmeric yard'
    ];
    setLiveLog(initialLogs);

    const logTimer = setInterval(() => {
      const mandis = MANDI_SURVEILLANCE_DATA;
      const randomMandi = mandis[Math.floor(Math.random() * mandis.length)];
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      const statusIcon = randomMandi.status === 'SAFE' ? '✅' : randomMandi.status === 'WARNING' ? '⚠️' : '🚨';
      const newEntry = `${statusIcon} [${now}] ${randomMandi.name} (${randomMandi.city}): ${randomMandi.foodItem} tested -> ${randomMandi.status}`;
      
      setLiveLog(prev => [newEntry, ...prev.slice(0, 5)]);
    }, 8000);

    return () => clearInterval(logTimer);
  }, []);

  const handleSelectNode = (node: GeoMandiNode) => {
    sound.click();
    setSelectedNode(node);
  };

  const filteredNodes = MANDI_SURVEILLANCE_DATA.filter(n => {
    const matchCat = categoryFilter === 'ALL' || n.category === categoryFilter;
    const matchStat = statusFilter === 'ALL' || n.status === statusFilter;
    return matchCat && matchStat;
  });

  const totalMonitored = MANDI_SURVEILLANCE_DATA.length;
  const criticalCount = MANDI_SURVEILLANCE_DATA.filter(n => n.status === 'CRITICAL').length;
  const safeCount = MANDI_SURVEILLANCE_DATA.filter(n => n.status === 'SAFE').length;
  const nationalCompliance = Math.round((safeCount / totalMonitored) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px 30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-safe" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={12} className="radar-sweep" /> LIVE GEO-SURVEILLANCE HUD
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                MoFPI & FSSAI National Food Adulteration Early Warning Grid
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginTop: '6px', letterSpacing: '-0.02em' }}>
              National Food Adulterant Geo-Tracking & Mandi Telemetry
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px', marginTop: '4px' }}>
              Real-time spatial monitoring of food adulteration across wholesale APMC mandis, dairy unions, and cold-chain hubs. Every test is cryptographically logged with GPS coordinates, field inspector credentials, and LSPR photonic spectral signatures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>MONITORED MANDIS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>12 Hubs</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>ACTIVE VIOLATIONS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{criticalCount} Hotspots</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>SAFETY COMPLIANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{nationalCompliance}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Commodity:
          </span>
          {[
            { key: 'ALL', label: 'All Commodities' },
            { key: 'DAIRY', label: '🥛 Dairy' },
            { key: 'SPICES', label: '🌶️ Spices' },
            { key: 'EDIBLE_OILS', label: '🛢️ Oils & Ghee' },
            { key: 'HONEY', label: '🍯 Honey' },
            { key: 'VEGETABLES', label: '🥬 Vegetables' }
          ].map(c => (
            <button
              key={c.key}
              onClick={() => { sound.click(); setCategoryFilter(c.key); }}
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: categoryFilter === c.key ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                color: categoryFilter === c.key ? '#fff' : 'var(--text-muted)',
                fontWeight: categoryFilter === c.key ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '6px' }}>Status:</span>
          {[
            { key: 'ALL', label: 'All Status' },
            { key: 'CRITICAL', label: '🚨 Hotspots' },
            { key: 'WARNING', label: '⚠️ Suspicious' },
            { key: 'SAFE', label: '✅ Safe' }
          ].map(s => (
            <button
              key={s.key}
              onClick={() => { sound.click(); setStatusFilter(s.key); }}
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === s.key ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === s.key ? '#fff' : 'var(--text-dim)',
                fontWeight: statusFilter === s.key ? 600 : 400
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Mandi Inspector Drawer */}
      <div className="geo-map-grid">
        
        {/* Interactive Map Visualizer Box */}
        <div className="glass-card geo-map-canvas-box" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe2 size={18} color="var(--color-primary)" /> National Spatial Vector Map (India Radar)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span className="dot dot-safe"></span> Live Uplink (GPS Accurate)
            </div>
          </div>

          {/* Map Canvas / SVG Area */}
          <div 
            className="geo-map-inner"
            style={{
              flex: 1,
              position: 'relative',
              background: 'radial-gradient(ellipse at 45% 50%, rgba(15, 23, 42, 0.95), rgba(6, 9, 19, 0.98))',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '480px'
            }}
          >

            {/* Radar Coordinates Graticule */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Concentric radar rings centered at coordinates */}
              <circle cx="45%" cy="50%" r="90" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="45%" cy="50%" r="180" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="45%" cy="50%" r="270" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 8" />
              <line x1="45%" y1="0%" x2="45%" y2="100%" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 3" />
            </svg>

            {/* High-Resolution India Geographical Boundary SVG Representation */}
            <svg
              viewBox="0 0 800 900"
              style={{
                width: '90%',
                height: '92%',
                filter: 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.15))'
              }}
            >
              {/* Stylized High-Tech Vector Path of India Mainland */}
              <path
                d="M 310,95 L 340,90 L 375,130 L 400,165 L 380,210 L 450,225 L 485,250 L 530,260 L 585,270 L 610,240 L 640,245 L 670,260 L 650,290 L 590,300 L 575,340 L 590,385 L 565,430 L 540,470 L 510,515 L 480,570 L 435,630 L 405,685 L 385,745 L 370,780 L 365,800 L 360,820 L 350,830 L 340,820 L 330,780 L 325,730 L 310,670 L 290,620 L 265,580 L 250,540 L 220,500 L 210,470 L 230,440 L 260,430 L 285,410 L 290,380 L 280,340 L 275,300 L 265,260 L 270,220 L 260,180 L 275,150 L 310,95 Z"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Northeast Wing Vector */}
              <path
                d="M 590,295 L 640,285 L 690,280 L 730,295 L 750,330 L 730,360 L 685,365 L 660,390 L 630,370 L 620,330 L 590,300 Z"
                fill="rgba(15, 23, 42, 0.75)"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="2"
              />

              {/* Jammu & Kashmir / Ladakh Crown */}
              <path
                d="M 310,95 L 335,60 L 370,50 L 400,70 L 415,100 L 390,140 L 355,140 L 310,95 Z"
                fill="rgba(56, 189, 248, 0.1)"
                stroke="rgba(56, 189, 248, 0.5)"
                strokeWidth="1.5"
              />

              {/* Glowing Radar Sweep Beam */}
              <g transform="translate(360, 450)">
                <line
                  x1="0"
                  y1="0"
                  x2={380 * Math.cos((radarAngle * Math.PI) / 180)}
                  y2={380 * Math.sin((radarAngle * Math.PI) / 180)}
                  stroke="rgba(16, 185, 129, 0.7)"
                  strokeWidth="2"
                />
              </g>
            </svg>

            {/* Clickable Mandi Pins on the Map */}
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isCritical = node.status === 'CRITICAL';
              const isSafe = node.status === 'SAFE';
              const pinColor = isCritical ? '#ef4444' : isSafe ? '#10b981' : '#f59e0b';

              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.svgX}%`,
                    top: `${node.svgY}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 30 : 20,
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  title={`${node.name} (${node.foodItem})`}
                >
                  {/* Glowing Radar Pulse Ring */}
                  {isCritical && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.25)',
                        border: '1px solid #ef4444',
                        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }}
                    />
                  )}

                  {/* Marker Pin Icon */}
                  <div
                    style={{
                      width: isSelected ? '34px' : '26px',
                      height: isSelected ? '34px' : '26px',
                      borderRadius: '50%',
                      background: isSelected 
                        ? `radial-gradient(circle, #ffffff, ${pinColor})` 
                        : `radial-gradient(circle, ${pinColor}, #0f172a)`,
                      border: `2px solid ${isSelected ? '#ffffff' : pinColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected 
                        ? `0 0 20px ${pinColor}, 0 0 35px ${pinColor}` 
                        : `0 0 10px ${pinColor}`,
                      color: isSelected ? '#000' : '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    {node.category === 'DAIRY' ? '🥛' : node.category === 'SPICES' ? '🌶️' : node.category === 'EDIBLE_OILS' ? '🛢️' : node.category === 'HONEY' ? '🍯' : '🥬'}
                  </div>

                  {/* Label badge on hover/selection */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: `1px solid ${pinColor}`,
                        backdropFilter: 'blur(12px)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        pointerEvents: 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{node.city}</span>
                      <span style={{ fontSize: '0.65rem', color: pinColor, fontWeight: 600 }}>
                        {isCritical ? '🚨 Adulteration Flagged' : isSafe ? '✅ FSSAI Pure' : '⚠️ Warning'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Legend */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.72rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>Surveillance Legend</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>Severe Adulteration Hotspot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>Suspicious / MRL Warning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>100% Certified Compliant Mandi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Mandi Live Telemetry Drawer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {selectedNode && (
            <div className="glass-card" style={{ padding: '24px', border: `1px solid ${selectedNode.status === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : selectedNode.status === 'SAFE' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
              {/* Mandi Title & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span className={`badge ${selectedNode.status === 'CRITICAL' ? 'badge-danger' : selectedNode.status === 'SAFE' ? 'badge-safe' : 'badge-warning'}`} style={{ fontSize: '0.72rem', marginBottom: '6px' }}>
                    {selectedNode.status === 'CRITICAL' ? '🚨 SEVERE ADULTERATION ALERT' : selectedNode.status === 'SAFE' ? '✅ 100% PURE COMPLIANT' : '⚠️ WARNING / SUSPICIOUS'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{selectedNode.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--color-primary)" /> {selectedNode.city}, {selectedNode.state} (GPS: {selectedNode.lat.toFixed(4)}°N, {selectedNode.lng.toFixed(4)}°E)
                  </div>
                </div>

                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: selectedNode.status === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  border: `1px solid ${selectedNode.status === 'CRITICAL' ? '#ef4444' : '#10b981'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {selectedNode.category === 'DAIRY' ? '🥛' : selectedNode.category === 'SPICES' ? '🌶️' : selectedNode.category === 'EDIBLE_OILS' ? '🛢️' : selectedNode.category === 'HONEY' ? '🍯' : '🥬'}
                </div>
              </div>

              {/* Key Forensic Readings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sample Tested:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{selectedNode.foodItem}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Adulterant Identified:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedNode.status === 'CRITICAL' ? '#f87171' : '#34d399' }}>
                    {selectedNode.adulterant}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Detected Concentration:</span>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {selectedNode.concentration}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>FSSAI Legal Tolerance:</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedNode.fssaiLimit}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Field Nano-Cartridge:</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>{selectedNode.cartridgeUid}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Accredited Inspector:</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{selectedNode.inspector}</span>
                </div>
              </div>

              {/* FSSAI Action Box */}
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: selectedNode.status === 'CRITICAL' ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${selectedNode.status === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedNode.status === 'CRITICAL' ? '#f87171' : '#34d399', marginBottom: '4px' }}>
                  ⚡ LEGAL PROTOCOL & REGULATORY ACTION:
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  {selectedNode.actionTaken}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', background: selectedNode.status === 'CRITICAL' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #059669, #10b981)' }}
                  onClick={() => {
                    sound.start();
                    setIsOrderModalOpen(true);
                  }}
                >
                  <FileText size={15} /> Issue MoFPI Enforcement Notice
                </button>
              </div>
            </div>
          )}

          {/* Live Incident Stream Card */}
          <div className="glass-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--color-primary)" /> Live Field Incident Feed
              </div>
              <span className="dot dot-safe"></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '180px' }}>
              {liveLog.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    color: log.includes('CRITICAL') || log.includes('🚨') ? '#f87171' : log.includes('WARNING') || log.includes('⚠️') ? '#fbbf24' : '#34d399',
                    lineHeight: 1.4
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Enforcement Order Modal */}
      {isOrderModalOpen && selectedNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '30px', border: '1px solid rgba(239,68,68,0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#ef4444" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>OFFICIAL FSSAI & MoFPI SEIZURE DIRECTIVE</h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Pursuant to Section 38 of the <strong>Food Safety and Standards Act, 2006</strong> and Smart India Hackathon Rapid Verification Protocol:
              <br /><br />
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
                <strong>Location:</strong> {selectedNode.name}, {selectedNode.city}, {selectedNode.state}<br />
                <strong>Target Commodity:</strong> {selectedNode.foodItem}<br />
                <strong>Detected Violation:</strong> <span style={{ color: '#f87171' }}>{selectedNode.adulterant} ({selectedNode.concentration})</span><br />
                <strong>Sensor Serial:</strong> {selectedNode.cartridgeUid} (LSPR Photonic Peak Verified)<br />
                <strong>Authorized Inspector:</strong> {selectedNode.inspector}
              </div>
              <br />
              All stocks from the tested batch are hereby ordered to be quarantined immediately under seal of the Food Safety Officer.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-secondary"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Close Directive
              </button>
              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                onClick={() => {
                  sound.success();
                  alert(`Digital Enforcement Notice #FSSAI-${Date.now().toString().slice(-6)} dispatched to ${selectedNode.city} District Magistrate and Food Safety Commissioner.`);
                  setIsOrderModalOpen(false);
                }}
              >
                <Zap size={15} /> Dispatch Digital Seizure Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
