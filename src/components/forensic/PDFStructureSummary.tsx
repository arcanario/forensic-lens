import { motion } from 'framer-motion';
import { FileText, Package, Type, ImageIcon, Table2, Lock, Layers } from 'lucide-react';
import type { PDFAnalysisResult } from '@/lib/pdf-analyzer';

interface PDFStructureSummaryProps {
  result: PDFAnalysisResult;
}

export function PDFStructureSummary({ result }: PDFStructureSummaryProps) {
  const items = [
    { icon: FileText, label: 'PDF', value: result.header.version, color: 'text-primary' },
    { icon: Package, label: 'Objetos', value: result.totalObjects, color: 'text-primary' },
    { icon: Layers, label: 'Páginas', value: result.pages.length, color: 'text-primary' },
    { icon: Type, label: 'Fontes', value: result.fonts.length, color: result.fonts.length > 0 ? 'text-info' : 'text-muted-foreground' },
    { icon: ImageIcon, label: 'Imagens', value: result.images.length, color: result.images.length > 0 ? 'text-info' : 'text-muted-foreground' },
    { icon: Table2, label: 'XRef', value: result.xrefTables.length, color: 'text-primary' },
    ...(result.linearized ? [{ icon: Layers, label: 'Linearizado', value: 'Sim', color: 'text-success' }] : []),
    ...(result.security.encrypted ? [{ icon: Lock, label: 'Criptografado', value: 'Sim', color: 'text-warning' }] : []),
    ...(result.incrementalUpdates > 1 ? [{ icon: Layers, label: 'Updates', value: result.incrementalUpdates, color: 'text-warning' }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2"
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded-lg border border-border/50"
        >
          <item.icon className={`w-3 h-3 ${item.color}`} />
          <span className="text-[10px] text-muted-foreground">{item.label}:</span>
          <span className={`text-[11px] font-mono font-semibold ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </motion.div>
  );
}
