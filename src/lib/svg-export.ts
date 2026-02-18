/**
 * SVG Export - Converts stencil bitmap to SVG vector format
 * Uses canvas-based threshold tracing for clean stencil line art
 */

export async function convertToSvg(stencilImageDataUrl: string): Promise<string> {
  const img = await loadImage(stencilImageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Convert to black/white threshold
  const paths = traceImageToSvgPaths(imageData);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  <rect width="100%" height="100%" fill="white"/>
  ${paths}
</svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Simple run-length based SVG path tracing for stencil images.
 * Groups dark pixels into horizontal runs and outputs them as filled rectangles.
 */
function traceImageToSvgPaths(imageData: ImageData): string {
  const { width, height, data } = imageData;
  const threshold = 128;
  const rects: string[] = [];

  for (let y = 0; y < height; y++) {
    let runStart = -1;
    for (let x = 0; x <= width; x++) {
      const idx = (y * width + x) * 4;
      const isDark = x < width && (data[idx] + data[idx + 1] + data[idx + 2]) / 3 < threshold;

      if (isDark && runStart === -1) {
        runStart = x;
      } else if (!isDark && runStart !== -1) {
        rects.push(`<rect x="${runStart}" y="${y}" width="${x - runStart}" height="1" fill="black"/>`);
        runStart = -1;
      }
    }
  }

  // Optimization: group into larger rectangles if the output is huge
  if (rects.length > 50000) {
    // Fall back to embedded image in SVG for very complex stencils
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    return `<image href="${dataUrl}" width="${imageData.width}" height="${imageData.height}"/>`;
  }

  return rects.join("\n  ");
}

export function downloadSvg(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
