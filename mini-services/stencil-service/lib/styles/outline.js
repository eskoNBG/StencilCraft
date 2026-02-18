const sharp = require("sharp");
const { sobelEdges, dilate } = require("../edges");

/**
 * Outline style: Clean edge outlines, perfect for fine tattoos.
 */
async function outline(grayBuf, width, height, lineThickness, contrast) {
  // Light smoothing only — preserve edges
  const smoothed = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.5)
    .grayscale()
    .raw()
    .toBuffer();

  // Lower thresholds for better edge pickup
  const scale = 1 - (contrast - 50) / 100;
  const low = Math.max(5, Math.round(15 * scale));
  const high = Math.max(15, Math.round(45 * scale));

  let edges = await sobelEdges(smoothed, width, height, low, high);

  // Apply line thickness (always at least 1px dilation for visible lines)
  edges = dilate(edges, width, height, Math.max(1, lineThickness - 1));

  return edges;
}

module.exports = { outline };
