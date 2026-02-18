const sharp = require("sharp");

// ─── Sobel gradient computation ───────────────────────────────────────────────

/**
 * Compute Sobel gradient magnitude and direction for every pixel.
 */
function sobelGradient(grayBuf, width, height) {
  const size = width * height;
  const magnitude = new Float32Array(size);
  const direction = new Float32Array(size);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -grayBuf[(y - 1) * width + (x - 1)] - 2 * grayBuf[y * width + (x - 1)] - grayBuf[(y + 1) * width + (x - 1)]
        + grayBuf[(y - 1) * width + (x + 1)] + 2 * grayBuf[y * width + (x + 1)] + grayBuf[(y + 1) * width + (x + 1)];
      const gy =
        -grayBuf[(y - 1) * width + (x - 1)] - 2 * grayBuf[(y - 1) * width + x] - grayBuf[(y - 1) * width + (x + 1)]
        + grayBuf[(y + 1) * width + (x - 1)] + 2 * grayBuf[(y + 1) * width + x] + grayBuf[(y + 1) * width + (x + 1)];

      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

// ─── Non-maximum suppression ──────────────────────────────────────────────────

/**
 * Thin edges to 1px width by suppressing non-maximum gradient values.
 */
function nonMaxSuppression(magnitude, direction, width, height) {
  const suppressed = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const mag = magnitude[idx];
      if (mag === 0) continue;

      let angle = direction[idx] * (180 / Math.PI);
      if (angle < 0) angle += 180;

      let n1, n2;
      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        n1 = magnitude[y * width + (x - 1)];
        n2 = magnitude[y * width + (x + 1)];
      } else if (angle >= 22.5 && angle < 67.5) {
        n1 = magnitude[(y - 1) * width + (x + 1)];
        n2 = magnitude[(y + 1) * width + (x - 1)];
      } else if (angle >= 67.5 && angle < 112.5) {
        n1 = magnitude[(y - 1) * width + x];
        n2 = magnitude[(y + 1) * width + x];
      } else {
        n1 = magnitude[(y - 1) * width + (x - 1)];
        n2 = magnitude[(y + 1) * width + (x + 1)];
      }

      suppressed[idx] = (mag >= n1 && mag >= n2) ? mag : 0;
    }
  }

  return suppressed;
}

// ─── Canny-like edge detection ────────────────────────────────────────────────

/**
 * Full Canny-like edge detection:
 * 1. Sobel gradient
 * 2. Non-maximum suppression (1px thin edges)
 * 3. Double threshold with global percentile-based values
 * 4. Hysteresis
 *
 * @param {Buffer} grayBuf
 * @param {number} width
 * @param {number} height
 * @param {number} lowThreshold - Absolute low threshold for weak edges
 * @param {number} highThreshold - Absolute high threshold for strong edges
 * @param {boolean} useNMS - Whether to apply non-maximum suppression
 */
async function cannyEdges(grayBuf, width, height, lowThreshold = 20, highThreshold = 50, useNMS = true) {
  const { magnitude, direction } = sobelGradient(grayBuf, width, height);

  // Optional NMS for thinner lines
  const edgeMag = useNMS
    ? nonMaxSuppression(magnitude, direction, width, height)
    : magnitude;

  const size = width * height;

  // Double-threshold
  const edges = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    if (edgeMag[i] >= highThreshold) {
      edges[i] = 255; // Strong
    } else if (edgeMag[i] >= lowThreshold) {
      edges[i] = 128; // Weak
    }
  }

  // Hysteresis: promote weak edges connected to strong edges (3 passes)
  const result = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    if (edges[i] === 255) result[i] = 255;
  }

  for (let pass = 0; pass < 3; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (edges[idx] !== 128 || result[idx]) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (result[(y + dy) * width + (x + dx)] === 255) {
              result[idx] = 255;
              dy = 2; // break outer
              break;
            }
          }
        }
      }
    }
  }

  return result;
}

/**
 * Simple gradient-magnitude edge detection (no NMS, for posterization).
 */
function simpleEdges(grayBuf, width, height, threshold = 30) {
  const { magnitude } = sobelGradient(grayBuf, width, height);
  const edges = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    edges[i] = magnitude[i] >= threshold ? 255 : 0;
  }
  return edges;
}

/**
 * Laplacian edge detection for fine detail.
 */
function laplacianEdges(grayBuf, width, height, threshold = 30) {
  const edges = Buffer.alloc(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap =
        -grayBuf[(y - 1) * width + x]
        - grayBuf[y * width + (x - 1)]
        + 4 * grayBuf[idx]
        - grayBuf[y * width + (x + 1)]
        - grayBuf[(y + 1) * width + x];
      edges[idx] = Math.abs(lap) >= threshold ? 255 : 0;
    }
  }
  return edges;
}

// ─── Utility operations ───────────────────────────────────────────────────────

function mergeEdges(a, b) {
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = (a[i] || b[i]) ? 255 : 0;
  }
  return result;
}

function dilate(buf, width, height, radius) {
  if (radius <= 0) return buf;
  const result = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    const yMin = Math.max(0, y - radius), yMax = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - radius), xMax = Math.min(width - 1, x + radius);
      let found = false;
      for (let ny = yMin; ny <= yMax && !found; ny++) {
        for (let nx = xMin; nx <= xMax && !found; nx++) {
          if (buf[ny * width + nx]) found = true;
        }
      }
      if (found) result[y * width + x] = 255;
    }
  }
  return result;
}

function erode(buf, width, height, radius) {
  if (radius <= 0) return buf;
  const result = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    const yMin = Math.max(0, y - radius), yMax = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - radius), xMax = Math.min(width - 1, x + radius);
      let allSet = true;
      for (let ny = yMin; ny <= yMax && allSet; ny++) {
        for (let nx = xMin; nx <= xMax && allSet; nx++) {
          if (!buf[ny * width + nx]) allSet = false;
        }
      }
      if (allSet) result[y * width + x] = 255;
    }
  }
  return result;
}

function morphOpen(buf, width, height, radius = 1) {
  return dilate(erode(buf, width, height, radius), width, height, radius);
}

module.exports = {
  sobelGradient, cannyEdges, simpleEdges, laplacianEdges,
  mergeEdges, dilate, erode, morphOpen,
};
