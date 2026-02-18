import sharp from "sharp";

const MAX_DIMENSION = 2048;

/**
 * Preprocess an image buffer into a normalized grayscale raw buffer.
 * Professional pipeline: resize → grayscale → CLAHE → contrast → denoise
 *
 * @param {Buffer} imageBuffer - Raw image file buffer (PNG/JPEG/etc)
 * @param {number} contrast - 0-100, controls contrast enhancement
 * @returns {Promise<{ data: Buffer, width: number, height: number }>}
 */
async function preprocess(imageBuffer, contrast) {
  let pipeline = sharp(imageBuffer).rotate(); // auto-rotate EXIF

  // Cap dimensions
  const meta = await sharp(imageBuffer).metadata();
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside" });
  }

  // Convert to grayscale
  pipeline = pipeline.grayscale();

  // CLAHE — local histogram equalization for consistent contrast across the image.
  // This is critical: it brings out detail in both shadows and highlights,
  // making edge detection far more effective on real photos.
  // Larger tiles = less aggressive local equalization = less noise amplification
  pipeline = pipeline.clahe({ width: 16, height: 16, maxSlope: 3 });

  // Mild denoise — median filter preserves edges better than Gaussian
  pipeline = pipeline.median(3);

  // Global contrast adjustment centered on midpoint
  const alpha = Math.max(0.1, 1 + (contrast - 50) / 50);
  pipeline = pipeline.linear(alpha, 128 * (1 - alpha));

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  // Ensure single-channel output
  if (info.channels !== 1) {
    const single = Buffer.alloc(info.width * info.height);
    for (let i = 0; i < info.width * info.height; i++) {
      single[i] = data[i * info.channels];
    }
    return { data: single, width: info.width, height: info.height };
  }

  return { data, width: info.width, height: info.height };
}

/**
 * Detect background via edge density analysis.
 * Returns a subject mask where 255 = likely subject, 0 = likely background.
 */
function detectSubjectMask(grayBuf, width, height) {
  // Compute local variance in 16x16 blocks to find "interesting" areas
  const blockSize = 16;
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  const variance = new Float32Array(blocksX * blocksY);

  let maxVar = 0;
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let sum = 0, sumSq = 0, count = 0;
      const yStart = by * blockSize, yEnd = Math.min(yStart + blockSize, height);
      const xStart = bx * blockSize, xEnd = Math.min(xStart + blockSize, width);

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const v = grayBuf[y * width + x];
          sum += v;
          sumSq += v * v;
          count++;
        }
      }

      const mean = sum / count;
      const v = sumSq / count - mean * mean;
      variance[by * blocksX + bx] = v;
      if (v > maxVar) maxVar = v;
    }
  }

  // Create mask: high variance = subject, low variance = flat background
  const mask = Buffer.alloc(width * height);
  const threshold = maxVar * 0.05; // 5% of max variance is considered "interesting"

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bx = Math.min(Math.floor(x / blockSize), blocksX - 1);
      const by = Math.min(Math.floor(y / blockSize), blocksY - 1);
      mask[y * width + x] = variance[by * blocksX + bx] > threshold ? 255 : 0;
    }
  }

  return mask;
}

module.exports = { preprocess, detectSubjectMask };
