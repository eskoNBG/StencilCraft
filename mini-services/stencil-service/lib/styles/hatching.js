const sharp = require("sharp");
const { cannyEdges, mergeEdges, dilate } = require("../edges");
const { detectSubjectMask } = require("../preprocess");

/**
 * Hatching style: Cross-hatching shading with edge contours.
 */
async function hatching(grayBuf, width, height, lineThickness, contrast) {
  // --- 1. Edge contours ---
  const smoothed = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.5)
    .grayscale()
    .raw()
    .toBuffer();

  const factor = 1 - (contrast - 50) / 100;
  const low = Math.max(8, Math.round(15 * factor));
  const high = Math.max(20, Math.round(45 * factor));

  let contours = await cannyEdges(smoothed, width, height, low, high, true);
  if (lineThickness > 1) {
    contours = dilate(contours, width, height, lineThickness - 1);
  }

  // --- 2. Subject mask ---
  const subjectMask = detectSubjectMask(grayBuf, width, height);
  let mask = dilate(subjectMask, width, height, 8);
  mask = await sharp(mask, { raw: { width, height, channels: 1 } })
    .blur(4)
    .grayscale()
    .raw()
    .toBuffer();

  // --- 3. Darkness map ---
  const darknessMap = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    darknessMap[i] = 255 - grayBuf[i];
  }
  const blurredDarkness = await sharp(darknessMap, { raw: { width, height, channels: 1 } })
    .blur(3)
    .grayscale()
    .raw()
    .toBuffer();

  // --- 4. Hatching lines ---
  const hatchBuf = Buffer.alloc(width * height);

  // Primary diagonals (45°)
  const spacing1 = Math.max(3, 10 - lineThickness);
  for (let offset = -height; offset < width + height; offset += spacing1) {
    for (let y = 0; y < height; y++) {
      const x = offset + y;
      if (x < 0 || x >= width) continue;
      const idx = y * width + x;
      if (mask[idx] > 20 && blurredDarkness[idx] > 35) {
        hatchBuf[idx] = 255;
        if (lineThickness >= 2 && x + 1 < width) hatchBuf[y * width + x + 1] = 255;
        if (lineThickness >= 3 && x - 1 >= 0) hatchBuf[y * width + x - 1] = 255;
      }
    }
  }

  // Cross-hatching (135°) in darker areas
  const spacing2 = Math.max(4, 12 - lineThickness);
  for (let offset = 0; offset < width + height; offset += spacing2) {
    for (let y = 0; y < height; y++) {
      const x = offset - y + height;
      if (x < 0 || x >= width) continue;
      const idx = y * width + x;
      if (mask[idx] > 20 && blurredDarkness[idx] > 90) {
        hatchBuf[idx] = 255;
        if (lineThickness >= 2 && x + 1 < width) hatchBuf[y * width + x + 1] = 255;
      }
    }
  }

  // Dense horizontal fill for very dark areas
  const spacing3 = Math.max(3, 8 - lineThickness);
  for (let y = 0; y < height; y += spacing3) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] > 20 && blurredDarkness[idx] > 160) {
        hatchBuf[idx] = 255;
      }
    }
  }

  return mergeEdges(contours, hatchBuf);
}

module.exports = { hatching };
