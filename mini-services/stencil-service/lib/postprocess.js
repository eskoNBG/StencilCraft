const sharp = require("sharp");
const { hexToRgb } = require("./utils");

/**
 * Post-process a binary edge buffer into a final PNG base64 data URL.
 * Includes anti-aliasing for smooth lines.
 */
async function postprocess(edgeBuf, width, height, options) {
  const { inverted, lineColor, transparentBg } = options;
  const { r, g, b } = hexToRgb(lineColor);

  // Anti-alias: apply a slight blur to the binary edges, then use the
  // resulting gradient as an alpha channel for smooth, non-jagged lines.
  const aaBuffer = await sharp(edgeBuf, { raw: { width, height, channels: 1 } })
    .blur(0.6)
    .grayscale()
    .raw()
    .toBuffer();

  const pixelCount = width * height;
  const rgba = Buffer.alloc(pixelCount * 4);

  for (let i = 0; i < pixelCount; i++) {
    // aaBuffer values: 0 = no edge, 255 = full edge, intermediate = anti-aliased
    let edgeAlpha = aaBuffer[i];
    if (inverted) edgeAlpha = 255 - edgeAlpha;

    const offset = i * 4;

    if (transparentBg) {
      // Lines are colored with alpha from edge strength
      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = edgeAlpha;
    } else {
      // Blend line color over background
      const bgVal = inverted ? 30 : 255;
      const t = edgeAlpha / 255;
      rgba[offset] = Math.round(r * t + bgVal * (1 - t));
      rgba[offset + 1] = Math.round(g * t + bgVal * (1 - t));
      rgba[offset + 2] = Math.round(b * t + bgVal * (1 - t));
      rgba[offset + 3] = 255;
    }
  }

  const pngBuffer = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

module.exports = { postprocess };
