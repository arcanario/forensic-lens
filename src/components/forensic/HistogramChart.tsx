import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface HistogramChartProps {
  histogram: { r: number[]; g: number[]; b: number[] };
  isDidactic: boolean;
}

export function HistogramChart({ histogram, isDidactic }: HistogramChartProps) {
  const [activeChannels, setActiveChannels] = useState({ r: true, g: true, b: true });

  // Downsample to 64 bins for performance
  const data = Array.from({ length: 64 }, (_, i) => {
    const start = i * 4;
    const end = start + 4;
    return {
      bin: i * 4,
      r: histogram.r.slice(start, end).reduce((a, b) => a + b, 0),
      g: histogram.g.slice(start, end).reduce((a, b) => a + b, 0),
      b: histogram.b.slice(start, end).reduce((a, b) => a + b, 0),
    };
  });

  const channels = [
    { key: 'r', label: 'Vermelho', color: '#ef4444' },
    { key: 'g', label: 'Verde', color: '#22c55e' },
    { key: 'b', label: 'Azul', color: '#3b82f6' },
  ] as const;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Histograma de Cores</h3>
          </div>
          <div className="flex gap-2">
            {channels.map(ch => (
              <button
                key={ch.key}
                onClick={() => setActiveChannels(prev => ({ ...prev, [ch.key]: !prev[ch.key] }))}
                className={`w-3 h-3 rounded-full border transition-all ${
                  activeChannels[ch.key] ? 'opacity-100 scale-100' : 'opacity-30 scale-75'
                }`}
                style={{ backgroundColor: ch.color, borderColor: ch.color }}
              />
            ))}
          </div>
        </div>
        {isDidactic && (
          <p className="text-xs text-muted-foreground mt-1">
            O histograma mostra a distribuição de intensidade de cada canal RGB. Picos ou cortes abruptos podem indicar edição.
          </p>
        )}
      </div>
      <div className="p-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="bin"
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 40%, 8%)',
                border: '1px solid hsl(222, 25%, 16%)',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
              labelStyle={{ color: 'hsl(200, 20%, 90%)' }}
            />
            {activeChannels.r && (
              <Area type="monotone" dataKey="r" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={1.5} />
            )}
            {activeChannels.g && (
              <Area type="monotone" dataKey="g" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={1.5} />
            )}
            {activeChannels.b && (
              <Area type="monotone" dataKey="b" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={1.5} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
