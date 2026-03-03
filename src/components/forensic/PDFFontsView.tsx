import { motion } from 'framer-motion';
import { Type } from 'lucide-react';
import type { PDFFont } from '@/lib/pdf-analyzer';

interface PDFFontsViewProps {
  fonts: PDFFont[];
  isDidactic: boolean;
}

export function PDFFontsView({ fonts, isDidactic }: PDFFontsViewProps) {
  if (fonts.length === 0 && !isDidactic) return null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Fontes</h3>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{fonts.length} fontes</span>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {fonts.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground italic">Nenhuma fonte detectada diretamente nos objetos</div>
        ) : (
          fonts.map((font, i) => (
            <div key={i} className="px-4 py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground truncate max-w-[180px]">{font.name}</span>
                <span className="font-mono text-muted-foreground">{font.type}</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{font.encoding}</span>
                {font.embedded && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-success/10 text-success">Embedded</span>}
                {!font.embedded && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/10 text-warning">Not Embedded</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 Fontes embutidas garantem que o documento será exibido corretamente em qualquer sistema. Fontes não embutidas dependem de estarem instaladas no computador do leitor.
        </div>
      )}
    </div>
  );
}
