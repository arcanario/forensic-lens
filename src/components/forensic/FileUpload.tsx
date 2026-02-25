import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export function FileUpload({ onFileSelect, isAnalyzing }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: isAnalyzing,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-lg border-2 border-dashed p-8
          transition-all duration-300 cursor-pointer
          ${isDragActive
            ? 'border-primary bg-primary/5 glow-primary'
            : 'border-border hover:border-primary/50 hover:bg-surface-2/50'
          }
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Scanline effect */}
        {isDragActive && (
          <div className="absolute inset-0 scanline opacity-50" />
        )}

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-primary">Analisando arquivo...</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {isDragActive ? (
                <FileImage className="w-10 h-10 text-primary animate-pulse-glow" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste uma imagem ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  JPEG • PNG • PDF — Máx. 50MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {fileRejections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-xs text-destructive"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Formato não suportado ou arquivo muito grande</span>
        </motion.div>
      )}
    </div>
  );
}
