const sharp = require("sharp");
const { cannyEdges, laplacianEdges, mergeEdges, dilate } = require("../edges");

/**
 * Detailed style: Multi-scale edges for high-detail realistic stencils.
 * Combines fine and coarse edges. NMS keeps lines thin and crisp.
 */
async function detailed(grayBuf, width, height, lineThickness, contrast) {
  const smoothed1 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.0)
    .grayscale()
    .raw()
    .toBuffer();

  const smoothed2 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.0)
    .grayscale()
    .raw()
    .toBuffer();

  const factor = 1 - (contrast - 50) / 100;

  const [edges1, edges2, edgesLap] = await Promise.all([
    cannyEdges(smoothed1, width, height,
      Math.max(6, Math.round(12 * factor)),
      Math.max(15, Math.round(35 * factor)),
      true
    ),
    cannyEdges(smoothed2, width, height,
      Math.max(10, Math.round(20 * factor)),
      Math.max(25, Math.round(60 * factor)),
      true
    ),
    Promise.resolve(laplacianEdges(smoothed1, width, height,
      Math.max(8, Math.round(18 * factor))
    )),
  ]);

  let combined = mergeEdges(edges1, edges2);
  combined = mergeEdges(combined, edgesLap);

  if (lineThickness > 1) {
    combined = dilate(combined, width, height, lineThickness - 1);
  }

  return combined;
}

module.exports = { detailed };
