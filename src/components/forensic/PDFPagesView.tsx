import { motion } from 'framer-motion';
import { FileText, RotateCw } from 'lucide-react';
import type { PDFPage } from '@/lib/pdf-analyzer';

interface PDFPagesViewProps {
  pages: PDFPage[];
  isDidactic: boolean;
}

export function PDFPagesView({ pages, isDidactic }: PDFPagesViewProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Páginas</h3>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{pages.length} páginas</span>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {pages.map((page) => {
          const w = page.mediaBox.length >= 4 ? (page.mediaBox[2] - page.mediaBox[0]).toFixed(0) : '?';
          const h = page.mediaBox.length >= 4 ? (page.mediaBox[3] - page.mediaBox[1]).toFixed(0) : '?';
          const wIn = page.mediaBox.length >= 4 ? ((page.mediaBox[2] - page.mediaBox[0]) / 72).toFixed(1) : '?';
          const hIn = page.mediaBox.length >= 4 ? ((page.mediaBox[3] - page.mediaBox[1]) / 72).toFixed(1) : '?';

          return (
            <div key={page.pageNum} className="px-4 py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground">Página {page.pageNum}</span>
                <span className="font-mono text-muted-foreground">{w}×{h} pt ({wIn}×{hIn} in)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {page.rotate && (
                  <span className="text-[10px] font-mono text-warning flex items-center gap-0.5">
                    <RotateCw className="w-2.5 h-2.5" /> {page.rotate}°
                  </span>
                )}
                {page.resources.map((r, i) => (
                  <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{r}</span>
                ))}
                {page.hasAnnotations && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-info/10 text-info">Annotations</span>}
              </div>
            </div>
          );
        })}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 Cada página possui um MediaBox que define suas dimensões em pontos (1 pt = 1/72 polegada). Recursos incluem fontes, imagens e estados gráficos usados na página.
        </div>
      )}
    </div>
  );
}
