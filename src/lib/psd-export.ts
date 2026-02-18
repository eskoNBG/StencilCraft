/**
 * PSD Export Utility for Procreate Compatibility
 * Creates layered PSD files that can be imported into Procreate
 */

import { writePsd } from 'ag-psd';
import type { Psd, Layer } from 'ag-psd';

// Paper size presets in pixels at different DPI
export const PAPER_SIZES = {
  a4: {
    name: 'A4 (210×297mm)',
    sizes: {
      72: { width: 595, height: 842 },
      150: { width: 1240, height: 1754 },
      300: { width: 2480, height: 3508 },
    },
  },
  a5: {
    name: 'A5 (148×210mm)',
    sizes: {
      72: { width: 420, height: 595 },
      150: { width: 874, height: 1240 },
      300: { width: 1748, height: 2480 },
    },
  },
  letter: {
    name: 'Letter (8.5×11")',
    sizes: {
      72: { width: 612, height: 792 },
      150: { width: 1275, height: 1650 },
      300: { width: 2550, height: 3300 },
    },
  },
  tattoo: {
    name: 'Tattoo Standard (4×6")',
    sizes: {
      72: { width: 288, height: 432 },
      150: { width: 600, height: 900 },
      300: { width: 1200, height: 1800 },
    },
  },
  original: {
    name: 'Originalgröße',
    sizes: null, // Use original image size
  },
};

export type PaperSizeKey = keyof typeof PAPER_SIZES;
export type DPIOption = 72 | 150 | 300;

export interface ExportOptions {
  paperSize: PaperSizeKey;
  dpi: DPIOption;
  format: 'png' | 'psd' | 'svg';
  includeOriginal: boolean;
  includeStencil: boolean;
}

/**
 * Load an image from base64 data URL
 */
async function loadImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataURL;
  });
}

/**
 * Create a canvas from an image with specified dimensions
 */
function createCanvas(img: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  
  // Calculate scaling to fit image while preserving aspect ratio
  const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;
  
  // Fill with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  
  // Draw image centered
  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  
  return canvas;
}

/**
 * Create a PSD file with layers
 */
export async function createPsdWithLayers(
  originalImage: string,
  stencilImage: string,
  options: ExportOptions
): Promise<ArrayBuffer> {
  const originalImg = await loadImageFromDataURL(originalImage);
  const stencilImg = await loadImageFromDataURL(stencilImage);
  
  // Determine dimensions
  let width: number, height: number;
  
  if (options.paperSize === 'original' || !PAPER_SIZES[options.paperSize].sizes) {
    width = originalImg.width;
    height = originalImg.height;
  } else {
    const size = PAPER_SIZES[options.paperSize].sizes![options.dpi];
    width = size.width;
    height = size.height;
  }
  
  // Create layers
  const layers: Layer[] = [];
  
  if (options.includeStencil) {
    const stencilCanvas = createCanvas(stencilImg, width, height);
    layers.push({
      name: 'Stencil',
      canvas: stencilCanvas,
      opacity: 255,
      hidden: false,
      blendMode: 'normal',
    });
  }
  
  if (options.includeOriginal) {
    const originalCanvas = createCanvas(originalImg, width, height);
    layers.push({
      name: 'Original',
      canvas: originalCanvas,
      opacity: Math.round(0.5 * 255), // 50% opacity for reference
      hidden: false,
      blendMode: 'multiply',
    });
  }
  
  // Create PSD
  const psd: Psd = {
    width,
    height,
    channels: 4, // RGBA
    bitsPerChannel: 8,
    colorMode: 3, // RGB
    children: layers,
    imageResources: {
      // Set DPI for proper printing
      resolutionInfo: {
        horizontalResolution: options.dpi,
        horizontalResolutionUnit: 'PPI',
        widthUnit: 'Inches',
        verticalResolution: options.dpi,
        verticalResolutionUnit: 'PPI',
        heightUnit: 'Inches',
      },
    },
  };
  
  return writePsd(psd);
}

/**
 * Export as high-resolution PNG
 */
export async function exportAsPng(
  stencilImage: string,
  options: ExportOptions
): Promise<Blob> {
  const img = await loadImageFromDataURL(stencilImage);
  
  let width: number, height: number;
  
  if (options.paperSize === 'original' || !PAPER_SIZES[options.paperSize].sizes) {
    width = img.width;
    height = img.height;
  } else {
    const size = PAPER_SIZES[options.paperSize].sizes![options.dpi];
    width = size.width;
    height = size.height;
  }
  
  const canvas = createCanvas(img, width, height);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

/**
 * Download a file
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: 'png' | 'psd' | 'svg', style: string): string {
  const date = new Date();
  const timestamp = date.toISOString().slice(0, 10);
  return `stencilcraft-stencil-${style}-${timestamp}.${format}`;
}
