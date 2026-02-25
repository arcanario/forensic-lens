import { motion } from 'framer-motion';
import { Database, MapPin, Camera, Calendar, Cpu } from 'lucide-react';

interface MetadataPanelProps {
  exifData: Record<string, any> | null;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
  isDidactic: boolean;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function MetadataPanel({ exifData, fileInfo, isDidactic }: MetadataPanelProps) {
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
    ...(exifData ? [
      {
        icon: Camera,
        title: 'Câmera',
        items: [
          exifData.Make && { label: 'Fabricante', value: exifData.Make },
          exifData.Model && { label: 'Modelo', value: exifData.Model },
          exifData.LensModel && { label: 'Lente', value: exifData.LensModel },
          exifData.FocalLength && { label: 'Distância Focal', value: `${exifData.FocalLength}mm` },
          exifData.FNumber && { label: 'Abertura', value: `f/${exifData.FNumber}` },
          exifData.ExposureTime && { label: 'Exposição', value: `${exifData.ExposureTime}s` },
          exifData.ISO && { label: 'ISO', value: exifData.ISO },
        ].filter(Boolean),
      },
      {
        icon: Calendar,
        title: 'Datas',
        items: [
          exifData.DateTimeOriginal && { label: 'Original', value: String(exifData.DateTimeOriginal) },
          exifData.ModifyDate && { label: 'Modificação', value: String(exifData.ModifyDate) },
          exifData.CreateDate && { label: 'Criação', value: String(exifData.CreateDate) },
        ].filter(Boolean),
      },
      {
        icon: Cpu,
        title: 'Software',
        items: [
          exifData.Software && { label: 'Software', value: exifData.Software },
          exifData.ColorSpace && { label: 'Espaço de Cor', value: String(exifData.ColorSpace) },
          exifData.ImageWidth && { label: 'Resolução', value: `${exifData.ImageWidth}×${exifData.ImageHeight}` },
        ].filter(Boolean),
      },
      ...(exifData.latitude ? [{
        icon: MapPin,
        title: 'Localização',
        items: [
          { label: 'Latitude', value: exifData.latitude?.toFixed(6) },
          { label: 'Longitude', value: exifData.longitude?.toFixed(6) },
        ],
      }] : []),
    ] : []),
  ];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <h3 className="text-sm font-semibold text-foreground">Metadados</h3>
        {isDidactic && !exifData && (
          <p className="text-xs text-warning mt-1">
            ⚠️ Sem dados EXIF. Metadados podem ter sido removidos intencionalmente (prática comum em redes sociais).
          </p>
        )}
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
              {section.items.map((item: any, iIdx: number) => (
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
