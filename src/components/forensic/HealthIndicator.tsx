import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface HealthIndicatorProps {
  score: number;
  details: string[];
  isDidactic: boolean;
}

export function HealthIndicator({ score, details, isDidactic }: HealthIndicatorProps) {
  const getStatus = () => {
    if (score >= 80) return { label: 'Íntegro', color: 'text-success', bg: 'bg-success/10', glow: 'glow-success', Icon: ShieldCheck };
    if (score >= 50) return { label: 'Suspeito', color: 'text-warning', bg: 'bg-warning/10', glow: 'glow-warning', Icon: ShieldAlert };
    return { label: 'Comprometido', color: 'text-destructive', bg: 'bg-destructive/10', glow: 'glow-danger', Icon: ShieldX };
  };

  const status = getStatus();

  return (
    <div className={`rounded-lg border border-border ${status.bg} p-4 ${status.glow}`}>
      <div className="flex items-center gap-3 mb-3">
        <status.Icon className={`w-6 h-6 ${status.color}`} />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Saúde do Documento</h3>
          <span className={`text-xs font-mono ${status.color}`}>{status.label} — {score}/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive'
          }`}
        />
      </div>

      {/* Details */}
      <div className="space-y-1">
        {details.map((detail, i) => (
          <p key={i} className="text-xs text-muted-foreground font-mono leading-relaxed">
            {detail}
          </p>
        ))}
      </div>

      {isDidactic && (
        <div className="mt-3 p-2 bg-surface-2 rounded text-xs text-muted-foreground">
          💡 O score é calculado com base na presença de marcadores, qualidade das tabelas de quantização e consistência dos metadados.
        </div>
      )}
    </div>
  );
}
