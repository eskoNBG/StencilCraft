#!/usr/bin/env python3
"""
Professional Tattoo Stencil Generator v4.0
High-quality tattoo stencils matching professional services.

Features:
- 5 professional styles: Outline, Simple, Detailed, Hatching, Solid
- Configurable line thickness and contrast
- Transparent background output
- Multi-scale edge detection
- Optional upscaling
- Optional vectorization

Usage:
    python stencil_generator.py input.jpg --style outline --thickness 3 --output stencil.png
"""

import cv2
import numpy as np
import argparse
import sys
import os
from typing import Tuple, Optional, Union
import warnings
warnings.filterwarnings('ignore')

# Import local modules
from preprocessing import preprocess_pipeline, remove_background, ensure_minimum_resolution, resize_for_output
from styles import generate_stencil, STYLE_FUNCTIONS
from postprocessing import finalize_stencil, smooth_lines, binary_to_rgba, vectorize_to_svg
from utils import (
    load_image, save_image, image_to_bytes, bytes_to_base64, base64_to_bytes,
    validate_thickness, validate_contrast, validate_resolution,
    Timer, get_image_info, warn_if_low_resolution
)


class TattooStencilGenerator:
    """
    Professional Tattoo Stencil Generator.
    
    Generates high-quality tattoo stencils from photos with multiple styles.
    """
    
    def __init__(self,
                 thickness: int = 3,
                 contrast: int = 50,
                 remove_bg: bool = False,
                 upscale: str = 'none',
                 line_color: Tuple[int, int, int] = (0, 0, 0),
                 transparent_bg: bool = False):
        """
        Initialize the generator.
        
        Args:
            thickness: Line thickness (1-10)
            contrast: Contrast level (0-100)
            remove_bg: Whether to remove background
            upscale: Target resolution ('none', '1024', '2048', '4K')
            line_color: BGR color for stencil lines (default: black)
            transparent_bg: Whether background should be transparent (default: False = white bg)
        """
        self.thickness = validate_thickness(thickness)
        self.contrast = validate_contrast(contrast)
        self.remove_bg = remove_bg
        self.target_resolution = validate_resolution(upscale)
        self.line_color = line_color
        self.transparent_bg = transparent_bg
    
    def generate(self, 
                 image_data: Union[str, bytes],
                 style: str = 'outline',
                 **style_kwargs) -> bytes:
        """
        Generate stencil from image.
        
        Args:
            image_data: File path (str) or image bytes
            style: Stencil style ('outline', 'simple', 'detailed', 'hatching', 'solid')
            **style_kwargs: Additional style parameters
            
        Returns:
            PNG image bytes
        """
        with Timer("Total Generation"):
            # Load image
            with Timer("Image Loading"):
                image = load_image(image_data)
                print(f"[Generator] Loaded image: {image.shape[1]}x{image.shape[0]} pixels")
                warn_if_low_resolution(image)
            
            # Ensure minimum resolution
            image = ensure_minimum_resolution(image, min_size=1024)
            
            # Optional background removal
            if self.remove_bg:
                with Timer("Background Removal"):
                    image = remove_background(image)
            
            # Preprocessing
            with Timer("Preprocessing"):
                gray = preprocess_pipeline(
                    image, 
                    contrast=self.contrast,
                    denoise=True,
                    denoise_strength=10
                )
            
            # Generate stencil
            with Timer(f"Style: {style}"):
                stencil = generate_stencil(
                    gray,
                    style=style,
                    thickness=self.thickness,
                    contrast=self.contrast,
                    **style_kwargs
                )
            
            # Post-processing
            with Timer("Post-processing"):
                rgba = finalize_stencil(
                    stencil,
                    smooth=True,
                    line_color=self.line_color,
                    transparent_bg=self.transparent_bg
                )
            
            # Resize to target resolution if specified
            if self.target_resolution != (0, 0):
                rgba = resize_for_output(rgba, self.target_resolution, keep_aspect=True)
            
            # Encode to PNG
            with Timer("Encoding"):
                result = image_to_bytes(rgba, format='.png')
            
            print(f"[Generator] ✅ Stencil created: {len(result)} bytes")
            return result
    
    def generate_to_file(self,
                         input_path: str,
                         output_path: str,
                         style: str = 'outline',
                         **style_kwargs) -> bool:
        """
        Generate stencil and save to file.
        
        Args:
            input_path: Input image path
            output_path: Output PNG path
            style: Stencil style
            **style_kwargs: Style parameters
            
        Returns:
            True if successful
        """
        result = self.generate(input_path, style=style, **style_kwargs)
        
        with open(output_path, 'wb') as f:
            f.write(result)
        
        print(f"[Generator] Saved to: {output_path}")
        return True
    
    def generate_to_svg(self,
                        input_path: str,
                        output_path: str,
                        style: str = 'outline',
                        **style_kwargs) -> bool:
        """
        Generate stencil and export as SVG.
        
        Args:
            input_path: Input image path
            output_path: Output SVG path
            style: Stencil style
            **style_kwargs: Style parameters
            
        Returns:
            True if successful
        """
        # Load and process
        image = load_image(input_path)
        image = ensure_minimum_resolution(image, min_size=1024)
        
        gray = preprocess_pipeline(image, contrast=self.contrast)
        stencil = generate_stencil(gray, style=style, thickness=self.thickness, **style_kwargs)
        
        # Vectorize
        return vectorize_to_svg(stencil, output_path, smooth=True)


# HTTP Service Interface
class StencilService:
    """
    HTTP service interface for stencil generation.
    Compatible with the existing index.py service.
    """
    
    def __init__(self):
        self.generator = TattooStencilGenerator()
    
    def process(self, 
                image_base64: str,
                style: str = 'outline',
                thickness: int = 3,
                contrast: int = 50,
                inverted: bool = False,
                line_color: str = '#000000',
                transparent_bg: bool = False) -> str:
        """
        Process base64 image and return base64 stencil.
        
        Args:
            image_base64: Base64 encoded image
            style: Stencil style
            thickness: Line thickness
            contrast: Contrast level
            inverted: Whether to invert colors
            line_color: Hex color string for lines (e.g., '#000000' for black)
            transparent_bg: Whether background should be transparent
            
        Returns:
            Base64 encoded stencil
        """
        # Parse hex color to BGR
        def hex_to_bgr(hex_color: str) -> Tuple[int, int, int]:
            hex_color = hex_color.lstrip('#')
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            return (b, g, r)  # BGR format for OpenCV
        
        # Update generator settings
        self.generator.thickness = validate_thickness(thickness)
        self.generator.contrast = validate_contrast(contrast)
        self.generator.line_color = hex_to_bgr(line_color)
        self.generator.transparent_bg = transparent_bg
        
        # Decode input
        image_data = base64_to_bytes(image_base64)
        
        # Generate
        result = self.generator.generate(image_data, style=style)
        
        # Return base64
        return bytes_to_base64(result)


# Convenience function for direct import
def generate_stencil_from_bytes(image_data: bytes,
                                style: str = 'outline',
                                thickness: int = 3,
                                contrast: int = 50) -> bytes:
    """
    Convenience function to generate stencil from bytes.
    
    Args:
        image_data: Image bytes
        style: Stencil style
        thickness: Line thickness
        contrast: Contrast level
        
    Returns:
        PNG image bytes
    """
    generator = TattooStencilGenerator(thickness=thickness, contrast=contrast)
    return generator.generate(image_data, style=style)


# Legacy compatibility
class StencilGenerator(TattooStencilGenerator):
    """Alias for backward compatibility."""
    pass


# CLI Interface
def main():
    parser = argparse.ArgumentParser(
        description='Professional Tattoo Stencil Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stencil_generator.py input.jpg --style outline --thickness 3 --output stencil.png
  python stencil_generator.py photo.png --style hatching --hatch-angle 45 135 --output hatch.png
  python stencil_generator.py art.jpg --style detailed --upscale 4K --output detail_4k.png
        """
    )
    
    parser.add_argument('input', help='Input image path')
    parser.add_argument('--output', '-o', default='stencil.png', help='Output path')
    parser.add_argument('--style', '-s', 
                        choices=list(STYLE_FUNCTIONS.keys()),
                        default='outline',
                        help='Stencil style')
    parser.add_argument('--thickness', '-t', type=int, default=3,
                        help='Line thickness (1-10)')
    parser.add_argument('--contrast', '-c', type=int, default=50,
                        help='Contrast level (0-100)')
    parser.add_argument('--upscale', choices=['none', '1024', '2048', '4K'],
                        default='none', help='Target resolution')
    parser.add_argument('--remove-bg', action='store_true',
                        help='Remove background')
    parser.add_argument('--vector', action='store_true',
                        help='Output as SVG instead of PNG')
    
    # Style-specific options
    parser.add_argument('--hatch-angle', type=float, nargs='+',
                        help='Hatching angle(s) in degrees')
    parser.add_argument('--hatch-density', type=int, default=5,
                        help='Hatching density (1-10)')
    parser.add_argument('--solid-levels', type=int, default=4,
                        help='Number of levels for solid style (3-5)')
    parser.add_argument('--fill', action='store_true',
                        help='Fill areas in solid style')
    
    args = parser.parse_args()
    
    # Create generator
    generator = TattooStencilGenerator(
        thickness=args.thickness,
        contrast=args.contrast,
        remove_bg=args.remove_bg,
        upscale=args.upscale
    )
    
    # Style-specific kwargs
    style_kwargs = {}
    if args.style == 'hatching':
        if args.hatch_angle:
            style_kwargs['angles'] = args.hatch_angle
        style_kwargs['density'] = args.hatch_density
    elif args.style == 'solid':
        style_kwargs['levels'] = args.solid_levels
        style_kwargs['fill_areas'] = args.fill
    
    # Generate
    try:
        if args.vector:
            output = args.output.replace('.png', '.svg')
            generator.generate_to_svg(args.input, output, args.style, **style_kwargs)
        else:
            generator.generate_to_file(args.input, args.output, args.style, **style_kwargs)
        
        print(f"\n✅ Success! Stencil saved to: {args.output}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
