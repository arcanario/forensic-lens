import { motion } from 'framer-motion';
import { FileImage, Binary, Hash, Grid3x3, MessageSquare, Image, AlertTriangle } from 'lucide-react';
import type { FullAnalysisResult } from '@/lib/forensic-analyzer';

interface StructureSummaryProps {
  result: FullAnalysisResult;
}

export function StructureSummary({ result }: StructureSummaryProps) {
  const items = [
    { icon: FileImage, label: 'Marcadores', value: result.totalMarkers, color: 'text-primary' },
    { icon: Grid3x3, label: 'DQT', value: result.quantizationTables.length, color: 'text-primary' },
    { icon: Hash, label: 'DHT', value: result.huffmanTables.length, color: 'text-primary' },
    { icon: MessageSquare, label: 'Comentários', value: result.comments.length, color: result.comments.length > 0 ? 'text-info' : 'text-muted-foreground' },
    { icon: Image, label: 'Thumbnail', value: result.hasThumbnail ? 'Sim' : 'Não', color: result.hasThumbnail ? 'text-success' : 'text-muted-foreground' },
    ...(result.hasTrailingData ? [{ icon: AlertTriangle, label: 'Dados Extra', value: `${result.trailingDataSize}B`, color: 'text-warning' }] : []),
    ...(result.estimatedQuality !== null ? [{ icon: Binary, label: 'Qualidade', value: `~${result.estimatedQuality}%`, color: 'text-primary' }] : []),
    ...(result.sofInfo ? [{ icon: FileImage, label: 'Tipo', value: result.sofInfo.compressionType, color: 'text-primary' }] : []),
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
