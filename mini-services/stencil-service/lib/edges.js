const sharp = require("sharp");

/**
 * Helper: create a sharp instance from a single-channel raw buffer.
 */
function fromRaw(buf, width, height) {
  return sharp(buf, { raw: { width, height, channels: 1 } });
}

/**
 * Helper: extract single-channel raw buffer, ensuring we stay in grayscale.
 * Sharp may internally convert to sRGB, so we force grayscale + raw on output.
 */
async function toRaw(pipeline) {
  return pipeline.grayscale().raw().toBuffer();
}

/**
 * Sobel edge detection.
 *
 * Instead of using convolve with offset tricks, we use a simpler approach:
 * Apply Sobel via convolve with proper normalization, then threshold.
 *
 * Sharp's convolve formula: output = clamp((sum of kernel*pixel) / scale + offset, 0, 255)
 * For Sobel, we want the absolute gradient magnitude.
 *
 * Approach: Run two passes (horizontal and vertical edge emphasis via blur differences),
 * then combine in raw buffer math.
 */
async function sobelEdges(grayBuf, width, height, lowThreshold = 30, highThreshold = 90) {
  // Use difference-of-gaussians approach for more reliable edge detection
  // than trying to use convolve with signed kernels.

  // Slightly blurred version (preserves edges)
  const blurSmall = await toRaw(fromRaw(grayBuf, width, height).blur(1.0));
  // More blurred version (smooths edges)
  const blurLarge = await toRaw(fromRaw(grayBuf, width, height).blur(2.0));

  // Difference of Gaussians gives edge-like response
  const dog = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    dog[i] = Math.abs(blurSmall[i] - blurLarge[i]);
  }

  // Also compute simple gradient via pixel differences (Sobel-like)
  const gradMag = Buffer.alloc(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Sobel X approximation
      const gx =
        -grayBuf[(y - 1) * width + (x - 1)] - 2 * grayBuf[y * width + (x - 1)] - grayBuf[(y + 1) * width + (x - 1)]
        + grayBuf[(y - 1) * width + (x + 1)] + 2 * grayBuf[y * width + (x + 1)] + grayBuf[(y + 1) * width + (x + 1)];
      // Sobel Y approximation
      const gy =
        -grayBuf[(y - 1) * width + (x - 1)] - 2 * grayBuf[(y - 1) * width + x] - grayBuf[(y - 1) * width + (x + 1)]
        + grayBuf[(y + 1) * width + (x - 1)] + 2 * grayBuf[(y + 1) * width + x] + grayBuf[(y + 1) * width + (x + 1)];

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) / 4);
      gradMag[idx] = Math.round(mag);
    }
  }

  // Combine DoG and gradient magnitude
  const combined = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    combined[i] = Math.min(255, gradMag[i] + dog[i] * 2);
  }

  // Apply double-threshold (hysteresis)
  const strong = Buffer.alloc(width * height);
  const weak = Buffer.alloc(width * height);

  for (let i = 0; i < width * height; i++) {
    if (combined[i] >= highThreshold) {
      strong[i] = 255;
    } else if (combined[i] >= lowThreshold) {
      weak[i] = 255;
    }
  }

  // Promote weak edges adjacent to strong edges (2 passes for connectivity)
  const result = Buffer.from(strong);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (weak[idx] && !result[idx]) {
          // Check 8-neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (result[(y + dy) * width + (x + dx)]) {
                result[idx] = 255;
                break;
              }
            }
            if (result[idx]) break;
          }
        }
      }
    }
  }

  return result;
}

/**
 * Laplacian edge detection via raw buffer math.
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

/**
 * OR two binary edge buffers together.
 */
function mergeEdges(a, b) {
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = (a[i] || b[i]) ? 255 : 0;
  }
  return result;
}

/**
 * Morphological dilation on a binary buffer (pure JS, no sharp convolve issues).
 */
function dilate(buf, width, height, radius) {
  if (radius <= 0) return buf;
  const result = Buffer.alloc(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (buf[ny * width + nx]) found = true;
          }
        }
      }
      if (found) result[y * width + x] = 255;
    }
  }

  return result;
}

/**
 * Clean small noise from a binary edge buffer using morphological erosion then dilation.
 */
function cleanEdges(buf, width, height, size = 1) {
  // Erode: only keep pixels where ALL neighbors within `size` are also set
  const eroded = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!buf[y * width + x]) continue;
      let allSet = true;
      for (let dy = -size; dy <= size && allSet; dy++) {
        for (let dx = -size; dx <= size && allSet; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (!buf[ny * width + nx]) allSet = false;
          } else {
            allSet = false;
          }
        }
      }
      if (allSet) eroded[y * width + x] = 255;
    }
  }

  // Dilate back to restore edge thickness
  return dilate(eroded, width, height, size);
}

module.exports = { sobelEdges, laplacianEdges, mergeEdges, dilate, cleanEdges };
