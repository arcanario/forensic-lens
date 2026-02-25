import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, Maximize2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
}

export function ImagePreview({ imageUrl, fileName }: ImagePreviewProps) {
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const ZOOM = 3;
  const SIZE = 120;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    setMagnifier({ show: true, x, y, bgX, bgY });
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground truncate">{fileName}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Passe o mouse para ampliar</span>
      </div>
      <div
        ref={imgRef}
        className="relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMagnifier(prev => ({ ...prev, show: false }))}
      >
        <motion.img
          src={imageUrl}
          alt={fileName}
          className="w-full h-auto max-h-80 object-contain bg-surface-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {magnifier.show && (
          <div
            className="absolute pointer-events-none border-2 border-primary rounded-full shadow-lg"
            style={{
              width: SIZE,
              height: SIZE,
              left: magnifier.x - SIZE / 2,
              top: magnifier.y - SIZE / 2,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${ZOOM * 100}%`,
              backgroundPosition: `${magnifier.bgX}% ${magnifier.bgY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>
    </div>
  );
}
