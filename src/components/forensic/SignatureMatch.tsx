import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import type { CompressionSignature } from '@/lib/forensic-analyzer';

interface SignatureMatchProps {
  signatures: CompressionSignature[];
  isDidactic: boolean;
}

export function SignatureMatch({ signatures, isDidactic }: SignatureMatchProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Assinaturas de Compressão</h3>
        </div>
        {isDidactic && (
          <p className="text-xs text-muted-foreground mt-1">
            Comparação da tabela DQT com assinaturas conhecidas de softwares e câmeras. Alta confiança indica que o arquivo foi salvo por aquele software.
          </p>
        )}
      </div>
      <div className="p-4 space-y-2">
        {signatures.map((sig, i) => {
          const Icon = sig.confidence >= 90 ? CheckCircle : sig.confidence >= 75 ? AlertCircle : HelpCircle;
          const color = sig.confidence >= 90 ? 'text-success' : sig.confidence >= 75 ? 'text-warning' : 'text-muted-foreground';
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded bg-surface-0 border border-border/50"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{sig.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{sig.details}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-xs font-mono font-semibold ${color}`}>{sig.confidence}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
