import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { HuffmanTable } from '@/lib/forensic-analyzer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HuffmanViewProps {
  tables: HuffmanTable[];
  isDidactic: boolean;
}

export function HuffmanView({ tables, isDidactic }: HuffmanViewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Tabelas de Huffman (DHT)</h3>
            <span className="text-xs text-muted-foreground font-mono">{tables.length} tabelas</span>
            {isDidactic && (
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-primary/60" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Tabelas de Huffman realizam a codificação entrópica — comprimem os coeficientes DCT usando códigos de comprimento variável. DC codifica as diferenças de brilho médio entre blocos; AC codifica os detalhes de frequência.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Recolher</> : <><ChevronDown className="w-3 h-3" /> Expandir</>}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {tables.map((table, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border/50 rounded p-3 bg-surface-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-foreground font-semibold">
                {table.classLabel} Tabela {table.tableId}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {table.totalCodes} códigos
              </span>
            </div>

            {/* Bits distribution */}
            <div className="mb-2">
              <p className="text-[10px] text-muted-foreground mb-1">Distribuição por comprimento (1-16 bits):</p>
              <div className="flex gap-0.5">
                {table.bits.map((count, bi) => {
                  const maxCount = Math.max(...table.bits, 1);
                  const height = Math.max(2, (count / maxCount) * 24);
                  return (
                    <Tooltip key={bi}>
                      <TooltipTrigger>
                        <div className="flex flex-col items-center gap-0.5">
                          <div
                            className="w-3 bg-primary/60 rounded-t"
                            style={{ height: `${height}px` }}
                          />
                          <span className="text-[8px] text-muted-foreground">{bi + 1}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs font-mono">
                        {count} código(s) de {bi + 1} bit(s)
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Values (when expanded) */}
            {expanded && table.values.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-muted-foreground mb-1">Valores:</p>
                <div className="flex flex-wrap gap-1">
                  {table.values.slice(0, expanded ? 64 : 16).map((v, vi) => (
                    <span
                      key={vi}
                      className="text-[10px] font-mono px-1 py-0.5 bg-surface-2 rounded text-foreground"
                    >
                      {v.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                  ))}
                  {table.values.length > 64 && (
                    <span className="text-[10px] text-muted-foreground">+{table.values.length - 64} mais</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {isDidactic && (
          <div className="p-2 bg-surface-2 rounded text-xs text-muted-foreground leading-relaxed">
            💡 JPEG usa 4 tabelas Huffman: 2 DC (luminância + crominância) e 2 AC. O gráfico de barras mostra quantos códigos existem para cada comprimento de bits — códigos mais curtos são usados para valores mais frequentes.
          </div>
        )}
      </div>
    </div>
  );
}
