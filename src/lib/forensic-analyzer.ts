// ============================================================
// ForensicEye — Full JPEG Structure Analyzer (JPEGsnoop-level)
// ============================================================

// --- All JPEG marker definitions ---
export const JPEG_MARKERS: Record<number, { name: string; description: string }> = {
  0xD8: { name: 'SOI', description: 'Start of Image — Marca o início do stream JPEG' },
  0xD9: { name: 'EOI', description: 'End of Image — Marca o fim do stream JPEG' },
  0xDA: { name: 'SOS', description: 'Start of Scan — Início dos dados codificados da imagem' },
  0xDB: { name: 'DQT', description: 'Define Quantization Table — Tabela(s) de quantização para DCT' },
  0xC0: { name: 'SOF0', description: 'Start of Frame (Baseline DCT) — Codificação Baseline sequencial' },
  0xC1: { name: 'SOF1', description: 'Start of Frame (Extended Sequential DCT)' },
  0xC2: { name: 'SOF2', description: 'Start of Frame (Progressive DCT) — Codificação progressiva' },
  0xC3: { name: 'SOF3', description: 'Start of Frame (Lossless)' },
  0xC4: { name: 'DHT', description: 'Define Huffman Table — Tabela(s) de codificação entrópica' },
  0xC5: { name: 'SOF5', description: 'Start of Frame (Differential Sequential DCT)' },
  0xC6: { name: 'SOF6', description: 'Start of Frame (Differential Progressive DCT)' },
  0xC7: { name: 'SOF7', description: 'Start of Frame (Differential Lossless)' },
  0xC9: { name: 'SOF9', description: 'Start of Frame (Extended Sequential DCT, Arithmetic)' },
  0xCA: { name: 'SOF10', description: 'Start of Frame (Progressive DCT, Arithmetic)' },
  0xCB: { name: 'SOF11', description: 'Start of Frame (Lossless, Arithmetic)' },
  0xCC: { name: 'DAC', description: 'Define Arithmetic Coding' },
  0xDD: { name: 'DRI', description: 'Define Restart Interval — Intervalo de reinício entre MCUs' },
  0xD0: { name: 'RST0', description: 'Restart Marker 0' },
  0xD1: { name: 'RST1', description: 'Restart Marker 1' },
  0xD2: { name: 'RST2', description: 'Restart Marker 2' },
  0xD3: { name: 'RST3', description: 'Restart Marker 3' },
  0xD4: { name: 'RST4', description: 'Restart Marker 4' },
  0xD5: { name: 'RST5', description: 'Restart Marker 5' },
  0xD6: { name: 'RST6', description: 'Restart Marker 6' },
  0xD7: { name: 'RST7', description: 'Restart Marker 7' },
  0xE0: { name: 'APP0', description: 'JFIF — Identificação e parâmetros do formato JFIF' },
  0xE1: { name: 'APP1', description: 'EXIF / XMP — Metadados da câmera, GPS, software' },
  0xE2: { name: 'APP2', description: 'ICC Profile / FlashPix' },
  0xE3: { name: 'APP3', description: 'APP3 — Extensões proprietárias' },
  0xE4: { name: 'APP4', description: 'APP4' },
  0xE5: { name: 'APP5', description: 'APP5' },
  0xE6: { name: 'APP6', description: 'APP6' },
  0xE7: { name: 'APP7', description: 'APP7' },
  0xE8: { name: 'APP8', description: 'APP8' },
  0xE9: { name: 'APP9', description: 'APP9' },
  0xEA: { name: 'APP10', description: 'APP10' },
  0xEB: { name: 'APP11', description: 'APP11' },
  0xEC: { name: 'APP12', description: 'APP12 — Ducky / Picture Info' },
  0xED: { name: 'APP13', description: 'APP13 — Photoshop IRB / IPTC' },
  0xEE: { name: 'APP14', description: 'APP14 — Adobe DCT Filter' },
  0xEF: { name: 'APP15', description: 'APP15' },
  0xFE: { name: 'COM', description: 'Comment — Texto de comentário incorporado' },
};

// --- Interfaces ---

export interface JpegMarker {
  offset: number;
  marker: number;
  markerHex: string;
  name: string;
  description: string;
  length: number;
  rawData?: Uint8Array;
}

export interface QuantizationTable {
  id: number;
  precision: number; // 0=8bit, 1=16bit
  values: number[];
  zigzagValues: number[];
}

export interface SOFInfo {
  marker: number;
  markerName: string;
  precision: number; // bits per sample
  height: number;
  width: number;
  numComponents: number;
  components: SOFComponent[];
  compressionType: string;
  isProgressive: boolean;
  isLossless: boolean;
  isArithmetic: boolean;
  encodingProcess: string;
}

export interface SOFComponent {
  id: number;
  name: string;
  hSampling: number;
  vSampling: number;
  quantTableId: number;
  samplingLabel: string;
}

export interface HuffmanTable {
  tableClass: number; // 0=DC, 1=AC
  tableId: number;
  bits: number[];
  totalCodes: number;
  values: number[];
  classLabel: string;
}

export interface SOSInfo {
  numComponents: number;
  components: { id: number; dcTable: number; acTable: number }[];
  spectralStart: number;
  spectralEnd: number;
  successiveApproxHigh: number;
  successiveApproxLow: number;
}

export interface JFIFInfo {
  version: string;
  units: number;
  unitsLabel: string;
  xDensity: number;
  yDensity: number;
  thumbWidth: number;
  thumbHeight: number;
  hasThumbnail: boolean;
}

export interface AdobeInfo {
  version: number;
  flags0: number;
  flags1: number;
  colorTransform: number;
  colorTransformLabel: string;
}

export interface DRIInfo {
  restartInterval: number;
}

export interface CompressionSignature {
  name: string;
  confidence: number;
  details: string;
}

export interface FullAnalysisResult {
  // Basic file info
  fileInfo: {
    name: string;
    size: number;
    type: string;
    isJpeg: boolean;
    isPng: boolean;
  };
  // Marker sequence
  markers: JpegMarker[];
  markerSequence: string;
  totalMarkers: number;
  // Quantization
  quantizationTables: QuantizationTable[];
  estimatedQuality: number | null;
  qualityMethod: string;
  // SOF (frame info)
  sofInfo: SOFInfo | null;
  // Huffman
  huffmanTables: HuffmanTable[];
  // SOS
  sosInfo: SOSInfo | null;
  // JFIF
  jfifInfo: JFIFInfo | null;
  // Adobe
  adobeInfo: AdobeInfo | null;
  // DRI
  driInfo: DRIInfo | null;
  // Comments
  comments: string[];
  // Subsampling
  subsamplingLabel: string;
  // Thumbnail detection
  hasThumbnail: boolean;
  thumbnailSource: string;
  // Embedded data after EOI
  hasTrailingData: boolean;
  trailingDataSize: number;
  // Compression signature matching
  signatures: CompressionSignature[];
  // Hex dump
  hexDump: string[];
  // Health
  healthScore: number;
  healthDetails: string[];
  // Color histogram
  colorHistogram: { r: number[]; g: number[]; b: number[] };
  // Log output (JPEGsnoop-style text)
  logOutput: string[];
  // Possible editor
  possibleEditor: string | null;
}

// --- Zigzag order for DQT ---
const ZIGZAG_ORDER = [
   0,  1,  5,  6, 14, 15, 27, 28,
   2,  4,  7, 13, 16, 26, 29, 42,
   3,  8, 12, 17, 25, 30, 41, 43,
   9, 11, 18, 24, 31, 40, 44, 53,
  10, 19, 23, 32, 39, 45, 52, 54,
  20, 22, 33, 38, 46, 51, 55, 60,
  21, 34, 37, 47, 50, 56, 59, 61,
  35, 36, 48, 49, 57, 58, 62, 63,
];

// --- IJG Standard Luminance Table (quality 50) ---
const IJG_STD_LUMINANCE = [
  16, 11, 10, 16,  24,  40,  51,  61,
  12, 12, 14, 19,  26,  58,  60,  55,
  14, 13, 16, 24,  40,  57,  69,  56,
  14, 17, 22, 29,  51,  87,  80,  62,
  18, 22, 37, 56,  68, 109, 103,  77,
  24, 35, 55, 64,  81, 104, 113,  92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103,  99,
];

const IJG_STD_CHROMINANCE = [
  17, 18, 24, 47, 99, 99, 99, 99,
  18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
];

// --- Known DQT signature database ---
interface DQTSignature {
  name: string;
  lum: number[]; // first 8 values of luminance table
  chr?: number[];
}

const KNOWN_SIGNATURES: DQTSignature[] = [
  { name: 'Adobe Photoshop - Save for Web (Quality 51-60)', lum: [6, 4, 4, 6, 10, 16, 20, 24] },
  { name: 'Adobe Photoshop - Save for Web (Quality 61-70)', lum: [4, 3, 3, 4, 6, 10, 13, 15] },
  { name: 'Adobe Photoshop - Save for Web (Quality 71-80)', lum: [3, 2, 2, 3, 4, 6, 8, 10] },
  { name: 'Adobe Photoshop - Save for Web (Quality 81-90)', lum: [2, 1, 1, 2, 3, 4, 5, 6] },
  { name: 'Adobe Photoshop - Save for Web (Quality 91-100)', lum: [1, 1, 1, 1, 1, 2, 2, 3] },
  { name: 'Adobe Photoshop CS - Standard', lum: [1, 1, 1, 1, 1, 1, 1, 1] },
  { name: 'GIMP 2.x (Quality 85)', lum: [5, 3, 3, 5, 7, 12, 15, 18] },
  { name: 'GIMP 2.x (Quality 100)', lum: [1, 1, 1, 1, 1, 1, 1, 1] },
  { name: 'Samsung Galaxy Camera', lum: [3, 2, 2, 3, 5, 8, 10, 12] },
  { name: 'Canon EOS DSLR (Fine)', lum: [2, 1, 1, 2, 3, 5, 6, 7] },
  { name: 'Nikon DSLR (Fine)', lum: [2, 1, 1, 1, 2, 3, 4, 4] },
  { name: 'Apple iPhone/iPad', lum: [3, 2, 2, 3, 4, 6, 8, 10] },
  { name: 'Microsoft Paint', lum: [8, 6, 5, 8, 12, 20, 26, 31] },
  { name: 'IJG libjpeg (Quality 75)', lum: [8, 6, 5, 8, 12, 20, 26, 31] },
  { name: 'IJG libjpeg (Quality 90)', lum: [3, 2, 2, 3, 5, 8, 10, 12] },
  { name: 'IJG libjpeg (Quality 95)', lum: [2, 1, 1, 2, 2, 4, 5, 6] },
  { name: 'Mozilla/Firefox (mozjpeg)', lum: [3, 2, 2, 3, 5, 8, 10, 12] },
  { name: 'WhatsApp Image Compression', lum: [6, 4, 5, 6, 9, 14, 18, 21] },
  { name: 'Facebook/Instagram Upload', lum: [4, 3, 3, 4, 6, 9, 12, 14] },
  { name: 'Twitter Upload', lum: [5, 3, 4, 5, 8, 12, 16, 19] },
];

// --- Estimate IJG Quality from DQT ---
function estimateIJGQuality(table: number[]): { quality: number; method: string } {
  // Method: compare with scaled IJG standard tables
  // Based on the algorithm used by IJG's cjpeg
  if (table.length < 64) return { quality: -1, method: 'Tabela incompleta' };

  // Try to reverse the IJG quality formula
  // Q = S * Qstd / 50 (for S < 50)
  // Q = (200 - 2*S) * Qstd / 100 (for S >= 50)
  let sumActual = 0;
  let sumStd = 0;
  for (let i = 0; i < 64; i++) {
    sumActual += table[i];
    sumStd += IJG_STD_LUMINANCE[i];
  }

  if (sumStd === 0) return { quality: -1, method: 'Erro' };

  const ratio = sumActual / sumStd;

  let quality: number;
  if (ratio < 1.0) {
    // High quality (S > 50)
    quality = Math.round(100 - (ratio * 50));
  } else {
    // Low quality (S <= 50)  
    quality = Math.round(50 / ratio);
  }

  quality = Math.max(1, Math.min(100, quality));
  return { quality, method: 'Estimativa IJG (libjpeg)' };
}

// --- Match DQT signatures ---
function matchSignatures(tables: QuantizationTable[]): CompressionSignature[] {
  if (tables.length === 0) return [];
  const results: CompressionSignature[] = [];
  const lumTable = tables[0].values.slice(0, 8);

  for (const sig of KNOWN_SIGNATURES) {
    let distance = 0;
    for (let i = 0; i < 8; i++) {
      distance += Math.abs(lumTable[i] - sig.lum[i]);
    }
    const maxDistance = sig.lum.reduce((a, b) => a + b, 0);
    const confidence = Math.max(0, Math.round((1 - distance / Math.max(maxDistance, 1)) * 100));
    if (confidence >= 60) {
      results.push({
        name: sig.name,
        confidence,
        details: `Distância: ${distance}, Match nos primeiros 8 coeficientes`,
      });
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 5);
}

// --- Component name ---
function componentName(id: number): string {
  switch (id) {
    case 1: return 'Y (Luminância)';
    case 2: return 'Cb (Crominância Azul)';
    case 3: return 'Cr (Crominância Vermelha)';
    case 4: return 'I';
    case 5: return 'Q';
    default: return `Componente ${id}`;
  }
}

function subsamplingString(components: SOFComponent[]): string {
  if (components.length < 3) return 'Grayscale';
  const y = components[0];
  const cb = components[1];
  const cr = components[2];
  const hMax = Math.max(y.hSampling, cb.hSampling, cr.hSampling);
  const vMax = Math.max(y.vSampling, cb.vSampling, cr.vSampling);
  
  const hRatio = y.hSampling / cb.hSampling;
  const vRatio = y.vSampling / cb.vSampling;

  if (hRatio === 1 && vRatio === 1) return '4:4:4 (Sem subamostragem)';
  if (hRatio === 2 && vRatio === 1) return '4:2:2 (Subamostragem horizontal)';
  if (hRatio === 2 && vRatio === 2) return '4:2:0 (Subamostragem H+V)';
  if (hRatio === 4 && vRatio === 1) return '4:1:1';
  if (hRatio === 1 && vRatio === 2) return '4:4:0';
  return `${y.hSampling}×${y.vSampling} : ${cb.hSampling}×${cb.vSampling} : ${cr.hSampling}×${cr.vSampling}`;
}

// --- Compression type from SOF marker ---
function compressionTypeFromMarker(marker: number): {
  type: string;
  isProgressive: boolean;
  isLossless: boolean;
  isArithmetic: boolean;
  encodingProcess: string;
} {
  const m: Record<number, [string, boolean, boolean, boolean, string]> = {
    0xC0: ['Baseline DCT', false, false, false, 'Baseline DCT, Huffman coding'],
    0xC1: ['Extended Sequential DCT', false, false, false, 'Extended Sequential DCT, Huffman coding'],
    0xC2: ['Progressive DCT', true, false, false, 'Progressive DCT, Huffman coding'],
    0xC3: ['Lossless', false, true, false, 'Lossless, Huffman coding'],
    0xC5: ['Differential Sequential DCT', false, false, false, 'Differential Sequential DCT, Huffman coding'],
    0xC6: ['Differential Progressive DCT', true, false, false, 'Differential Progressive DCT, Huffman coding'],
    0xC7: ['Differential Lossless', false, true, false, 'Differential Lossless, Huffman coding'],
    0xC9: ['Extended Sequential DCT (Arithmetic)', false, false, true, 'Extended Sequential DCT, Arithmetic coding'],
    0xCA: ['Progressive DCT (Arithmetic)', true, false, true, 'Progressive DCT, Arithmetic coding'],
    0xCB: ['Lossless (Arithmetic)', false, true, true, 'Lossless, Arithmetic coding'],
  };
  const info = m[marker];
  if (!info) return { type: 'Unknown', isProgressive: false, isLossless: false, isArithmetic: false, encodingProcess: 'Unknown' };
  return { type: info[0], isProgressive: info[1], isLossless: info[2], isArithmetic: info[3], encodingProcess: info[4] };
}

// --- Hex dump generator ---
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

// --- ELA ---
export async function performELA(
  imageElement: HTMLImageElement,
  quality: number = 75
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);
  const recompressed = canvas.toDataURL('image/jpeg', quality / 100);
  return new Promise((resolve) => {
    const img2 = new Image();
    img2.onload = () => {
      const canvas2 = document.createElement('canvas');
      const ctx2 = canvas2.getContext('2d')!;
      canvas2.width = canvas.width;
      canvas2.height = canvas.height;
      ctx2.drawImage(img2, 0, 0);
      const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const recomp = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
      const result = ctx.createImageData(canvas.width, canvas.height);
      const scale = 15;
      for (let i = 0; i < original.data.length; i += 4) {
        result.data[i] = Math.min(255, Math.abs(original.data[i] - recomp.data[i]) * scale);
        result.data[i + 1] = Math.min(255, Math.abs(original.data[i + 1] - recomp.data[i + 1]) * scale);
        result.data[i + 2] = Math.min(255, Math.abs(original.data[i + 2] - recomp.data[i + 2]) * scale);
        result.data[i + 3] = 255;
      }
      ctx.putImageData(result, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img2.src = recompressed;
  });
}

// --- Main parser ---
export function fullJpegParse(buffer: ArrayBuffer): Omit<FullAnalysisResult, 'fileInfo' | 'healthScore' | 'healthDetails' | 'colorHistogram'> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const markers: JpegMarker[] = [];
  const quantizationTables: QuantizationTable[] = [];
  const huffmanTables: HuffmanTable[] = [];
  const comments: string[] = [];
  const logOutput: string[] = [];
  let sofInfo: SOFInfo | null = null;
  let sosInfo: SOSInfo | null = null;
  let jfifInfo: JFIFInfo | null = null;
  let adobeInfo: AdobeInfo | null = null;
  let driInfo: DRIInfo | null = null;
  let hasThumbnail = false;
  let thumbnailSource = '';
  let sosOffset = -1;

  const log = (line: string) => logOutput.push(line);

  log('╔══════════════════════════════════════════════════════════╗');
  log('║            ForensicEye — JPEG Structure Report          ║');
  log('╚══════════════════════════════════════════════════════════╝');
  log('');
  log(`Tamanho do arquivo: ${buffer.byteLength} bytes (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  log('');
  log('─── Sequência de Marcadores ────────────────────────────────');
  log('');

  let offset = 0;

  while (offset < view.byteLength - 1) {
    if (view.getUint8(offset) !== 0xFF) {
      offset++;
      continue;
    }

    const byte2 = view.getUint8(offset + 1);
    if (byte2 === 0x00 || byte2 === 0xFF) {
      offset++;
      continue;
    }

    const markerInfo = JPEG_MARKERS[byte2];
    const name = markerInfo?.name || `UNK(0xFF${byte2.toString(16).toUpperCase().padStart(2, '0')})`;
    const desc = markerInfo?.description || 'Marcador desconhecido';
    const hexStr = 'FF' + byte2.toString(16).toUpperCase().padStart(2, '0');

    // Markers without length
    const noLength = [0xD8, 0xD9, 0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7];
    let length = 0;

    if (!noLength.includes(byte2) && byte2 !== 0xDA) {
      if (offset + 3 < view.byteLength) {
        length = view.getUint16(offset + 2);
      }
    }

    // Extract raw segment data
    let rawData: Uint8Array | undefined;
    if (length > 0 && offset + 2 + length <= view.byteLength) {
      rawData = bytes.slice(offset + 2, offset + 2 + length);
    }

    markers.push({ offset, marker: byte2, markerHex: hexStr, name, description: desc, length, rawData });
    log(`  Offset 0x${offset.toString(16).toUpperCase().padStart(8, '0')}  Marcador 0x${hexStr}  ${name.padEnd(8)}  Tamanho: ${length > 0 ? length + ' bytes' : '—'}`);

    // --- Parse specific segments ---

    // APP0 (JFIF)
    if (byte2 === 0xE0 && length >= 14 && rawData) {
      const id = String.fromCharCode(rawData[2], rawData[3], rawData[4], rawData[5], rawData[6]);
      if (id === 'JFIF\0') {
        const ver = `${rawData[7]}.${rawData[8].toString().padStart(2, '0')}`;
        const units = rawData[9];
        const unitsLabels = ['sem unidade (aspect ratio)', 'pixels/polegada (DPI)', 'pixels/centímetro'];
        const xDen = (rawData[10] << 8) | rawData[11];
        const yDen = (rawData[12] << 8) | rawData[13];
        const tw = rawData[14] || 0;
        const th = rawData[15] || 0;

        jfifInfo = {
          version: ver,
          units,
          unitsLabel: unitsLabels[units] || 'desconhecido',
          xDensity: xDen,
          yDensity: yDen,
          thumbWidth: tw,
          thumbHeight: th,
          hasThumbnail: tw > 0 && th > 0,
        };

        log('');
        log('  ┌── JFIF APP0 ──────────────────────────────────────────');
        log(`  │ Versão JFIF: ${ver}`);
        log(`  │ Unidade de Densidade: ${units} (${unitsLabels[units] || '?'})`);
        log(`  │ Densidade X: ${xDen}`);
        log(`  │ Densidade Y: ${yDen}`);
        if (tw > 0 || th > 0) {
          log(`  │ Thumbnail JFIF: ${tw}×${th}`);
          hasThumbnail = true;
          thumbnailSource = 'JFIF APP0';
        } else {
          log('  │ Thumbnail JFIF: Nenhum');
        }
        log('  └────────────────────────────────────────────────────────');
        log('');
      }
    }

    // APP1 (EXIF) — check for embedded thumbnail
    if (byte2 === 0xE1 && rawData && length > 10) {
      const id = String.fromCharCode(rawData[2], rawData[3], rawData[4], rawData[5]);
      if (id === 'Exif') {
        // Look for thumbnail markers (FFD8 inside EXIF)
        for (let i = 10; i < rawData.length - 1; i++) {
          if (rawData[i] === 0xFF && rawData[i + 1] === 0xD8) {
            hasThumbnail = true;
            thumbnailSource = 'EXIF APP1 (Embedded JPEG Thumbnail)';
            log(`  ┌── EXIF Thumbnail Detectado ──────────────────────────`);
            log(`  │ Offset dentro do APP1: ${i}`);
            log(`  └────────────────────────────────────────────────────────`);
            log('');
            break;
          }
        }
      }
    }

    // APP14 (Adobe)
    if (byte2 === 0xEE && rawData && length >= 12) {
      const id = String.fromCharCode(rawData[2], rawData[3], rawData[4], rawData[5], rawData[6]);
      if (id === 'Adobe') {
        const ver = (rawData[7] << 8) | rawData[8];
        const f0 = (rawData[9] << 8) | rawData[10];
        const f1 = (rawData[11] << 8) | rawData[12];
        const ct = rawData[13] || 0;
        const ctLabels: Record<number, string> = { 0: 'Unknown (RGB ou CMYK)', 1: 'YCbCr', 2: 'YCCK' };

        adobeInfo = {
          version: ver,
          flags0: f0,
          flags1: f1,
          colorTransform: ct,
          colorTransformLabel: ctLabels[ct] || 'Desconhecido',
        };

        log('');
        log('  ┌── Adobe APP14 ─────────────────────────────────────────');
        log(`  │ Versão: ${ver}`);
        log(`  │ Flags: 0x${f0.toString(16).padStart(4, '0')}, 0x${f1.toString(16).padStart(4, '0')}`);
        log(`  │ Transformação de Cor: ${ct} (${ctLabels[ct] || '?'})`);
        log('  └────────────────────────────────────────────────────────');
        log('');
      }
    }

    // DQT
    if (byte2 === 0xDB && rawData && length >= 65) {
      log('');
      log('  ┌── DQT (Tabela de Quantização) ──────────────────────────');
      let pos = 2; // skip length field
      while (pos < length) {
        const info = rawData[pos];
        const precision = (info >> 4) & 0x0F;
        const id = info & 0x0F;
        const valSize = precision === 0 ? 1 : 2;
        const values: number[] = [];
        pos++;

        for (let i = 0; i < 64 && pos < length; i++) {
          if (valSize === 1) {
            values.push(rawData[pos]);
            pos++;
          } else {
            values.push((rawData[pos] << 8) | rawData[pos + 1]);
            pos += 2;
          }
        }

        // De-zigzag
        const zigzagValues = [...values];
        const natural: number[] = new Array(64).fill(0);
        for (let i = 0; i < 64 && i < values.length; i++) {
          if (ZIGZAG_ORDER[i] < values.length) {
            natural[i] = values[ZIGZAG_ORDER[i]];
          }
        }

        quantizationTables.push({ id, precision, values, zigzagValues: natural });

        log(`  │ Tabela ID: ${id}  Precisão: ${precision === 0 ? '8-bit' : '16-bit'}`);
        log(`  │ Valores (ordem zigzag):`);
        for (let row = 0; row < 8; row++) {
          const rowVals = values.slice(row * 8, row * 8 + 8).map(v => v.toString().padStart(4)).join(' ');
          log(`  │   ${rowVals}`);
        }
      }
      log('  └────────────────────────────────────────────────────────');
      log('');
    }

    // SOF (any SOF marker)
    const sofMarkers = [0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB];
    if (sofMarkers.includes(byte2) && rawData && length >= 8) {
      const cType = compressionTypeFromMarker(byte2);
      const precision = rawData[2];
      const height = (rawData[3] << 8) | rawData[4];
      const width = (rawData[5] << 8) | rawData[6];
      const numComp = rawData[7];
      const components: SOFComponent[] = [];

      for (let c = 0; c < numComp && 8 + c * 3 + 2 < rawData.length; c++) {
        const compId = rawData[8 + c * 3];
        const sampling = rawData[9 + c * 3];
        const hSamp = (sampling >> 4) & 0x0F;
        const vSamp = sampling & 0x0F;
        const qTable = rawData[10 + c * 3];
        components.push({
          id: compId,
          name: componentName(compId),
          hSampling: hSamp,
          vSampling: vSamp,
          quantTableId: qTable,
          samplingLabel: `${hSamp}×${vSamp}`,
        });
      }

      sofInfo = {
        marker: byte2,
        markerName: name,
        precision,
        height,
        width,
        numComponents: numComp,
        components,
        compressionType: cType.type,
        isProgressive: cType.isProgressive,
        isLossless: cType.isLossless,
        isArithmetic: cType.isArithmetic,
        encodingProcess: cType.encodingProcess,
      };

      log('');
      log('  ┌── SOF (Start of Frame) ─────────────────────────────────');
      log(`  │ Tipo: ${cType.type}`);
      log(`  │ Processo de Codificação: ${cType.encodingProcess}`);
      log(`  │ Precisão: ${precision} bits/amostra`);
      log(`  │ Dimensões: ${width} × ${height} pixels`);
      log(`  │ Componentes: ${numComp}`);
      for (const c of components) {
        log(`  │   Comp ${c.id} (${c.name}): Amostragem ${c.samplingLabel}, Tabela DQT ${c.quantTableId}`);
      }
      log(`  │ Subamostragem: ${subsamplingString(components)}`);
      if (numComp >= 3) {
        const mcuW = components[0].hSampling * 8;
        const mcuH = components[0].vSampling * 8;
        const mcuCols = Math.ceil(width / mcuW);
        const mcuRows = Math.ceil(height / mcuH);
        log(`  │ MCU: ${mcuW}×${mcuH} pixels, Grade: ${mcuCols}×${mcuRows} = ${mcuCols * mcuRows} MCUs`);
      }
      log('  └────────────────────────────────────────────────────────');
      log('');
    }

    // DHT
    if (byte2 === 0xC4 && rawData && length >= 17) {
      log('');
      log('  ┌── DHT (Tabela de Huffman) ──────────────────────────────');
      let pos = 2;
      while (pos < length) {
        const info = rawData[pos];
        const tableClass = (info >> 4) & 0x0F; // 0=DC, 1=AC
        const tableId = info & 0x0F;
        pos++;

        const bits: number[] = [];
        let totalCodes = 0;
        for (let i = 0; i < 16 && pos < length; i++) {
          bits.push(rawData[pos]);
          totalCodes += rawData[pos];
          pos++;
        }

        const values: number[] = [];
        for (let i = 0; i < totalCodes && pos < length; i++) {
          values.push(rawData[pos]);
          pos++;
        }

        const classLabel = tableClass === 0 ? 'DC' : 'AC';
        huffmanTables.push({ tableClass, tableId, bits, totalCodes, values, classLabel });

        log(`  │ Classe: ${classLabel}  ID: ${tableId}  Total de Códigos: ${totalCodes}`);
        log(`  │ Bits por comprimento: [${bits.join(', ')}]`);
        log(`  │ Valores (primeiros 16): [${values.slice(0, 16).map(v => '0x' + v.toString(16).toUpperCase().padStart(2, '0')).join(', ')}${values.length > 16 ? ', ...' : ''}]`);
      }
      log('  └────────────────────────────────────────────────────────');
      log('');
    }

    // DRI
    if (byte2 === 0xDD && rawData && length >= 4) {
      const ri = (rawData[2] << 8) | rawData[3];
      driInfo = { restartInterval: ri };
      log(`  ┌── DRI: Intervalo de Reinício = ${ri} MCUs`);
      log('  └────────────────────────────────────────────────────────');
      log('');
    }

    // SOS
    if (byte2 === 0xDA && offset + 3 < view.byteLength) {
      sosOffset = offset;
      const sosLen = view.getUint16(offset + 2);
      if (offset + 4 < view.byteLength) {
        const nc = view.getUint8(offset + 4);
        const comps: { id: number; dcTable: number; acTable: number }[] = [];
        for (let c = 0; c < nc && offset + 5 + c * 2 + 1 < view.byteLength; c++) {
          const cid = view.getUint8(offset + 5 + c * 2);
          const tables = view.getUint8(offset + 6 + c * 2);
          comps.push({ id: cid, dcTable: (tables >> 4) & 0x0F, acTable: tables & 0x0F });
        }
        const ssOffset = offset + 5 + nc * 2;
        const ss = ssOffset < view.byteLength ? view.getUint8(ssOffset) : 0;
        const se = ssOffset + 1 < view.byteLength ? view.getUint8(ssOffset + 1) : 63;
        const sa = ssOffset + 2 < view.byteLength ? view.getUint8(ssOffset + 2) : 0;

        sosInfo = {
          numComponents: nc,
          components: comps,
          spectralStart: ss,
          spectralEnd: se,
          successiveApproxHigh: (sa >> 4) & 0x0F,
          successiveApproxLow: sa & 0x0F,
        };

        log('');
        log('  ┌── SOS (Start of Scan) ─────────────────────────────────');
        log(`  │ Componentes no Scan: ${nc}`);
        for (const c of comps) {
          log(`  │   Comp ${c.id}: Tabela DC=${c.dcTable}, Tabela AC=${c.acTable}`);
        }
        log(`  │ Seleção Espectral: Ss=${ss}, Se=${se}`);
        log(`  │ Aproximação Sucessiva: Ah=${(sa >> 4) & 0x0F}, Al=${sa & 0x0F}`);
        log(`  │ Início dos dados comprimidos: Offset 0x${(offset + 2 + sosLen).toString(16).toUpperCase().padStart(8, '0')}`);
        log('  └────────────────────────────────────────────────────────');
        log('');
      }
      break; // after SOS, scan data begins
    }

    // COM
    if (byte2 === 0xFE && rawData && length > 2) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(rawData.slice(2));
      comments.push(text);
      log(`  ┌── Comentário: "${text.trim()}"`);
      log('  └────────────────────────────────────────────────────────');
      log('');
    }

    // Advance offset
    if (noLength.includes(byte2)) {
      offset += 2;
    } else {
      offset += length > 0 ? length + 2 : 2;
    }
  }

  // --- Check for EOI and trailing data ---
  let hasTrailingData = false;
  let trailingDataSize = 0;
  let foundEoi = false;

  // Search for EOI from end
  for (let i = view.byteLength - 2; i >= Math.max(0, view.byteLength - 100); i--) {
    if (view.getUint8(i) === 0xFF && view.getUint8(i + 1) === 0xD9) {
      foundEoi = true;
      markers.push({
        offset: i,
        marker: 0xD9,
        markerHex: 'FFD9',
        name: 'EOI',
        description: 'End of Image',
        length: 0,
      });
      log(`  Offset 0x${i.toString(16).toUpperCase().padStart(8, '0')}  Marcador 0xFFD9  EOI       Tamanho: —`);
      
      if (i + 2 < view.byteLength) {
        hasTrailingData = true;
        trailingDataSize = view.byteLength - (i + 2);
        log('');
        log(`  ⚠️ DADOS APÓS EOI: ${trailingDataSize} bytes de dados adicionais após o fim da imagem!`);
        log('  Isso pode indicar dados concatenados, esteganografia ou corrupção.');
      }
      break;
    }
  }

  if (!foundEoi) {
    log('');
    log('  ⚠️ MARCADOR EOI (FFD9) NÃO ENCONTRADO — Arquivo pode estar truncado!');
  }

  // --- Image data size ---
  if (sosOffset >= 0 && foundEoi) {
    const eoiMarker = markers.find(m => m.name === 'EOI');
    if (eoiMarker) {
      const dataSize = eoiMarker.offset - sosOffset;
      log('');
      log(`  Dados de imagem comprimidos: ${dataSize} bytes (${((dataSize / buffer.byteLength) * 100).toFixed(1)}% do arquivo)`);
    }
  }

  // --- Quality estimation ---
  let estimatedQuality: number | null = null;
  let qualityMethod = '';
  if (quantizationTables.length > 0) {
    const est = estimateIJGQuality(quantizationTables[0].values);
    if (est.quality > 0) {
      estimatedQuality = est.quality;
      qualityMethod = est.method;
    }
  }

  log('');
  log('─── Análise de Compressão ──────────────────────────────────');
  log('');
  if (estimatedQuality !== null) {
    log(`  Qualidade JPEG estimada: ~${estimatedQuality}% (${qualityMethod})`);
  }
  if (sofInfo) {
    log(`  Tipo de compressão: ${sofInfo.compressionType}`);
    log(`  Processo de codificação: ${sofInfo.encodingProcess}`);
    log(`  Subamostragem: ${subsamplingString(sofInfo.components)}`);
  }

  // --- Signature matching ---
  const signatures = matchSignatures(quantizationTables);
  if (signatures.length > 0) {
    log('');
    log('─── Assinaturas de Compressão ─────────────────────────────');
    log('');
    for (const sig of signatures) {
      log(`  ${sig.confidence >= 90 ? '✅' : sig.confidence >= 75 ? '🔶' : '❓'} ${sig.name} — Confiança: ${sig.confidence}%`);
    }
  }

  // --- Marker sequence string ---
  const markerSequence = markers.map(m => m.name).join(' → ');

  // --- Hex dump ---
  const hexDump = generateHexDump(buffer, 2048);

  log('');
  log('─── Resumo da Estrutura ───────────────────────────────────');
  log('');
  log(`  Total de marcadores: ${markers.length}`);
  log(`  Tabelas DQT: ${quantizationTables.length}`);
  log(`  Tabelas DHT: ${huffmanTables.length}`);
  log(`  Comentários: ${comments.length}`);
  log(`  Thumbnail incorporado: ${hasThumbnail ? 'Sim (' + thumbnailSource + ')' : 'Não'}`);
  log(`  Dados após EOI: ${hasTrailingData ? 'Sim (' + trailingDataSize + ' bytes)' : 'Não'}`);
  log('');
  log(`  Sequência: ${markerSequence}`);
  log('');
  log('══════════════════════════════════════════════════════════════');

  return {
    markers,
    markerSequence,
    totalMarkers: markers.length,
    quantizationTables,
    estimatedQuality,
    qualityMethod,
    sofInfo,
    huffmanTables,
    sosInfo,
    jfifInfo,
    adobeInfo,
    driInfo,
    comments,
    subsamplingLabel: sofInfo ? subsamplingString(sofInfo.components) : 'N/A',
    hasThumbnail,
    thumbnailSource,
    hasTrailingData,
    trailingDataSize,
    signatures,
    hexDump,
    logOutput,
    possibleEditor: null,
  };
}

export function computeHealthScore(
  parsed: Omit<FullAnalysisResult, 'fileInfo' | 'healthScore' | 'healthDetails' | 'colorHistogram'>,
  exifData: Record<string, any> | null,
  isJpeg: boolean
): { score: number; details: string[] } {
  if (!isJpeg) return { score: 50, details: ['Análise limitada para arquivos não-JPEG'] };

  let score = 100;
  const details: string[] = [];

  if (!parsed.markers.find(m => m.name === 'SOI')) {
    score -= 30;
    details.push('⚠️ Marcador SOI ausente — arquivo pode estar corrompido');
  }
  if (!parsed.markers.find(m => m.name === 'EOI')) {
    score -= 20;
    details.push('⚠️ Marcador EOI ausente — arquivo pode estar truncado');
  }
  if (parsed.hasTrailingData) {
    score -= 15;
    details.push(`⚠️ ${parsed.trailingDataSize} bytes de dados após EOI — possível esteganografia ou concatenação`);
  }
  if (parsed.quantizationTables.length > 0) {
    const avgQ = parsed.quantizationTables[0].values.reduce((a, b) => a + b, 0) / 64;
    if (avgQ > 10) {
      score -= 15;
      details.push('🔶 Tabelas DQT indicam compressão elevada');
    }
    if (parsed.quantizationTables.length > 2) {
      score -= 10;
      details.push('🔶 Múltiplas tabelas DQT — possível re-compressão');
    }
  }
  if (parsed.estimatedQuality !== null) {
    details.push(`📊 Qualidade JPEG estimada: ~${parsed.estimatedQuality}%`);
  }
  if (parsed.sofInfo) {
    details.push(`🖼 ${parsed.sofInfo.compressionType} — ${parsed.sofInfo.width}×${parsed.sofInfo.height}`);
    details.push(`📐 Subamostragem: ${parsed.subsamplingLabel}`);
  }
  if (parsed.signatures.length > 0) {
    const top = parsed.signatures[0];
    details.push(`🔍 Assinatura: ${top.name} (${top.confidence}%)`);
  }
  if (exifData) {
    if (exifData.Software) {
      details.push(`📝 Software: ${exifData.Software}`);
      if (/photoshop|gimp|paint|lightroom/i.test(exifData.Software)) {
        score -= 10;
        details.push('🔶 Processado por editor de imagem');
      }
    }
    if (exifData.ModifyDate && exifData.DateTimeOriginal) {
      const mod = new Date(exifData.ModifyDate).getTime();
      const orig = new Date(exifData.DateTimeOriginal).getTime();
      if (mod - orig > 60000) {
        score -= 5;
        details.push('🔶 Data de modificação difere da original');
      }
    }
    if (exifData.latitude && exifData.longitude) {
      details.push(`📍 GPS: ${exifData.latitude.toFixed(4)}, ${exifData.longitude.toFixed(4)}`);
    }
  } else {
    details.push('ℹ️ Sem dados EXIF — metadados podem ter sido removidos');
  }
  if (parsed.hasThumbnail) {
    details.push(`🖼 Thumbnail: ${parsed.thumbnailSource}`);
  }

  return { score: Math.max(0, score), details };
}

export function computeColorHistogram(
  imageData: ImageData
): { r: number[]; g: number[]; b: number[] } {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    r[data[i]]++;
    g[data[i + 1]]++;
    b[data[i + 2]]++;
  }
  return { r, g, b };
}
