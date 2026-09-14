import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { SpectralChannel } from '../services/api';

interface SpectralChartProps {
  channels: SpectralChannel[];
  showProcessed?: boolean;
  title?: string;
}

export function SpectralChart({ channels, showProcessed = true, title }: SpectralChartProps) {
  const data = channels.map(ch => ({
    wavelength: ch.wavelength,
    raw: Math.round(ch.rawValue),
    processed: ch.processedValue !== null ? Number(ch.processedValue.toFixed(4)) : null,
  }));

  return (
    <div>
      {title && <div className="card-title" style={{ marginBottom: 16 }}>{title}</div>}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="wavelength"
            tickFormatter={v => `${v}`}
            label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5, fill: '#6e7681', fontSize: 11 }}
            tick={{ fill: '#8b949e', fontSize: 11 }}
            stroke="#30363d"
          />
          <YAxis
            yAxisId="raw"
            orientation="left"
            tick={{ fill: '#8b949e', fontSize: 11 }}
            stroke="#30363d"
            label={{ value: 'Raw (counts)', angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 10 }}
          />
          {showProcessed && (
            <YAxis
              yAxisId="proc"
              orientation="right"
              tick={{ fill: '#8b949e', fontSize: 11 }}
              stroke="#30363d"
              label={{ value: 'Processed', angle: 90, position: 'insideRight', fill: '#6e7681', fontSize: 10 }}
            />
          )}
          <Tooltip
            contentStyle={{
              background: '#1c2128', border: '1px solid #30363d',
              borderRadius: 8, fontSize: 12, color: '#e6edf3',
            }}
            formatter={(value: any, name: any) => [
              name === 'raw' ? `${value} counts` : Number(value)?.toFixed(4),
              name === 'raw' ? 'Raw' : 'Processed (SNV)',
            ]}
            labelFormatter={(l) => `${l} nm`}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e', paddingTop: 8 }} />
          <Line
            yAxisId="raw"
            type="monotone"
            dataKey="raw"
            stroke="#388bfd"
            strokeWidth={2}
            dot={{ r: 3, fill: '#388bfd' }}
            activeDot={{ r: 5 }}
            name="Raw"
          />
          {showProcessed && (
            <Line
              yAxisId="proc"
              type="monotone"
              dataKey="processed"
              stroke="#3fb950"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2, fill: '#3fb950' }}
              name="Processed"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
