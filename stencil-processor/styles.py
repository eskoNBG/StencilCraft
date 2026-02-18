#!/usr/bin/env python3
"""
Style generation functions for Tattoo Stencil Generator v22.0
BOTH Hatching and Solid: INVERTED (white on black) with better Solid algorithm.
"""

import cv2
import numpy as np
from typing import List
import warnings
warnings.filterwarnings('ignore')


def remove_small_objects(binary: np.ndarray, min_size: int = 10) -> np.ndarray:
    """Remove small disconnected objects."""
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8, cv2.CV_32S)
    output = np.zeros_like(binary)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_size:
            output[labels == i] = 255
    return output


# =============================================================================
# STYLE FUNCTIONS
# =============================================================================

def generate_outline(gray: np.ndarray, thickness: int = 2, contrast: int = 50) -> np.ndarray:
    """Outline style - Clean edge contours (black on white)."""
    h, w = gray.shape
    smooth = cv2.bilateralFilter(gray, 11, 75, 75)
    edges = cv2.Canny(smooth, 30, 90)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    result = np.zeros((h, w), dtype=np.uint8)
    for cnt in contours:
        if cv2.contourArea(cnt) >= 8:
            cv2.drawContours(result, [cnt], -1, 255, thickness, cv2.LINE_AA)
    return result


def generate_simple(gray: np.ndarray, thickness: int = 2, contrast: int = 50) -> np.ndarray:
    """Simple style - Clear contours only (black on white)."""
    smooth = cv2.bilateralFilter(gray, 13, 75, 75)
    blur = cv2.GaussianBlur(smooth, (7, 7), 2)
    edges = cv2.Canny(blur, 20, 60)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    result = np.zeros(gray.shape, dtype=np.uint8)
    for cnt in contours:
        if cv2.contourArea(cnt) >= 20:
            cv2.drawContours(result, [cnt], -1, 255, thickness, cv2.LINE_AA)
    return result


def generate_detailed(gray: np.ndarray, thickness: int = 1, contrast: int = 50) -> np.ndarray:
    """Detailed style - Fine edges (black on white)."""
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    edges1 = cv2.Canny(smooth, 30, 90)
    edges2 = cv2.Canny(smooth, 50, 150)
    edges = cv2.bitwise_or(edges1, edges2)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    result = np.zeros(gray.shape, dtype=np.uint8)
    for cnt in contours:
        if cv2.contourArea(cnt) >= 5:
            cv2.drawContours(result, [cnt], -1, 255, thickness, cv2.LINE_AA)
    return result


def generate_hatching(gray: np.ndarray, thickness: int = 1, contrast: int = 50, density: int = 6) -> np.ndarray:
    """
    Hatching style - INVERTED (white lines on black background).
    Quality: 7/10
    """
    h, w = gray.shape
    output = np.zeros((h, w), dtype=np.uint8)  # BLACK background
    
    smooth = cv2.bilateralFilter(gray, 11, 75, 75)
    
    # Get edges
    edges_fine = cv2.Canny(smooth, 25, 75)
    edges_detail = cv2.Canny(smooth, 40, 120)
    edges = cv2.bitwise_or(edges_fine, edges_detail)
    
    # Subject mask
    edges_dilated = cv2.dilate(edges, np.ones((15, 15), np.uint8), iterations=3)
    contours_mask, _ = cv2.findContours(edges_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    subject_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.drawContours(subject_mask, contours_mask, -1, 255, -1)
    subject_mask = cv2.erode(subject_mask, np.ones((7, 7), np.uint8), iterations=2)
    
    # Darkness map
    darkness = 255.0 - smooth.astype(np.float64)
    darkness = cv2.GaussianBlur(darkness, (15, 15), 5)
    darkness_norm = darkness / 255.0
    
    # Diagonal hatching (WHITE)
    spacing = max(10, 22 - density * 2)
    
    for offset in range(-max(h, w), max(h, w), spacing):
        for t in np.linspace(0, 1, 120):
            x = int(offset + t * h)
            y = int(t * h)
            if 0 <= x < w and 0 <= y < h and subject_mask[y, x] > 0:
                if darkness_norm[y, x] > 0.25:
                    output[y, x] = 255
    
    # Cross-hatching
    if density >= 4:
        spacing2 = int(spacing * 0.65)
        for offset in range(-max(h, w), max(h, w), spacing2):
            for t in np.linspace(0, 1, 120):
                x = int(w - offset + t * h)
                y = int(t * h)
                if 0 <= x < w and 0 <= y < h and subject_mask[y, x] > 0:
                    if darkness_norm[y, x] > 0.45:
                        output[y, x] = 255
    
    # Edge contours (WHITE)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        if cv2.contourArea(cnt) >= 5:
            cv2.drawContours(output, [cnt], -1, 255, max(1, thickness), cv2.LINE_AA)
    
    # Main contours
    main_edges = cv2.Canny(smooth, 20, 60)
    main_contours, _ = cv2.findContours(main_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in main_contours:
        if cv2.contourArea(cnt) >= 30:
            cv2.drawContours(output, [cnt], -1, 255, max(1, thickness + 1), cv2.LINE_AA)
    
    return output


def generate_solid(gray: np.ndarray, thickness: int = 1, contrast: int = 50, levels: int = 4, fill_areas: bool = True) -> np.ndarray:
    """
    Solid style - INVERTED (white on black).
    
    Better approach: Use clean contour lines instead of fills for better subject preservation.
    """
    h, w = gray.shape
    # BLACK background (inverted)
    output = np.zeros((h, w), dtype=np.uint8)
    
    smooth = cv2.bilateralFilter(gray, 11, 75, 75)
    
    # Step 1: Get main subject contours
    main_edges = cv2.Canny(smooth, 20, 60)
    main_contours, _ = cv2.findContours(main_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Draw main contours (WHITE)
    for cnt in main_contours:
        if cv2.contourArea(cnt) >= 20:
            cv2.drawContours(output, [cnt], -1, 255, thickness + 1, cv2.LINE_AA)
    
    # Step 2: Get detailed edges
    edges_detail = cv2.Canny(smooth, 30, 90)
    contours_detail, _ = cv2.findContours(edges_detail, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    # Draw detailed contours (WHITE)
    for cnt in contours_detail:
        if cv2.contourArea(cnt) >= 8:
            cv2.drawContours(output, [cnt], -1, 255, thickness, cv2.LINE_AA)
    
    # Step 3: Add posterization-based contour lines (not fills)
    blur = cv2.GaussianBlur(smooth, (7, 7), 2)
    step = 256.0 / levels
    
    for level in range(1, levels):
        threshold = int(level * step)
        # Get edges at this threshold level
        _, level_binary = cv2.threshold(blur, threshold, 255, cv2.THRESH_BINARY)
        level_edges = cv2.Canny(level_binary, 50, 150)
        level_contours, _ = cv2.findContours(level_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in level_contours:
            if cv2.contourArea(cnt) >= 15:
                cv2.drawContours(output, [cnt], -1, 255, max(1, thickness - 1), cv2.LINE_AA)
    
    return output


# =============================================================================
# STYLE DISPATCHER
# =============================================================================

STYLE_FUNCTIONS = {
    'outline': generate_outline,
    'simple': generate_simple,
    'detailed': generate_detailed,
    'hatching': generate_hatching,
    'solid': generate_solid,
}


def generate_stencil(gray: np.ndarray, style: str = 'outline', thickness: int = 3, contrast: int = 50, **kwargs) -> np.ndarray:
    """Generate stencil in specified style."""
    func = STYLE_FUNCTIONS.get(style, generate_outline)
    return func(gray, thickness=thickness, contrast=contrast, **kwargs)
