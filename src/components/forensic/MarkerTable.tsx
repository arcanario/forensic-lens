import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import type { JpegMarker } from '@/lib/forensic-analyzer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MarkerTableProps {
  markers: JpegMarker[];
  isDidactic: boolean;
}

export function MarkerTable({ markers, isDidactic }: MarkerTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <h3 className="text-sm font-semibold text-foreground">Marcadores JPEG</h3>
        {isDidactic && (
          <p className="text-xs text-muted-foreground mt-1">
            Marcadores são sinalizadores que organizam a estrutura interna do arquivo JPEG.
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left px-4 py-2">Offset</th>
              <th className="text-left px-4 py-2">Marcador</th>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Tamanho</th>
              {isDidactic && <th className="text-left px-4 py-2">Info</th>}
            </tr>
          </thead>
          <tbody>
            {markers.map((marker, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
              >
                <td className="px-4 py-2 text-muted-foreground">
                  0x{marker.offset.toString(16).toUpperCase().padStart(8, '0')}
                </td>
                <td className="px-4 py-2 text-primary">0x{marker.markerHex}</td>
                <td className="px-4 py-2 text-foreground font-semibold">{marker.name}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {marker.length > 0 ? `${marker.length} bytes` : '—'}
                </td>
                {isDidactic && (
                  <td className="px-4 py-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-primary/60 hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs text-xs">
                        {marker.description}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
