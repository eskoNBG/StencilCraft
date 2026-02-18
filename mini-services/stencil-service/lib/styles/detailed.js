const sharp = require("sharp");
const { sobelEdges, laplacianEdges, mergeEdges, dilate } = require("../edges");

/**
 * Detailed style: High detail, for realistic subjects.
 * Multi-scale edge detection preserves fine details.
 */
async function detailed(grayBuf, width, height, lineThickness, contrast) {
  // Light smoothing
  const smoothed1 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.2)
    .grayscale()
    .raw()
    .toBuffer();

  // Slightly more blurred for secondary pass
  const smoothed2 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.5)
    .grayscale()
    .raw()
    .toBuffer();

  const scale = 1 - (contrast - 50) / 150;

  // Multi-scale edge detection
  const [edges1, edges2, edgesLap] = await Promise.all([
    sobelEdges(smoothed1, width, height,
      Math.max(10, Math.round(25 * scale)),
      Math.max(30, Math.round(70 * scale))
    ),
    sobelEdges(smoothed2, width, height,
      Math.max(15, Math.round(40 * scale)),
      Math.max(50, Math.round(120 * scale))
    ),
    Promise.resolve(laplacianEdges(smoothed1, width, height,
      Math.max(10, Math.round(20 * scale))
    )),
  ]);

  // Merge all edge maps
  let combined = mergeEdges(edges1, edges2);
  combined = mergeEdges(combined, edgesLap);

  // Apply line thickness
  if (lineThickness > 1) {
    combined = dilate(combined, width, height, lineThickness - 1);
  }

  return combined;
}

module.exports = { detailed };
