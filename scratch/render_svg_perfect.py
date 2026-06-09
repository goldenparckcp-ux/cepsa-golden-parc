import os
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

def render_svg_to_png():
    svg_content = """<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Background -->
    <rect width="1024" height="1024" fill="#0B0F19" />
    
    <!-- Outer Glow -->
    <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D52B1E" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#D52B1E" stop-opacity="0" />
        </radialGradient>
    </defs>
    <circle cx="512" cy="512" r="450" fill="url(#glow)" />
    
    <!-- Rounded App Icon Card -->
    <rect x="212" y="212" width="600" height="600" rx="140" ry="140" fill="#111827" stroke="#D52B1E" stroke-width="12" />
    
    <!-- Centered Cepsa Star Symbol -->
    <g transform="translate(302, 318) scale(7.92)" fill="#D52B1E">
        <path d="M18,25.1l-9.7,0c-0.8,0-1.5,0.2-2.1,0.7c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3l14.1,0 c1,0,1.1,0.5,1,1.1l-2.9,14.5c-0.2,0.9,0.6,1,1,0.6l5.3-4.3c0.7-0.5,1.8-1.3,2.1-2.7c0,0,1.4-7.2,2.1-10.1 C24,27.3,21.4,25.1,18,25.1z" />
        <path d="M49.4,25.1l-16.6,0c-3,0-6.4,2.5-6.9,4.8l-1.6,8c-0.2,0.9,0.5,1.1,1.3,0.6l7.7-6.2c0.4-0.3,1-0.6,1.5-0.6 l7.1,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C50.6,25.6,50,25.1,49.4,25.1z" />
        <path d="M27.5,10.2c0.2-0.9-0.5-1.1-1.3-0.6l-7.7,6.3c-0.4,0.3-1,0.6-1.5,0.6H10c-0.8,0-1.5,0.2-2.1,0.7 c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3L19,23c3,0,6.4-2.5,6.9-4.8L27.5,10.2z" />
        <path d="M51.1,16.4l-14.1,0c-1,0-1.1-0.5-1-1l2.9-14.5c0.2-0.9-0.6-1-1-0.6l-5.7,4.6c-0.6,0.5-1.5,1.3-1.7,2.7 c-0.6,3.1-1.4,6.8-2,9.8c-0.7,3.5,2,5.7,5.3,5.7l9.7,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C52.2,16.9,51.7,16.4,51.1,16.4z" />
    </g>
</svg>
"""
    
    # Save temporary SVG
    temp_svg = "temp_icon.svg"
    with open(temp_svg, "w") as f:
        f.write(svg_content)
        
    print("Parsing SVG using svglib...")
    drawing = svg2rlg(temp_svg)
    
    print("Rendering drawing to PNG...")
    output_png = "cepsa_icon.png"
    renderPM.drawToFile(drawing, output_png, fmt="PNG")
    
    # Clean up temp SVG
    if os.path.exists(temp_svg):
        os.remove(temp_svg)
        
    print(f"Perfect icon generated and saved at: {os.path.abspath(output_png)}")

if __name__ == "__main__":
    render_svg_to_png()
