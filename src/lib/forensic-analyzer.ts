// JPEG Marker definitions
export const JPEG_MARKERS: Record<string, { name: string; description: string }> = {
  'FFD8': { name: 'SOI', description: 'Start of Image - Marca o início do arquivo JPEG' },
  'FFE0': { name: 'APP0', description: 'JFIF - Informações básicas do formato JPEG' },
  'FFE1': { name: 'APP1', description: 'EXIF/XMP - Metadados da câmera e software' },
  'FFE2': { name: 'APP2', description: 'ICC Profile - Perfil de cores' },
  'FFDB': { name: 'DQT', description: 'Tabela de Quantização - Define a compressão por frequência' },
  'FFC0': { name: 'SOF0', description: 'Start of Frame (Baseline) - Dimensões e componentes' },
  'FFC2': { name: 'SOF2', description: 'Start of Frame (Progressive) - Codificação progressiva' },
  'FFC4': { name: 'DHT', description: 'Tabela de Huffman - Codificação entrópica dos dados' },
  'FFDA': { name: 'SOS', description: 'Start of Scan - Início dos dados comprimidos da imagem' },
  'FFD9': { name: 'EOI', description: 'End of Image - Marca o fim do arquivo JPEG' },
  'FFFE': { name: 'COM', description: 'Comentário - Texto incorporado no arquivo' },
  'FFE0E': { name: 'APP14', description: 'Adobe - Metadados específicos do Adobe' },
};

export interface JpegMarker {
  offset: number;
  marker: string;
  name: string;
  description: string;
  length: number;
}

export interface QuantizationTable {
  id: number;
  precision: number;
  values: number[];
}

export interface AnalysisResult {
  markers: JpegMarker[];
  quantizationTables: QuantizationTable[];
  hexDump: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    isJpeg: boolean;
    isPng: boolean;
  };
  healthScore: number;
  healthDetails: string[];
  colorHistogram: { r: number[]; g: number[]; b: number[] };
  possibleEditor: string | null;
}

// Known DQT signatures for editor detection
const PHOTOSHOP_DQT_SIG = [2, 1, 1, 2, 1, 1, 2, 2];
const GIMP_DQT_SIG = [1, 1, 1, 1, 1, 1, 1, 1];

function detectEditor(tables: QuantizationTable[]): string | null {
  if (tables.length === 0) return null;
  const first8 = tables[0].values.slice(0, 8);
  
  if (first8[0] <= 2 && first8[1] <= 2 && first8.every(v => v <= 3)) {
    return 'Alta qualidade (possivelmente câmera profissional)';
  }
  if (first8[0] >= 8 && first8.some(v => v >= 15)) {
    return 'Re-compressão detectada (múltiplas salvações)';
  }
  if (first8[0] === 2 && first8[1] === 1) {
    return 'Possível Adobe Photoshop';
  }
  if (first8[0] === 1 && first8.every(v => v === 1)) {
    return 'Possível GIMP (qualidade máxima)';
  }
  return 'Editor desconhecido';
}

export function parseJpegMarkers(buffer: ArrayBuffer): JpegMarker[] {
  const view = new DataView(buffer);
  const markers: JpegMarker[] = [];
  let offset = 0;

  while (offset < view.byteLength - 1) {
    if (view.getUint8(offset) === 0xFF) {
      const byte2 = view.getUint8(offset + 1);
      if (byte2 !== 0x00 && byte2 !== 0xFF) {
        const hex = 'FF' + byte2.toString(16).toUpperCase().padStart(2, '0');
        const info = JPEG_MARKERS[hex] || { name: `UNK(0x${hex})`, description: 'Marcador desconhecido' };
        
        let length = 0;
        if (byte2 !== 0xD8 && byte2 !== 0xD9 && byte2 !== 0xDA) {
          if (offset + 3 < view.byteLength) {
            length = view.getUint16(offset + 2);
          }
        }

        markers.push({
          offset,
          marker: hex,
          name: info.name,
          description: info.description,
          length,
        });

        if (byte2 === 0xDA) break; // SOS - rest is image data
        offset += length > 0 ? length + 2 : 2;
        continue;
      }
    }
    offset++;
  }

  // Check for EOI at end
  if (view.byteLength >= 2) {
    const last2 = view.getUint8(view.byteLength - 2).toString(16).toUpperCase().padStart(2, '0') +
                  view.getUint8(view.byteLength - 1).toString(16).toUpperCase().padStart(2, '0');
    if (last2 === 'FFD9') {
      markers.push({
        offset: view.byteLength - 2,
        marker: 'FFD9',
        name: 'EOI',
        description: 'End of Image',
        length: 0,
      });
    }
  }

  return markers;
}

export function extractQuantizationTables(buffer: ArrayBuffer): QuantizationTable[] {
  const view = new DataView(buffer);
  const tables: QuantizationTable[] = [];
  let offset = 0;

  while (offset < view.byteLength - 1) {
    if (view.getUint8(offset) === 0xFF && view.getUint8(offset + 1) === 0xDB) {
      const length = view.getUint16(offset + 2);
      let pos = offset + 4;
      const end = offset + 2 + length;

      while (pos < end && pos < view.byteLength) {
        const byte = view.getUint8(pos);
        const precision = (byte >> 4) & 0x0F;
        const id = byte & 0x0F;
        const valueSize = precision === 0 ? 1 : 2;
        const values: number[] = [];
        pos++;

        for (let i = 0; i < 64 && pos < view.byteLength; i++) {
          if (valueSize === 1) {
            values.push(view.getUint8(pos));
            pos++;
          } else {
            values.push(view.getUint16(pos));
            pos += 2;
          }
        }

        tables.push({ id, precision, values });
      }

      offset = end;
      continue;
    }
    offset++;
  }

  return tables;
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

export function computeHealthScore(
  markers: JpegMarker[],
  tables: QuantizationTable[],
  exifData: Record<string, any> | null,
  isJpeg: boolean
): { score: number; details: string[] } {
  if (!isJpeg) return { score: 50, details: ['Análise limitada para arquivos não-JPEG'] };

  let score = 100;
  const details: string[] = [];

  // Check for SOI
  if (!markers.find(m => m.name === 'SOI')) {
    score -= 30;
    details.push('⚠️ Marcador SOI ausente - arquivo pode estar corrompido');
  }

  // Check for EOI
  if (!markers.find(m => m.name === 'EOI')) {
    score -= 20;
    details.push('⚠️ Marcador EOI ausente - arquivo pode estar truncado');
  }

  // Check DQT quality
  if (tables.length > 0) {
    const avgQ = tables[0].values.reduce((a, b) => a + b, 0) / tables[0].values.length;
    if (avgQ > 10) {
      score -= 15;
      details.push('🔶 Tabelas de quantização indicam compressão elevada');
    }
    if (tables.length > 2) {
      score -= 10;
      details.push('🔶 Múltiplas tabelas DQT podem indicar re-compressão');
    }
  }

  // Check EXIF
  if (exifData) {
    if (exifData.Software) {
      details.push(`📝 Software: ${exifData.Software}`);
      if (/photoshop|gimp|paint/i.test(exifData.Software)) {
        score -= 10;
        details.push('🔶 Arquivo foi processado por editor de imagem');
      }
    }
    if (exifData.ModifyDate && exifData.DateTimeOriginal) {
      const mod = new Date(exifData.ModifyDate).getTime();
      const orig = new Date(exifData.DateTimeOriginal).getTime();
      if (mod - orig > 60000) {
        score -= 5;
        details.push('🔶 Data de modificação difere da data original');
      }
    }
    if (exifData.latitude && exifData.longitude) {
      details.push(`📍 GPS: ${exifData.latitude.toFixed(4)}, ${exifData.longitude.toFixed(4)}`);
    }
  } else {
    details.push('ℹ️ Sem dados EXIF - metadados podem ter sido removidos');
  }

  if (details.length === 0) {
    details.push('✅ Nenhuma anomalia detectada');
  }

  return { score: Math.max(0, score), details };
}

export async function performELA(
  imageElement: HTMLImageElement,
  quality: number = 75
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  // Re-compress
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
      const scale = 15; // amplification

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
