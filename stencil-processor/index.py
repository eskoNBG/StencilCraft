#!/usr/bin/env python3
"""
Stencil Processing Service
HTTP server for tattoo stencil generation.
Provides REST API for stencil generation with multiple styles.
"""

import sys
import os
import json
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the new modular generator
from stencil_generator import StencilService

PORT = 3005

# Initialize the service
stencil_service = StencilService()


class StencilHandler(BaseHTTPRequestHandler):
    """HTTP handler for stencil generation requests."""
    
    def log_message(self, format, *args):
        """Reduce logging noise."""
        if "health" not in str(args):
            print(f"[Stencil Service] {args[0]}")
    
    def send_cors_headers(self):
        """Send CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Health check."""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = json.dumps({
                'status': 'healthy',
                'service': 'stencil-processor',
                'version': '4.0',
                'styles': ['outline', 'simple', 'detailed', 'hatching', 'solid']
            })
            self.wfile.write(response.encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        """Process stencil generation request."""
        if self.path != '/generate':
            self.send_error(404)
            return
        
        try:
            # Read request
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            # Extract parameters
            image_base64 = data.get('image', '')
            style = data.get('style', 'outline')
            line_thickness = int(data.get('lineThickness', 3))
            contrast = int(data.get('contrast', 50))
            inverted = bool(data.get('inverted', False))
            line_color = data.get('lineColor', '#000000')  # Hex color
            transparent_bg = bool(data.get('transparentBg', False))
            
            if not image_base64:
                self._send_error(400, 'No image provided')
                return
            
            print(f"[Stencil Service] Processing: style={style}, thickness={line_thickness}, contrast={contrast}, color={line_color}, transparent={transparent_bg}")
            
            # Generate stencil using the new service
            stencil_base64 = stencil_service.process(
                image_base64=image_base64,
                style=style,
                thickness=line_thickness,
                contrast=contrast,
                inverted=inverted,
                line_color=line_color,
                transparent_bg=transparent_bg
            )
            
            print(f"[Stencil Service] ✅ Success!")
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            
            response = json.dumps({
                'success': True,
                'stencilImage': stencil_base64,
                'style': style
            })
            self.wfile.write(response.encode())
            
        except Exception as e:
            print(f"[Stencil Service] ❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            self._send_error(500, str(e))
    
    def _send_error(self, code: int, message: str):
        """Send error response."""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': False,
            'error': message
        }).encode())


def main():
    print(f"🎨 Stencil Processing Service v4.0 starting on port {PORT}...")
    print(f"✅ Ready at http://localhost:{PORT}")
    print(f"   POST /generate - Generate stencil from uploaded image")
    print(f"   GET  /health   - Health check")
    print(f"")
    print(f"   Styles: outline, simple, detailed, hatching, solid")
    
    server = HTTPServer(('0.0.0.0', PORT), StencilHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
