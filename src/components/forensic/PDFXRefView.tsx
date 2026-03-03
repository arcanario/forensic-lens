import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table2, ChevronDown, ChevronRight } from 'lucide-react';
import type { PDFXRefTable } from '@/lib/pdf-analyzer';

interface PDFXRefViewProps {
  xrefTables: PDFXRefTable[];
  isDidactic: boolean;
}

export function PDFXRefView({ xrefTables, isDidactic }: PDFXRefViewProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tabela de Referência Cruzada (XRef)</h3>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {xrefTables.map((table, idx) => (
          <div key={idx} className="border-b border-border/50 last:border-0">
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-surface-2/50 transition-colors"
            >
              {expanded === idx ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <span className="text-xs font-mono text-foreground">XRef #{idx + 1}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Offset: 0x{table.offset.toString(16).toUpperCase()} — {table.entries.length} entradas
              </span>
            </button>
            {expanded === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-3"
              >
                <div className="bg-surface-0 rounded overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 text-[10px] font-mono text-muted-foreground border-b border-border/50 px-2 py-1">
                    <span>Obj#</span><span>Offset</span><span>Gen</span><span>Status</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {table.entries.slice(0, 100).map((entry, i) => (
                      <div key={i} className={`grid grid-cols-4 gap-0 text-[10px] font-mono px-2 py-0.5 ${entry.inUse ? 'text-foreground' : 'text-muted-foreground'}`}>
                        <span>{entry.objNum}</span>
                        <span>0x{entry.offset.toString(16).toUpperCase().padStart(8, '0')}</span>
                        <span>{entry.genNum}</span>
                        <span className={entry.inUse ? 'text-success' : 'text-destructive'}>{entry.inUse ? 'n (uso)' : 'f (livre)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 A tabela XRef é o "índice" do PDF — mapeia cada objeto ao seu offset no arquivo, permitindo acesso aleatório eficiente.
          Entradas marcadas como "f" (free) são objetos excluídos.
        </div>
      )}
    </div>
  );
}
