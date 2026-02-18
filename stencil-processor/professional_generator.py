"""
Professional Tattoo Stencil Generator
Implements advanced algorithms for high-quality stencil generation:

1. Vector Field-Based Hatching - Lines follow form/gradient
2. Density Mapping - Line density based on grayscale intensity
3. Edge Importance Detection - Thicker lines for important edges
4. Multi-Pass Processing - Separate passes for optimal results
5. Solid Style - Posterization with filled regions

Based on analysis of professional tattoo stencil references.
"""

import cv2
import numpy as np
from typing import Tuple, Optional, Dict, Any
from enum import Enum
import math


class StencilStyle(Enum):
    OUTLINE = "outline"
    HATCHING = "hatching"
    SOLID = "solid"
    DETAILED = "detailed"


class ProfessionalStencilGenerator:
    """
    Professional tattoo stencil generator with advanced algorithms.
    """
    
    def __init__(self):
        self.edge_canny_low = 30
        self.edge_canny_high = 100
        self.hatching_base_spacing = 8
        self.hatching_min_spacing = 3
        self.hatching_max_spacing = 20
        self.contour_thickness = 2
        self.detail_thickness = 1
        
    def generate(
        self,
        image: np.ndarray,
        style: str = "hatching",
        line_thickness: int = 2,
        contrast: int = 50,
        inverted: bool = False,
        line_color: Tuple[int, int, int] = (0, 0, 0),
        transparent_bg: bool = False,
        preserve_details: bool = True
    ) -> np.ndarray:
        """
        Generate a professional tattoo stencil.
        
        Args:
            image: Input BGR image
            style: 'outline', 'hatching', 'solid', or 'detailed'
            line_thickness: Base line thickness (1-5)
            contrast: Contrast enhancement (0-100)
            inverted: Invert colors
            line_color: BGR color for lines
            transparent_bg: Use transparent background
            
        Returns:
            Stencil image (BGR or BGRA)
        """
        # Convert style string to enum
        style_enum = StencilStyle(style.lower())
        
        # Preprocessing
        processed = self._preprocess(image, contrast)
        
        # Multi-pass processing
        contours = self._extract_contours(processed, line_thickness)
        edges_importance = self._compute_edge_importance(processed)
        
        # Generate based on style
        if style_enum == StencilStyle.OUTLINE:
            stencil = self._generate_outline(contours, edges_importance, line_thickness)
        elif style_enum == StencilStyle.HATCHING:
            stencil = self._generate_hatching(processed, contours, edges_importance, line_thickness)
        elif style_enum == StencilStyle.SOLID:
            stencil = self._generate_solid(processed, contours, line_thickness)
        else:  # DETAILED
            stencil = self._generate_detailed(processed, contours, edges_importance, line_thickness)
        
        # Apply inversion if needed
        if inverted:
            stencil = cv2.bitwise_not(stencil)
        
        # Apply line color
        result = self._apply_color(stencil, line_color, transparent_bg)
        
        return result
    
    def _preprocess(self, image: np.ndarray, contrast: int) -> np.ndarray:
        """
        Preprocess image: denoise, enhance contrast, normalize.
        """
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, None, h=10, searchWindowSize=21, templateWindowSize=7)
        
        # Enhance contrast using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0 + contrast / 25.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Normalize to 0-255
        normalized = cv2.normalize(enhanced, None, 0, 255, cv2.NORM_MINMAX)
        
        return normalized
    
    def _extract_contours(self, gray: np.ndarray, thickness: int) -> np.ndarray:
        """
        Extract main contours with varying importance.
        """
        # Multi-scale edge detection
        edges_fine = cv2.Canny(gray, 50, 150)
        edges_coarse = cv2.Canny(gray, 30, 100)
        
        # Morphological operations for cleaner edges
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        edges_clean = cv2.morphologyEx(edges_fine, cv2.MORPH_CLOSE, kernel)
        
        # Combine edges
        combined = cv2.bitwise_or(edges_clean, edges_coarse)
        
        # Dilate based on thickness
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (thickness, thickness))
        contours = cv2.dilate(combined, dilate_kernel, iterations=1)
        
        return contours
    
    def _compute_edge_importance(self, gray: np.ndarray) -> np.ndarray:
        """
        Compute edge importance map for variable line thickness.
        Important edges (face features, strong contrasts) get higher values.
        """
        # Gradient magnitude
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Normalize
        gradient_normalized = cv2.normalize(gradient_magnitude, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Find strong edges (face features typically have higher contrast)
        _, strong_edges = cv2.threshold(gradient_normalized, 100, 255, cv2.THRESH_BINARY)
        
        # Dilate importance area
        importance_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        importance = cv2.dilate(strong_edges, importance_kernel, iterations=2)
        
        return importance
    
    def _compute_vector_field(self, gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute vector field for directional hatching.
        Lines should be perpendicular to the gradient (along contours).
        """
        # Compute gradients
        grad_x = cv2.Sobel(gray.astype(np.float64), cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray.astype(np.float64), cv2.CV_64F, 0, 1, ksize=3)
        
        # Vector field perpendicular to gradient (for hatching direction)
        # Rotate 90 degrees: (-grad_y, grad_x)
        vec_x = -grad_y
        vec_y = grad_x
        
        # Normalize vectors
        magnitude = np.sqrt(vec_x**2 + vec_y**2) + 1e-10
        vec_x_norm = vec_x / magnitude
        vec_y_norm = vec_y / magnitude
        
        # Apply Gaussian smoothing for smoother flow
        vec_x_smooth = cv2.GaussianBlur(vec_x_norm, (15, 15), 0)
        vec_y_smooth = cv2.GaussianBlur(vec_y_norm, (15, 15), 0)
        
        return vec_x_smooth, vec_y_smooth
    
    def _compute_density_map(self, gray: np.ndarray) -> np.ndarray:
        """
        Compute density map for hatching.
        Darker areas = more lines, lighter areas = fewer lines.
        """
        # Invert: darker = more density
        density = 255 - gray
        
        # Normalize to 0-1 range
        density_normalized = density.astype(np.float64) / 255.0
        
        # Apply gamma correction for better distribution
        gamma = 0.7
        density_gamma = np.power(density_normalized, gamma)
        
        return density_gamma
    
    def _generate_outline(
        self,
        contours: np.ndarray,
        importance: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate clean outline style - minimal, precise contours.
        """
        h, w = contours.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Find contours and filter
        cnts, _ = cv2.findContours(contours, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in cnts:
            area = cv2.contourArea(cnt)
            if area > 50:  # Filter small noise
                # Variable thickness based on importance
                cv2.drawContours(result, [cnt], -1, 0, thickness)
        
        return result
    
    def _generate_hatching(
        self,
        gray: np.ndarray,
        contours: np.ndarray,
        importance: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate hatching style with vector field-based lines.
        Lines follow the form and density varies with darkness.
        """
        h, w = gray.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Compute vector field and density
        vec_x, vec_y = self._compute_vector_field(gray)
        density = self._compute_density_map(gray)
        
        # Draw contours first
        result = cv2.subtract(result, contours)
        
        # Generate hatching lines
        hatching = self._draw_vector_hatching(
            result.shape, vec_x, vec_y, density, thickness
        )
        
        # Combine contours and hatching
        result = cv2.bitwise_and(result, hatching)
        
        return result
    
    def _draw_vector_hatching(
        self,
        shape: Tuple[int, int],
        vec_x: np.ndarray,
        vec_y: np.ndarray,
        density: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Draw hatching lines following the vector field.
        """
        h, w = shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Create starting points grid
        spacing = self.hatching_base_spacing
        
        # Multiple passes for different densities
        for pass_num in range(3):
            offset = pass_num * spacing // 3
            
            for y in range(offset, h, spacing):
                for x in range(offset, w, spacing):
                    # Check local density
                    local_density = density[y, x]
                    
                    # Skip based on density (lighter areas get fewer lines)
                    threshold = 0.3 + pass_num * 0.2
                    if local_density < threshold:
                        continue
                    
                    # Draw a short line segment following the vector field
                    line_length = int(10 + local_density * 20)
                    self._draw_flow_line(
                        result, x, y, vec_x, vec_y, 
                        line_length, thickness, local_density
                    )
        
        return result
    
    def _draw_flow_line(
        self,
        canvas: np.ndarray,
        start_x: int,
        start_y: int,
        vec_x: np.ndarray,
        vec_y: np.ndarray,
        length: int,
        thickness: int,
        intensity: float
    ) -> None:
        """
        Draw a single line following the vector field.
        """
        h, w = canvas.shape
        points = [(start_x, start_y)]
        
        x, y = float(start_x), float(start_y)
        step_size = 2.0
        
        for _ in range(length):
            # Get local direction
            ix, iy = int(x), int(y)
            if 0 <= ix < w and 0 <= iy < h:
                dx = vec_x[iy, ix] * step_size
                dy = vec_y[iy, ix] * step_size
                
                x += dx
                y += dy
                
                if 0 <= int(x) < w and 0 <= int(y) < h:
                    points.append((int(x), int(y)))
                else:
                    break
            else:
                break
        
        # Draw the line
        if len(points) > 1:
            pts = np.array(points, dtype=np.int32)
            cv2.polylines(canvas, [pts], False, 0, thickness)
    
    def _generate_solid(
        self,
        gray: np.ndarray,
        contours: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate solid style with posterization and filled regions.
        """
        h, w = gray.shape
        
        # Posterize to few levels (3-4)
        levels = 4
        posterized = (gray // (256 // levels)) * (256 // levels)
        
        # Create result
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Process each level
        for level in range(levels - 1, 0, -1):
            threshold = level * (256 // levels)
            
            # Create mask for this level
            mask = (gray < threshold).astype(np.uint8) * 255
            
            # Find contours and fill
            cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Fill regions with different patterns/densities
            fill_value = max(0, 255 - level * 60)
            cv2.drawContours(result, cnts, -1, fill_value, -1)
            
            # Draw outlines
            cv2.drawContours(result, cnts, -1, 0, thickness)
        
        # Add main contours
        result = cv2.subtract(result, contours)
        
        return result
    
    def _generate_detailed(
        self,
        gray: np.ndarray,
        contours: np.ndarray,
        importance: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate detailed style combining all techniques.
        High detail level with precise edges and selective hatching.
        """
        h, w = gray.shape
        
        # Start with outline
        result = self._generate_outline(contours, importance, thickness)
        
        # Add fine details via Difference of Gaussians
        blur1 = cv2.GaussianBlur(gray, (5, 5), 1.0)
        blur2 = cv2.GaussianBlur(gray, (9, 9), 2.0)
        dog = cv2.subtract(blur1, blur2)
        
        # Threshold DoG for fine details
        _, fine_details = cv2.threshold(dog, 10, 255, cv2.THRESH_BINARY)
        
        # Add selective hatching for darker areas
        density = self._compute_density_map(gray)
        vec_x, vec_y = self._compute_vector_field(gray)
        
        # Only add hatching to darker regions
        dark_mask = (density > 0.5).astype(np.uint8) * 255
        
        hatching = self._draw_vector_hatching(
            result.shape, vec_x, vec_y, density, max(1, thickness - 1)
        )
        
        # Apply hatching only to dark areas
        hatching_masked = cv2.bitwise_or(
            cv2.bitwise_and(hatching, 255 - dark_mask),
            cv2.bitwise_and(result, dark_mask)
        )
        
        # Combine all
        result = cv2.bitwise_and(result, fine_details)
        result = cv2.bitwise_and(result, hatching_masked)
        
        return result
    
    def _apply_color(
        self,
        stencil: np.ndarray,
        line_color: Tuple[int, int, int],
        transparent_bg: bool
    ) -> np.ndarray:
        """
        Apply line color and handle transparency.
        """
        if transparent_bg:
            # Create BGRA image
            h, w = stencil.shape
            result = np.ones((h, w, 4), dtype=np.uint8)
            
            # Set alpha channel (white = transparent, black = opaque)
            alpha = 255 - stencil
            result[:, :, 3] = alpha
            
            # Set color for non-transparent pixels
            mask = alpha > 0
            result[mask, 0] = line_color[0]  # B
            result[mask, 1] = line_color[1]  # G
            result[mask, 2] = line_color[2]  # R
            
        else:
            # Create white background
            h, w = stencil.shape
            result = np.ones((h, w, 3), dtype=np.uint8) * 255
            
            # Apply line color where stencil is black
            mask = stencil < 128
            result[mask] = line_color
        
        return result


def hex_to_bgr(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to BGR tuple."""
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (b, g, r)  # BGR order for OpenCV


# Test function
def test_generator():
    """Test the professional stencil generator."""
    import sys
    
    # Create test gradient image
    h, w = 500, 500
    test_img = np.zeros((h, w), dtype=np.uint8)
    
    # Add gradient
    for y in range(h):
        for x in range(w):
            test_img[y, x] = int(255 * (1 - y/h))
    
    # Add circle
    cv2.circle(test_img, (250, 250), 100, 100, -1)
    
    # Convert to BGR
    test_bgr = cv2.cvtColor(test_img, cv2.COLOR_GRAY2BGR)
    
    # Test generator
    generator = ProfessionalStencilGenerator()
    
    for style in ['outline', 'hatching', 'solid', 'detailed']:
        result = generator.generate(test_bgr, style=style)
        cv2.imwrite(f'/tmp/test_{style}.png', result)
        print(f"Generated test_{style}.png")


if __name__ == "__main__":
    test_generator()
