const sharp = require("sharp");
const { sobelEdges, dilate } = require("../edges");

/**
 * Simple style: Reduced detail, ideal for smaller tattoos.
 * Moderate smoothing — fewer fine details than outline, but keeps major shapes.
 */
async function simple(grayBuf, width, height, lineThickness, contrast) {
  // Moderate smoothing — stronger than outline but not so heavy it kills edges
  const smoothed = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.0)
    .grayscale()
    .raw()
    .toBuffer();

  const scale = 1 - (contrast - 50) / 100;
  const low = Math.max(6, Math.round(15 * scale));
  const high = Math.max(18, Math.round(50 * scale));

  let edges = await sobelEdges(smoothed, width, height, low, high);

  // Slightly thicker lines than outline for bolder look
  edges = dilate(edges, width, height, lineThickness);

  return edges;
}

module.exports = { simple };
