import React, { useState } from 'react';
import { TestSessionRecord } from '../types';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, ChevronRight, Download } from 'lucide-react';

interface HistoryViewProps {
  sessions: TestSessionRecord[];
  onSelectTest: (test: TestSessionRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectTest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = sessions.filter(s => {
    const matchesSearch =
      s.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sessionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.foodItem && s.foodItem.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.collectionSource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult =
      filterResult === 'ALL' || s.overallResult === filterResult;

    const matchesCategory =
      selectedCategory === 'ALL' || s.foodCategory === selectedCategory;

    return matchesSearch && matchesResult && matchesCategory;
  });

  const getCommodityIcon = (cat: string) => {
    switch (cat) {
      case 'DAIRY': return '🥛';
      case 'HONEY': return '🍯';
      case 'SPICES': return '🌶️';
      case 'EDIBLE_OILS': return '🛢️';
      case 'VEGETABLES': return '🥬';
      default: return '🥗';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff' }}>Multi-Commodity Screening History</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Tamper-evident audit log of field-tested food commodities across regional centers
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                placeholder="Search food, sample, location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              />
            </div>

            <select
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
              className="form-input"
              style={{ width: 'auto', fontSize: '0.88rem' }}
            >
              <option value="ALL">All Outcomes</option>
              <option value="PASS_SCREENING">Pass Screening (Safe)</option>
              <option value="WARNING_SUSPICIOUS">Warning Samples</option>
              <option value="POSITIVE_SCREENING">Positive Adulterated</option>
              <option value="INVALID_TEST">Invalid Tests</option>
            </select>
          </div>
        </div>

        {/* Commodity Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Commodities' },
            { id: 'DAIRY', label: '🥛 Dairy (Milk, Paneer, Dahi)' },
            { id: 'HONEY', label: '🍯 Pure Honey' },
            { id: 'SPICES', label: '🌶️ Spices (Turmeric, Chilli)' },
            { id: 'EDIBLE_OILS', label: '🛢️ Edible Oils & Ghee' },
            { id: 'VEGETABLES', label: '🥬 Green Vegetables' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={selectedCategory === tab.id ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Session Code</th>
                <th>Sample ID</th>
                <th>Food Commodity</th>
                <th>Collection Centre</th>
                <th>Cartridge UID</th>
                <th>Overall Outcome</th>
                <th>Validity</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                    No matching food test records found.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => onSelectTest(s)}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {s.sessionCode}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.sampleCode}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span>{getCommodityIcon(s.foodCategory)}</span>
                        <span>{s.foodItem || s.foodCategory}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.collectionSource}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{s.cartridgeUid}</td>
                    <td>
                      {s.overallResult === 'PASS_SCREENING' && (
                        <span className="badge badge-safe"><CheckCircle size={12} /> PASS</span>
                      )}
                      {s.overallResult === 'WARNING_SUSPICIOUS' && (
                        <span className="badge badge-warning"><AlertTriangle size={12} /> WARNING</span>
                      )}
                      {s.overallResult === 'POSITIVE_SCREENING' && (
                        <span className="badge badge-danger"><XCircle size={12} /> POSITIVE</span>
                      )}
                      {s.overallResult === 'INVALID_TEST' && (
                        <span className="badge badge-neutral">INVALID</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: s.validityStatus === 'VALID' ? '#34d399' : '#f87171' }}>
                      {s.validityStatus}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{s.startedAt}</td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        View <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
