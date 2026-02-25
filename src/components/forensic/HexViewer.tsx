import { useState } from 'react';
import { motion } from 'framer-motion';
import { Binary, ChevronDown, ChevronUp } from 'lucide-react';

interface HexViewerProps {
  hexLines: string[];
}

export function HexViewer({ hexLines }: HexViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleLines = expanded ? hexLines : hexLines.slice(0, 16);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Hex Dump</h3>
          <span className="text-xs text-muted-foreground font-mono">({hexLines.length} linhas)</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <>Recolher <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Expandir <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 bg-surface-0">
        <pre className="text-xs font-mono leading-5 text-muted-foreground">
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className="hover:bg-surface-2/30 px-1 -mx-1 rounded"
            >
              <span className="text-primary/40">{line.slice(0, 10)}</span>
              <span className="text-foreground">{line.slice(10, line.lastIndexOf('|'))}</span>
              <span className="text-accent">{line.slice(line.lastIndexOf('|'))}</span>
            </motion.div>
          ))}
        </pre>
      </div>
    </div>
  );
}
