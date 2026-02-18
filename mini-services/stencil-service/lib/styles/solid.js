const sharp = require("sharp");
const { cannyEdges, mergeEdges, dilate } = require("../edges");
const { detectSubjectMask } = require("../preprocess");

/**
 * Solid style: Bold outlines with posterization shading regions.
 */
async function solid(grayBuf, width, height, lineThickness, contrast) {
  const factor = 1 - (contrast - 50) / 100;

  // --- 1. Main bold contours ---
  const smoothed1 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(2.0)
    .grayscale()
    .raw()
    .toBuffer();

  let mainContours = await cannyEdges(smoothed1, width, height,
    Math.max(8, Math.round(15 * factor)),
    Math.max(20, Math.round(45 * factor)),
    true
  );
  mainContours = dilate(mainContours, width, height, lineThickness);

  // --- 2. Detail contours ---
  const smoothed2 = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
    .blur(1.2)
    .grayscale()
    .raw()
    .toBuffer();

  let detailContours = await cannyEdges(smoothed2, width, height,
    Math.max(6, Math.round(12 * factor)),
    Math.max(18, Math.round(40 * factor)),
    true
  );
  if (lineThickness > 1) {
    detailContours = dilate(detailContours, width, height, lineThickness - 1);
  }

  // --- 3. Posterization boundaries ---
  const levels = [64, 128, 192];
  const levelEdges = await Promise.all(
    levels.map(async (thresh) => {
      const binary = await sharp(grayBuf, { raw: { width, height, channels: 1 } })
        .blur(2.5)
        .threshold(thresh)
        .grayscale()
        .raw()
        .toBuffer();

      const edges = Buffer.alloc(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const val = binary[idx];
          if (
            val !== binary[(y - 1) * width + x] ||
            val !== binary[(y + 1) * width + x] ||
            val !== binary[y * width + (x - 1)] ||
            val !== binary[y * width + (x + 1)]
          ) {
            edges[idx] = 255;
          }
        }
      }
      const r = Math.max(0, lineThickness - 2);
      return r > 0 ? dilate(edges, width, height, r) : edges;
    })
  );

  let posterEdges = levelEdges[0];
  for (let i = 1; i < levelEdges.length; i++) {
    posterEdges = mergeEdges(posterEdges, levelEdges[i]);
  }

  // --- 4. Fill darkest regions solid ---
  const subjectMask = detectSubjectMask(grayBuf, width, height);
  const solidFill = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    if (grayBuf[i] < 50 && subjectMask[i]) solidFill[i] = 255;
  }

  // --- 5. Combine ---
  let combined = mergeEdges(mainContours, detailContours);
  combined = mergeEdges(combined, posterEdges);
  combined = mergeEdges(combined, solidFill);

  return combined;
}

module.exports = { solid };
