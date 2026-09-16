import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generador de PNGs binarios puros usando zlib nativo de Node.js
 */
function createPng(width, height, drawFn) {
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    buffer[rowStart] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[pixelStart] = r;
      buffer[pixelStart + 1] = g;
      buffer[pixelStart + 2] = b;
      buffer[pixelStart + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(buffer);

  // CRC32 table
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const crcVal = crc32(Buffer.concat([chunkType, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, chunkType, data, crcBuf]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth 8
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // No filter
  ihdr[12] = 0; // No interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const SPONSORS = {
  consalud: {
    bg: [0, 82, 155], // #00529b
    accent: [0, 163, 224], // #00a3e0
    symbol: 'cross',
  },
  zurichsantander: {
    bg: [0, 51, 153], // #003399
    accent: [230, 0, 0], // #e60000 (Santander Red)
    symbol: 'circles',
  },
  default: {
    bg: [37, 99, 235], // #2563eb
    accent: [14, 165, 233], // #0ea5e9
    symbol: 'paw',
  },
};

function generateIcon(sponsorKey, size, isMaskable) {
  const cfg = SPONSORS[sponsorKey];
  const [bgR, bgG, bgB] = cfg.bg;
  const [accR, accG, accB] = cfg.accent;

  const png = createPng(size, size, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Padding para maskable: 15% seguro
    const cornerRadius = isMaskable ? 0 : w * 0.22;

    // Fondo redondeado para standard, plano completo para maskable
    let inBackground = false;
    if (isMaskable) {
      inBackground = true;
    } else {
      // Rounded rect
      const rx = Math.abs(x - cx);
      const ry = Math.abs(y - cy);
      const innerW = cx - cornerRadius;
      const innerH = cy - cornerRadius;
      if (rx <= innerW || ry <= innerH) {
        inBackground = rx <= cx && ry <= cy;
      } else {
        const cdx = rx - innerW;
        const cdy = ry - innerH;
        inBackground = cdx * cdx + cdy * cdy <= cornerRadius * cornerRadius;
      }
    }

    if (!inBackground) {
      return [0, 0, 0, 0]; // Transparente exterior
    }

    // Acento circular sutil de fondo
    if (dist < w * 0.38 && dist > w * 0.34) {
      return [accR, accG, accB, 255];
    }

    // Símbolo central
    if (cfg.symbol === 'cross') {
      // Cruz médica Consalud
      const armWidth = w * 0.08;
      const armLength = w * 0.22;
      const inV = Math.abs(dx) <= armWidth && Math.abs(dy) <= armLength;
      const inH = Math.abs(dy) <= armWidth && Math.abs(dx) <= armLength;
      if (inV || inH) {
        return [255, 255, 255, 255];
      }
    } else if (cfg.symbol === 'circles') {
      // Emblema Zurich concentric + Santander flame dot
      if (dist >= w * 0.16 && dist <= w * 0.22) {
        return [255, 255, 255, 255];
      }
      if (dist <= w * 0.09) {
        return [accR, accG, accB, 255]; // Red flame center
      }
    } else {
      // Paw central
      const padDist = Math.sqrt(dx * dx + (dy - h * 0.04) * (dy - h * 0.04));
      if (padDist <= w * 0.14) {
        return [255, 255, 255, 255];
      }
      // Dedos
      const t1 = Math.sqrt((dx + w * 0.11) ** 2 + (dy + h * 0.12) ** 2);
      const t2 = Math.sqrt((dx - w * 0.11) ** 2 + (dy + h * 0.12) ** 2);
      const t3 = Math.sqrt(dx ** 2 + (dy + h * 0.16) ** 2);
      if (t1 <= w * 0.05 || t2 <= w * 0.05 || t3 <= w * 0.05) {
        return [255, 255, 255, 255];
      }
    }

    return [bgR, bgG, bgB, 255];
  });

  return png;
}

// Generar todos los íconos
const publicDir = path.resolve('public/icons');

for (const sponsorKey of Object.keys(SPONSORS)) {
  const targetDir = path.join(publicDir, sponsorKey);
  fs.mkdirSync(targetDir, { recursive: true });

  const icon192 = generateIcon(sponsorKey, 192, false);
  fs.writeFileSync(path.join(targetDir, 'icon-192x192.png'), icon192);

  const icon512 = generateIcon(sponsorKey, 512, false);
  fs.writeFileSync(path.join(targetDir, 'icon-512x512.png'), icon512);

  const maskable = generateIcon(sponsorKey, 512, true);
  fs.writeFileSync(path.join(targetDir, 'icon-maskable.png'), maskable);

  console.log(`✓ Íconos generados para "${sponsorKey}" en ${targetDir}`);
}

console.log('\n🐾 Todos los íconos PWA han sido generados exitosamente.');
