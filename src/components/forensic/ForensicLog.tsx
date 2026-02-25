import { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ForensicLogProps {
  logLines: string[];
}

export function ForensicLog({ logLines }: ForensicLogProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleLines = expanded ? logLines : logLines.slice(0, 20);

  const handleCopy = () => {
    navigator.clipboard.writeText(logLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Log Forense Completo</h3>
          <span className="text-xs text-muted-foreground font-mono">{logLines.length} linhas</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Recolher</> : <><ChevronDown className="w-3 h-3" /> Expandir</>}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto p-4 bg-surface-0 max-h-[500px] overflow-y-auto">
        <pre className="text-[11px] font-mono leading-5 text-muted-foreground whitespace-pre">
          {visibleLines.map((line, i) => (
            <div key={i} className="hover:bg-surface-2/30 px-1 -mx-1 rounded">
              {line.includes('⚠️') || line.includes('DADOS APÓS') || line.includes('NÃO ENCONTRADO') ? (
                <span className="text-warning">{line}</span>
              ) : line.includes('✅') ? (
                <span className="text-success">{line}</span>
              ) : line.startsWith('  ┌') || line.startsWith('  └') || line.startsWith('  │') ? (
                <span className="text-foreground/80">{line}</span>
              ) : line.startsWith('═') || line.startsWith('─') || line.startsWith('╔') || line.startsWith('╚') || line.startsWith('║') ? (
                <span className="text-primary/60">{line}</span>
              ) : (
                line
              )}
            </div>
          ))}
          {!expanded && logLines.length > 20 && (
            <div className="text-primary/60 mt-2">... +{logLines.length - 20} linhas (clique em Expandir)</div>
          )}
        </pre>
      </div>
    </div>
  );
}
