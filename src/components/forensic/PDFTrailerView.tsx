import { motion } from 'framer-motion';
import { FileKey } from 'lucide-react';
import type { PDFTrailer } from '@/lib/pdf-analyzer';

interface PDFTrailerViewProps {
  trailer: PDFTrailer;
  isDidactic: boolean;
}

export function PDFTrailerView({ trailer, isDidactic }: PDFTrailerViewProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <FileKey className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Trailer</h3>
        </div>
      </div>
      <div className="p-4 space-y-2 text-xs font-mono">
        <Row label="Size" value={`${trailer.size}`} />
        <Row label="Root (Catalog)" value={trailer.root || 'N/A'} />
        <Row label="Info" value={trailer.info || 'N/A'} />
        {trailer.id.length === 2 && (
          <>
            <Row label="ID[0]" value={trailer.id[0].substring(0, 24) + '...'} />
            <Row label="ID[1]" value={trailer.id[1].substring(0, 24) + '...'} />
          </>
        )}
        {trailer.encrypted && (
          <div className="flex items-center gap-2 text-warning">
            <span>🔒 Documento criptografado</span>
          </div>
        )}
      </div>

      {isDidactic && (
        <div className="px-4 py-3 bg-surface-2 border-t border-border text-xs text-muted-foreground">
          💡 O trailer é a "porta de entrada" do PDF. Contém referência ao catálogo raiz (/Root), ao dicionário de informações (/Info) e IDs únicos do documento.
          IDs diferentes entre ID[0] e ID[1] indicam que o documento foi modificado.
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground truncate max-w-[200px]">{value}</span>
    </div>
  );
}
