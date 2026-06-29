import os
from PIL import Image, ImageDraw
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

def render_combined_logo():
    size = 1024
    
    # 1. Generate transparent SVG of the star only (viewBox matches 1024x1024)
    # The star viewBox is 53x49, scaled by 7.92 -> 420x388, positioned at (302, 318)
    star_svg = """<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <g transform="translate(302, 318) scale(7.92)" fill="#D52B1E">
        <path d="M18,25.1l-9.7,0c-0.8,0-1.5,0.2-2.1,0.7c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3l14.1,0 c1,0,1.1,0.5,1,1.1l-2.9,14.5c-0.2,0.9,0.6,1,1,0.6l5.3-4.3c0.7-0.5,1.8-1.3,2.1-2.7c0,0,1.4-7.2,2.1-10.1 C24,27.3,21.4,25.1,18,25.1z" />
        <path d="M49.4,25.1l-16.6,0c-3,0-6.4,2.5-6.9,4.8l-1.6,8c-0.2,0.9,0.5,1.1,1.3,0.6l7.7-6.2c0.4-0.3,1-0.6,1.5-0.6 l7.1,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C50.6,25.6,50,25.1,49.4,25.1z" />
        <path d="M27.5,10.2c0.2-0.9-0.5-1.1-1.3-0.6l-7.7,6.3c-0.4,0.3-1,0.6-1.5,0.6H10c-0.8,0-1.5,0.2-2.1,0.7 c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3L19,23c3,0,6.4-2.5,6.9-4.8L27.5,10.2z" />
        <path d="M51.1,16.4l-14.1,0c-1,0-1.1-0.5-1-1l2.9-14.5c0.2-0.9-0.6-1-1-0.6l-5.7,4.6c-0.6,0.5-1.5,1.3-1.7,2.7 c-0.6,3.1-1.4,6.8-2,9.8c-0.7,3.5,2,5.7,5.3,5.7l9.7,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C52.2,16.9,51.7,16.4,51.1,16.4z" />
    </g>
</svg>
"""
    temp_svg = "temp_star.svg"
    temp_png = "temp_star.png"
    
    with open(temp_svg, "w") as f:
        f.write(star_svg)
        
    # Render SVG using svglib
    drawing = svg2rlg(temp_svg)
    renderPM.drawToFile(drawing, temp_png, fmt="PNG")
    
    # 2. Build Pillow Background with smooth glow
    bg_img = Image.new("RGBA", (size, size), (7, 10, 19, 255)) # Dark slate (#070A13)
    draw = ImageDraw.Draw(bg_img)
    
    # Draw radial glow
    for r in range(450, 0, -3):
        alpha = int(40 * (1.0 - (r / 450.0)))
        left = 512 - r
        top = 512 - r
        right = 512 + r
        bottom = 512 + r
        draw.ellipse([left, top, right, bottom], fill=(213, 43, 30, alpha))
        
    # Draw rounded card container
    card_size = 310
    card_left = 512 - card_size
    card_top = 512 - card_size
    card_right = 512 + card_size
    card_bottom = 512 + card_size
    
    # Inner dark gray card
    draw.rounded_rectangle(
        [card_left, card_top, card_right, card_bottom],
        radius=145,
        fill=(17, 24, 39, 255), # gray-900 (#111827)
        outline=(213, 43, 30, 255), # Cepsa Red
        width=12
    )
    
    # 3. Paste the rendered SVG star on top of background
    star_img = Image.open(temp_png).convert("RGBA")
    
    # Blend the star_img on top of bg_img
    bg_img.alpha_composite(star_img)
    
    # Save final icon
    output_png = "cepsa_icon.png"
    bg_img.save(output_png, "PNG")
    
    # Clean up temp files
    if os.path.exists(temp_svg):
        os.remove(temp_svg)
    if os.path.exists(temp_png):
        os.remove(temp_png)
        
    print(f"Combined perfect icon generated successfully at: {os.path.abspath(output_png)}")

if __name__ == "__main__":
    render_combined_logo()
