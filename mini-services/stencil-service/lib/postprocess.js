const sharp = require("sharp");
const { hexToRgb } = require("./utils");

/**
 * Post-process a binary edge buffer into a final PNG base64 data URL.
 *
 * @param {Buffer} edgeBuf - Binary single-channel buffer (255 = edge, 0 = bg)
 * @param {number} width
 * @param {number} height
 * @param {object} options
 * @param {boolean} options.inverted
 * @param {string} options.lineColor
 * @param {boolean} options.transparentBg
 * @returns {Promise<string>} "data:image/png;base64,..."
 */
async function postprocess(edgeBuf, width, height, options) {
  const { inverted, lineColor, transparentBg } = options;
  const { r, g, b } = hexToRgb(lineColor);

  // Build RGBA output directly from the binary edge buffer
  const pixelCount = width * height;
  const rgba = Buffer.alloc(pixelCount * 4);

  for (let i = 0; i < pixelCount; i++) {
    const isLine = inverted ? (edgeBuf[i] === 0) : (edgeBuf[i] === 255);
    const offset = i * 4;

    if (isLine) {
      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = 255;
    } else if (transparentBg) {
      // All zeros = fully transparent (already initialized)
    } else {
      // Background color: white for normal, dark for inverted
      const bg = inverted ? 30 : 255;
      rgba[offset] = bg;
      rgba[offset + 1] = bg;
      rgba[offset + 2] = bg;
      rgba[offset + 3] = 255;
    }
  }

  // Encode to PNG
  const pngBuffer = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

module.exports = { postprocess };
