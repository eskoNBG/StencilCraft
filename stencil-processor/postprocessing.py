#!/usr/bin/env python3
"""
Post-processing functions for Tattoo Stencil Generator.
Handles smoothing, final cleanup, vectorization, and output formatting.
"""

import cv2
import numpy as np
from typing import Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


def smooth_lines(binary: np.ndarray, 
                  method: str = 'gaussian',
                  strength: float = 0.5) -> np.ndarray:
    """
    Smooth jagged lines to reduce aliasing.
    
    Args:
        binary: Binary edge image (255 = lines)
        method: Smoothing method ('gaussian', 'morphological')
        strength: Smoothing strength
        
    Returns:
        Smoothed binary image
    """
    if method == 'gaussian':
        # Small Gaussian blur + threshold
        kernel_size = max(3, int(strength * 5))
        if kernel_size % 2 == 0:
            kernel_size += 1
        
        blurred = cv2.GaussianBlur(binary, (kernel_size, kernel_size), strength)
        _, result = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
        
    elif method == 'morphological':
        # Opening followed by closing
        kernel_size = max(2, int(strength * 3))
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        
        result = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        result = cv2.morphologyEx(result, cv2.MORPH_CLOSE, kernel)
    else:
        result = binary.copy()
    
    return result


def enhance_line_continuity(binary: np.ndarray, 
                            max_gap: int = 3) -> np.ndarray:
    """
    Connect small gaps in lines.
    
    Args:
        binary: Binary edge image
        max_gap: Maximum gap size to close
        
    Returns:
        Gap-closed image
    """
    kernel = np.ones((max_gap, max_gap), np.uint8)
    
    # Close gaps
    closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    # Remove artifacts created by closing
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel)
    
    return opened


def apply_anti_aliasing(binary: np.ndarray) -> np.ndarray:
    """
    Apply anti-aliasing to binary image edges.
    
    Args:
        binary: Binary image
        
    Returns:
        Anti-aliased image (grayscale with soft edges)
    """
    # Distance transform for smooth edges
    dist = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
    
    # Normalize and threshold
    dist = cv2.normalize(dist, None, 0, 255, cv2.NORM_MINMAX)
    
    # Apply slight blur
    result = cv2.GaussianBlur(dist.astype(np.uint8), (3, 3), 0.5)
    
    # Threshold back to binary but with softer edges
    _, result = cv2.threshold(result, 20, 255, cv2.THRESH_BINARY)
    
    return result


def binary_to_rgba(binary: np.ndarray, 
                    line_color: Tuple[int, int, int] = (0, 0, 0),
                    background_color: Tuple[int, int, int] = (255, 255, 255),
                    transparent_bg: bool = True) -> np.ndarray:
    """
    Convert binary stencil to RGBA format.
    
    Args:
        binary: Binary image (255 = lines, 0 = background)
        line_color: BGR color for lines
        background_color: BGR color for background
        transparent_bg: Whether background should be transparent
        
    Returns:
        BGRA image
    """
    h, w = binary.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    
    # Lines are white (255) in binary, background is black (0)
    # We want lines to be the line_color, background to be transparent/white
    
    # Set background
    if transparent_bg:
        rgba[:, :, 3] = 0  # Transparent background
    else:
        rgba[:, :, :3] = background_color
        rgba[:, :, 3] = 255
    
    # Set lines
    line_mask = binary == 255
    rgba[line_mask, 0] = line_color[0]  # B
    rgba[line_mask, 1] = line_color[1]  # G
    rgba[line_mask, 2] = line_color[2]  # R
    rgba[line_mask, 3] = 255  # Opaque
    
    return rgba


def add_margin(image: np.ndarray, 
               margin: int = 50,
               color: Tuple[int, int, int, int] = (255, 255, 255, 0)) -> np.ndarray:
    """
    Add margin around the image.
    
    Args:
        image: Input image
        margin: Margin size in pixels
        color: Background color (BGRA)
        
    Returns:
        Image with margin
    """
    if len(image.shape) == 2:
        # Grayscale
        h, w = image.shape
        result = np.ones((h + 2*margin, w + 2*margin), dtype=np.uint8) * 255
        result[margin:margin+h, margin:margin+w] = image
    else:
        # Color
        h, w, c = image.shape
        result = np.ones((h + 2*margin, w + 2*margin, c), dtype=np.uint8)
        result[:, :] = color
        result[margin:margin+h, margin:margin+w] = image
    
    return result


def center_on_canvas(image: np.ndarray,
                     canvas_size: Tuple[int, int],
                     color: Tuple[int, int, int, int] = (255, 255, 255, 0)) -> np.ndarray:
    """
    Center image on a larger canvas.
    
    Args:
        image: Input image
        canvas_size: (width, height) of target canvas
        color: Background color
        
    Returns:
        Centered image
    """
    target_w, target_h = canvas_size
    
    if len(image.shape) == 2:
        h, w = image.shape
        c = 1
    else:
        h, w, c = image.shape
    
    # Create canvas
    if c == 1:
        result = np.ones((target_h, target_w), dtype=np.uint8) * 255
    else:
        result = np.ones((target_h, target_w, c), dtype=np.uint8)
        result[:, :] = color
    
    # Calculate position
    x = (target_w - w) // 2
    y = (target_h - h) // 2
    
    # Ensure we don't go out of bounds
    if w > target_w or h > target_h:
        # Scale down to fit
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        x = (target_w - new_w) // 2
        y = (target_h - new_h) // 2
        h, w = new_h, new_w
    
    # Place image
    if c == 1:
        result[y:y+h, x:x+w] = image
    else:
        result[y:y+h, x:x+w] = image
    
    return result


def vectorize_to_svg(binary: np.ndarray, 
                      output_path: str,
                      smooth: bool = True) -> bool:
    """
    Convert binary stencil to SVG format.
    
    Args:
        binary: Binary edge image
        output_path: Path to save SVG
        smooth: Whether to smooth contours
        
    Returns:
        True if successful
    """
    try:
        # Try using potrace
        import subprocess
        import tempfile
        import os
        
        # Save as temporary BMP
        with tempfile.NamedTemporaryFile(suffix='.bmp', delete=False) as f:
            temp_bmp = f.name
            cv2.imwrite(temp_bmp, binary)
        
        # Run potrace
        result = subprocess.run(
            ['potrace', '-s', '-o', output_path, temp_bmp],
            capture_output=True
        )
        
        # Clean up
        os.unlink(temp_bmp)
        
        return result.returncode == 0
        
    except (ImportError, FileNotFoundError):
        # Fallback: manual SVG generation
        return manual_svg_export(binary, output_path, smooth)


def manual_svg_export(binary: np.ndarray, 
                       output_path: str,
                       smooth: bool = True) -> bool:
    """
    Manually export contours to SVG without potrace.
    
    Args:
        binary: Binary edge image
        output_path: Output SVG path
        smooth: Whether to smooth contours
        
    Returns:
        True if successful
    """
    h, w = binary.shape
    
    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Generate SVG
    svg_parts = [
        f'<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
        f'<g fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    ]
    
    for contour in contours:
        if len(contour) < 2:
            continue
        
        # Build path
        path_parts = []
        
        # Start point
        x, y = contour[0][0]
        path_parts.append(f'M {x} {y}')
        
        # Line to subsequent points
        for point in contour[1:]:
            x, y = point[0]
            path_parts.append(f'L {x} {y}')
        
        # Close path
        path_parts.append('Z')
        
        svg_parts.append(f'<path d="{" ".join(path_parts)}" />')
    
    svg_parts.extend(['</g>', '</svg>'])
    
    # Write to file
    with open(output_path, 'w') as f:
        f.write('\n'.join(svg_parts))
    
    return True


def finalize_stencil(binary: np.ndarray,
                     smooth: bool = True,
                     line_color: Tuple[int, int, int] = (0, 0, 0),
                     transparent_bg: bool = True) -> np.ndarray:
    """
    Final processing steps for stencil output.
    
    Args:
        binary: Binary stencil image (255 = lines)
        smooth: Whether to apply smoothing
        line_color: BGR color for lines
        transparent_bg: Whether background should be transparent
        
    Returns:
        Final BGRA stencil image
    """
    # Optional smoothing
    if smooth:
        binary = smooth_lines(binary, method='gaussian', strength=0.3)
    
    # Convert to RGBA
    rgba = binary_to_rgba(binary, line_color=line_color, transparent_bg=transparent_bg)
    
    return rgba


def create_preview_comparison(original: np.ndarray, 
                               stencil: np.ndarray) -> np.ndarray:
    """
    Create a side-by-side comparison image.
    
    Args:
        original: Original image (BGR)
        stencil: Stencil image (BGRA or binary)
        
    Returns:
        Comparison image
    """
    # Ensure same height
    h1, w1 = original.shape[:2]
    h2, w2 = stencil.shape[:2]
    
    target_h = max(h1, h2)
    
    # Resize if needed
    if h1 != target_h:
        scale = target_h / h1
        original = cv2.resize(original, (int(w1 * scale), target_h))
    
    if h2 != target_h:
        scale = target_h / h2
        stencil = cv2.resize(stencil, (int(w2 * scale), target_h))
    
    # Convert stencil to BGR if needed
    if len(stencil.shape) == 2:
        stencil_bgr = cv2.cvtColor(stencil, cv2.COLOR_GRAY2BGR)
    elif stencil.shape[2] == 4:
        stencil_bgr = cv2.cvtColor(stencil, cv2.COLOR_BGRA2BGR)
    else:
        stencil_bgr = stencil
    
    # Concatenate
    comparison = np.hstack([original, stencil_bgr])
    
    # Add divider line
    w1_new = original.shape[1]
    cv2.line(comparison, (w1_new, 0), (w1_new, target_h), (128, 128, 128), 2)
    
    return comparison
