import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScatterPoint { x: number; y: number; label: string; }

interface PCAChartProps {
  trainingPoints: ScatterPoint[];
  newSample?: { x: number; y: number } | null;
  explainedVariance?: number[];
  isDevelopment?: boolean;
}

const LABEL_COLORS: Record<string, string> = {
  AUTHENTIC:   '#3fb950',
  SAFE:        '#3fb950',
  ADULTERATED: '#f85149',
  SUSPECTED:   '#d29922',
};

const DEFAULT_COLOR = '#8b949e';

const getColor = (label: string) => LABEL_COLORS[label] ?? DEFAULT_COLOR;

// Group scatter points by label for recharts multiple Scatter
function groupByLabel(points: ScatterPoint[]): Record<string, ScatterPoint[]> {
  return points.reduce((acc, p) => {
    if (!acc[p.label]) acc[p.label] = [];
    acc[p.label].push(p);
    return acc;
  }, {} as Record<string, ScatterPoint[]>);
}

export function PCAChart({ trainingPoints, newSample, explainedVariance, isDevelopment = true }: PCAChartProps) {
  const grouped = groupByLabel(trainingPoints);
  const pc1Var = explainedVariance?.[0] ? `${(explainedVariance[0] * 100).toFixed(1)}%` : '';
  const pc2Var = explainedVariance?.[1] ? `${(explainedVariance[1] * 100).toFixed(1)}%` : '';

  return (
    <div>
      {isDevelopment && (
        <div style={{ fontSize: 11, color: '#d29922', marginBottom: 10, padding: '4px 10px', background: 'rgba(45,29,0,0.6)', borderRadius: 4, border: '1px solid rgba(210,153,34,0.25)' }}>
          PCA Demonstration — Synthetic Dataset. Not experimentally validated.
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="x"
            type="number"
            name="PC1"
            tick={{ fill: '#8b949e', fontSize: 11 }}
            stroke="#30363d"
            label={{ value: `PC1 ${pc1Var}`, position: 'insideBottom', offset: -10, fill: '#6e7681', fontSize: 11 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="PC2"
            tick={{ fill: '#8b949e', fontSize: 11 }}
            stroke="#30363d"
            label={{ value: `PC2 ${pc2Var}`, angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, fontSize: 12, color: '#e6edf3' }}
            formatter={(v: any) => typeof v === 'number' ? v.toFixed(3) : String(v)}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {Object.entries(grouped).map(([label, points]) => (
            <Scatter
              key={label}
              name={label}
              data={points}
              fill={getColor(label)}
              opacity={0.65}
              r={5}
            />
          ))}

          {/* Current test sample — highlighted */}
          {newSample && (
            <Scatter
              name="Current Sample"
              data={[{ x: newSample.x, y: newSample.y, label: 'Current' }]}
              fill="#ffffff"
              shape="diamond"
              r={8}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
