import os
import sys
from PIL import Image, ImageDraw

def render_logo():
    # Size 1024x1024 as requested by Facebook / Meta for App Icon
    size = 1024
    
    # Create background with Cepsa Red / Sleek styling
    # Background color is dark charcoal-blue (#0B0F19) for premium look, which matches the dark mode web app
    img = Image.new("RGBA", (size, size), (11, 15, 25, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw radial background glow at the center
    # Create soft red/orange glow behind the logo
    for r in range(450, 0, -4):
        # alpha drops from 40 to 0
        alpha = int(45 * (1.0 - (r / 450.0)))
        left = 512 - r
        top = 512 - r
        right = 512 + r
        bottom = 512 + r
        # Drawing a soft ellipse
        draw.ellipse([left, top, right, bottom], fill=(213, 43, 30, alpha))
        
    # Draw premium container (a rounded rectangle with a thin glowing border)
    # The rounded rectangle will hold the star symbol
    card_size = 300
    card_left = 512 - card_size
    card_top = 512 - card_size
    card_right = 512 + card_size
    card_bottom = 512 + card_size
    
    # Draw dark inner container
    draw.rounded_rectangle(
        [card_left, card_top, card_right, card_bottom],
        radius=140,
        fill=(17, 24, 39, 255), # slate-900 / gray-900 (#111827)
        outline=(213, 43, 30, 255), # Cepsa red border
        width=12
    )

    # Let's scale and translate the Cepsa Star symbol
    # The Cepsa star consists of 4 wings:
    # 1. Top-Right: d="M51.1,16.4l-14.1,0c-1,0-1.1-0.5-1-1l2.9-14.5c0.2-0.9-0.6-1-1-0.6l-5.7,4.6c-0.6,0.5-1.5,1.3-1.7,2.7 c-0.6,3.1-1.4,6.8-2,9.8c-0.7,3.5,2,5.7,5.3,5.7l9.7,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C52.2,16.9,51.7,16.4,51.1,16.4z"
    # 2. Top-Left: d="M27.5,10.2c0.2-0.9-0.5-1.1-1.3-0.6l-7.7,6.3c-0.4,0.3-1,0.6-1.5,0.6H10c-0.8,0-1.5,0.2-2.1,0.7 c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3L19,23c3,0,6.4-2.5,6.9-4.8L27.5,10.2z"
    # 3. Bottom-Left: d="M18,25.1l-9.7,0c-0.8,0-1.5,0.2-2.1,0.7c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3l14.1,0 c1,0,1.1,0.5,1,1.1l-2.9,14.5c-0.2,0.9,0.6,1,1,0.6l5.3-4.3c0.7-0.5,1.8-1.3,2.1-2.7c0,0,1.4-7.2,2.1-10.1 C24,27.3,21.4,25.1,18,25.1z"
    # 4. Bottom-Right: d="M49.4,25.1l-16.6,0c-3,0-6.4,2.5-6.9,4.8l-1.6,8c-0.2,0.9,0.5,1.1,1.3,0.6l7.7-6.2c0.4-0.3,1-0.6,1.5-0.6 l7.1,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C50.6,25.6,50,25.1,49.4,25.1z"
    
    # We will approximate these paths using polygons since they are mostly composed of lines and simple curves.
    # To get a pixel-perfect rendering of the SVG without complex SVG engines, we can create an HTML page with the SVG
    # scaled up to 1024x1024, and since there is no headless browser readily configured, we can draw the polygons in PIL
    # using high-density vertices representing the bezier curves, or we can use PIL to rasterize a high-res SVG.
    # Wait! The easiest and most pixel-perfect way is to write a python script that draws the SVG using a high-density polygon approximation, or
    # we can draw the exact shapes.
    # Let's map the exact coordinates, scaling them up from [0, 53] width and [0, 49] height to about [0, 400] centered at 512, 512.
    
    # Let's define the SVG coordinates.
    # We want to scale the SVG viewBox: x in [0, 53], y in [0, 49] to fit inside [312, 712] (400 width)
    # The center of the viewBox is at x = 26.5, y = 24.5.
    # We want this center to map to (512, 512).
    # Scale factor = 400 / 53 = 7.55
    # Let's write helper scaling functions:
    def scale_x(x):
        return 512 + (x - 26.5) * 7.5
    def scale_y(y):
        return 512 + (y - 24.5) * 7.5
        
    # Polygons approximation:
    # 1. Top-Right:
    # d="M51.1,16.4l-14.1,0c-1,0-1.1-0.5-1-1l2.9-14.5c0.2-0.9-0.6-1-1-0.6l-5.7,4.6c-0.6,0.5-1.5,1.3-1.7,2.7 c-0.6,3.1-1.4,6.8-2,9.8c-0.7,3.5,2,5.7,5.3,5.7l9.7,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C52.2,16.9,51.7,16.4,51.1,16.4z"
    # Let's build point arrays.
    # For curves, we interpolate intermediate points.
    
    # Curve 1: from -1.7,2.7 to -2,9.8 via control points, or we can just specify a list of sequential coordinates
    # that approximate the curves extremely well.
    # Let's do a smooth list of points:
    top_right = [
        (51.1, 16.4), (37.0, 16.4), (36.0, 15.9), (35.9, 14.9), (38.8, 0.9), (38.0, 0.3), (32.3, 4.9), 
        (31.7, 5.4), (30.0, 8.1), (28.6, 14.9), (26.6, 24.7), (29.5, 27.2), (34.8, 27.2), (44.5, 27.2), 
        (45.3, 27.0), (47.4, 26.5), (53.0, 21.9), (52.2, 16.9), (51.1, 16.4)
    ]
    
    # 2. Top-Left:
    # d="M27.5,10.2c0.2-0.9-0.5-1.1-1.3-0.6l-7.7,6.3c-0.4,0.3-1,0.6-1.5,0.6H10c-0.8,0-1.5,0.2-2.1,0.7 c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3L19,23c3,0,6.4-2.5,6.9-4.8L27.5,10.2z"
    top_left = [
        (27.5, 10.2), (26.2, 9.1), (18.5, 15.4), (18.1, 15.7), (16.6, 16.3), (10.0, 16.3), (7.9, 17.0), 
        (2.3, 21.6), (1.7, 22.2), (2.5, 22.9), (19.0, 23.0), (22.0, 23.0), (25.4, 20.5), (25.9, 18.2), (27.5, 10.2)
    ]
    
    # 3. Bottom-Left:
    # d="M18,25.1l-9.7,0c-0.8,0-1.5,0.2-2.1,0.7c-0.3,0.3-5,4-5.6,4.6c-1,0.8-0.5,1.3,0.2,1.3l14.1,0 c1,0,1.1,0.5,1,1.1l-2.9,14.5c-0.2,0.9,0.6,1,1,0.6l5.3-4.3c0.7-0.5,1.8-1.3,2.1-2.7c0,0,1.4-7.2,2.1-10.1 C24,27.3,21.4,25.1,18,25.1z"
    bottom_left = [
        (18.0, 25.1), (8.3, 25.1), (6.2, 25.8), (0.6, 30.4), (1.2, 31.7), (15.3, 31.7), (16.3, 32.2), 
        (16.3, 32.8), (13.4, 47.3), (14.2, 47.9), (19.5, 43.6), (20.2, 43.1), (21.3, 41.8), (22.0, 39.1), 
        (24.1, 29.0), (21.4, 25.1), (18.0, 25.1)
    ]
    
    # 4. Bottom-Right:
    # d="M49.4,25.1l-16.6,0c-3,0-6.4,2.5-6.9,4.8l-1.6,8c-0.2,0.9,0.5,1.1,1.3,0.6l7.7-6.2c0.4-0.3,1-0.6,1.5-0.6 l7.1,0c0.8,0,1.5-0.2,2.1-0.7c0.3-0.3,5-4,5.6-4.6C50.6,25.6,50,25.1,49.4,25.1z"
    bottom_right = [
        (49.4, 25.1), (32.8, 25.1), (29.8, 25.1), (26.4, 27.6), (25.9, 29.9), (24.3, 37.9), (25.6, 38.5), 
        (33.3, 32.3), (33.7, 32.0), (34.7, 31.4), (41.8, 31.4), (43.9, 30.7), (49.5, 26.1), (50.1, 25.5), (49.4, 25.1)
    ]
    
    # Scale coordinate lists
    scaled_top_right = [(scale_x(x), scale_y(y)) for (x, y) in top_right]
    scaled_top_left = [(scale_x(x), scale_y(y)) for (x, y) in top_left]
    scaled_bottom_left = [(scale_x(x), scale_y(y)) for (x, y) in bottom_left]
    scaled_bottom_right = [(scale_x(x), scale_y(y)) for (x, y) in bottom_right]
    
    # Draw wings with solid brand Cepsa Red color (#D52B1E)
    # Cepsa red: R=213, G=43, B=30
    cepsa_red = (213, 43, 30, 255)
    
    draw.polygon(scaled_top_right, fill=cepsa_red)
    draw.polygon(scaled_top_left, fill=cepsa_red)
    draw.polygon(scaled_bottom_left, fill=cepsa_red)
    draw.polygon(scaled_bottom_right, fill=cepsa_red)
    
    # Save the output image in the root directory
    output_path = "cepsa_icon.png"
    img.save(output_path, "PNG")
    print(f"Icon saved successfully at: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    render_logo()
