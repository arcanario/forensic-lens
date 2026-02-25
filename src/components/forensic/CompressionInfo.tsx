import { motion } from 'framer-motion';
import { Cpu, Layers, Image, Ruler, Cog } from 'lucide-react';
import type { FullAnalysisResult } from '@/lib/forensic-analyzer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CompressionInfoProps {
  result: FullAnalysisResult;
  isDidactic: boolean;
}

export function CompressionInfo({ result, isDidactic }: CompressionInfoProps) {
  const { sofInfo, estimatedQuality, qualityMethod, subsamplingLabel, jfifInfo, adobeInfo, driInfo, sosInfo } = result;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Compressão & Codificação</h3>
        </div>
      </div>
      <div className="p-4 space-y-3 text-xs font-mono">
        {sofInfo && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-[11px] uppercase tracking-wider">
              <Image className="w-3 h-3" /> Frame (SOF)
            </div>
            <Row label="Tipo" value={sofInfo.compressionType} />
            <Row label="Processo" value={sofInfo.encodingProcess} />
            <Row label="Dimensões" value={`${sofInfo.width} × ${sofInfo.height} px`} />
            <Row label="Precisão" value={`${sofInfo.precision} bits/amostra`} />
            <Row label="Componentes" value={`${sofInfo.numComponents}`} />
            
            {sofInfo.components.map((c, i) => (
              <div key={i} className="ml-4 flex justify-between text-muted-foreground">
                <span>{c.name}</span>
                <span className="text-foreground">
                  Amostragem {c.samplingLabel} → DQT#{c.quantTableId}
                </span>
              </div>
            ))}

            <Row label="Subamostragem" value={subsamplingLabel} highlight />

            {sofInfo.numComponents >= 3 && (
              <Row
                label="MCU"
                value={`${sofInfo.components[0].hSampling * 8}×${sofInfo.components[0].vSampling * 8} px — ${Math.ceil(sofInfo.width / (sofInfo.components[0].hSampling * 8)) * Math.ceil(sofInfo.height / (sofInfo.components[0].vSampling * 8))} blocos`}
              />
            )}
          </motion.div>
        )}

        {estimatedQuality !== null && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-primary font-semibold text-[11px] uppercase tracking-wider">
              <Ruler className="w-3 h-3" /> Qualidade
            </div>
            <Row label="Qualidade JPEG" value={`~${estimatedQuality}%`} highlight />
            <Row label="Método" value={qualityMethod} />
          </motion.div>
        )}

        {jfifInfo && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-primary font-semibold text-[11px] uppercase tracking-wider">
              <Layers className="w-3 h-3" /> JFIF
            </div>
            <Row label="Versão" value={jfifInfo.version} />
            <Row label="Unidades" value={jfifInfo.unitsLabel} />
            <Row label="Densidade" value={`${jfifInfo.xDensity} × ${jfifInfo.yDensity}`} />
            <Row label="Thumbnail" value={jfifInfo.hasThumbnail ? `${jfifInfo.thumbWidth}×${jfifInfo.thumbHeight}` : 'Nenhum'} />
          </motion.div>
        )}

        {adobeInfo && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-primary font-semibold text-[11px] uppercase tracking-wider">
              <Cog className="w-3 h-3" /> Adobe APP14
            </div>
            <Row label="Versão" value={`${adobeInfo.version}`} />
            <Row label="Transformação" value={adobeInfo.colorTransformLabel} />
          </motion.div>
        )}

        {driInfo && (
          <div className="pt-2 border-t border-border">
            <Row label="Restart Interval (DRI)" value={`${driInfo.restartInterval} MCUs`} />
          </div>
        )}

        {sosInfo && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2 pt-2 border-t border-border">
            <div className="text-primary font-semibold text-[11px] uppercase tracking-wider">SOS (Scan)</div>
            <Row label="Componentes" value={`${sosInfo.numComponents}`} />
            {sosInfo.components.map((c, i) => (
              <div key={i} className="ml-4 flex justify-between text-muted-foreground">
                <span>Comp {c.id}</span>
                <span className="text-foreground">DC={c.dcTable} AC={c.acTable}</span>
              </div>
            ))}
            <Row label="Espectral" value={`Ss=${sosInfo.spectralStart} Se=${sosInfo.spectralEnd}`} />
            <Row label="Aprox. Sucessiva" value={`Ah=${sosInfo.successiveApproxHigh} Al=${sosInfo.successiveApproxLow}`} />
          </motion.div>
        )}

        {isDidactic && (
          <div className="mt-3 p-2 bg-surface-2 rounded text-xs text-muted-foreground leading-relaxed">
            💡 <strong>Baseline DCT</strong> carrega a imagem de cima para baixo.{' '}
            <strong>Progressive DCT</strong> carrega primeiro uma versão borrada e refina progressivamente.{' '}
            A subamostragem <strong>4:2:0</strong> descarta metade da informação de cor — é a mais comum.{' '}
            <strong>4:4:4</strong> mantém toda a informação de cor (maior qualidade).
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'text-primary' : 'text-foreground'}>{value}</span>
    </div>
  );
}
