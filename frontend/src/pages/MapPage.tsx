import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, AlertTriangle,
  Layers, Filter, Compass, Locate, CheckCircle2,
  ArrowRight, Volume2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOperator } from '../context/OperatorContext';

export interface InspectionGeoPoint {
  id: string;
  testId: string;
  foodType: 'Milk' | 'Honey' | 'Paneer';
  status: 'SAFE' | 'ADULTERATED' | 'SUSPECTED';
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  xPct: number; // percentage on map (0-100)
  yPct: number; // percentage on map (0-100)
  detectedIssue: string | null;
  inspectorName: string;
  deviceId: string;
  timestamp: string;
}

const INITIAL_FIELD_POINTS: InspectionGeoPoint[] = [
  {
    id: 'GEO-01',
    testId: 'TST-DL-901',
    foodType: 'Milk',
    status: 'ADULTERATED',
    locationName: 'Ghazipur Dairy Wholesale Market',
    city: 'East Delhi',
    lat: 28.625,
    lng: 77.328,
    xPct: 52,
    yPct: 34,
    detectedIssue: 'Urea (2.4 g/L) & Detergent Surfactant',
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: 'Today, 09:15 AM',
  },
  {
    id: 'GEO-02',
    testId: 'TST-GJ-404',
    foodType: 'Milk',
    status: 'SAFE',
    locationName: 'Amul Milk Cooperative Chilling Center',
    city: 'Anand, Gujarat',
    lat: 22.564,
    lng: 72.928,
    xPct: 35,
    yPct: 55,
    detectedIssue: null,
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: 'Today, 11:30 AM',
  },
  {
    id: 'GEO-03',
    testId: 'TST-UP-882',
    foodType: 'Paneer',
    status: 'ADULTERATED',
    locationName: 'Aminabad Dairy Exchange',
    city: 'Lucknow, UP',
    lat: 26.846,
    lng: 80.946,
    xPct: 62,
    yPct: 38,
    detectedIssue: 'Starch Paste & Vegetable Fat (Trans Fats)',
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: 'Yesterday, 04:20 PM',
  },
  {
    id: 'GEO-04',
    testId: 'TST-MH-312',
    foodType: 'Honey',
    status: 'ADULTERATED',
    locationName: 'Vashi Wholesale APMC Spice & Honey Yard',
    city: 'Navi Mumbai',
    lat: 19.076,
    lng: 72.877,
    xPct: 38,
    yPct: 68,
    detectedIssue: 'C4 High Fructose Invert Syrup (28%)',
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: 'Yesterday, 02:45 PM',
  },
  {
    id: 'GEO-05',
    testId: 'TST-RJ-119',
    foodType: 'Paneer',
    status: 'SAFE',
    locationName: 'Saras Dairy Processing Hub',
    city: 'Jaipur, Rajasthan',
    lat: 26.912,
    lng: 75.787,
    xPct: 45,
    yPct: 40,
    detectedIssue: null,
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: '2 days ago',
  },
  {
    id: 'GEO-06',
    testId: 'TST-PB-771',
    foodType: 'Milk',
    status: 'ADULTERATED',
    locationName: 'Ludhiana Bulk Tanker Collection Bay',
    city: 'Ludhiana, Punjab',
    lat: 30.901,
    lng: 75.857,
    xPct: 48,
    yPct: 22,
    detectedIssue: 'Formalin (0.8 mg/L) Preservative',
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: '3 days ago',
  },
  {
    id: 'GEO-07',
    testId: 'TST-KA-550',
    foodType: 'Honey',
    status: 'SAFE',
    locationName: 'Coorg Forest Apiculture Reserve Sample',
    city: 'Madikeri, Karnataka',
    lat: 12.424,
    lng: 75.738,
    xPct: 44,
    yPct: 82,
    detectedIssue: null,
    inspectorName: 'Dr. Sarthak',
    deviceId: 'DEV-AS7265X-01',
    timestamp: '3 days ago',
  },
];

export function MapPage() {
  const navigate = useNavigate();
  const { locale, speakText } = useLanguage();
  const isHi = locale === 'hi';
  const { currentOperator } = useOperator();

  const [points, setPoints] = useState<InspectionGeoPoint[]>(INITIAL_FIELD_POINTS);
  const [selectedPoint, setSelectedPoint] = useState<InspectionGeoPoint | null>(INITIAL_FIELD_POINTS[0]);
  const [foodFilter, setFoodFilter] = useState<'All' | 'Milk' | 'Honey' | 'Paneer'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'SAFE' | 'ADULTERATED'>('All');
  const [locating, setLocating] = useState(false);

  // Sync with current user's tests
  useEffect(() => {
    if (currentOperator?.name) {
      setPoints(prev => prev.map(p => ({
        ...p,
        inspectorName: currentOperator.name,
      })));
    }
  }, [currentOperator?.name]);

  const filteredPoints = points.filter(p => {
    if (foodFilter !== 'All' && p.foodType !== foodFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    return true;
  });

  const totalTested = points.length;
  const safeCount = points.filter(p => p.status === 'SAFE').length;
  const adulteratedCount = points.filter(p => p.status === 'ADULTERATED').length;
  const contaminationRate = ((adulteratedCount / totalTested) * 100).toFixed(1);

  // Geolocation trigger
  const handlePinCurrentLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPt: InspectionGeoPoint = {
            id: `GEO-${Date.now().toString(36).toUpperCase()}`,
            testId: `TST-LOC-${Math.floor(Math.random() * 900 + 100)}`,
            foodType: 'Milk',
            status: 'SAFE',
            locationName: 'Current Field Inspection Site (GPS Tagged)',
            city: `Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            xPct: 50 + (Math.random() - 0.5) * 20,
            yPct: 50 + (Math.random() - 0.5) * 20,
            detectedIssue: null,
            inspectorName: currentOperator?.name || 'Inspector',
            deviceId: 'DEV-AS7265X-01',
            timestamp: 'Just Now',
          };
          setPoints(prev => [newPt, ...prev]);
          setSelectedPoint(newPt);
          setLocating(false);
        },
        () => {
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={24} color="var(--accent)" />
            <span>Field Surveillance & Adulteration Heatmap</span>
          </h1>
          <div className="page-subtitle">
            Regional GPS-tagged food authenticity inspections & black-market contamination surveillance
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 12px' }}
            onClick={() => {
              if (isHi) {
                speakText(`क्षेत्रीय निगरानी रिपोर्ट। कुल ${totalTested} नमूनों में से ${adulteratedCount} में मिलावट पाई गई। क्षेत्रीय मिलावट दर ${contaminationRate} प्रतिशत है।`, 'hi');
              } else {
                speakText(`Regional surveillance alert. Out of ${totalTested} field samples, ${adulteratedCount} are contaminated. Regional adulteration rate is ${contaminationRate} percent.`, 'en');
              }
            }}
          >
            <Volume2 size={15} />
            <span>{isHi ? 'ऑडियो रिपोर्ट सुनें' : 'Listen Report'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 12px' }}
            onClick={handlePinCurrentLocation}
            disabled={locating}
          >
            <Locate size={14} />
            <span>{locating ? (isHi ? 'जीपीएस खोज रहे हैं…' : 'Acquiring GPS…') : (isHi ? 'मेरा स्थान टैग करें' : 'Tag My Current Location')}</span>
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* KPI Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          marginBottom: 16,
        }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Field Inspections</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>{totalTested}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Geotagged verified sites</div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Authentic Samples</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--safe)', marginTop: 2 }}>{safeCount}</div>
            <div style={{ fontSize: 10, color: 'var(--safe)' }}>100% pure certified</div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Contaminated Hotspots</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--adulterated)', marginTop: 2 }}>{adulteratedCount}</div>
            <div style={{ fontSize: 10, color: '#fca5a5' }}>Chemical spikes detected</div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Regional Contamination</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>{contaminationRate}%</div>
            <div style={{ fontSize: 10, color: '#fde68a' }}>Active black-market alert</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 14,
          background: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Filter size={13} />
            <span>Filters:</span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {(['All', 'Milk', 'Honey', 'Paneer'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFoodFilter(f)}
                className={foodFilter === f ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '4px 8px', fontSize: 11 }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            {(['All', 'SAFE', 'ADULTERATED'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '4px 8px', fontSize: 11 }}
              >
                {s === 'All' ? 'All Status' : s === 'SAFE' ? '🟢 Safe' : '🔴 Contaminated'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Map Graphic + Point Inspection Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}>
          {/* High-Tech Regional Surveillance Radar Map */}
          <div className="card" style={{
            padding: 16,
            position: 'relative',
            background: 'radial-gradient(ellipse at 50% 50%, #0f172a 0%, #020617 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 20,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} color="#38bdf8" />
                <span>Regional Sensor Telemetry Radar</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                GPS MESH ACTIVE
              </span>
            </div>

            {/* Map Canvas with Grid Lines and Pins */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '380px',
              borderRadius: 14,
              border: '1px solid rgba(56, 189, 248, 0.15)',
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.98))',
              overflow: 'hidden',
            }}>
              {/* Radar Grid Overlay */}
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Radar Concentric Circles */}
                <circle cx="50%" cy="50%" r="90" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50%" cy="50%" r="160" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Geo Points Markers */}
              {filteredPoints.map(p => {
                const isSelected = selectedPoint?.id === p.id;
                const isAdulterated = p.status === 'ADULTERATED';
                const color = isAdulterated ? '#ef4444' : '#10b981';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPoint(p)}
                    style={{
                      position: 'absolute',
                      left: `${p.xPct}%`,
                      top: `${p.yPct}%`,
                      transform: 'translate(-50%, -50%)',
                      background: isSelected ? color : 'rgba(15, 23, 42, 0.9)',
                      border: `2px solid ${color}`,
                      borderRadius: '50%',
                      width: isSelected ? '34px' : '26px',
                      height: isSelected ? '34px' : '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: isSelected ? 10 : 3,
                      boxShadow: isAdulterated
                        ? '0 0 16px rgba(239, 68, 68, 0.8)'
                        : '0 0 12px rgba(16, 185, 129, 0.6)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    title={`${p.locationName}: ${p.status}`}
                  >
                    <span style={{ fontSize: isSelected ? '14px' : '11px' }}>
                      {p.foodType === 'Milk' ? '🥛' : p.foodType === 'Honey' ? '🍯' : '🧀'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11, color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span>Safe Sample</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginLeft: 8 }} />
                <span>Contaminated Hotspot</span>
              </div>
              <span>Tap pin to view inspection dossier</span>
            </div>
          </div>

          {/* Right: Selected Inspection Dossier */}
          {selectedPoint ? (
            <div className="card" style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: `1px solid ${selectedPoint.status === 'ADULTERATED' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              borderRadius: 20,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>{selectedPoint.testId}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 2px 0', color: '#ffffff' }}>
                    {selectedPoint.locationName}
                  </h3>
                  <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color="var(--accent)" />
                    <span>{selectedPoint.city}</span>
                  </div>
                </div>

                <div style={{
                  padding: '4px 10px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  background: selectedPoint.status === 'ADULTERATED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${selectedPoint.status === 'ADULTERATED' ? '#ef4444' : '#10b981'}`,
                  color: selectedPoint.status === 'ADULTERATED' ? '#f87171' : '#34d399',
                }}>
                  {selectedPoint.status}
                </div>
              </div>

              {/* Chemical Threat Assessment */}
              {selectedPoint.status === 'ADULTERATED' ? (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: 14,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={13} color="#ef4444" />
                    <span>Chemical Contaminants Flagged:</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', marginTop: 3 }}>
                    {selectedPoint.detectedIssue}
                  </div>
                  <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>
                    Immediate notice issued under FSSAI Section 38. Product seizure recommended.
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: 14,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>Pure Food Matrix Verified:</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>
                    All 16 chromogenic zones and 18-channel spectral NIR frequencies match authentic purity baselines.
                  </div>
                </div>
              )}

              {/* Inspection Metadata Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                  <span style={{ color: '#94a3b8' }}>Tested Food Matrix:</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>
                    {selectedPoint.foodType === 'Milk' ? '🥛 Milk (Cow/Buffalo)' : selectedPoint.foodType === 'Honey' ? '🍯 Honey (Apis)' : '🧀 Paneer (Curd)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                  <span style={{ color: '#94a3b8' }}>Reporting Inspector:</span>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>{selectedPoint.inspectorName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                  <span style={{ color: '#94a3b8' }}>Hardware Terminal:</span>
                  <span className="mono" style={{ color: '#cbd5e1' }}>{selectedPoint.deviceId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Field Acquisition Time:</span>
                  <span style={{ color: '#cbd5e1' }}>{selectedPoint.timestamp}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={() => navigate('/test')}
                >
                  <span>Re-test at this Location</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <MapPin size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Select any inspection pin on the radar map to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
