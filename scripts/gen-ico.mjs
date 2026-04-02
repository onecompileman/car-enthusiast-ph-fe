/**
 * Generates public/favicon.ico with 16x16, 32x32 and 48x48 sizes.
 * Design: dark rounded square, white "C", red dot — matching the CEPH. brand.
 * No external dependencies — only Node built-ins.
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '../public/favicon.ico');

// ── Palette colours (RGBA) ─────────────────────────────────────────────────
const TRANSPARENT = [0, 0, 0, 0];
const BG          = [15, 17, 21, 255];   // #0f1115
const TEXT        = [245, 247, 250, 255]; // #f5f7fa
const ACCENT      = [255, 90, 79, 255];  // #ff5a4f

// ── Pixel-art bitmaps ──────────────────────────────────────────────────────
// Each pixel is one of: T=transparent, K=background, W=white, R=red
const T = 0, K = 1, W = 2, R = 3;
const COLOURS = [TRANSPARENT, BG, TEXT, ACCENT];

// 16×16
const MAP16 = [
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,W,W,W,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,W,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,W,K,K,K,W,K,K,K,K,K,K,K,K,K,
  K,K,K,W,W,W,K,K,K,K,K,K,K,K,R,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
];

// 32×32
const MAP32 = [
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,W,W,W,W,W,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,W,W,K,K,K,K,W,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,W,K,K,K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,W,W,K,K,K,K,K,K,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,W,W,K,K,K,K,W,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,W,W,W,W,W,W,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,R,R,R,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,R,R,R,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
  K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,
];

// 48×48
function scaleMap(map, srcSize, dstSize) {
  const out = new Array(dstSize * dstSize);
  const scale = srcSize / dstSize;
  for (let y = 0; y < dstSize; y++) {
    for (let x = 0; x < dstSize; x++) {
      const sx = Math.min(Math.floor(x * scale), srcSize - 1);
      const sy = Math.min(Math.floor(y * scale), srcSize - 1);
      out[y * dstSize + x] = map[sy * srcSize + sx];
    }
  }
  return out;
}
const MAP48 = scaleMap(MAP32, 32, 48);

// ── Minimal PNG encoder ────────────────────────────────────────────────────
function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function makePNG(map, size) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB (no alpha in palette — we'll use RGBA via colour type 6)
  ihdr[8] = 8; ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // IDAT — raw scanlines (filter byte 0 + RGBA pixels)
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = COLOURS[map[y * size + x]];
      const off = 1 + x * 4;
      row[off] = r; row[off + 1] = g; row[off + 2] = b; row[off + 3] = a;
    }
    rawRows.push(row);
  }
  const raw = Buffer.concat(rawRows);
  const compressed = deflateSync(raw, { level: 9 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// ── ICO assembler ─────────────────────────────────────────────────────────
function makeICO(entries) {
  // entries: [{size, map}]
  const pngs = entries.map(e => makePNG(e.map, e.size));

  const numImages = entries.length;
  const headerSize = 6 + numImages * 16;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type: 1 = ICO
  header.writeUInt16LE(numImages, 4);

  let offset = headerSize;
  const dirEntries = pngs.map((png, i) => {
    const size = entries[i].size;
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size; // width
    entry[1] = size >= 256 ? 0 : size; // height
    entry[2] = 0;  // colour count
    entry[3] = 0;  // reserved
    entry.writeUInt16LE(1,  4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...dirEntries, ...pngs]);
}

const ico = makeICO([
  { size: 16, map: MAP16 },
  { size: 32, map: MAP32 },
  { size: 48, map: MAP48 },
]);

writeFileSync(OUT, ico);
console.log(`Written ${ico.length} bytes → ${OUT}`);
