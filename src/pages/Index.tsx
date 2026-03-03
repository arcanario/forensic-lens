import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scan, FileImage, FileText, Image, Shield, Sparkles, ArrowRight, Zap, Eye, Layers } from 'lucide-react';

type DocType = 'jpeg' | 'png' | 'pdf';

const docTypes: { id: DocType; label: string; ext: string; icon: any; color: string; glowClass: string; description: string; features: string[] }[] = [
  {
    id: 'jpeg',
    label: 'JPEG',
    ext: '.jpg / .jpeg',
    icon: FileImage,
    color: 'text-primary',
    glowClass: 'glow-primary',
    description: 'Análise forense completa de arquivos JPEG com parsing de marcadores, tabelas DQT/DHT, ELA e assinaturas de compressão.',
    features: ['Marcadores SOI→EOI', 'Tabelas de Quantização', 'Huffman Tables', 'ELA (Error Level Analysis)', 'Assinaturas de Software', 'Histogramas RGB'],
  },
  {
    id: 'png',
    label: 'PNG',
    ext: '.png',
    icon: Image,
    color: 'text-info',
    glowClass: 'glow-primary',
    description: 'Análise de integridade e metadados de imagens PNG com histogramas e detecção de software.',
    features: ['Metadados EXIF', 'Histograma de Cores', 'Detecção de Software', 'Informações de Arquivo'],
  },
  {
    id: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    icon: FileText,
    color: 'text-warning',
    glowClass: 'glow-warning',
    description: 'Parsing estrutural completo de documentos PDF: objetos, tabela XRef, trailer, fontes, imagens e metadados.',
    features: ['Objetos PDF', 'Tabela XRef', 'Trailer & Info', 'Fontes Embutidas', 'Imagens Extraídas', 'Segurança & Criptografia'],
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<DocType | null>(null);

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
                Análise Forense de Documentos
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 mt-8"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-6 glow-primary">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Análise Forense de <span className="text-primary text-glow">Documentos</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Selecione o tipo de documento para iniciar uma análise detalhada de integridade, metadados e estrutura interna.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { icon: Zap, label: 'Client-Side', desc: 'Processamento local' },
            { icon: Eye, label: 'Deep Parse', desc: 'Análise byte-a-byte' },
            { icon: Layers, label: 'Multi-Format', desc: 'JPEG, PNG, PDF' },
            { icon: Sparkles, label: 'Forensic', desc: 'Nível pericial' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-lg border border-border/50">
              <stat.icon className="w-4 h-4 text-primary" />
              <div>
                <span className="text-xs font-semibold text-foreground">{stat.label}</span>
                <p className="text-[10px] text-muted-foreground">{stat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Document type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {docTypes.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onMouseEnter={() => setHovered(doc.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(`/analyze/${doc.id}`)}
              className={`
                group relative cursor-pointer rounded-xl border bg-card overflow-hidden
                transition-all duration-300
                ${hovered === doc.id
                  ? `border-primary/50 ${doc.glowClass} scale-[1.02]`
                  : 'border-border hover:border-primary/30'
                }
              `}
            >
              {/* Gradient overlay on hover */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                bg-gradient-to-b from-primary/5 via-transparent to-transparent
              `} />

              <div className="relative p-6">
                {/* Icon + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${hovered === doc.id ? 'bg-primary/15 scale-110' : 'bg-surface-2'}
                  `}>
                    <doc.icon className={`w-7 h-7 ${doc.color} transition-all duration-300`} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-surface-2 px-2 py-1 rounded">
                    {doc.ext}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  {doc.label}
                  <ArrowRight className={`
                    w-4 h-4 transition-all duration-300
                    ${hovered === doc.id ? 'opacity-100 translate-x-0 text-primary' : 'opacity-0 -translate-x-2'}
                  `} />
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {doc.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {doc.features.map((feat, fi) => (
                    <span
                      key={fi}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border/50"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className={`
                h-1 transition-all duration-500
                ${hovered === doc.id ? 'bg-primary' : 'bg-border'}
              `} />
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-muted-foreground font-mono mt-12"
        >
          Todos os arquivos são processados localmente no seu navegador. Nenhum dado é enviado para servidores externos.
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
