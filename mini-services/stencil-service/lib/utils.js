/**
 * Parse a hex color string to RGB components.
 * @param {string} hex - Color in "#RRGGBB" format
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const match = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * Strip the data URL prefix from a base64 image string and return a Buffer.
 * @param {string} dataUrl - "data:image/png;base64,..."
 * @returns {Buffer}
 */
function decodeBase64Image(dataUrl) {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) throw new Error("Invalid data URL");
  return Buffer.from(dataUrl.slice(commaIdx + 1), "base64");
}

/**
 * Validate and normalize request parameters.
 * @param {object} body
 * @returns {object} Validated params with defaults applied
 */
function validateRequest(body) {
  const { image, style, lineThickness, contrast, inverted, lineColor, transparentBg } = body || {};

  if (!image || typeof image !== "string") {
    throw new Error("No image provided");
  }

  const validStyles = ["outline", "simple", "detailed", "hatching", "solid"];
  const s = style || "outline";
  if (!validStyles.includes(s)) {
    throw new Error(`Invalid style: ${s}`);
  }

  const lt = lineThickness ?? 3;
  if (lt < 1 || lt > 5) throw new Error("lineThickness must be 1-5");

  const c = contrast ?? 50;
  if (c < 0 || c > 100) throw new Error("contrast must be 0-100");

  const lc = lineColor || "#000000";
  if (!/^#[0-9a-fA-F]{6}$/.test(lc)) throw new Error("Invalid hex color");

  return {
    image,
    style: s,
    lineThickness: Math.round(lt),
    contrast: Math.round(c),
    inverted: !!inverted,
    lineColor: lc,
    transparentBg: !!transparentBg,
  };
}

module.exports = { hexToRgb, decodeBase64Image, validateRequest };
