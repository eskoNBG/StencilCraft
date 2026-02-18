const { outline } = require("./outline");
const { simple } = require("./simple");
const { detailed } = require("./detailed");
const { hatching } = require("./hatching");
const { solid } = require("./solid");

const styles = { outline, simple, detailed, hatching, solid };

/**
 * Generate a stencil using the specified style.
 * @param {string} style - One of: outline, simple, detailed, hatching, solid
 * @param {Buffer} grayBuf - Preprocessed single-channel grayscale buffer
 * @param {number} width
 * @param {number} height
 * @param {number} lineThickness - 1-5
 * @param {number} contrast - 0-100
 * @returns {Promise<Buffer>} Binary edge buffer (255 = line, 0 = background)
 */
async function generateStyle(style, grayBuf, width, height, lineThickness, contrast) {
  const fn = styles[style];
  if (!fn) throw new Error(`Unknown style: ${style}`);
  return fn(grayBuf, width, height, lineThickness, contrast);
}

module.exports = { generateStyle };
