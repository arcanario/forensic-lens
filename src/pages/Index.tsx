import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, BookOpen, Shield, Scan, FileText } from 'lucide-react';
import exifr from 'exifr';

import { FileUpload } from '@/components/forensic/FileUpload';
import { HealthIndicator } from '@/components/forensic/HealthIndicator';
import { MarkerTable } from '@/components/forensic/MarkerTable';
import { HexViewer } from '@/components/forensic/HexViewer';
import { HistogramChart } from '@/components/forensic/HistogramChart';
import { QuantizationView } from '@/components/forensic/QuantizationView';
import { ELAViewer } from '@/components/forensic/ELAViewer';
import { MetadataPanel } from '@/components/forensic/MetadataPanel';
import { ImagePreview } from '@/components/forensic/ImagePreview';
import { CompressionInfo } from '@/components/forensic/CompressionInfo';
import { HuffmanView } from '@/components/forensic/HuffmanView';
import { SignatureMatch } from '@/components/forensic/SignatureMatch';
import { ForensicLog } from '@/components/forensic/ForensicLog';
import { StructureSummary } from '@/components/forensic/StructureSummary';

import {
  fullJpegParse,
  computeColorHistogram,
  computeHealthScore,
  generateHexDump,
  type FullAnalysisResult,
} from '@/lib/forensic-analyzer';

type Mode = 'didactic' | 'expert';

const Index = () => {
  const [mode, setMode] = useState<Mode>('didactic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<Record<string, any> | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setExifData(null);

    try {
      const buffer = await file.arrayBuffer();
      const isJpeg = file.type === 'image/jpeg';
      const isPng = file.type === 'image/png';

      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Full JPEG parse
      const parsed = isJpeg ? fullJpegParse(buffer) : {
        markers: [],
        markerSequence: '',
        totalMarkers: 0,
        quantizationTables: [],
        estimatedQuality: null,
        qualityMethod: '',
        sofInfo: null,
        huffmanTables: [],
        sosInfo: null,
        jfifInfo: null,
        adobeInfo: null,
        driInfo: null,
        comments: [],
        subsamplingLabel: 'N/A',
        hasThumbnail: false,
        thumbnailSource: '',
        hasTrailingData: false,
        trailingDataSize: 0,
        signatures: [],
        hexDump: generateHexDump(buffer, 2048),
        logOutput: ['Arquivo não-JPEG — análise estrutural limitada'],
        possibleEditor: null,
      };

      // EXIF
      let parsedExif: Record<string, any> | null = null;
      try {
        parsedExif = await exifr.parse(file, { gps: true, xmp: true, icc: false });
      } catch {}
      setExifData(parsedExif);

      // Histogram
      let colorHistogram = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };
      if (isJpeg || isPng) {
        try {
          const img = new Image();
          img.src = url;
          await new Promise<void>((resolve) => { img.onload = () => resolve(); });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          colorHistogram = computeColorHistogram(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } catch {}
      }

      // Health
      const { score, details } = computeHealthScore(parsed, parsedExif, isJpeg);

      // Editor detection
      let possibleEditor = parsed.possibleEditor;
      if (parsedExif?.Software) {
        possibleEditor = `Detectado: ${parsedExif.Software}`;
      } else if (parsed.signatures.length > 0) {
        possibleEditor = parsed.signatures[0].name;
      }

      setResult({
        ...parsed,
        fileInfo: { name: file.name, size: file.size, type: file.type, isJpeg, isPng },
        healthScore: score,
        healthDetails: details,
        colorHistogram,
        possibleEditor,
      });
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const isDidactic = mode === 'didactic';

  return (
    <div className="min-h-screen bg-background forensic-grid relative">
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-1/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                Forensic<span className="text-primary">Eye</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                Análise Forense de Imagens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1">
            <button
              onClick={() => setMode('didactic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'didactic' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Didático
            </button>
            <button
              onClick={() => setMode('expert')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'expert' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Expert
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto mt-24"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-4 glow-primary">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Análise Forense de Imagens</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Faça upload de uma imagem JPEG, PNG ou PDF para análise completa de integridade, metadados e compressão.
                </p>
              </div>
              <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Resultados da Análise</h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    {result.fileInfo.name} — {result.totalMarkers} marcadores — {result.markerSequence.length > 80 ? result.markerSequence.slice(0, 80) + '...' : result.markerSequence}
                  </p>
                </div>
                <button
                  onClick={() => { setResult(null); setImageUrl(null); setExifData(null); }}
                  className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Nova Análise
                </button>
              </div>

              {/* Structure summary bar */}
              <StructureSummary result={result} />

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  <HealthIndicator score={result.healthScore} details={result.healthDetails} isDidactic={isDidactic} />
                  <CompressionInfo result={result} isDidactic={isDidactic} />
                  <MetadataPanel exifData={exifData} fileInfo={result.fileInfo} isDidactic={isDidactic} />
                  {result.signatures.length > 0 && (
                    <SignatureMatch signatures={result.signatures} isDidactic={isDidactic} />
                  )}
                </div>

                {/* Center column */}
                <div className="space-y-6">
                  {imageUrl && <ImagePreview imageUrl={imageUrl} fileName={result.fileInfo.name} />}
                  <HistogramChart histogram={result.colorHistogram} isDidactic={isDidactic} />
                  {imageUrl && result.fileInfo.isJpeg && (
                    <ELAViewer imageUrl={imageUrl} isDidactic={isDidactic} />
                  )}
                  {result.quantizationTables.length > 0 && (
                    <QuantizationView
                      tables={result.quantizationTables}
                      isDidactic={isDidactic}
                      possibleEditor={result.possibleEditor}
                    />
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {result.markers.length > 0 && (
                    <MarkerTable markers={result.markers} isDidactic={isDidactic} />
                  )}
                  {result.huffmanTables.length > 0 && (
                    <HuffmanView tables={result.huffmanTables} isDidactic={isDidactic} />
                  )}
                  {mode === 'expert' && <HexViewer hexLines={result.hexDump} />}
                </div>
              </div>

              {/* Full-width log at bottom */}
              <ForensicLog logLines={result.logOutput} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
