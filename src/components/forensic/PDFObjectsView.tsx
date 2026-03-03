import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import type { PDFObject } from '@/lib/pdf-analyzer';

interface PDFObjectsViewProps {
  objects: PDFObject[];
  objectTypes: Record<string, number>;
  isDidactic: boolean;
  isExpert: boolean;
}

export function PDFObjectsView({ objects, objectTypes, isDidactic, isExpert }: PDFObjectsViewProps) {
  const [expandedObj, setExpandedObj] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const types = Object.entries(objectTypes).sort((a, b) => b[1] - a[1]);
  const filtered = filter === 'all' ? objects : objects.filter(o => o.type === filter);
  const displayed = filtered.slice(0, 50);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Objetos PDF</h3>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{objects.length} objetos</span>
        </div>
      </div>

      {/* Type distribution */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Distribuição por tipo</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              filter === 'all' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-surface-2 border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos ({objects.length})
          </button>
          {types.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? 'all' : type)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                filter === type ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-surface-2 border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {type} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Object list */}
      <div className="max-h-80 overflow-y-auto">
        {displayed.map((obj) => (
          <div key={`${obj.objNum}-${obj.genNum}`} className="border-b border-border/50 last:border-0">
            <button
              onClick={() => setExpandedObj(expandedObj === obj.objNum ? null : obj.objNum)}
              className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-surface-2/50 transition-colors"
            >
              {expandedObj === obj.objNum ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
              <span className="text-[11px] font-mono text-primary">{obj.objNum} {obj.genNum} obj</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{obj.type}</span>
              {obj.hasStream && <span className="text-[10px] font-mono text-info">stream:{obj.streamLength}B</span>}
              <span className="text-[10px] text-muted-foreground ml-auto font-mono">0x{obj.offset.toString(16).toUpperCase()}</span>
            </button>

            {expandedObj === obj.objNum && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-3"
              >
                {isExpert && (
                  <pre className="text-[10px] font-mono text-muted-foreground bg-surface-0 rounded p-2 overflow-x-auto max-h-40 whitespace-pre-wrap">
                    {obj.rawContent}
                  </pre>
                )}
                {Object.keys(obj.dictionary).length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {Object.entries(obj.dictionary).slice(0, 15).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px] font-mono">
                        <span className="text-primary">/{k}</span>
                        <span className="text-foreground truncate ml-2 max-w-[200px]">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
        {filtered.length > 50 && (
          <div className="px-4 py-2 text-[10px] text-muted-foreground text-center">
            Mostrando 50 de {filtered.length} objetos
          </div>
        )}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 Objetos PDF contêm todo o conteúdo do documento: páginas, fontes, imagens, metadados. Cada objeto tem um número único e pode referenciar outros objetos.
        </div>
      )}
    </div>
  );
}
