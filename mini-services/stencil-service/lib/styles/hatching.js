const sharp = require("sharp");
const { sobelEdges, mergeEdges, dilate, cleanEdges } = require("../edges");

/**
 * Hatching style: Cross-hatching patterns for shading.
 * Edge detection + diagonal line patterns based on darkness map.
 */
async function hatching(grayBuf, width, height, lineThickness, contrast) {
  // --- 1. Edge contours ---
  const smoothed = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.5)
    .grayscale()
    .raw()
    .toBuffer();

  const scale = 1 - (contrast - 50) / 100;

  const [edges1, edges2] = await Promise.all([
    sobelEdges(smoothed, width, height,
      Math.max(5, Math.round(15 * scale)),
      Math.max(15, Math.round(45 * scale))
    ),
    sobelEdges(smoothed, width, height,
      Math.max(10, Math.round(25 * scale)),
      Math.max(30, Math.round(75 * scale))
    ),
  ]);

  let contours = mergeEdges(edges1, edges2);

  if (lineThickness > 1) {
    contours = dilate(contours, width, height, lineThickness - 1);
  }

  // --- 2. Darkness map from original grayscale ---
  // Invert: dark areas in original become high values
  const darknessMap = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    darknessMap[i] = 255 - grayBuf[i];
  }

  // Blur the darkness map for smooth transitions
  const blurredDarkness = await sharp(darknessMap, { raw: { width, height, channels: 1 } })
    .blur(3)
    .grayscale()
    .raw()
    .toBuffer();

  // --- 3. Create subject mask from thresholding ---
  // Instead of relying only on dilated edges, use the original image
  // to detect the subject: anything darker than the background
  const bgThreshold = 200; // pixels lighter than this are considered background
  const subjectMask = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    subjectMask[i] = grayBuf[i] < bgThreshold ? 255 : 0;
  }

  // Dilate subject mask to fill gaps, then blur for smooth edges
  let mask = dilate(subjectMask, width, height, 5);
  mask = await sharp(mask, { raw: { width, height, channels: 1 } })
    .blur(3)
    .grayscale()
    .raw()
    .toBuffer();

  // --- 4. Generate hatching pattern ---
  const hatchBuf = Buffer.alloc(width * height);

  // Primary diagonal lines (45 degrees)
  const spacing1 = Math.max(3, 10 - lineThickness);
  for (let offset = -height; offset < width + height; offset += spacing1) {
    for (let y = 0; y < height; y++) {
      const x = offset + y;
      if (x >= 0 && x < width) {
        const idx = y * width + x;
        // Draw where subject is dark enough and within mask
        if (blurredDarkness[idx] > 40 && mask[idx] > 30) {
          hatchBuf[idx] = 255;
          if (lineThickness >= 2 && x + 1 < width) hatchBuf[y * width + x + 1] = 255;
          if (lineThickness >= 3 && x - 1 >= 0) hatchBuf[y * width + x - 1] = 255;
        }
      }
    }
  }

  // Cross-hatching (135 degrees) in darker areas
  const spacing2 = Math.max(4, 12 - lineThickness);
  for (let offset = 0; offset < width + height; offset += spacing2) {
    for (let y = 0; y < height; y++) {
      const x = offset - y + height;
      if (x >= 0 && x < width) {
        const idx = y * width + x;
        // Cross-hatch only in darker areas
        if (blurredDarkness[idx] > 90 && mask[idx] > 30) {
          hatchBuf[idx] = 255;
          if (lineThickness >= 2 && x + 1 < width) hatchBuf[y * width + x + 1] = 255;
        }
      }
    }
  }

  // --- 5. Combine contours + hatching ---
  return mergeEdges(contours, hatchBuf);
}

module.exports = { hatching };
