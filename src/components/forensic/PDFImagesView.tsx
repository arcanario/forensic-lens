import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import type { PDFImage } from '@/lib/pdf-analyzer';

interface PDFImagesViewProps {
  images: PDFImage[];
  isDidactic: boolean;
}

export function PDFImagesView({ images, isDidactic }: PDFImagesViewProps) {
  if (images.length === 0 && !isDidactic) return null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Imagens</h3>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{images.length} imagens</span>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {images.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground italic">Nenhuma imagem detectada diretamente</div>
        ) : (
          images.map((img, i) => (
            <div key={i} className="px-4 py-2 border-b border-border/50 last:border-0 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Obj {img.objNum}</span>
                <span className="text-muted-foreground">{img.width}×{img.height}</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{img.colorSpace}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{img.filter}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">{img.bitsPerComponent}bpc</span>
                {img.size > 0 && <span className="text-[10px] text-muted-foreground">{(img.size / 1024).toFixed(1)}KB</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 Imagens em PDF são armazenadas como objetos XObject do subtipo Image. O filtro indica a compressão: DCTDecode=JPEG, FlateDecode=ZIP, CCITTFaxDecode=Fax.
        </div>
      )}
    </div>
  );
}
