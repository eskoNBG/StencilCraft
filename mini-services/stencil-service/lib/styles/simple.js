const sharp = require("sharp");
const { cannyEdges, dilate, morphOpen } = require("../edges");

/**
 * Simple style: Bold contours with reduced detail.
 * Heavier blur suppresses fine detail, keeping only major shapes.
 */
async function simple(grayBuf, width, height, lineThickness, contrast) {
  const smoothed = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.5)
    .grayscale()
    .raw()
    .toBuffer();

  const factor = 1 - (contrast - 50) / 100;
  const low = Math.max(8, Math.round(15 * factor));
  const high = Math.max(18, Math.round(45 * factor));

  // No NMS — simple style wants bold, simplified contours, not thin lines
  let edges = await cannyEdges(smoothed, width, height, low, high, false);

  edges = morphOpen(edges, width, height, 1);

  // Bold lines
  edges = dilate(edges, width, height, Math.max(1, lineThickness));

  return edges;
}

module.exports = { simple };
