#!/usr/bin/env python3
"""
Utility functions for the Tattoo Stencil Generator.
Handles image I/O, parameter validation, and helper functions.
"""

import cv2
import numpy as np
from typing import Tuple, Optional, Union
import os


def load_image(path_or_bytes: Union[str, bytes]) -> np.ndarray:
    """
    Load an image from file path or bytes.
    
    Args:
        path_or_bytes: File path (str) or image bytes
        
    Returns:
        numpy array (BGR format)
    """
    if isinstance(path_or_bytes, bytes):
        nparr = np.frombuffer(path_or_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(path_or_bytes, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not load image. Check format and path.")
    
    return img


def save_image(image: np.ndarray, path: str, quality: int = 95) -> bool:
    """
    Save image to file.
    
    Args:
        image: numpy array (BGR or BGRA format)
        path: Output file path
        quality: JPEG quality (1-100) or PNG compression (ignored)
        
    Returns:
        True if successful
    """
    # Create directory if needed
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    
    # Determine format from extension
    ext = os.path.splitext(path)[1].lower()
    
    if ext == '.png':
        params = [cv2.IMWRITE_PNG_COMPRESSION, 9]
    elif ext in ['.jpg', '.jpeg']:
        params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    else:
        params = []
    
    return cv2.imwrite(path, image, params)


def image_to_bytes(image: np.ndarray, format: str = '.png') -> bytes:
    """
    Convert image to bytes.
    
    Args:
        image: numpy array
        format: Image format ('.png', '.jpg')
        
    Returns:
        Image as bytes
    """
    if format == '.png':
        params = [cv2.IMWRITE_PNG_COMPRESSION, 9]
    else:
        params = []
    
    success, buffer = cv2.imencode(format, image, params)
    if not success:
        raise ValueError("Failed to encode image")
    
    return buffer.tobytes()


def bytes_to_base64(data: bytes, mime_type: str = 'image/png') -> str:
    """
    Convert bytes to base64 data URL.
    """
    import base64
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:{mime_type};base64,{b64}"


def base64_to_bytes(data_url: str) -> bytes:
    """
    Convert base64 data URL to bytes.
    """
    import base64
    if ',' in data_url:
        data_url = data_url.split(',')[1]
    return base64.b64decode(data_url)


def validate_thickness(thickness: int) -> int:
    """Validate and normalize line thickness (1-10 pixels)."""
    return max(1, min(10, thickness))


def validate_contrast(contrast: int) -> int:
    """Validate contrast value (0-100)."""
    return max(0, min(100, contrast))


def validate_resolution(resolution: str) -> Tuple[int, int]:
    """
    Parse resolution string to (width, height).
    
    Args:
        resolution: '1024', '2048', '4K', or 'none'
        
    Returns:
        Tuple of (width, height) or (0, 0) for 'none'
    """
    resolutions = {
        '1024': (1024, 1024),
        '2048': (2048, 2048),
        '4k': (3840, 2160),
        '4K': (3840, 2160),
        'none': (0, 0),
        'original': (0, 0),
    }
    return resolutions.get(resolution, (0, 0))


def calculate_median_threshold(gray: np.ndarray) -> Tuple[float, float]:
    """
    Calculate Canny thresholds based on image median.
    
    Args:
        gray: Grayscale image
        
    Returns:
        Tuple of (low_threshold, high_threshold)
    """
    median = np.median(gray)
    low = max(0, int(0.66 * median))
    high = min(255, int(1.33 * median))
    # Ensure minimum separation
    if high - low < 30:
        low = max(0, median - 30)
        high = min(255, median + 30)
    return low, high


def ensure_minimum_resolution(image: np.ndarray, min_size: int = 1024) -> np.ndarray:
    """
    Ensure image meets minimum resolution.
    Upscales if necessary using Lanczos interpolation.
    
    Args:
        image: Input image
        min_size: Minimum dimension (width or height)
        
    Returns:
        Image at or above minimum resolution
    """
    h, w = image.shape[:2]
    
    if max(h, w) < min_size:
        # Calculate scale factor
        scale = min_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        print(f"[Utils] Upscaled image from {w}x{h} to {new_w}x{new_h}")
    
    return image


def resize_to_target(image: np.ndarray, target: Tuple[int, int], 
                     keep_aspect: bool = True) -> np.ndarray:
    """
    Resize image to target resolution.
    
    Args:
        image: Input image
        target: (width, height) tuple
        keep_aspect: Whether to preserve aspect ratio
        
    Returns:
        Resized image
    """
    if target == (0, 0):
        return image
    
    h, w = image.shape[:2]
    target_w, target_h = target
    
    if keep_aspect:
        # Calculate scale to fit within target
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
    else:
        new_w, new_h = target_w, target_h
    
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)


def get_image_info(image: np.ndarray) -> dict:
    """Get image information dictionary."""
    h, w = image.shape[:2]
    channels = image.shape[2] if len(image.shape) > 2 else 1
    dtype = str(image.dtype)
    size_mb = image.nbytes / (1024 * 1024)
    
    return {
        'width': w,
        'height': h,
        'channels': channels,
        'dtype': dtype,
        'size_mb': round(size_mb, 2),
        'total_pixels': w * h
    }


def warn_if_low_resolution(image: np.ndarray, min_recommended: int = 1000) -> bool:
    """
    Check if image resolution is below recommended.
    
    Returns:
        True if warning was issued
    """
    h, w = image.shape[:2]
    if max(h, w) < min_recommended:
        print(f"[Warning] Image resolution ({w}x{h}) is below recommended minimum ({min_recommended}px). "
              f"Consider using a higher resolution image for best results.")
        return True
    return False


class Timer:
    """Simple timer context manager for performance measurement."""
    
    def __init__(self, name: str = "Operation"):
        self.name = name
        self.start_time = None
        self.elapsed = 0
        
    def __enter__(self):
        import time
        self.start_time = time.time()
        return self
        
    def __exit__(self, *args):
        import time
        self.elapsed = time.time() - self.start_time
        print(f"[Timer] {self.name}: {self.elapsed:.2f}s")
