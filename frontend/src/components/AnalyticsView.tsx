import React from 'react';
import { TestSessionRecord } from '../types';
import { BarChart3, PieChart, TrendingUp, AlertCircle, ShieldCheck, MapPin, Globe2, ArrowRight } from 'lucide-react';

interface AnalyticsViewProps {
  sessions: TestSessionRecord[];
  onOpenGeoMap?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessions, onOpenGeoMap }) => {
  const total = sessions.length;
  const passCount = sessions.filter(s => s.overallResult === 'PASS_SCREENING').length;
  const warningCount = sessions.filter(s => s.overallResult === 'WARNING_SUSPICIOUS').length;
  const positiveCount = sessions.filter(s => s.overallResult === 'POSITIVE_SCREENING').length;

  // Compute analyte-specific detections across all commodities
  const counts: Record<string, number> = {
    MELAMINE: 0,
    H2O2: 0,
    UREA: 0,
    STARCH: 0,
    NEUTRALIZER: 0,
    METANIL_YELLOW: 0,
    SUDAN_DYE: 0,
    ARGEMONE_OIL: 0,
    VANASPATI_GHEE: 0,
    INVERT_SUGAR: 0,
    MALACHITE_GREEN: 0
  };

  // Compute category totals and adulterations
  const categoryStats: Record<string, { total: number; positive: number }> = {
    DAIRY: { total: 0, positive: 0 },
    HONEY: { total: 0, positive: 0 },
    SPICES: { total: 0, positive: 0 },
    EDIBLE_OILS: { total: 0, positive: 0 },
    VEGETABLES: { total: 0, positive: 0 }
  };

  sessions.forEach(s => {
    const cat = s.foodCategory || 'DAIRY';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, positive: 0 };
    }
    categoryStats[cat].total++;
    if (s.overallResult === 'POSITIVE_SCREENING') {
      categoryStats[cat].positive++;
    }

    s.readings.forEach(r => {
      if (r.status === 'POSITIVE_ADULTERATED' || r.status === 'WARNING_SUSPICIOUS') {
        if (counts[r.code] !== undefined) {
          counts[r.code]++;
        }
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Overall Compliance Ratio */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--color-primary)" /> Multi-Commodity Compliance Ratio
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Pass Screening (Safe & Pure)</span>
                <span>{passCount} samples ({total > 0 ? Math.round((passCount / total) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                <div style={{ width: `${total > 0 ? (passCount / total) * 100 : 0}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Warning Samples</span>
                <span>{warningCount} samples ({total > 0 ? Math.round((warningCount / total) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                <div style={{ width: `${total > 0 ? (warningCount / total) * 100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>Positive (Adulterated Samples)</span>
                <span>{positiveCount} samples ({total > 0 ? Math.round((positiveCount / total) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                <div style={{ width: `${total > 0 ? (positiveCount / total) * 100 : 0}%`, height: '100%', background: '#ef4444', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Commodity Category Breakdown Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--color-primary)" /> Category Breakdown & Contamination
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'DAIRY', label: '🥛 Dairy (Milk, Paneer, Dahi)' },
              { key: 'HONEY', label: '🍯 Pure Honey (Madh)' },
              { key: 'SPICES', label: '🌶️ Spices (Turmeric, Red Chilli)' },
              { key: 'EDIBLE_OILS', label: '🛢️ Edible Oils & Desi Ghee' },
              { key: 'VEGETABLES', label: '🥬 Green Vegetables' }
            ].map(item => {
              const stat = categoryStats[item.key] || { total: 0, positive: 0 };
              const rate = stat.total > 0 ? Math.round((stat.positive / stat.total) * 100) : 0;
              return (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{stat.total} tests conducted</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={stat.positive > 0 ? 'badge badge-danger' : 'badge badge-safe'}>
                      {stat.positive} Adulterated ({rate}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complete Adulterant Detection Frequency */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--color-primary)" /> Specific Adulterant & Contaminant Detection Frequency
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Metanil Yellow Dye</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Spices: Turmeric Powder</div>
            </div>
            <span className={counts.METANIL_YELLOW > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.METANIL_YELLOW} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Sudan Dyes I-IV</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Spices: Red Chilli Powder</div>
            </div>
            <span className={counts.SUDAN_DYE > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.SUDAN_DYE} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Toxic Argemone Oil</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Edible Oils: Mustard Oil</div>
            </div>
            <span className={counts.ARGEMONE_OIL > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.ARGEMONE_OIL} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Invert Sugar & HFCS</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Honey: Pure Honey (Madh)</div>
            </div>
            <span className={counts.INVERT_SUGAR > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.INVERT_SUGAR} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Malachite Green Dye</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Vegetables: Peas & Gourds</div>
            </div>
            <span className={counts.MALACHITE_GREEN > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.MALACHITE_GREEN} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Vanaspati (Baudouin Test)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy: Desi Ghee & Butter</div>
            </div>
            <span className={counts.VANASPATI_GHEE > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.VANASPATI_GHEE} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Melamine AuNP Shift</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy: Bovine Milk</div>
            </div>
            <span className={counts.MELAMINE > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.MELAMINE} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Starch & Flour Filler</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy: Paneer & Dahi</div>
            </div>
            <span className={counts.STARCH > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.STARCH} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Hydrogen Peroxide (H2O2)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy & Produce Preservative</div>
            </div>
            <span className={counts.H2O2 > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.H2O2} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Synthetic Urea & Nitrogen</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy & Syrups</div>
            </div>
            <span className={counts.UREA > 0 ? 'badge badge-warning' : 'badge badge-neutral'}>
              {counts.UREA} Hits
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Neutralizers & Detergent</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Dairy: Synthetic Paneer/Milk</div>
            </div>
            <span className={counts.NEUTRALIZER > 0 ? 'badge badge-danger' : 'badge badge-neutral'}>
              {counts.NEUTRALIZER} Hits
            </span>
          </div>
        </div>
      </div>

      {/* Geospatial Traceability Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--color-primary)" /> National Food Testing Geolocation Registry
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Every rapid screening reading is cryptographically tied to the field reader's serial number, operator identity, food category, and GPS coordinate stamp.
            </p>
          </div>
          {onOpenGeoMap && (
            <button
              onClick={onOpenGeoMap}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}
            >
              <Globe2 size={15} /> Open Live National Geo-Map <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Anand Milk Union (Gujarat)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 22.5645° N, 72.9289° E</div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px' }}>Target: Bovine Milk (100% Compliant)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dadar Wholesale Mandi (Mumbai)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 19.0178° N, 72.8478° E</div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px' }}>Target: Fresh Paneer (Starch & Alkalis Flagged)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>APMC Spice Yard (Nizamabad)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 18.6725° N, 78.0941° E</div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px' }}>Target: Turmeric (Metanil Yellow Positive)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Alwar Oil Mill (Rajasthan)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 27.5530° N, 76.6346° E</div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px' }}>Target: Mustard Oil (Argemone Detected)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Kangra Valley Cooperative (HP)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 32.0998° N, 76.2691° E</div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px' }}>Target: Wild Forest Honey (HFCS Invert Sugar)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vashi APMC Sabzi Mandi (Navi Mumbai)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS: 19.0770° N, 72.9986° E</div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '6px' }}>Target: Green Peas (Malachite Green Positive)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
