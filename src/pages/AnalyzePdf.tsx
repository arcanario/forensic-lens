import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, BookOpen, Scan, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FileUpload } from '@/components/forensic/FileUpload';
import { ForensicLog } from '@/components/forensic/ForensicLog';
import { HexViewer } from '@/components/forensic/HexViewer';
import { HealthIndicator } from '@/components/forensic/HealthIndicator';
import { PDFObjectsView } from '@/components/forensic/PDFObjectsView';
import { PDFXRefView } from '@/components/forensic/PDFXRefView';
import { PDFTrailerView } from '@/components/forensic/PDFTrailerView';
import { PDFMetadataView } from '@/components/forensic/PDFMetadataView';
import { PDFPagesView } from '@/components/forensic/PDFPagesView';
import { PDFFontsView } from '@/components/forensic/PDFFontsView';
import { PDFImagesView } from '@/components/forensic/PDFImagesView';
import { PDFStructureSummary } from '@/components/forensic/PDFStructureSummary';

import { fullPDFParse, type PDFAnalysisResult } from '@/lib/pdf-analyzer';

type Mode = 'didactic' | 'expert';

const AnalyzePdf = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('didactic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PDFAnalysisResult | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = fullPDFParse(buffer);
      parsed.fileInfo.name = file.name;
      setResult(parsed);
    } catch (err) {
      console.error('PDF Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const isDidactic = mode === 'didactic';

  return (
    <div className="min-h-screen bg-background forensic-grid relative">
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      <header className="sticky top-0 z-40 border-b border-border bg-surface-1/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center glow-warning">
              <Scan className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                Forensic<span className="text-primary">Eye</span>
                <span className="text-xs text-muted-foreground ml-2 font-mono">/ PDF</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                Análise Forense PDF
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
              className="max-w-xl mx-auto mt-16"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Análise PDF</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Faça upload de um documento PDF para análise completa da estrutura interna, objetos, metadados e tabela de referência cruzada.
                </p>
              </div>
              <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} acceptTypes="pdf" />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Resultados da Análise PDF</h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    {result.fileInfo.name} — PDF {result.header.version} — {result.totalObjects} objetos — {result.pages.length} páginas
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Nova Análise
                </button>
              </div>

              <PDFStructureSummary result={result} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="space-y-6">
                  <HealthIndicator score={result.healthScore} details={result.healthDetails} isDidactic={isDidactic} />
                  <PDFMetadataView metadata={result.metadata} fileInfo={result.fileInfo} isDidactic={isDidactic} />
                  {result.security.encrypted && (
                    <div className="rounded-lg border border-warning/50 bg-warning/5 p-4 glow-warning">
                      <h3 className="text-sm font-semibold text-warning mb-2">🔒 Segurança</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        Método: {result.security.encryptionMethod || 'Standard'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center */}
                <div className="space-y-6">
                  <PDFPagesView pages={result.pages} isDidactic={isDidactic} />
                  <PDFFontsView fonts={result.fonts} isDidactic={isDidactic} />
                  <PDFImagesView images={result.images} isDidactic={isDidactic} />
                </div>

                {/* Right */}
                <div className="space-y-6">
                  <PDFObjectsView objects={result.objects} objectTypes={result.objectTypes} isDidactic={isDidactic} isExpert={mode === 'expert'} />
                  {result.xrefTables.length > 0 && (
                    <PDFXRefView xrefTables={result.xrefTables} isDidactic={isDidactic} />
                  )}
                  {result.trailer && (
                    <PDFTrailerView trailer={result.trailer} isDidactic={isDidactic} />
                  )}
                  {mode === 'expert' && <HexViewer hexLines={result.hexDump} />}
                </div>
              </div>

              <ForensicLog logLines={result.logOutput} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AnalyzePdf;
