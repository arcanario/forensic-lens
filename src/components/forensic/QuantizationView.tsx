import { motion } from 'framer-motion';
import { Grid3x3, Info } from 'lucide-react';
import type { QuantizationTable } from '@/lib/forensic-analyzer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QuantizationViewProps {
  tables: QuantizationTable[];
  isDidactic: boolean;
  possibleEditor: string | null;
}

export function QuantizationView({ tables, isDidactic, possibleEditor }: QuantizationViewProps) {
  if (tables.length === 0) return null;

  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-success bg-success/10';
    if (value <= 5) return 'text-foreground bg-surface-3';
    if (value <= 15) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tabelas de Quantização (DQT)</h3>
          {isDidactic && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-primary/60" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                As tabelas DQT controlam quanta informação é descartada na compressão JPEG. Valores baixos = alta qualidade. Valores altos = mais compressão e perda de detalhes.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {possibleEditor && (
          <p className="text-xs text-accent mt-1 font-mono">
            🔍 {possibleEditor}
          </p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {tables.map((table, tIdx) => (
          <div key={tIdx}>
            <p className="text-xs text-muted-foreground font-mono mb-2">
              Tabela {table.id} (Precisão: {table.precision === 0 ? '8-bit' : '16-bit'})
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {table.values.slice(0, 64).map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={`
                    text-center text-[10px] font-mono py-1 rounded-sm
                    ${getValueColor(val)}
                  `}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {isDidactic && (
          <div className="p-2 bg-surface-2 rounded text-xs text-muted-foreground space-y-1">
            <p>🟢 Verde: Alta fidelidade (valores 0-2)</p>
            <p>⬜ Neutro: Compressão padrão (3-5)</p>
            <p>🟡 Amarelo: Compressão moderada (6-15)</p>
            <p>🔴 Vermelho: Compressão agressiva (16+)</p>
          </div>
        )}
      </div>
    </div>
  );
}
