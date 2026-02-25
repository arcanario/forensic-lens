import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, Loader2 } from 'lucide-react';
import { performELA } from '@/lib/forensic-analyzer';
import { Slider } from '@/components/ui/slider';

interface ELAViewerProps {
  imageUrl: string;
  isDidactic: boolean;
}

export function ELAViewer({ imageUrl, isDidactic }: ELAViewerProps) {
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(75);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setLoading(true);
      try {
        const result = await performELA(img, quality);
        setElaUrl(result);
      } catch (e) {
        console.error('ELA failed:', e);
      }
      setLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl, quality]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <ScanSearch className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Error Level Analysis (ELA)</h3>
        </div>
        {isDidactic && (
          <p className="text-xs text-muted-foreground mt-1">
            ELA re-comprime a imagem e compara com o original. Áreas editadas aparecem mais brilhantes pois divergem do nível de compressão uniforme.
          </p>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Quality slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono w-20">Qualidade:</span>
          <Slider
            value={[quality]}
            onValueChange={([v]) => setQuality(v)}
            min={50}
            max={95}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-primary font-mono w-8">{quality}%</span>
        </div>

        {/* Image display */}
        <div
          className="relative rounded overflow-hidden bg-surface-0 cursor-pointer"
          onMouseEnter={() => setShowOriginal(true)}
          onMouseLeave={() => setShowOriginal(false)}
        >
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : elaUrl ? (
            <motion.img
              src={showOriginal ? imageUrl : elaUrl}
              alt="ELA"
              className="w-full h-auto max-h-64 object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : null}

          {/* Label */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-surface-0/80 rounded text-[10px] font-mono text-primary">
            {showOriginal ? 'ORIGINAL' : 'ELA'}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Passe o mouse para ver o original
        </p>
      </div>
    </div>
  );
}
