const sharp = require("sharp");
const { cannyEdges, dilate } = require("../edges");

/**
 * Outline style: Clean, thin edge outlines for fine tattoos.
 * Uses two scales — fine edges (light blur) and structural edges (heavier blur)
 * merged together for complete contours. NMS keeps lines thin.
 */
async function outline(grayBuf, width, height, lineThickness, contrast) {
  // Fine-scale edges: light blur preserves detail
  const smoothed1 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.0)
    .grayscale()
    .raw()
    .toBuffer();

  // Structural edges: heavier blur for major contours
  const smoothed2 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.0)
    .grayscale()
    .raw()
    .toBuffer();

  const factor = 1 - (contrast - 50) / 100;

  const [fineEdges, structEdges] = await Promise.all([
    cannyEdges(smoothed1, width, height,
      Math.max(5, Math.round(10 * factor)),
      Math.max(12, Math.round(25 * factor)),
      true
    ),
    cannyEdges(smoothed2, width, height,
      Math.max(8, Math.round(15 * factor)),
      Math.max(18, Math.round(40 * factor)),
      false // no NMS on structural — keeps continuous contours
    ),
  ]);

  // Merge: fine NMS edges for detail + structural for complete outlines
  const merged = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    merged[i] = (fineEdges[i] || structEdges[i]) ? 255 : 0;
  }

  // Apply line thickness
  if (lineThickness > 1) {
    return dilate(merged, width, height, lineThickness - 1);
  }

  return merged;
}

module.exports = { outline };
