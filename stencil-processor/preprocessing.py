#!/usr/bin/env python3
"""
Preprocessing functions for Tattoo Stencil Generator.
Handles image enhancement, denoising, background removal, and upscaling.
"""

import cv2
import numpy as np
from typing import Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert image to grayscale.
    
    Args:
        image: BGR or grayscale image
        
    Returns:
        Grayscale image
    """
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image.copy()


def apply_clahe(gray: np.ndarray, clip_limit: float = 2.0, 
                tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization).
    
    Args:
        gray: Grayscale image
        clip_limit: Threshold for contrast limiting
        tile_grid_size: Size of grid for histogram equalization
        
    Returns:
        Enhanced grayscale image
    """
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(gray)


def denoise_image(gray: np.ndarray, strength: int = 10, 
                  method: str = 'nlmeans') -> np.ndarray:
    """
    Denoise image while preserving edges.
    
    Args:
        gray: Grayscale image
        strength: Denoising strength (h parameter)
        method: 'nlmeans' for Non-Local Means or 'bilateral' for bilateral filter
        
    Returns:
        Denoised image
    """
    if method == 'nlmeans':
        # Non-local means denoising - best for preserving edges
        return cv2.fastNlMeansDenoising(
            gray, None, 
            h=strength, 
            templateWindowSize=7, 
            searchWindowSize=21
        )
    elif method == 'bilateral':
        # Bilateral filter - faster but less effective
        return cv2.bilateralFilter(gray, 9, 75, 75)
    else:
        return gray.copy()


def enhance_contrast(gray: np.ndarray, alpha: float = 1.0, beta: int = 0) -> np.ndarray:
    """
    Adjust image contrast and brightness.
    
    Args:
        gray: Grayscale image
        alpha: Contrast multiplier (>1 increases contrast)
        beta: Brightness offset
        
    Returns:
        Adjusted image
    """
    return cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)


def preprocess_pipeline(image: np.ndarray, 
                        contrast: int = 50,
                        denoise: bool = True,
                        denoise_strength: int = 10) -> np.ndarray:
    """
    Full preprocessing pipeline for stencil generation.
    
    Args:
        image: BGR input image
        contrast: Contrast level (0-100, 50 is neutral)
        denoise: Whether to apply denoising
        denoise_strength: Denoising strength
        
    Returns:
        Preprocessed grayscale image
    """
    # Convert to grayscale
    gray = to_grayscale(image)
    
    # Denoise if requested
    if denoise:
        gray = denoise_image(gray, strength=denoise_strength)
    
    # Apply CLAHE for local contrast enhancement
    gray = apply_clahe(gray, clip_limit=2.5)
    
    # Global contrast adjustment based on parameter
    alpha = 1.0 + (contrast - 50) / 50.0
    gray = enhance_contrast(gray, alpha=alpha)
    
    # Bilateral filter for smooth gradients while keeping edges
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    
    return gray


def remove_background(image: np.ndarray) -> np.ndarray:
    """
    Remove background using rembg library.
    
    Args:
        image: BGR input image
        
    Returns:
        BGRA image with transparent background
        
    Note:
        Requires 'rembg' package to be installed.
        Falls back to simple background removal if not available.
    """
    try:
        import rembg
        
        # Convert BGR to RGB for rembg
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Remove background
        output = rembg.remove(rgb)
        
        # Convert back to BGRA
        bgra = cv2.cvtColor(output, cv2.COLOR_RGBA2BGRA)
        
        return bgra
        
    except ImportError:
        print("[Warning] 'rembg' not installed. Using simple background removal.")
        return simple_background_removal(image)


def simple_background_removal(image: np.ndarray, 
                               threshold: int = 240) -> np.ndarray:
    """
    Simple background removal using thresholding.
    Works well for images with light/white backgrounds.
    
    Args:
        image: BGR input image
        threshold: Brightness threshold for background
        
    Returns:
        BGRA image with transparent background
    """
    # Convert to grayscale
    gray = to_grayscale(image)
    
    # Create alpha channel based on brightness
    # Bright pixels become transparent
    _, alpha = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY_INV)
    
    # Apply morphological operations to clean up
    kernel = np.ones((3, 3), np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel)
    
    # Combine with original image
    bgra = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    bgra[:, :, 3] = alpha
    
    return bgra


def upscale_image(image: np.ndarray, scale: float, 
                  method: str = 'lanczos') -> np.ndarray:
    """
    Upscale image using specified interpolation method.
    
    Args:
        image: Input image
        scale: Scale factor (>1 to upscale)
        method: Interpolation method ('lanczos', 'cubic', 'linear')
        
    Returns:
        Upscaled image
    """
    h, w = image.shape[:2]
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    methods = {
        'lanczos': cv2.INTER_LANCZOS4,
        'cubic': cv2.INTER_CUBIC,
        'linear': cv2.INTER_LINEAR,
    }
    
    interpolation = methods.get(method, cv2.INTER_LANCZOS4)
    
    return cv2.resize(image, (new_w, new_h), interpolation=interpolation)


def ensure_minimum_resolution(image: np.ndarray, 
                               min_size: int = 1024) -> np.ndarray:
    """
    Ensure image meets minimum resolution.
    
    Args:
        image: Input image
        min_size: Minimum dimension (width or height)
        
    Returns:
        Image at or above minimum resolution
    """
    h, w = image.shape[:2]
    
    if max(h, w) < min_size:
        scale = min_size / max(h, w)
        return upscale_image(image, scale)
    
    return image


def resize_for_output(image: np.ndarray, 
                       target_resolution: Tuple[int, int] = (0, 0),
                       keep_aspect: bool = True) -> np.ndarray:
    """
    Resize image for final output.
    
    Args:
        image: Input image
        target_resolution: (width, height) or (0, 0) to keep original
        keep_aspect: Whether to preserve aspect ratio
        
    Returns:
        Resized image
    """
    if target_resolution == (0, 0):
        return image
    
    h, w = image.shape[:2]
    target_w, target_h = target_resolution
    
    if keep_aspect:
        # Fit within target while preserving aspect ratio
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
    else:
        new_w, new_h = target_w, target_h
    
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)


def create_white_background_mask(image: np.ndarray, 
                                  threshold: int = 250) -> np.ndarray:
    """
    Create a mask for white/near-white background.
    Useful for images with white backgrounds.
    
    Args:
        image: BGR or grayscale image
        threshold: Brightness threshold
        
    Returns:
        Binary mask (255 = foreground, 0 = background)
    """
    gray = to_grayscale(image)
    _, mask = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY_INV)
    return mask
