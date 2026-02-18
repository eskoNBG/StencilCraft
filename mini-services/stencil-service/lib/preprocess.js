const sharp = require("sharp");

const MAX_DIMENSION = 2048;

/**
 * Preprocess an image buffer into a normalized grayscale raw buffer.
 * @param {Buffer} imageBuffer - Raw image file buffer (PNG/JPEG/etc)
 * @param {number} contrast - 0-100, controls contrast enhancement
 * @returns {Promise<{ data: Buffer, width: number, height: number }>}
 */
async function preprocess(imageBuffer, contrast) {
  let pipeline = sharp(imageBuffer).rotate(); // auto-rotate based on EXIF

  const meta = await sharp(imageBuffer).metadata();
  let { width, height } = meta;

  // Cap dimensions to avoid memory issues
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside" });
  }

  // Convert to single-channel grayscale
  // Use .toColourspace('b-w') to ensure single-channel output
  pipeline = pipeline.grayscale();

  // Global contrast adjustment
  // contrast=0 -> alpha=0.1, contrast=50 -> alpha=1, contrast=100 -> alpha=2
  const alpha = Math.max(0.1, 1 + (contrast - 50) / 50);
  pipeline = pipeline.linear(alpha, 128 * (1 - alpha)); // keep midpoint at 128

  // Get raw single-channel buffer
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  // Verify we got single-channel data
  if (info.channels !== 1) {
    // Force to single channel by taking every Nth byte
    const singleChannel = Buffer.alloc(info.width * info.height);
    for (let i = 0; i < info.width * info.height; i++) {
      singleChannel[i] = data[i * info.channels];
    }
    return { data: singleChannel, width: info.width, height: info.height };
  }

  return { data, width: info.width, height: info.height };
}

module.exports = { preprocess };
