// ============================================================
// ForensicEye — PDF Structure Analyzer
// ============================================================

export interface PDFHeader {
  version: string;
  offset: number;
  raw: string;
}

export interface PDFObject {
  objNum: number;
  genNum: number;
  offset: number;
  type: string;
  rawContent: string;
  dictionary: Record<string, string>;
  hasStream: boolean;
  streamLength: number;
}

export interface PDFXRefEntry {
  objNum: number;
  offset: number;
  genNum: number;
  inUse: boolean;
}

export interface PDFXRefTable {
  offset: number;
  entries: PDFXRefEntry[];
  startObj: number;
  count: number;
}

export interface PDFTrailer {
  size: number;
  root: string;
  info: string;
  id: string[];
  rawContent: string;
  encrypted: boolean;
}

export interface PDFPage {
  pageNum: number;
  mediaBox: number[];
  cropBox?: number[];
  rotate?: number;
  resources: string[];
  hasAnnotations: boolean;
  hasImages: boolean;
  hasFonts: boolean;
}

export interface PDFFont {
  name: string;
  type: string;
  baseFont: string;
  encoding: string;
  embedded: boolean;
}

export interface PDFImage {
  objNum: number;
  width: number;
  height: number;
  bitsPerComponent: number;
  colorSpace: string;
  filter: string;
  size: number;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  trapped: string;
}

export interface PDFSecurityInfo {
  encrypted: boolean;
  encryptionMethod: string;
  permissions: string[];
}

export interface PDFAnalysisResult {
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
  header: PDFHeader;
  objects: PDFObject[];
  xrefTables: PDFXRefTable[];
  trailer: PDFTrailer | null;
  pages: PDFPage[];
  fonts: PDFFont[];
  images: PDFImage[];
  metadata: PDFMetadata;
  security: PDFSecurityInfo;
  healthScore: number;
  healthDetails: string[];
  logOutput: string[];
  hexDump: string[];
  linearized: boolean;
  incrementalUpdates: number;
  totalObjects: number;
  objectTypes: Record<string, number>;
}

function textDecode(buffer: ArrayBuffer): string {
  return new TextDecoder('latin1').decode(buffer);
}

export function generateHexDump(buffer: ArrayBuffer, maxBytes: number = 512): string[] {
  const view = new Uint8Array(buffer);
  const lines: string[] = [];
  const bytesToShow = Math.min(view.length, maxBytes);
  for (let i = 0; i < bytesToShow; i += 16) {
    const offsetStr = i.toString(16).toUpperCase().padStart(8, '0');
    const hexParts: string[] = [];
    let ascii = '';
    for (let j = 0; j < 16; j++) {
      if (i + j < bytesToShow) {
        hexParts.push(view[i + j].toString(16).toUpperCase().padStart(2, '0'));
        const charCode = view[i + j];
        ascii += charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
      } else {
        hexParts.push('  ');
        ascii += ' ';
      }
    }
    const hex = hexParts.slice(0, 8).join(' ') + '  ' + hexParts.slice(8).join(' ');
    lines.push(`${offsetStr}  ${hex}  |${ascii}|`);
  }
  return lines;
}

function extractDictValue(content: string, key: string): string {
  const regex = new RegExp(`/${key}\\s+([^/\\n\\r]+?)(?=\\s*/|\\s*>>|\\s*$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractDictRef(content: string, key: string): string {
  const regex = new RegExp(`/${key}\\s+(\\d+\\s+\\d+\\s+R)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractArray(content: string, key: string): string {
  const regex = new RegExp(`/${key}\\s*\\[([^\\]]*)]`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function parsePDFDate(dateStr: string): string {
  if (!dateStr) return '';
  // PDF date: D:YYYYMMDDHHmmSSOHH'mm'
  const clean = dateStr.replace(/[()D:]/g, '').trim();
  if (clean.length >= 14) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    const h = clean.substring(8, 10);
    const min = clean.substring(10, 12);
    const s = clean.substring(12, 14);
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }
  return clean;
}

function detectObjectType(content: string): string {
  if (content.includes('/Type /Catalog')) return 'Catalog';
  if (content.includes('/Type /Pages')) return 'Pages';
  if (content.includes('/Type /Page')) return 'Page';
  if (content.includes('/Type /Font')) return 'Font';
  if (content.includes('/Type /FontDescriptor')) return 'FontDescriptor';
  if (content.includes('/Type /XObject')) return 'XObject';
  if (content.includes('/Type /Annot')) return 'Annotation';
  if (content.includes('/Type /Action')) return 'Action';
  if (content.includes('/Type /Encoding')) return 'Encoding';
  if (content.includes('/Type /Metadata')) return 'Metadata';
  if (content.includes('/Type /StructTreeRoot')) return 'StructTreeRoot';
  if (content.includes('/Type /StructElem')) return 'StructElem';
  if (content.includes('/Type /ObjStm')) return 'ObjectStream';
  if (content.includes('/Type /XRef')) return 'XRefStream';
  if (content.includes('/Subtype /Image')) return 'Image';
  if (content.includes('/Subtype /Form')) return 'Form';
  if (content.includes('/Subtype /Type1')) return 'Type1Font';
  if (content.includes('/Subtype /TrueType')) return 'TrueTypeFont';
  if (content.includes('/Subtype /CIDFontType')) return 'CIDFont';
  if (content.includes('/Linearized')) return 'Linearized';
  if (content.includes('/FlateDecode') || content.includes('stream')) return 'Stream';
  if (content.includes('/Title') && content.includes('/Author')) return 'DocumentInfo';
  return 'Generic';
}

export function fullPDFParse(buffer: ArrayBuffer): PDFAnalysisResult {
  const text = textDecode(buffer);
  const bytes = new Uint8Array(buffer);
  const logOutput: string[] = [];
  const log = (line: string) => logOutput.push(line);

  log('╔══════════════════════════════════════════════════════════╗');
  log('║            ForensicEye — PDF Structure Report           ║');
  log('╚══════════════════════════════════════════════════════════╝');
  log('');
  log(`Tamanho do arquivo: ${buffer.byteLength} bytes (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  log('');

  // --- Header ---
  const headerMatch = text.match(/%PDF-(\d+\.\d+)/);
  const header: PDFHeader = {
    version: headerMatch ? headerMatch[1] : 'Unknown',
    offset: headerMatch ? text.indexOf(headerMatch[0]) : 0,
    raw: headerMatch ? headerMatch[0] : '',
  };

  log('─── Cabeçalho PDF ─────────────────────────────────────────');
  log(`  Versão: PDF ${header.version}`);
  log(`  Offset: 0x${header.offset.toString(16).toUpperCase().padStart(8, '0')}`);
  log('');

  // --- Check linearized ---
  const linearized = text.substring(0, 1024).includes('/Linearized');
  if (linearized) {
    log('  ✅ PDF Linearizado (otimizado para web)');
    log('');
  }

  // --- Find all objects ---
  const objects: PDFObject[] = [];
  const objRegex = /(\d+)\s+(\d+)\s+obj\b/g;
  let objMatch;
  
  log('─── Objetos PDF ───────────────────────────────────────────');
  log('');

  while ((objMatch = objRegex.exec(text)) !== null) {
    const objNum = parseInt(objMatch[1]);
    const genNum = parseInt(objMatch[2]);
    const startIdx = objMatch.index;
    
    // Find endobj
    const endIdx = text.indexOf('endobj', startIdx);
    if (endIdx === -1) continue;
    
    const rawContent = text.substring(startIdx, endIdx + 6).substring(0, 2000); // Limit size
    const type = detectObjectType(rawContent);
    const hasStream = rawContent.includes('stream');
    
    // Extract stream length
    let streamLength = 0;
    const lengthMatch = rawContent.match(/\/Length\s+(\d+)/);
    if (lengthMatch) streamLength = parseInt(lengthMatch[1]);

    // Extract dictionary entries
    const dictionary: Record<string, string> = {};
    const dictEntries = rawContent.match(/\/([A-Za-z]+)\s+([^\n/]+)/g);
    if (dictEntries) {
      for (const entry of dictEntries.slice(0, 20)) {
        const kv = entry.match(/\/([A-Za-z]+)\s+(.*)/);
        if (kv) {
          dictionary[kv[1]] = kv[2].trim().substring(0, 100);
        }
      }
    }

    objects.push({
      objNum,
      genNum,
      offset: startIdx,
      type,
      rawContent: rawContent.substring(0, 500),
      dictionary,
      hasStream,
      streamLength,
    });

    log(`  Obj ${objNum} ${genNum} — Tipo: ${type}${hasStream ? ` [Stream: ${streamLength} bytes]` : ''}`);
  }

  log('');
  log(`  Total de objetos: ${objects.length}`);
  log('');

  // --- Object type statistics ---
  const objectTypes: Record<string, number> = {};
  for (const obj of objects) {
    objectTypes[obj.type] = (objectTypes[obj.type] || 0) + 1;
  }

  log('─── Tipos de Objetos ──────────────────────────────────────');
  log('');
  for (const [type, count] of Object.entries(objectTypes).sort((a, b) => b[1] - a[1])) {
    log(`  ${type}: ${count}`);
  }
  log('');

  // --- XRef Tables ---
  const xrefTables: PDFXRefTable[] = [];
  let xrefIdx = text.indexOf('xref');
  let incrementalUpdates = 0;

  log('─── Tabela de Referência Cruzada (XRef) ────────────────────');
  log('');

  while (xrefIdx !== -1) {
    incrementalUpdates++;
    const xrefContent = text.substring(xrefIdx, Math.min(xrefIdx + 10000, text.length));
    const entries: PDFXRefEntry[] = [];
    
    // Parse xref subsections
    const lines = xrefContent.split('\n');
    let startObj = 0;
    let count = 0;
    let parsing = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === 'trailer' || line.startsWith('trailer')) break;
      
      const subsectionMatch = line.match(/^(\d+)\s+(\d+)\s*$/);
      if (subsectionMatch) {
        startObj = parseInt(subsectionMatch[1]);
        count = parseInt(subsectionMatch[2]);
        parsing = true;
        continue;
      }

      if (parsing) {
        const entryMatch = line.match(/^(\d{10})\s+(\d{5})\s+([nf])\s*$/);
        if (entryMatch) {
          entries.push({
            objNum: startObj + entries.length,
            offset: parseInt(entryMatch[1]),
            genNum: parseInt(entryMatch[2]),
            inUse: entryMatch[3] === 'n',
          });
        }
      }
    }

    if (entries.length > 0) {
      xrefTables.push({
        offset: xrefIdx,
        entries,
        startObj,
        count: entries.length,
      });

      log(`  XRef em offset 0x${xrefIdx.toString(16).toUpperCase().padStart(8, '0')}`);
      log(`  Entradas: ${entries.length} (${entries.filter(e => e.inUse).length} em uso, ${entries.filter(e => !e.inUse).length} livres)`);
      log('');
    }

    xrefIdx = text.indexOf('xref', xrefIdx + 4);
  }

  if (incrementalUpdates > 1) {
    log(`  ⚠️ ${incrementalUpdates} atualizações incrementais detectadas`);
    log('');
  }

  // --- Trailer ---
  let trailer: PDFTrailer | null = null;
  const trailerIdx = text.lastIndexOf('trailer');
  if (trailerIdx !== -1) {
    const trailerContent = text.substring(trailerIdx, Math.min(trailerIdx + 1000, text.length));
    const sizeMatch = trailerContent.match(/\/Size\s+(\d+)/);
    const rootMatch = trailerContent.match(/\/Root\s+(\d+\s+\d+\s+R)/);
    const infoMatch = trailerContent.match(/\/Info\s+(\d+\s+\d+\s+R)/);
    const idMatch = trailerContent.match(/\/ID\s*\[\s*<([^>]*)>\s*<([^>]*)>\s*]/);
    const encryptMatch = trailerContent.includes('/Encrypt');

    trailer = {
      size: sizeMatch ? parseInt(sizeMatch[1]) : 0,
      root: rootMatch ? rootMatch[1] : '',
      info: infoMatch ? infoMatch[1] : '',
      id: idMatch ? [idMatch[1], idMatch[2]] : [],
      rawContent: trailerContent.substring(0, 500),
      encrypted: encryptMatch,
    };

    log('─── Trailer ───────────────────────────────────────────────');
    log('');
    log(`  Size: ${trailer.size}`);
    log(`  Root: ${trailer.root}`);
    log(`  Info: ${trailer.info}`);
    if (trailer.id.length === 2) {
      log(`  ID[0]: ${trailer.id[0].substring(0, 32)}...`);
      log(`  ID[1]: ${trailer.id[1].substring(0, 32)}...`);
    }
    if (trailer.encrypted) {
      log('  ⚠️ Documento CRIPTOGRAFADO');
    }
    log('');
  }

  // --- Extract metadata from Info dictionary ---
  const metadata: PDFMetadata = {
    title: '', author: '', subject: '', keywords: '',
    creator: '', producer: '', creationDate: '', modDate: '', trapped: '',
  };

  // Find info object
  if (trailer?.info) {
    const infoObjNum = parseInt(trailer.info);
    const infoObj = objects.find(o => o.objNum === infoObjNum);
    if (infoObj) {
      const c = infoObj.rawContent;
      const extractPDFString = (key: string): string => {
        const regex = new RegExp(`/${key}\\s*\\(([^)]*)\\)`, 'i');
        const match = c.match(regex);
        return match ? match[1] : '';
      };

      metadata.title = extractPDFString('Title');
      metadata.author = extractPDFString('Author');
      metadata.subject = extractPDFString('Subject');
      metadata.keywords = extractPDFString('Keywords');
      metadata.creator = extractPDFString('Creator');
      metadata.producer = extractPDFString('Producer');
      metadata.creationDate = parsePDFDate(extractPDFString('CreationDate'));
      metadata.modDate = parsePDFDate(extractPDFString('ModDate'));
      metadata.trapped = extractDictValue(c, 'Trapped');
    }
  }

  log('─── Metadados do Documento ────────────────────────────────');
  log('');
  if (metadata.title) log(`  Título: ${metadata.title}`);
  if (metadata.author) log(`  Autor: ${metadata.author}`);
  if (metadata.subject) log(`  Assunto: ${metadata.subject}`);
  if (metadata.creator) log(`  Criador: ${metadata.creator}`);
  if (metadata.producer) log(`  Produtor: ${metadata.producer}`);
  if (metadata.creationDate) log(`  Data de Criação: ${metadata.creationDate}`);
  if (metadata.modDate) log(`  Data de Modificação: ${metadata.modDate}`);
  if (!metadata.title && !metadata.author && !metadata.creator) {
    log('  Sem metadados de informação no dicionário /Info');
  }
  log('');

  // --- Extract pages ---
  const pages: PDFPage[] = [];
  const pageObjects = objects.filter(o => o.type === 'Page');
  
  log('─── Páginas ───────────────────────────────────────────────');
  log('');

  for (let i = 0; i < pageObjects.length; i++) {
    const po = pageObjects[i];
    const c = po.rawContent;
    
    const mediaBoxStr = extractArray(c, 'MediaBox');
    const mediaBox = mediaBoxStr ? mediaBoxStr.split(/\s+/).map(Number).filter(n => !isNaN(n)) : [0, 0, 612, 792];
    
    const cropBoxStr = extractArray(c, 'CropBox');
    const cropBox = cropBoxStr ? cropBoxStr.split(/\s+/).map(Number).filter(n => !isNaN(n)) : undefined;
    
    const rotateMatch = c.match(/\/Rotate\s+(\d+)/);
    const rotate = rotateMatch ? parseInt(rotateMatch[1]) : undefined;

    const resources: string[] = [];
    if (c.includes('/Font')) resources.push('Fonts');
    if (c.includes('/XObject')) resources.push('XObjects');
    if (c.includes('/ExtGState')) resources.push('ExtGState');
    if (c.includes('/ColorSpace')) resources.push('ColorSpace');
    if (c.includes('/Pattern')) resources.push('Pattern');
    if (c.includes('/Shading')) resources.push('Shading');

    pages.push({
      pageNum: i + 1,
      mediaBox,
      cropBox,
      rotate,
      resources,
      hasAnnotations: c.includes('/Annots'),
      hasImages: c.includes('/XObject') || c.includes('/Image'),
      hasFonts: c.includes('/Font'),
    });

    const w = mediaBox.length >= 4 ? mediaBox[2] - mediaBox[0] : 0;
    const h = mediaBox.length >= 4 ? mediaBox[3] - mediaBox[1] : 0;
    log(`  Página ${i + 1}: ${w}×${h} pt (${(w / 72).toFixed(1)}×${(h / 72).toFixed(1)} in)${rotate ? ` [Rotação: ${rotate}°]` : ''}`);
    if (resources.length) log(`    Recursos: ${resources.join(', ')}`);
  }
  log(`  Total: ${pages.length} páginas`);
  log('');

  // --- Extract fonts ---
  const fonts: PDFFont[] = [];
  const fontObjects = objects.filter(o => 
    o.type === 'Font' || o.type === 'Type1Font' || o.type === 'TrueTypeFont' || o.type === 'CIDFont'
  );

  log('─── Fontes ────────────────────────────────────────────────');
  log('');

  for (const fo of fontObjects) {
    const c = fo.rawContent;
    const baseFont = extractDictValue(c, 'BaseFont').replace(/^\//, '');
    const type = extractDictValue(c, 'Subtype').replace(/^\//, '') || fo.type;
    const encoding = extractDictValue(c, 'Encoding').replace(/^\//, '');
    const embedded = c.includes('/FontFile') || c.includes('/FontFile2') || c.includes('/FontFile3');

    fonts.push({
      name: baseFont || `Font-${fo.objNum}`,
      type,
      baseFont,
      encoding: encoding || 'Default',
      embedded,
    });

    log(`  ${baseFont || 'Unknown'} — ${type}${embedded ? ' [Embedded]' : ''} — Encoding: ${encoding || 'Default'}`);
  }
  if (fonts.length === 0) log('  Nenhuma fonte encontrada diretamente');
  log('');

  // --- Extract images ---
  const images: PDFImage[] = [];
  const imageObjects = objects.filter(o => o.type === 'Image');

  log('─── Imagens ───────────────────────────────────────────────');
  log('');

  for (const io of imageObjects) {
    const c = io.rawContent;
    const widthMatch = c.match(/\/Width\s+(\d+)/);
    const heightMatch = c.match(/\/Height\s+(\d+)/);
    const bpcMatch = c.match(/\/BitsPerComponent\s+(\d+)/);
    const csMatch = c.match(/\/ColorSpace\s+\/(\S+)/);
    const filterMatch = c.match(/\/Filter\s+\/(\S+)/);

    images.push({
      objNum: io.objNum,
      width: widthMatch ? parseInt(widthMatch[1]) : 0,
      height: heightMatch ? parseInt(heightMatch[1]) : 0,
      bitsPerComponent: bpcMatch ? parseInt(bpcMatch[1]) : 8,
      colorSpace: csMatch ? csMatch[1] : 'Unknown',
      filter: filterMatch ? filterMatch[1] : 'None',
      size: io.streamLength,
    });

    log(`  Obj ${io.objNum}: ${widthMatch?.[1] || '?'}×${heightMatch?.[1] || '?'} — ${csMatch?.[1] || 'Unknown'} — ${filterMatch?.[1] || 'Raw'} — ${io.streamLength} bytes`);
  }
  if (images.length === 0) log('  Nenhuma imagem encontrada diretamente');
  log('');

  // --- Security ---
  const security: PDFSecurityInfo = {
    encrypted: trailer?.encrypted || false,
    encryptionMethod: '',
    permissions: [],
  };

  if (security.encrypted) {
    const encryptObj = objects.find(o => o.rawContent.includes('/Filter /Standard'));
    if (encryptObj) {
      const vMatch = encryptObj.rawContent.match(/\/V\s+(\d+)/);
      const rMatch = encryptObj.rawContent.match(/\/R\s+(\d+)/);
      security.encryptionMethod = `V${vMatch?.[1] || '?'} R${rMatch?.[1] || '?'}`;
    }
  }

  // --- Health Score ---
  let healthScore = 100;
  const healthDetails: string[] = [];

  if (header.version === 'Unknown') {
    healthScore -= 30;
    healthDetails.push('⚠️ Cabeçalho PDF inválido ou ausente');
  } else {
    healthDetails.push(`📄 PDF versão ${header.version}`);
  }

  if (!trailer) {
    healthScore -= 20;
    healthDetails.push('⚠️ Trailer não encontrado — arquivo pode estar corrompido');
  }

  if (objects.length === 0) {
    healthScore -= 30;
    healthDetails.push('⚠️ Nenhum objeto encontrado');
  } else {
    healthDetails.push(`📦 ${objects.length} objetos encontrados`);
  }

  if (xrefTables.length === 0) {
    healthScore -= 10;
    healthDetails.push('🔶 Tabela XRef não encontrada (pode usar XRef stream)');
  }

  if (incrementalUpdates > 1) {
    healthScore -= 5 * (incrementalUpdates - 1);
    healthDetails.push(`🔶 ${incrementalUpdates} atualizações incrementais — documento foi modificado`);
  }

  if (security.encrypted) {
    healthDetails.push('🔒 Documento criptografado');
  }

  if (metadata.producer) {
    healthDetails.push(`🖨 Produtor: ${metadata.producer}`);
  }
  if (metadata.creator) {
    healthDetails.push(`📝 Criador: ${metadata.creator}`);
  }

  healthDetails.push(`📑 ${pages.length} páginas`);
  healthDetails.push(`🔤 ${fonts.length} fontes`);
  healthDetails.push(`🖼 ${images.length} imagens`);

  if (linearized) {
    healthDetails.push('✅ Linearizado (otimizado para web)');
  }

  healthScore = Math.max(0, healthScore);

  // --- Summary ---
  log('─── Resumo da Estrutura ───────────────────────────────────');
  log('');
  log(`  Versão PDF: ${header.version}`);
  log(`  Total de objetos: ${objects.length}`);
  log(`  Páginas: ${pages.length}`);
  log(`  Fontes: ${fonts.length}`);
  log(`  Imagens: ${images.length}`);
  log(`  Tabelas XRef: ${xrefTables.length}`);
  log(`  Atualizações incrementais: ${incrementalUpdates}`);
  log(`  Linearizado: ${linearized ? 'Sim' : 'Não'}`);
  log(`  Criptografado: ${security.encrypted ? 'Sim' : 'Não'}`);
  log(`  Score de Saúde: ${healthScore}/100`);
  log('');
  log('══════════════════════════════════════════════════════════════');

  return {
    fileInfo: { name: '', size: buffer.byteLength, type: 'application/pdf' },
    header,
    objects,
    xrefTables,
    trailer,
    pages,
    fonts,
    images,
    metadata,
    security,
    healthScore,
    healthDetails,
    logOutput,
    hexDump: generateHexDump(buffer, 2048),
    linearized,
    incrementalUpdates,
    totalObjects: objects.length,
    objectTypes,
  };
}
