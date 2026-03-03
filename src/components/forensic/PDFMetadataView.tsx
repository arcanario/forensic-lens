import { motion } from 'framer-motion';
import { Database, Calendar, User, FileText } from 'lucide-react';
import type { PDFMetadata } from '@/lib/pdf-analyzer';

interface PDFMetadataViewProps {
  metadata: PDFMetadata;
  fileInfo: { name: string; size: number; type: string };
  isDidactic: boolean;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function PDFMetadataView({ metadata, fileInfo, isDidactic }: PDFMetadataViewProps) {
  const sections = [
    {
      icon: Database,
      title: 'Arquivo',
      items: [
        { label: 'Nome', value: fileInfo.name },
        { label: 'Tamanho', value: formatSize(fileInfo.size) },
        { label: 'Tipo', value: fileInfo.type },
      ],
    },
    {
      icon: FileText,
      title: 'Documento',
      items: [
        metadata.title && { label: 'Título', value: metadata.title },
        metadata.subject && { label: 'Assunto', value: metadata.subject },
        metadata.keywords && { label: 'Palavras-chave', value: metadata.keywords },
        metadata.trapped && { label: 'Trapped', value: metadata.trapped },
      ].filter(Boolean) as { label: string; value: string }[],
    },
    {
      icon: User,
      title: 'Autoria',
      items: [
        metadata.author && { label: 'Autor', value: metadata.author },
        metadata.creator && { label: 'Criador', value: metadata.creator },
        metadata.producer && { label: 'Produtor', value: metadata.producer },
      ].filter(Boolean) as { label: string; value: string }[],
    },
    {
      icon: Calendar,
      title: 'Datas',
      items: [
        metadata.creationDate && { label: 'Criação', value: metadata.creationDate },
        metadata.modDate && { label: 'Modificação', value: metadata.modDate },
      ].filter(Boolean) as { label: string; value: string }[],
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <h3 className="text-sm font-semibold text-foreground">Metadados PDF</h3>
      </div>
      <div className="p-4 space-y-4">
        {sections.map((section, sIdx) => (
          <motion.div
            key={sIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <section.icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{section.title}</span>
            </div>
            <div className="space-y-1.5 ml-5">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-mono truncate ml-4 max-w-[200px]">{item.value}</span>
                </div>
              ))}
              {section.items.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Sem dados</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
