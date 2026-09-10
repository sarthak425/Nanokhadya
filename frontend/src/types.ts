export type OverallResult = 'PASS_SCREENING' | 'WARNING_SUSPICIOUS' | 'POSITIVE_SCREENING' | 'INVALID_TEST';
export type ResultStatus = 'SAFE_WITHIN_LIMITS' | 'WARNING_SUSPICIOUS' | 'POSITIVE_ADULTERATED' | 'INVALID_READING';
export type ValidityStatus = 'VALID' | 'INVALID_INSUFFICIENT_SAMPLE' | 'INVALID_OPTICAL_SATURATION' | 'INVALID_EXPIRED_CARTRIDGE';

export type FoodCategory = 'DAIRY' | 'HONEY' | 'SPICES' | 'EDIBLE_OILS' | 'VEGETABLES' | 'BEVERAGES';

export interface Analyte {
  id: number;
  name: string;
  codeIdentifier: string;
  zoneIndex: number;
  regulatoryThresholdFssai: number;
  unit: string;
  zeroTolerance: boolean;
  sensingNanomaterial: string;
  description: string;
  commodityCategory?: FoodCategory;
}

export interface ZoneReading {
  zoneIndex: number;
  analyteName: string;
  code: string;
  nanomaterial: string;
  rawR: number;
  rawG: number;
  rawB: number;
  cielabL: number;
  cielabA: number;
  cielabB: number;
  deltaE: number;
  estimatedConcentration: number;
  unit: string;
  threshold: number;
  status: ResultStatus;
  rationale: string;
}

export interface TestSessionRecord {
  id: string;
  sessionCode: string;
  sampleCode: string;
  foodCategory: FoodCategory;
  foodItem: string;
  milkType?: 'COW' | 'BUFFALO' | 'MIXED' | 'PACKAGED_PASTEURIZED' | 'NOT_APPLICABLE';
  collectionSource: string;
  batchLotNumber: string;
  deviceSerial: string;
  cartridgeUid: string;
  operatorName: string;
  overallResult: OverallResult;
  validityStatus: ValidityStatus;
  startedAt: string;
  completedAt?: string;
  readings: ZoneReading[];
}

export interface DeviceInfo {
  id: string;
  deviceSerial: string;
  modelVersion: string;
  firmwareVersion: string;
  assignedLocation: string;
  batteryLevel: number;
  status: 'ACTIVE' | 'OFFLINE' | 'CALIBRATION_REQUIRED';
  lastHeartbeat: string;
}

export interface CartridgeInfo {
  id: string;
  cartridgeUid: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  isUsed: boolean;
}
