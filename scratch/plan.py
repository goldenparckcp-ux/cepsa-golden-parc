# Create a high quality 1024x1024 app icon PNG for Meta developer portal.
# It should contain the Cepsa symbol (only the 4-pointed star motif, not the CEPSA word) in white or red, centered on a beautiful premium background.
# Let's generate a SVG with a beautiful dark gradient background, the cepsa star symbol in red/orange or white, and render it to a PNG file using a simple Python script.

import os
from PIL import Image, ImageDraw

def generate_png_icon():
    # Meta requires an icon between 512x512 and 1024x1024. Let's make it 1024x1024.
    size = 1024
    img = Image.new("RGBA", (size, size), (15, 23, 42, 255)) # Sleek slate-900 background #0F172A
    draw = ImageDraw.Draw(img)
    
    # We want a premium design: a subtle gradient or circle in the background to give depth.
    # Draw a soft blue/red radial glow at the center
    for r in range(400, 0, -4):
        # radial gradient from center (512, 512)
        alpha = int(35 * (1 - (r / 400.0)))
        # lets draw a circle
        left = 512 - r
        top = 512 - r
        right = 512 + r
        bottom = 512 + r
        draw.ellipse([left, top, right, bottom], fill=(220, 38, 38, alpha)) # Cepsa red glow
        
    # Now draw a premium rounded icon border/card at the center
    # Card size 600x600 rounded
    card_r = 300
    card_left = 512 - card_r
    card_top = 512 - card_r
    card_right = 512 + card_r
    card_bottom = 512 + card_r
    
    # Draw dark surface
    draw.rounded_rectangle([card_left, card_top, card_right, card_bottom], radius=120, fill=(7, 10, 19, 255), outline=(220, 38, 38, 40), width=4)
    
    # Now let's draw the Cepsa Star logo using the original SVG coordinates, scaled to fit inside our 1024x1024 canvas.
    # The original coordinates of the star paths are in viewBox="0 0 180 49" but the star itself fits in 0 0 53 49.
    # Let's look at the paths:
    # Path 1: M18,25.1l-9.7,0c-0.8,0-1.5,0.2-2.1,0.7c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3l14.1,0 c1,0,1.1,0.5,1,1.1l-2.9,14.5c-0.2,0.9,0.6,1,1,0.6l5.3-4.3c0.7-0.5,1.8-1.3,2.1-2.7c0,0,1.4-7.2,2.1-10.1 C24,27.3,21.4,25.1,18,25.1z
    # Instead of manual path drawing with ImageDraw which is tedious and error-prone, we can generate a temporary SVG file of 1024x1024
    # and then convert it using a simple script, or since cairosvg is missing, we can write a HTML file and use a browser/headless,
    # or write a python script that parses the SVG and draws paths using aggdraw or PIL's path drawing if available,
    # or use a canvas-based approach via Node.js which has canvas or we can do a super clean SVG rendering.
    # Wait, can we write a Node.js script using canvas? Let's check package.json to see if we have canvas or similar, or we can just use python PIL with custom polygons.
    # Actually, python's PIL can draw arbitrary polygons or we can just generate a beautiful SVG and convert it. But since we need a PNG for the Meta upload, we must output a PNG.
    # Let's see if we can install an SVG to PNG converter in python, or use Node to generate it. Let's see if canvas is installed in package.json.
    pass
