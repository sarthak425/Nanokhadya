import { Analyte, TestSessionRecord, DeviceInfo, CartridgeInfo } from './types';

export const INITIAL_ANALYTES: Analyte[] = [
  // DAIRY
  {
    id: 1,
    name: 'Melamine',
    codeIdentifier: 'MELAMINE',
    zoneIndex: 1,
    regulatoryThresholdFssai: 2.5,
    unit: 'ppm',
    zeroTolerance: false,
    sensingNanomaterial: 'Citrate-AuNPs (13nm)',
    description: 'LSPR plasmonic shift from red (520nm) to blue (650nm) upon cross-linking',
    commodityCategory: 'DAIRY'
  },
  {
    id: 2,
    name: 'Hydrogen Peroxide',
    codeIdentifier: 'H2O2',
    zoneIndex: 2,
    regulatoryThresholdFssai: 0.0,
    unit: 'ppm',
    zeroTolerance: true,
    sensingNanomaterial: 'Fe3O4 Nanozyme + TMB',
    description: 'Peroxidase-like catalytic oxidation of colorless TMB to sky-blue oxTMB',
    commodityCategory: 'DAIRY'
  },
  {
    id: 3,
    name: 'Synthetic Urea',
    codeIdentifier: 'UREA',
    zoneIndex: 3,
    regulatoryThresholdFssai: 700.0,
    unit: 'mg/L',
    zeroTolerance: false,
    sensingNanomaterial: 'Urease + Phenol Red/BTB',
    description: 'Enzymatic hydrolysis creates ammonium ions, shifting pH > 8.0 (yellow to magenta)',
    commodityCategory: 'DAIRY'
  },
  {
    id: 4,
    name: 'Starch & Dextrin',
    codeIdentifier: 'STARCH',
    zoneIndex: 4,
    regulatoryThresholdFssai: 0.0,
    unit: '% w/v',
    zeroTolerance: true,
    sensingNanomaterial: 'Lugol Iodine-PVP Nanocomposite',
    description: 'Triiodide inclusion in amylose helices causing instant deep inky-blue complex',
    commodityCategory: 'DAIRY'
  },
  {
    id: 5,
    name: 'Neutralizer & Detergent',
    codeIdentifier: 'NEUTRALIZER',
    zoneIndex: 5,
    regulatoryThresholdFssai: 0.0,
    unit: 'pH / %',
    zeroTolerance: true,
    sensingNanomaterial: 'Bromocresol Purple & Surfactant Indicator',
    description: 'Alkali additions shift pH > 6.8 (yellow-green to purple); surfactants induce migration',
    commodityCategory: 'DAIRY'
  },
  // SPICES
  {
    id: 6,
    name: 'Metanil Yellow Dye',
    codeIdentifier: 'METANIL_YELLOW',
    zoneIndex: 1,
    regulatoryThresholdFssai: 0.0,
    unit: '% w/w',
    zeroTolerance: true,
    sensingNanomaterial: 'Acidified Curcuminoid Strips',
    description: 'Protonation of azo dye turns distinct violet/magenta while natural curcumin remains yellow',
    commodityCategory: 'SPICES'
  },
  {
    id: 7,
    name: 'Sudan Dyes I-IV',
    codeIdentifier: 'SUDAN_DYE',
    zoneIndex: 2,
    regulatoryThresholdFssai: 0.0,
    unit: 'ppm',
    zeroTolerance: true,
    sensingNanomaterial: 'Lipophilic AuNP Partition Sensor',
    description: 'Hydrophobic partition of Sudan I-IV dyes induces plasmonic AuNP aggregation',
    commodityCategory: 'SPICES'
  },
  // EDIBLE OILS & GHEE
  {
    id: 8,
    name: 'Toxic Argemone Oil',
    codeIdentifier: 'ARGEMONE_OIL',
    zoneIndex: 1,
    regulatoryThresholdFssai: 0.0,
    unit: '%',
    zeroTolerance: true,
    sensingNanomaterial: 'Sanguinarine Ferric Charge-Transfer Matrix',
    description: 'Nitric acid and ferric reagent reacts with sanguinarine producing bright orange-red precipitate',
    commodityCategory: 'EDIBLE_OILS'
  },
  {
    id: 9,
    name: 'Vanaspati in Desi Ghee',
    codeIdentifier: 'VANASPATI_GHEE',
    zoneIndex: 2,
    regulatoryThresholdFssai: 0.0,
    unit: '%',
    zeroTolerance: true,
    sensingNanomaterial: 'Baudouin Furfural-HCl Chromogen',
    description: 'Reaction with sesamolin in hydrogenated fats yields characteristic rose-crimson chromogen',
    commodityCategory: 'EDIBLE_OILS'
  },
  // HONEY
  {
    id: 10,
    name: 'Invert Sugar & HFCS',
    codeIdentifier: 'INVERT_SUGAR',
    zoneIndex: 1,
    regulatoryThresholdFssai: 5.0,
    unit: '%',
    zeroTolerance: true,
    sensingNanomaterial: 'Fiehe Resorcinol-HCl Complex',
    description: 'Reaction with hydroxymethylfurfural (HMF) in artificial syrups forms cherry-red complex',
    commodityCategory: 'HONEY'
  },
  // VEGETABLES
  {
    id: 11,
    name: 'Malachite Green Dye',
    codeIdentifier: 'MALACHITE_GREEN',
    zoneIndex: 1,
    regulatoryThresholdFssai: 0.0,
    unit: 'ppm',
    zeroTolerance: true,
    sensingNanomaterial: 'Triphenylmethane Optoprobe',
    description: 'Rapid reduction strip detects prohibited Malachite Green dye on green peas, chillies and gourds',
    commodityCategory: 'VEGETABLES'
  }
];

export const INITIAL_DEVICES: DeviceInfo[] = [
  {
    id: 'dev-001',
    deviceSerial: 'READER-ESP32S3-001',
    modelVersion: 'v1.0-ESP32S3-OptoChamber',
    firmwareVersion: '1.0.0',
    assignedLocation: 'Anand Milk Union MCC-04, Gujarat',
    batteryLevel: 94,
    status: 'ACTIVE',
    lastHeartbeat: '2 mins ago'
  },
  {
    id: 'dev-002',
    deviceSerial: 'READER-ESP32S3-002',
    modelVersion: 'v1.0-ESP32S3-OptoChamber',
    firmwareVersion: '1.0.0',
    assignedLocation: 'APMC Spice & Commodity Yard, Vashi Navi Mumbai',
    batteryLevel: 88,
    status: 'ACTIVE',
    lastHeartbeat: '5 mins ago'
  },
  {
    id: 'dev-003',
    deviceSerial: 'READER-ESP32S3-003',
    modelVersion: 'v1.0-ESP32S3-OptoChamber',
    firmwareVersion: '1.0.0',
    assignedLocation: 'State Food Testing Flying Squad, Jaipur',
    batteryLevel: 78,
    status: 'ACTIVE',
    lastHeartbeat: '14 mins ago'
  }
];

export const INITIAL_CARTRIDGES: CartridgeInfo[] = [
  {
    id: 'cart-001',
    cartridgeUid: 'MC-9021',
    batchNumber: '2026-B1',
    manufacturingDate: '2026-09-01',
    expiryDate: '2027-03-01',
    isUsed: false
  },
  {
    id: 'cart-002',
    cartridgeUid: 'MC-9022',
    batchNumber: '2026-B1',
    manufacturingDate: '2026-09-01',
    expiryDate: '2027-03-01',
    isUsed: false
  },
  {
    id: 'cart-003',
    cartridgeUid: 'MC-8940',
    batchNumber: '2026-A4',
    manufacturingDate: '2026-08-15',
    expiryDate: '2027-02-15',
    isUsed: true
  }
];

export interface CommodityTemplate {
  category: 'DAIRY' | 'HONEY' | 'SPICES' | 'EDIBLE_OILS' | 'VEGETABLES';
  foodItem: string;
  defaultLot: string;
  defaultSource: string;
  sampleDescription: string;
  zones: {
    zoneIndex: number;
    analyteName: string;
    code: string;
    nanomaterial: string;
    unit: string;
    threshold: number;
    safeColor: { r: number; g: number; b: number; name: string };
    adulteratedColor: { r: number; g: number; b: number; name: string };
    description: string;
  }[];
}

export const COMMODITY_TEMPLATES: Record<string, CommodityTemplate> = {
  'MILK': {
    category: 'DAIRY',
    foodItem: 'Milk (Cow / Buffalo)',
    defaultLot: 'LOT-MK-882',
    defaultSource: 'Village Chikhodra Collection Centre, Anand',
    sampleDescription: 'Fresh bovine milk collection before bulk chilling',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Melamine',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs (13nm)',
        unit: 'ppm',
        threshold: 2.5,
        safeColor: { r: 198, g: 48, b: 52, name: 'Wine-Red (Dispersed AuNPs)' },
        adulteratedColor: { r: 112, g: 64, b: 178, name: 'Purple/Blue (Aggregated)' },
        description: 'LSPR plasmonic shift detects synthetic nitrogen booster'
      },
      {
        zoneIndex: 2,
        analyteName: 'Hydrogen Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Clear / Colorless' },
        adulteratedColor: { r: 35, g: 118, b: 225, name: 'Deep Sky Blue (oxTMB)' },
        description: 'Peroxidase nanozyme catalytic oxidation detects prohibited preservative'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        unit: 'mg/L',
        threshold: 700.0,
        safeColor: { r: 215, g: 195, b: 55, name: 'Yellow-Amber (pH 6.4)' },
        adulteratedColor: { r: 219, g: 39, b: 119, name: 'Deep Magenta (pH > 8.0)' },
        description: 'Enzymatic hydrolysis creates ammonium ions indicating synthetic urea spike'
      },
      {
        zoneIndex: 4,
        analyteName: 'Starch & Dextrin',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        unit: '% w/v',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Amber-Brown' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Polyiodide amylose complexation detects bulking agents'
      },
      {
        zoneIndex: 5,
        analyteName: 'Neutralizer & Detergent',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple Matrix',
        unit: 'pH / %',
        threshold: 6.8,
        safeColor: { r: 184, g: 192, b: 62, name: 'Yellow-Green (pH 6.6)' },
        adulteratedColor: { r: 109, g: 40, b: 217, name: 'Deep Violet (pH > 6.8)' },
        description: 'Alkaline neutralizers (caustic soda, carbonates) and detergent surfactants'
      }
    ]
  },
  'PANEER': {
    category: 'DAIRY',
    foodItem: 'Paneer (Cottage Cheese)',
    defaultLot: 'LOT-PN-104',
    defaultSource: 'Dadar Wholesale Mandi, Mumbai',
    sampleDescription: 'Fresh cottage cheese sample homogenate in distilled buffer',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Starch & Flour Filler',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Amber-Brown' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Exogenous starch and wheat flour added to artificially increase paneer weight'
      },
      {
        zoneIndex: 2,
        analyteName: 'Detergent & Alkalis',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple & Surfactant Indicator',
        unit: 'pH / %',
        threshold: 6.8,
        safeColor: { r: 184, g: 192, b: 62, name: 'Natural Curd pH 5.8-6.2' },
        adulteratedColor: { r: 109, g: 40, b: 217, name: 'Deep Violet-Purple' },
        description: 'Caustic detergent surfactants used in synthetic chemical paneer manufacturing'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea Spiking',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        unit: 'mg/kg',
        threshold: 700.0,
        safeColor: { r: 215, g: 195, b: 55, name: 'Yellow-Amber' },
        adulteratedColor: { r: 219, g: 39, b: 119, name: 'Deep Magenta' },
        description: 'Artificial nitrogen elevation in imitation synthetic paneer'
      },
      {
        zoneIndex: 4,
        analyteName: 'Hydrogen Peroxide Preservative',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Clear / Off-White' },
        adulteratedColor: { r: 35, g: 118, b: 225, name: 'Deep Sky Blue' },
        description: 'Illegal bleaching and anti-spoilage chemical added to extend shelf life'
      },
      {
        zoneIndex: 5,
        analyteName: 'Melamine Resin',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs (13nm)',
        unit: 'ppm',
        threshold: 2.5,
        safeColor: { r: 198, g: 48, b: 52, name: 'Wine-Red AuNPs' },
        adulteratedColor: { r: 112, g: 64, b: 178, name: 'Purple/Blue Aggregate' },
        description: 'Toxic industrial triazine chemical used to fake high protein content'
      }
    ]
  },
  'DAHI': {
    category: 'DAIRY',
    foodItem: 'Dahi / Yoghurt (Curd)',
    defaultLot: 'LOT-DH-09',
    defaultSource: 'Shivaji Nagar Dairy Depot, Pune',
    sampleDescription: 'Commercial and artisanal set curd whey extract',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Starch & Gelatin Thickener',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Amber-Brown' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Thickeners added to watery curd to mimic thick, creamy buffalo dahi'
      },
      {
        zoneIndex: 2,
        analyteName: 'Neutralizing Chemicals',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple',
        unit: 'pH',
        threshold: 5.5,
        safeColor: { r: 200, g: 180, b: 50, name: 'Acidic Yellow (pH 4.2-4.6)' },
        adulteratedColor: { r: 109, g: 40, b: 217, name: 'Violet (Artificially Neutralized)' },
        description: 'Alkali added to sour, expired curd to mask off-flavor acidity'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        unit: 'mg/kg',
        threshold: 700.0,
        safeColor: { r: 215, g: 195, b: 55, name: 'Yellow-Amber' },
        adulteratedColor: { r: 219, g: 39, b: 119, name: 'Deep Magenta' },
        description: 'Non-protein nitrogen booster from synthetic milk base'
      },
      {
        zoneIndex: 4,
        analyteName: 'Hydrogen Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Colorless' },
        adulteratedColor: { r: 35, g: 118, b: 225, name: 'Deep Sky Blue' },
        description: 'Added to suppress unwanted lactic acid bacteria fermentation'
      },
      {
        zoneIndex: 5,
        analyteName: 'Melamine Compound',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs (13nm)',
        unit: 'ppm',
        threshold: 2.5,
        safeColor: { r: 198, g: 48, b: 52, name: 'Wine-Red' },
        adulteratedColor: { r: 112, g: 64, b: 178, name: 'Purple/Blue' },
        description: 'Triazine adulterant screening'
      }
    ]
  },
  'HONEY': {
    category: 'HONEY',
    foodItem: 'Pure Honey (Madh)',
    defaultLot: 'LOT-HN-441',
    defaultSource: 'Kangra Valley Beekeeping Cooperative',
    sampleDescription: 'Raw unpasteurized forest honey diluted 1:1 in DI water',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Invert Sugar & HFCS',
        code: 'INVERT_SUGAR',
        nanomaterial: 'Fiehe Resorcinol-HCl Chromogen',
        unit: '%',
        threshold: 5.0,
        safeColor: { r: 210, g: 180, b: 60, name: 'Pale Amber-Yellow' },
        adulteratedColor: { r: 225, g: 29, b: 72, name: 'Intense Cherry Red' },
        description: 'High-Fructose Corn Syrup (HFCS) and acid-inverted commercial syrups'
      },
      {
        zoneIndex: 2,
        analyteName: 'Starch / Rice Syrup',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Amber-Brown' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Rice and potato syrup added to boost viscosity and clear sugar pass-through'
      },
      {
        zoneIndex: 3,
        analyteName: 'Jaggery & Molasses Syrup',
        code: 'NEUTRALIZER',
        nanomaterial: 'Aniline-HCl Chromophore Indicator',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 210, g: 190, b: 70, name: 'Golden-Yellow' },
        adulteratedColor: { r: 180, g: 83, b: 9, name: 'Dark Caramel-Brown' },
        description: 'Crude sugarcane molasses and jaggery adulterant admixture'
      },
      {
        zoneIndex: 4,
        analyteName: 'Synthetic Preservatives',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Clear' },
        adulteratedColor: { r: 35, g: 118, b: 225, name: 'Deep Sky Blue' },
        description: 'Peroxides used to bleach dark impure syrups'
      },
      {
        zoneIndex: 5,
        analyteName: 'Synthetic Nitrogen / Urea',
        code: 'UREA',
        nanomaterial: 'Urease Phenol Red Matrix',
        unit: 'mg/kg',
        threshold: 50.0,
        safeColor: { r: 215, g: 195, b: 55, name: 'Honey Yellow' },
        adulteratedColor: { r: 219, g: 39, b: 119, name: 'Magenta' },
        description: 'Nitrogenous yeast stimulants or synthetic protein syrups'
      }
    ]
  },
  'TURMERIC': {
    category: 'SPICES',
    foodItem: 'Turmeric Powder (Haldi)',
    defaultLot: 'LOT-TM-772',
    defaultSource: 'APMC Spice Market, Nizamabad',
    sampleDescription: 'Fine ground turmeric spice extract in warm aqueous ethanol',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Metanil Yellow Dye',
        code: 'METANIL_YELLOW',
        nanomaterial: 'Acidified Curcuminoid Strips',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Natural Curcumin Yellow' },
        adulteratedColor: { r: 168, g: 85, b: 247, name: 'Vibrant Violet/Magenta' },
        description: 'Carcinogenic non-permitted industrial coal-tar azo dye'
      },
      {
        zoneIndex: 2,
        analyteName: 'Lead Chromate Pigment',
        code: 'SUDAN_DYE',
        nanomaterial: 'Diphenylcarbazide Chelate Probe',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Yellow' },
        adulteratedColor: { r: 190, g: 24, b: 93, name: 'Deep Violet-Red' },
        description: 'Highly toxic neurotoxic heavy-metal pigment added to intensify bright yellow color'
      },
      {
        zoneIndex: 3,
        analyteName: 'Chalk & Starch Bulking',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Yellow-Amber' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Powdered chalk, gypsum and cheap rice starch filler'
      },
      {
        zoneIndex: 4,
        analyteName: 'Sudan Dye Hue Modifiers',
        code: 'NEUTRALIZER',
        nanomaterial: 'Lipophilic AuNP Partition Sensor',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 198, g: 48, b: 52, name: 'Dispersed AuNP' },
        adulteratedColor: { r: 112, g: 64, b: 178, name: 'Aggregated AuNP' },
        description: 'Reddish coal tar dyes added to adjust golden hue'
      },
      {
        zoneIndex: 5,
        analyteName: 'Curcumin Active Compound Normalizer',
        code: 'UREA',
        nanomaterial: 'Curcumin Photometric Reference',
        unit: '% w/w',
        threshold: 2.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Rich Curcumin Golden' },
        adulteratedColor: { r: 156, g: 163, b: 175, name: 'Pale Depleted Gray-Yellow' },
        description: 'Verifies natural curcumin content exceeds FSSAI minimum (2.0% w/w)'
      }
    ]
  },
  'RED_CHILLI': {
    category: 'SPICES',
    foodItem: 'Red Chilli Powder (Mirchi)',
    defaultLot: 'LOT-CH-189',
    defaultSource: 'Guntur Mirchi Yard, Andhra Pradesh',
    sampleDescription: 'Dried red chilli powder acetone-water extraction filtrate',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Sudan Dyes (I, II, III, IV)',
        code: 'SUDAN_DYE',
        nanomaterial: 'Lipophilic AuNP Partition Sensor',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 225, g: 29, b: 72, name: 'Natural Capsanthin Red' },
        adulteratedColor: { r: 88, g: 28, b: 135, name: 'Deep Violet-Purple AuNP Aggregation' },
        description: 'Carcinogenic industrial azo dyes banned globally under strict zero-tolerance'
      },
      {
        zoneIndex: 2,
        analyteName: 'Rhodamine B Fluorescent Dye',
        code: 'METANIL_YELLOW',
        nanomaterial: 'Acid-Quench Optical Fluoroprobe',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 225, g: 29, b: 72, name: 'Red' },
        adulteratedColor: { r: 244, g: 63, b: 94, name: 'Fluorescent Pink / Magenta' },
        description: 'Hazardous synthetic dye used in textile printing, strictly banned in foods'
      },
      {
        zoneIndex: 3,
        analyteName: 'Brick Powder & Insoluble Ash',
        code: 'STARCH',
        nanomaterial: 'Density Homography Optical Tile',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 220, g: 220, b: 220, name: 'Clear Suspension' },
        adulteratedColor: { r: 120, g: 53, b: 15, name: 'Gritty Brick Sediments' },
        description: 'Pulverized red brick dust and toxic red iron oxide powder'
      },
      {
        zoneIndex: 4,
        analyteName: 'Lead Salts & Red Lead (Pb3O4)',
        code: 'UREA',
        nanomaterial: 'Sodium Rhodizonate Chelate Strips',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 220, g: 220, b: 220, name: 'Colorless' },
        adulteratedColor: { r: 136, g: 19, b: 55, name: 'Intense Carmine Red' },
        description: 'Neurotoxic red lead pigments used to fake fiery red spice color'
      },
      {
        zoneIndex: 5,
        analyteName: 'Foreign Starch & Sawdust',
        code: 'NEUTRALIZER',
        nanomaterial: 'Lugol Polyiodide Sensor',
        unit: '% w/w',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Yellow-Amber' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Inky Blue-Black' },
        description: 'Spent exhausted waste bulked with starch and dyed red'
      }
    ]
  },
  'COOKING_OIL': {
    category: 'EDIBLE_OILS',
    foodItem: 'Edible Cooking Oil (Mustard / Sunflower)',
    defaultLot: 'LOT-MO-312',
    defaultSource: 'Alwar Oil Extraction Mill, Rajasthan',
    sampleDescription: 'Cold-pressed or refined edible cooking oil sample',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Toxic Argemone Oil',
        code: 'ARGEMONE_OIL',
        nanomaterial: 'Sanguinarine Ferric Charge-Transfer Matrix',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Golden Mustard Oil' },
        adulteratedColor: { r: 239, g: 68, b: 68, name: 'Crimson-Red / Orange Flocculate' },
        description: 'Toxic weed oil causing Epidemic Dropsy, cardiac arrest and glaucoma; zero tolerance'
      },
      {
        zoneIndex: 2,
        analyteName: 'Mineral / Cheap Liquid Paraffin',
        code: 'NEUTRALIZER',
        nanomaterial: 'Holde Saponification Turbidity Indicator',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Clear Saponified Solution' },
        adulteratedColor: { r: 243, g: 244, b: 246, name: 'Turbid Milky White Emulsion' },
        description: 'Non-edible petroleum crude hydrocarbons added to dilute expensive cooking oils'
      },
      {
        zoneIndex: 3,
        analyteName: 'Castor Oil Admixture',
        code: 'UREA',
        nanomaterial: 'Ammonium Molybdate Acid Reagent',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Golden' },
        adulteratedColor: { r: 59, g: 130, b: 246, name: 'Deep Molybdenum Blue' },
        description: 'Purgative non-edible castor oil mixed into edible mustard oil'
      },
      {
        zoneIndex: 4,
        analyteName: 'Rancidity & Peroxide Value',
        code: 'H2O2',
        nanomaterial: 'Ferrous-Thiocyanate Nanozyme',
        unit: 'meq/kg',
        threshold: 10.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Colorless' },
        adulteratedColor: { r: 220, g: 38, b: 38, name: 'Blood Red Blood-Complex' },
        description: 'Lipid peroxidation indicator measuring oxidized toxic free radicals'
      },
      {
        zoneIndex: 5,
        analyteName: 'Vanaspati / Low-Grade Palm Stearin',
        code: 'VANASPATI_GHEE',
        nanomaterial: 'Baudouin Furfural-HCl Reagent',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 234, g: 179, b: 8, name: 'Golden' },
        adulteratedColor: { r: 190, g: 18, b: 60, name: 'Rose-Crimson Red' },
        description: 'Detection of cheap hydrogenated vegetable oils or sesame chromogens'
      }
    ]
  },
  'DESI_GHEE': {
    category: 'EDIBLE_OILS',
    foodItem: 'Desi Ghee & Butter',
    defaultLot: 'LOT-GH-551',
    defaultSource: 'Saurashtra Dairy Cooperative, Rajkot',
    sampleDescription: 'Pure clarified butterfat (Desi Ghee) melted at 40°C',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Vanaspati (Hydrogenated Oil)',
        code: 'VANASPATI_GHEE',
        nanomaterial: 'Baudouin Chromogenic Reagent (Furfural-HCl)',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 250, g: 204, b: 21, name: 'Golden Yellow' },
        adulteratedColor: { r: 225, g: 29, b: 72, name: 'Persistent Rose-Crimson' },
        description: 'Furfural-HCl reacts with sesamolin in Vanaspati producing deep crimson red color'
      },
      {
        zoneIndex: 2,
        analyteName: 'Animal Body Fat (Tallow/Lard)',
        code: 'ARGEMONE_OIL',
        nanomaterial: 'Triglyceride Silver-Ion Probe',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 250, g: 204, b: 21, name: 'Golden Butterfat' },
        adulteratedColor: { r: 161, g: 98, b: 7, name: 'Dark Brownish Turbidity' },
        description: 'Slaughterhouse animal tallow fat mixed to adulterate holy desi ghee'
      },
      {
        zoneIndex: 3,
        analyteName: 'Mashed Potato / Starch Filler',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP Nanocomposite',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 205, g: 182, b: 68, name: 'Yellow-Amber' },
        adulteratedColor: { r: 26, g: 36, b: 104, name: 'Deep Inky Blue-Black' },
        description: 'Mashed potatoes and sweet potato flour mixed with ghee'
      },
      {
        zoneIndex: 4,
        analyteName: 'Mineral Oil / Petroleum Jelly',
        code: 'NEUTRALIZER',
        nanomaterial: 'Holde Saponification Matrix',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 250, g: 204, b: 21, name: 'Clear' },
        adulteratedColor: { r: 243, g: 244, b: 246, name: 'Milky Turbid' },
        description: 'Insoluble mineral oils added to alter texture and crystal formation'
      },
      {
        zoneIndex: 5,
        analyteName: 'Coal Tar Yellow Dyes',
        code: 'METANIL_YELLOW',
        nanomaterial: 'Acidified Partition Strip',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 250, g: 204, b: 21, name: 'Natural Carotene Yellow' },
        adulteratedColor: { r: 168, g: 85, b: 247, name: 'Magenta / Pink' },
        description: 'Artificial coal-tar yellow color added to fake cow ghee'
      }
    ]
  },
  'VEGETABLES': {
    category: 'VEGETABLES',
    foodItem: 'Fresh Green Vegetables (Peas, Parwal, Chillies)',
    defaultLot: 'LOT-GP-650',
    defaultSource: 'Vashi APMC Sabzi Mandi, Navi Mumbai',
    sampleDescription: 'Surface swab or extraction solution from green peas / pointed gourd',
    zones: [
      {
        zoneIndex: 1,
        analyteName: 'Malachite Green Dye',
        code: 'MALACHITE_GREEN',
        nanomaterial: 'Triphenylmethane Optical Nanoprobe',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 34, g: 197, b: 94, name: 'Natural Chlorophyll Green' },
        adulteratedColor: { r: 13, g: 148, b: 136, name: 'Intense Synthetic Teal-Green / Blue' },
        description: 'Toxic industrial carcinogenic dye used to make stale peas look freshly picked'
      },
      {
        zoneIndex: 2,
        analyteName: 'Copper Sulphate (CuSO4) Brightener',
        code: 'H2O2',
        nanomaterial: 'Neocuproine Chromogen Reagent',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Colorless' },
        adulteratedColor: { r: 37, g: 99, b: 235, name: 'Deep Royal Blue' },
        description: 'Toxic copper solution used to dye green vegetables vibrant green'
      },
      {
        zoneIndex: 3,
        analyteName: 'Paraffin Wax Glaze (Apples/Produce)',
        code: 'ARGEMONE_OIL',
        nanomaterial: 'Lipophilic Sudan Black Strip',
        unit: '%',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Clear' },
        adulteratedColor: { r: 17, g: 24, b: 39, name: 'Stained Dark Charcoal' },
        description: 'Petroleum-derived synthetic wax polish on apples and cucumbers to trap moisture'
      },
      {
        zoneIndex: 4,
        analyteName: 'Calcium Carbide / Ripening Residue',
        code: 'UREA',
        nanomaterial: 'Silver Nitrate Nano-complex',
        unit: 'ppm',
        threshold: 0.0,
        safeColor: { r: 228, g: 228, b: 232, name: 'Clear' },
        adulteratedColor: { r: 156, g: 163, b: 175, name: 'Grayish-Black Acetylide Precipitate' },
        description: 'Industrial hazardous calcium carbide containing traces of arsenic and phosphorus hydrides'
      },
      {
        zoneIndex: 5,
        analyteName: 'Organophosphate Pesticide Residues',
        code: 'NEUTRALIZER',
        nanomaterial: 'AChE Enzyme-AuNP Nanozyme',
        unit: 'ppm',
        threshold: 0.1,
        safeColor: { r: 234, g: 179, b: 8, name: 'Yellow (Enzyme Active)' },
        adulteratedColor: { r: 225, g: 29, b: 72, name: 'Red/Pink (Enzyme Inhibited)' },
        description: 'Inhibition of acetylcholinesterase indicates high toxic pesticide residue'
      }
    ]
  }
};

export const INITIAL_TEST_SESSIONS: TestSessionRecord[] = [
  // 1. Safe Cow Milk
  {
    id: 'sess-001',
    sessionCode: 'TEST-20260910-001',
    sampleCode: 'MILK-ANAND-01',
    foodCategory: 'DAIRY',
    foodItem: 'Milk (Cow Fresh)',
    milkType: 'COW',
    collectionSource: 'Village Chikhodra Collection Centre, Anand',
    batchLotNumber: 'LOT-882',
    deviceSerial: 'READER-ESP32S3-001',
    cartridgeUid: 'MC-8940',
    operatorName: 'Ramesh Patel (Food Safety Inspector)',
    overallResult: 'PASS_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 14:15:00',
    completedAt: '2026-09-10 14:16:02',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Melamine',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs',
        rawR: 198, rawG: 48, rawB: 52,
        cielabL: 56.2, cielabA: 24.8, cielabB: 12.1,
        deltaE: 1.1, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 2.5,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'No gold nanoparticle aggregation; melamine not detected'
      },
      {
        zoneIndex: 2,
        analyteName: 'Hydrogen Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        rawR: 220, rawG: 220, rawB: 220,
        cielabL: 86.4, cielabA: -0.4, cielabB: 1.9,
        deltaE: 0.6, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Nanozyme TMB substrate unreacted; zero H2O2 present'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        rawR: 215, rawG: 195, rawB: 55,
        cielabL: 77.8, cielabA: 3.8, cielabB: 47.1,
        deltaE: 2.2, estimatedConcentration: 365,
        unit: 'mg/L', threshold: 700.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Natural endogenous urea: 365 mg/L (normal bovine range)'
      },
      {
        zoneIndex: 4,
        analyteName: 'Starch & Dextrin',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        rawR: 205, rawG: 182, rawB: 68,
        cielabL: 73.6, cielabA: 2.4, cielabB: 31.8,
        deltaE: 0.8, estimatedConcentration: 0.0,
        unit: '% w/v', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Lugol reagent uncomplexed; exogenous starch absent'
      },
      {
        zoneIndex: 5,
        analyteName: 'Neutralizer & Detergent',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple',
        rawR: 184, rawG: 192, rawB: 62,
        cielabL: 74.8, cielabA: -2.9, cielabB: 27.4,
        deltaE: 1.2, estimatedConcentration: 6.6,
        unit: 'pH', threshold: 6.8,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Physiological acidity intact (pH 6.6); neutralizers absent'
      }
    ]
  },

  // 2. Adulterated Milk: Melamine positive
  {
    id: 'sess-002',
    sessionCode: 'TEST-20260910-002',
    sampleCode: 'MILK-VILLAGE-B2',
    foodCategory: 'DAIRY',
    foodItem: 'Milk (Buffalo Raw)',
    milkType: 'BUFFALO',
    collectionSource: 'Kaira District Dairy Collection Point',
    batchLotNumber: 'LOT-901',
    deviceSerial: 'READER-ESP32S3-001',
    cartridgeUid: 'MC-8939',
    operatorName: 'Ramesh Patel (Food Safety Inspector)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 15:40:00',
    completedAt: '2026-09-10 15:41:04',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Melamine',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs',
        rawR: 112, rawG: 64, rawB: 178,
        cielabL: 42.1, cielabA: 18.2, cielabB: -24.6,
        deltaE: 9.8, estimatedConcentration: 4.75,
        unit: 'ppm', threshold: 2.5,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Melamine LSPR peak shift detected: 4.75 ppm exceeds FSSAI MRL (2.5 ppm)'
      },
      {
        zoneIndex: 2,
        analyteName: 'Hydrogen Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        rawR: 218, rawG: 219, rawB: 221,
        cielabL: 86.1, cielabA: -0.3, cielabB: 2.1,
        deltaE: 0.7, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Zero H2O2 detected'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        rawR: 212, rawG: 194, rawB: 53,
        cielabL: 77.2, cielabA: 3.9, cielabB: 47.5,
        deltaE: 2.5, estimatedConcentration: 388,
        unit: 'mg/L', threshold: 700.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Natural endogenous urea within limits'
      },
      {
        zoneIndex: 4,
        analyteName: 'Starch & Dextrin',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        rawR: 202, rawG: 180, rawB: 67,
        cielabL: 73.1, cielabA: 2.6, cielabB: 32.1,
        deltaE: 0.9, estimatedConcentration: 0.0,
        unit: '% w/v', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Starch absent'
      },
      {
        zoneIndex: 5,
        analyteName: 'Neutralizer & Detergent',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple',
        rawR: 182, rawG: 190, rawB: 61,
        cielabL: 74.2, cielabA: -3.0, cielabB: 27.6,
        deltaE: 1.4, estimatedConcentration: 6.6,
        unit: 'pH', threshold: 6.8,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Neutralizer absent'
      }
    ]
  },

  // 3. Adulterated Paneer: Starch & Detergent positive
  {
    id: 'sess-003',
    sessionCode: 'TEST-20260910-003',
    sampleCode: 'PANEER-MUMBAI-04',
    foodCategory: 'DAIRY',
    foodItem: 'Paneer (Cottage Cheese)',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'Dadar Wholesale Mandi, Mumbai',
    batchLotNumber: 'LOT-PN-104',
    deviceSerial: 'READER-ESP32S3-002',
    cartridgeUid: 'MC-9005',
    operatorName: 'Sunil Verma (Food Quality Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 16:10:00',
    completedAt: '2026-09-10 16:11:08',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Starch & Flour Filler',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        rawR: 28, rawG: 38, rawB: 112,
        cielabL: 18.4, cielabA: 8.2, cielabB: -38.4,
        deltaE: 14.5, estimatedConcentration: 2.85,
        unit: '% w/w', threshold: 0.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Deep inky-blue complex confirms ~2.85% exogenous starch filler added to weight paneer'
      },
      {
        zoneIndex: 2,
        analyteName: 'Detergent & Caustic Alkali',
        code: 'NEUTRALIZER',
        nanomaterial: 'Bromocresol Purple',
        rawR: 110, rawG: 42, rawB: 220,
        cielabL: 38.2, cielabA: 34.1, cielabB: -48.2,
        deltaE: 11.2, estimatedConcentration: 7.6,
        unit: 'pH', threshold: 6.8,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Deep violet indicator indicates abnormal caustic alkali / detergent used in synthetic paneer'
      },
      {
        zoneIndex: 3,
        analyteName: 'Synthetic Urea',
        code: 'UREA',
        nanomaterial: 'Urease + Phenol Red',
        rawR: 216, rawG: 192, rawB: 50,
        cielabL: 76.5, cielabA: 4.1, cielabB: 48.0,
        deltaE: 2.8, estimatedConcentration: 410,
        unit: 'mg/kg', threshold: 700.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Endogenous nitrogen within baseline limits'
      },
      {
        zoneIndex: 4,
        analyteName: 'Hydrogen Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        rawR: 224, rawG: 224, rawB: 226,
        cielabL: 87.2, cielabA: -0.2, cielabB: 1.8,
        deltaE: 0.5, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'H2O2 absent'
      },
      {
        zoneIndex: 5,
        analyteName: 'Melamine',
        code: 'MELAMINE',
        nanomaterial: 'Citrate-AuNPs',
        rawR: 196, rawG: 46, rawB: 50,
        cielabL: 55.8, cielabA: 24.5, cielabB: 12.0,
        deltaE: 1.0, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 2.5,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Melamine not detected'
      }
    ]
  },

  // 4. Adulterated Turmeric: Metanil Yellow positive
  {
    id: 'sess-004',
    sessionCode: 'TEST-20260910-004',
    sampleCode: 'SPICE-TURM-77',
    foodCategory: 'SPICES',
    foodItem: 'Turmeric Powder (Haldi)',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'APMC Spice Market, Nizamabad',
    batchLotNumber: 'LOT-TM-772',
    deviceSerial: 'READER-ESP32S3-002',
    cartridgeUid: 'MC-9011',
    operatorName: 'Sunil Verma (Food Quality Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 16:45:00',
    completedAt: '2026-09-10 16:46:05',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Metanil Yellow Dye',
        code: 'METANIL_YELLOW',
        nanomaterial: 'Acidified Curcuminoid Strips',
        rawR: 172, rawG: 82, rawB: 244,
        cielabL: 48.6, cielabA: 42.1, cielabB: -45.6,
        deltaE: 12.4, estimatedConcentration: 0.712,
        unit: '% w/w', threshold: 0.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Hazardous non-permitted Metanil Yellow coal-tar dye detected (~0.712% w/w). Strictly prohibited under FSSAI'
      },
      {
        zoneIndex: 2,
        analyteName: 'Lead Chromate Pigment',
        code: 'SUDAN_DYE',
        nanomaterial: 'Diphenylcarbazide Chelate Probe',
        rawR: 232, rawG: 178, rawB: 10,
        cielabL: 74.2, cielabA: 12.1, cielabB: 62.4,
        deltaE: 1.2, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Lead chromate not detected'
      },
      {
        zoneIndex: 3,
        analyteName: 'Chalk & Starch Bulking',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        rawR: 204, rawG: 180, rawB: 66,
        cielabL: 73.0, cielabA: 2.8, cielabB: 31.5,
        deltaE: 0.9, estimatedConcentration: 0.0,
        unit: '% w/w', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'No foreign starch detected'
      },
      {
        zoneIndex: 4,
        analyteName: 'Sudan Dye Hue Modifiers',
        code: 'NEUTRALIZER',
        nanomaterial: 'Lipophilic AuNP Sensor',
        rawR: 195, rawG: 50, rawB: 54,
        cielabL: 55.4, cielabA: 24.1, cielabB: 11.9,
        deltaE: 1.1, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'No Sudan dyes detected'
      },
      {
        zoneIndex: 5,
        analyteName: 'Curcumin Active Normalizer',
        code: 'UREA',
        nanomaterial: 'Curcumin Photometric Reference',
        rawR: 230, rawG: 175, rawB: 12,
        cielabL: 73.8, cielabA: 11.8, cielabB: 61.9,
        deltaE: 1.0, estimatedConcentration: 2.8,
        unit: '% w/w', threshold: 2.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Natural curcumin concentration: 2.8% w/w (compliant > 2.0%)'
      }
    ]
  },

  // 5. Adulterated Red Chilli: Sudan Dye positive
  {
    id: 'sess-005',
    sessionCode: 'TEST-20260910-005',
    sampleCode: 'SPICE-CHIL-18',
    foodCategory: 'SPICES',
    foodItem: 'Red Chilli Powder (Mirchi)',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'Guntur Mirchi Yard, Andhra Pradesh',
    batchLotNumber: 'LOT-CH-189',
    deviceSerial: 'READER-ESP32S3-002',
    cartridgeUid: 'MC-9014',
    operatorName: 'Anand Rao (FSSAI Regional Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 17:20:00',
    completedAt: '2026-09-10 17:21:06',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Sudan Dyes (I-IV)',
        code: 'SUDAN_DYE',
        nanomaterial: 'Lipophilic AuNP Partition Sensor',
        rawR: 92, rawG: 32, rawB: 140,
        cielabL: 36.4, cielabA: 26.8, cielabB: -32.1,
        deltaE: 10.4, estimatedConcentration: 3.3,
        unit: 'ppm', threshold: 0.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Industrial carcinogenic Sudan I-IV dye detected (~3.3 ppm). Zero tolerance under FSSAI'
      },
      {
        zoneIndex: 2,
        analyteName: 'Rhodamine B Dye',
        code: 'METANIL_YELLOW',
        nanomaterial: 'Acid-Quench Optical Fluoroprobe',
        rawR: 224, rawG: 30, rawB: 70,
        cielabL: 45.2, cielabA: 52.4, cielabB: 28.1,
        deltaE: 1.2, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Rhodamine B negative'
      },
      {
        zoneIndex: 3,
        analyteName: 'Brick Powder & Insoluble Ash',
        code: 'STARCH',
        nanomaterial: 'Density Homography Optical Tile',
        rawR: 218, rawG: 218, rawB: 218,
        cielabL: 85.8, cielabA: -0.1, cielabB: 1.2,
        deltaE: 0.8, estimatedConcentration: 0.0,
        unit: '% w/w', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Insoluble mineral ash within limits'
      },
      {
        zoneIndex: 4,
        analyteName: 'Lead Salts / Red Lead',
        code: 'UREA',
        nanomaterial: 'Sodium Rhodizonate Strips',
        rawR: 222, rawG: 220, rawB: 222,
        cielabL: 86.2, cielabA: 0.1, cielabB: 1.5,
        deltaE: 0.6, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Toxic lead salts negative'
      },
      {
        zoneIndex: 5,
        analyteName: 'Foreign Starch & Sawdust',
        code: 'NEUTRALIZER',
        nanomaterial: 'Lugol Polyiodide Sensor',
        rawR: 202, rawG: 182, rawB: 68,
        cielabL: 73.2, cielabA: 2.5, cielabB: 31.9,
        deltaE: 0.9, estimatedConcentration: 0.0,
        unit: '% w/w', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Foreign starches absent'
      }
    ]
  },

  // 6. Adulterated Mustard Oil: Argemone Oil positive
  {
    id: 'sess-006',
    sessionCode: 'TEST-20260910-006',
    sampleCode: 'OIL-MUST-31',
    foodCategory: 'EDIBLE_OILS',
    foodItem: 'Mustard Oil (Kachi Ghani)',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'Alwar Oil Extraction Mill, Rajasthan',
    batchLotNumber: 'LOT-MO-312',
    deviceSerial: 'READER-ESP32S3-003',
    cartridgeUid: 'MC-9018',
    operatorName: 'Dr. Meena Sharma (State Food Safety Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 18:05:00',
    completedAt: '2026-09-10 18:06:12',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Toxic Argemone Oil',
        code: 'ARGEMONE_OIL',
        nanomaterial: 'Sanguinarine Ferric Charge-Transfer Matrix',
        rawR: 242, rawG: 72, rawB: 70,
        cielabL: 52.4, cielabA: 54.1, cielabB: 34.6,
        deltaE: 13.8, estimatedConcentration: 0.515,
        unit: '%', threshold: 0.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Toxic Argemone oil alkaloid (Sanguinarine) detected (~0.515%). Causes epidemic dropsy; strictly prohibited'
      },
      {
        zoneIndex: 2,
        analyteName: 'Mineral / Liquid Paraffin Oil',
        code: 'NEUTRALIZER',
        nanomaterial: 'Holde Saponification Indicator',
        rawR: 232, rawG: 180, rawB: 12,
        cielabL: 73.9, cielabA: 11.2, cielabB: 61.4,
        deltaE: 1.1, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Complete saponification; petroleum hydrocarbons absent'
      },
      {
        zoneIndex: 3,
        analyteName: 'Castor Oil Admixture',
        code: 'UREA',
        nanomaterial: 'Ammonium Molybdate Acid Reagent',
        rawR: 230, rawG: 178, rawB: 14,
        cielabL: 73.5, cielabA: 11.5, cielabB: 61.0,
        deltaE: 0.9, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Castor oil test negative'
      },
      {
        zoneIndex: 4,
        analyteName: 'Rancidity & Peroxide Value',
        code: 'H2O2',
        nanomaterial: 'Ferrous-Thiocyanate Nanozyme',
        rawR: 226, rawG: 226, rawB: 228,
        cielabL: 87.8, cielabA: -0.1, cielabB: 1.5,
        deltaE: 0.7, estimatedConcentration: 3.2,
        unit: 'meq/kg', threshold: 10.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Freshly extracted oil; peroxide value 3.2 meq/kg (safe < 10)'
      },
      {
        zoneIndex: 5,
        analyteName: 'Vanaspati / Cheap Fats',
        code: 'VANASPATI_GHEE',
        nanomaterial: 'Baudouin Furfural-HCl Reagent',
        rawR: 232, rawG: 179, rawB: 12,
        cielabL: 73.8, cielabA: 11.3, cielabB: 61.2,
        deltaE: 0.8, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Baudouin test negative'
      }
    ]
  },

  // 7. Adulterated Honey: Invert Sugar Syrup positive
  {
    id: 'sess-007',
    sessionCode: 'TEST-20260910-007',
    sampleCode: 'HONEY-HIM-02',
    foodCategory: 'HONEY',
    foodItem: 'Pure Wild Forest Honey',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'Kangra Valley Beekeeping Cooperative',
    batchLotNumber: 'LOT-HN-441',
    deviceSerial: 'READER-ESP32S3-003',
    cartridgeUid: 'MC-9020',
    operatorName: 'Dr. Meena Sharma (State Food Safety Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 18:50:00',
    completedAt: '2026-09-10 18:51:04',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Invert Sugar & HFCS',
        code: 'INVERT_SUGAR',
        nanomaterial: 'Fiehe Resorcinol-HCl Chromogen',
        rawR: 228, rawG: 32, rawB: 74,
        cielabL: 44.8, cielabA: 54.2, cielabB: 27.6,
        deltaE: 11.6, estimatedConcentration: 19.5,
        unit: '%', threshold: 5.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Cherry-red chromogen confirms ~19.5% commercial invert sugar syrup / HFCS adulteration'
      },
      {
        zoneIndex: 2,
        analyteName: 'Starch & Rice Syrup',
        code: 'STARCH',
        nanomaterial: 'Lugol Iodine-PVP',
        rawR: 206, rawG: 184, rawB: 70,
        cielabL: 74.1, cielabA: 2.2, cielabB: 31.2,
        deltaE: 0.8, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Rice starches absent'
      },
      {
        zoneIndex: 3,
        analyteName: 'Jaggery & Molasses Syrup',
        code: 'NEUTRALIZER',
        nanomaterial: 'Aniline-HCl Indicator',
        rawR: 212, rawG: 191, rawB: 72,
        cielabL: 75.2, cielabA: 3.2, cielabB: 38.4,
        deltaE: 1.0, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Molasses not detected'
      },
      {
        zoneIndex: 4,
        analyteName: 'Synthetic Bleaching Peroxide',
        code: 'H2O2',
        nanomaterial: 'Fe3O4 Nanozyme + TMB',
        rawR: 226, rawG: 226, rawB: 228,
        cielabL: 87.6, cielabA: -0.2, cielabB: 1.6,
        deltaE: 0.6, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Bleaching peroxides absent'
      },
      {
        zoneIndex: 5,
        analyteName: 'Synthetic Nitrogen Adulterants',
        code: 'UREA',
        nanomaterial: 'Urease Phenol Red Matrix',
        rawR: 214, rawG: 194, rawB: 54,
        cielabL: 77.2, cielabA: 3.9, cielabB: 46.8,
        deltaE: 1.4, estimatedConcentration: 12.0,
        unit: 'mg/kg', threshold: 50.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Nitrogen content within natural floral limits'
      }
    ]
  },

  // 8. Adulterated Green Vegetables: Malachite Green positive
  {
    id: 'sess-008',
    sessionCode: 'TEST-20260910-008',
    sampleCode: 'VEG-PEAS-65',
    foodCategory: 'VEGETABLES',
    foodItem: 'Fresh Green Peas (Matar)',
    milkType: 'NOT_APPLICABLE',
    collectionSource: 'Vashi APMC Sabzi Mandi, Navi Mumbai',
    batchLotNumber: 'LOT-GP-650',
    deviceSerial: 'READER-ESP32S3-002',
    cartridgeUid: 'MC-9024',
    operatorName: 'Sunil Verma (Food Quality Officer)',
    overallResult: 'POSITIVE_SCREENING',
    validityStatus: 'VALID',
    startedAt: '2026-09-10 19:15:00',
    completedAt: '2026-09-10 19:16:04',
    readings: [
      {
        zoneIndex: 1,
        analyteName: 'Malachite Green Dye',
        code: 'MALACHITE_GREEN',
        nanomaterial: 'Triphenylmethane Optoprobe',
        rawR: 15, rawG: 152, rawB: 140,
        cielabL: 48.2, cielabA: -36.4, cielabB: -4.2,
        deltaE: 12.2, estimatedConcentration: 3.15,
        unit: 'ppm', threshold: 0.0,
        status: 'POSITIVE_ADULTERATED',
        rationale: 'Toxic industrial dye (Malachite Green) detected (~3.15 ppm). Fresh produce colored illegally; zero tolerance'
      },
      {
        zoneIndex: 2,
        analyteName: 'Copper Sulphate Brightener',
        code: 'H2O2',
        nanomaterial: 'Neocuproine Chromogen Reagent',
        rawR: 224, rawG: 224, rawB: 226,
        cielabL: 87.2, cielabA: -0.2, cielabB: 1.8,
        deltaE: 0.6, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Copper brighteners negative'
      },
      {
        zoneIndex: 3,
        analyteName: 'Paraffin Wax Glaze',
        code: 'ARGEMONE_OIL',
        nanomaterial: 'Sudan Black Strip',
        rawR: 226, rawG: 226, rawB: 228,
        cielabL: 87.8, cielabA: -0.1, cielabB: 1.5,
        deltaE: 0.7, estimatedConcentration: 0.0,
        unit: '%', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Natural pea surface; no wax glaze'
      },
      {
        zoneIndex: 4,
        analyteName: 'Calcium Carbide Residue',
        code: 'UREA',
        nanomaterial: 'Silver Nitrate Nano-complex',
        rawR: 226, rawG: 226, rawB: 228,
        cielabL: 87.4, cielabA: -0.2, cielabB: 1.6,
        deltaE: 0.5, estimatedConcentration: 0.0,
        unit: 'ppm', threshold: 0.0,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Carbide residues absent'
      },
      {
        zoneIndex: 5,
        analyteName: 'Organophosphate Pesticides',
        code: 'NEUTRALIZER',
        nanomaterial: 'AChE Enzyme-AuNP Nanozyme',
        rawR: 232, rawG: 180, rawB: 12,
        cielabL: 74.0, cielabA: 11.2, cielabB: 61.8,
        deltaE: 1.2, estimatedConcentration: 0.04,
        unit: 'ppm', threshold: 0.1,
        status: 'SAFE_WITHIN_LIMITS',
        rationale: 'Pesticide residue 0.04 ppm (below FSSAI limit of 0.1 ppm)'
      }
    ]
  }
];
