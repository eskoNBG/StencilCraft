const sharp = require("sharp");
const { sobelEdges, mergeEdges, dilate, cleanEdges } = require("../edges");

/**
 * Solid style: Solid flat shading areas for depth.
 * Edge contours + posterization boundaries at multiple threshold levels.
 */
async function solid(grayBuf, width, height, lineThickness, contrast) {
  const scale = 1 - (contrast - 50) / 150;

  // --- 1. Main subject contours (bold) ---
  const smoothed1 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.5)
    .grayscale()
    .raw()
    .toBuffer();

  let mainContours = await sobelEdges(smoothed1, width, height,
    Math.max(8, Math.round(20 * scale)),
    Math.max(25, Math.round(60 * scale))
  );
  mainContours = dilate(mainContours, width, height, lineThickness);

  // --- 2. Detail contours ---
  const smoothed2 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.5)
    .grayscale()
    .raw()
    .toBuffer();

  let detailContours = await sobelEdges(smoothed2, width, height,
    Math.max(10, Math.round(30 * scale)),
    Math.max(30, Math.round(90 * scale))
  );
  if (lineThickness > 1) {
    detailContours = dilate(detailContours, width, height, lineThickness - 1);
  }

  // --- 3. Posterization boundaries ---
  const levels = [64, 128, 192];
  const levelEdges = await Promise.all(
    levels.map(async (thresh) => {
      // Create binary image at this quantization level
      const binary = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
        .blur(2.5)
        .threshold(thresh)
        .grayscale()
        .raw()
        .toBuffer();

      // Extract edges from the binary boundary using pixel differences
      const edges = Buffer.alloc(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const val = binary[idx];
          // Edge = pixel differs from any neighbor
          const hasEdge =
            val !== binary[(y - 1) * width + x] ||
            val !== binary[(y + 1) * width + x] ||
            val !== binary[y * width + (x - 1)] ||
            val !== binary[y * width + (x + 1)];
          if (hasEdge) edges[idx] = 255;
        }
      }

      // Thicken
      const r = Math.max(0, lineThickness - 2);
      return r > 0 ? dilate(edges, width, height, r) : edges;
    })
  );

  // Merge all level edges
  let posterEdges = levelEdges[0];
  for (let i = 1; i < levelEdges.length; i++) {
    posterEdges = mergeEdges(posterEdges, levelEdges[i]);
  }

  // --- 4. Combine all ---
  let combined = mergeEdges(mainContours, detailContours);
  combined = mergeEdges(combined, posterEdges);

  return combined;
}

module.exports = { solid };
