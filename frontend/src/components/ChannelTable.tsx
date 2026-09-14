import type { SpectralChannel } from '../services/api';

interface ChannelTableProps {
  channels: SpectralChannel[];
}

export function ChannelTable({ channels }: ChannelTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>CH</th>
            <th>Wavelength (nm)</th>
            <th>Raw Value</th>
            <th>Processed (SNV)</th>
          </tr>
        </thead>
        <tbody>
          {channels.map(ch => (
            <tr key={ch.channel}>
              <td className="mono" style={{ color: '#8b949e' }}>CH{String(ch.channel).padStart(2, '0')}</td>
              <td className="mono" style={{ color: '#388bfd' }}>{ch.wavelength} nm</td>
              <td className="mono">{Math.round(ch.rawValue).toLocaleString()}</td>
              <td className="mono" style={{ color: '#3fb950' }}>
                {ch.processedValue !== null && ch.processedValue !== undefined
                  ? ch.processedValue.toFixed(4)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
