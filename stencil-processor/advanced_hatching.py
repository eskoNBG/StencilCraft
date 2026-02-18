"""
Advanced Hatching Algorithms for Tattoo Stencils
Implements vector field-based hatching with density mapping.
"""

import cv2
import numpy as np
from typing import Tuple, Optional
import math


class AdvancedHatching:
    """
    Professional hatching generator with:
    - Vector field-based line direction
    - Density mapping from grayscale
    - Multi-pass line generation
    """
    
    def __init__(self):
        self.base_spacing = 8
        self.min_spacing = 3
        self.max_spacing = 15
        self.line_length_base = 15
        self.line_length_var = 10
        
    def generate(
        self,
        gray: np.ndarray,
        direction: str = "auto",
        density_mode: str = "gradient",
        thickness: int = 1,
        angle: float = 45
    ) -> np.ndarray:
        """
        Generate hatching pattern.
        
        Args:
            gray: Grayscale image
            direction: 'auto' (follows form), 'horizontal', 'vertical', 'diagonal', 'cross'
            density_mode: 'gradient' (based on darkness), 'uniform'
            thickness: Line thickness
            angle: Angle for fixed directions
            
        Returns:
            Hatching pattern (white background, black lines)
        """
        h, w = gray.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Compute density map
        if density_mode == "gradient":
            density = self._compute_density(gray)
        else:
            density = np.ones((h, w), dtype=np.float64) * 0.5
        
        # Generate based on direction mode
        if direction == "auto":
            # Vector field-based hatching
            result = self._auto_hatching(gray, density, thickness)
        elif direction == "cross":
            # Cross-hatching (two passes)
            result = self._cross_hatching(gray, density, thickness)
        else:
            # Fixed direction hatching
            result = self._fixed_hatching(gray, density, thickness, direction, angle)
        
        return result
    
    def _compute_density(self, gray: np.ndarray) -> np.ndarray:
        """
        Compute density map based on grayscale intensity.
        Darker = more lines, lighter = fewer lines.
        """
        # Invert so darker areas have higher density
        inverted = 255 - gray
        
        # Normalize to 0-1
        density = inverted.astype(np.float64) / 255.0
        
        # Apply gamma for better distribution
        gamma = 0.6
        density = np.power(density, gamma)
        
        # Apply slight blur for smoothness
        density = cv2.GaussianBlur(density, (5, 5), 0)
        
        return density
    
    def _compute_gradient_field(self, gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute gradient vector field.
        Returns unit vectors perpendicular to gradient (for line direction).
        """
        # Compute gradients
        grad_x = cv2.Sobel(gray.astype(np.float64), cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray.astype(np.float64), cv2.CV_64F, 0, 1, ksize=3)
        
        # Perpendicular direction (rotate 90°)
        vec_x = -grad_y
        vec_y = grad_x
        
        # Normalize
        magnitude = np.sqrt(vec_x**2 + vec_y**2) + 1e-8
        vec_x_norm = vec_x / magnitude
        vec_y_norm = vec_y / magnitude
        
        # Smooth the field for coherent lines
        vec_x_smooth = cv2.GaussianBlur(vec_x_norm, (21, 21), 5)
        vec_y_smooth = cv2.GaussianBlur(vec_y_norm, (21, 21), 5)
        
        # Renormalize after smoothing
        mag_smooth = np.sqrt(vec_x_smooth**2 + vec_y_smooth**2) + 1e-8
        vec_x_final = vec_x_smooth / mag_smooth
        vec_y_final = vec_y_smooth / mag_smooth
        
        return vec_x_final, vec_y_final
    
    def _auto_hatching(
        self,
        gray: np.ndarray,
        density: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate hatching following the form (auto direction).
        """
        h, w = gray.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Get vector field
        vec_x, vec_y = self._compute_gradient_field(gray)
        
        # Multi-pass generation with different spacing
        for pass_idx in range(4):
            spacing = self.base_spacing - pass_idx * 2
            spacing = max(self.min_spacing, spacing)
            
            offset = spacing // 2 * pass_idx
            
            for y in range(offset, h, spacing):
                for x in range(offset, w, spacing):
                    # Check local density
                    local_density = density[y, x]
                    
                    # Threshold for this pass
                    threshold = 0.2 + pass_idx * 0.15
                    if local_density < threshold:
                        continue
                    
                    # Draw flow line
                    line_length = int(self.line_length_base + local_density * self.line_length_var)
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
        max_length: int,
        thickness: int,
        intensity: float
    ) -> None:
        """
        Draw a line following the vector field from starting point.
        """
        h, w = canvas.shape
        points = []
        
        # Trace line in both directions
        for direction in [1, -1]:
            x, y = float(start_x), float(start_y)
            
            for _ in range(max_length // 2):
                ix, iy = int(x), int(y)
                
                if not (0 <= ix < w and 0 <= iy < h):
                    break
                
                points.append((int(x), int(y)))
                
                # Get local direction
                dx = vec_x[iy, ix] * direction
                dy = vec_y[iy, ix] * direction
                
                # Step
                x += dx * 2
                y += dy * 2
        
        # Draw if enough points
        if len(points) > 1:
            pts = np.array(points, dtype=np.int32)
            cv2.polylines(canvas, [pts], False, 0, thickness)
    
    def _cross_hatching(
        self,
        gray: np.ndarray,
        density: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate cross-hatching (45° and 135° lines).
        """
        # First pass: 45°
        result1 = self._fixed_hatching(gray, density, thickness, "diagonal", 45)
        
        # Second pass: 135°
        result2 = self._fixed_hatching(gray, density, thickness, "diagonal", 135)
        
        # Combine
        result = cv2.bitwise_and(result1, result2)
        
        return result
    
    def _fixed_hatching(
        self,
        gray: np.ndarray,
        density: np.ndarray,
        thickness: int,
        direction: str,
        angle: float
    ) -> np.ndarray:
        """
        Generate hatching with fixed direction.
        """
        h, w = gray.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Convert angle to direction
        angle_rad = math.radians(angle)
        dx = math.cos(angle_rad)
        dy = math.sin(angle_rad)
        
        # Multi-pass with varying spacing
        for pass_idx in range(3):
            spacing = self.base_spacing - pass_idx * 2
            spacing = max(self.min_spacing, spacing)
            
            # Offset for this pass
            offset = spacing * pass_idx // 3
            
            # Generate starting points
            if direction == "horizontal":
                for y in range(offset, h, spacing):
                    for x in range(0, w, spacing):
                        if density[y, x] > 0.3 + pass_idx * 0.2:
                            self._draw_straight_line(result, x, y, 1, 0, thickness)
            elif direction == "vertical":
                for x in range(offset, w, spacing):
                    for y in range(0, h, spacing):
                        if density[y, x] > 0.3 + pass_idx * 0.2:
                            self._draw_straight_line(result, x, y, 0, 1, thickness)
            else:  # diagonal
                # Draw lines at angle
                for start_y in range(-w, h + w, spacing):
                    for start_x in range(0, w, spacing):
                        sy = start_y + start_x * dy
                        sx = start_x
                        if 0 <= int(sy) < h and 0 <= sx < w:
                            if density[int(sy), sx] > 0.3 + pass_idx * 0.2:
                                self._draw_straight_line(result, sx, int(sy), dx, dy, thickness)
        
        return result
    
    def _draw_straight_line(
        self,
        canvas: np.ndarray,
        start_x: int,
        start_y: int,
        dx: float,
        dy: float,
        thickness: int
    ) -> None:
        """
        Draw a straight line from starting point.
        """
        h, w = canvas.shape
        length = min(w, h) // 4
        
        end_x = int(start_x + dx * length)
        end_y = int(start_y + dy * length)
        
        cv2.line(canvas, (start_x, start_y), (end_x, end_y), 0, thickness)


class SolidRegionGenerator:
    """
    Generate solid style with posterization.
    """
    
    def __init__(self):
        self.levels = 4
        
    def generate(
        self,
        gray: np.ndarray,
        contours: np.ndarray,
        thickness: int
    ) -> np.ndarray:
        """
        Generate solid posterized stencil.
        """
        h, w = gray.shape
        result = np.ones((h, w), dtype=np.uint8) * 255
        
        # Posterize
        step = 256 // self.levels
        posterized = (gray // step) * step
        
        # Process each level
        for level in range(self.levels - 1, 0, -1):
            threshold = level * step
            
            # Create binary mask
            _, mask = cv2.threshold(gray, threshold - 1, 255, cv2.THRESH_BINARY_INV)
            
            # Find contours
            cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Fill with grayscale
            fill_value = max(0, 255 - level * 70)
            cv2.drawContours(result, cnts, -1, fill_value, -1)
            
            # Draw outline
            cv2.drawContours(result, cnts, -1, 0, thickness)
        
        # Add main contours
        result = cv2.subtract(result, contours)
        
        return result
