import os
from PIL import Image, ImageDraw

OUT_DIR = r"c:\Users\thana\Desktop\MooAuan\public\images"
os.makedirs(OUT_DIR, exist_ok=True)

C_OUTLINE = (30, 35, 45, 255)
C_PIG_LIGHT = (255, 220, 230, 255)
C_PIG_BASE = (255, 180, 195, 255)
C_PIG_SHADOW = (230, 140, 160, 255)
C_SNOUT = (255, 145, 175, 255)
C_SNOUT_HOLES = (160, 45, 80, 255)
C_EYE = (25, 25, 35, 255)
C_CHEEK = (255, 100, 145, 200)

C_BLUE_BG = (180, 225, 255, 255)
C_BLUE_RING = (60, 140, 245, 255)
C_RED_BAND = (245, 55, 75, 255)

C_PINK_BG = (255, 215, 230, 255)
C_PINK_RING = (255, 80, 140, 255)
C_BOW = (255, 75, 130, 255)
C_GOLD = (255, 215, 0, 255)

def make_profile_icons():
    # --- 1. MAGNUM PROFILE AVATAR ---
    magnum_frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)

        # Circular Badge Background (Blue / Sky)
        d.ellipse([2, 2, 45, 45], fill=C_BLUE_BG, outline=C_BLUE_RING, width=2)

        # Sparkles in background
        if f in [0, 2]:
            d.polygon([(8, 12), (10, 10), (12, 12), (10, 14)], fill=(255, 255, 255, 220))
            d.polygon([(36, 10), (38, 8), (40, 10), (38, 12)], fill=C_GOLD)
        else:
            d.polygon([(38, 34), (40, 32), (42, 34), (40, 36)], fill=(255, 255, 255, 220))

        # Magnum Pig Head
        bounce = -1 if f in [1, 2] else 0
        cx, cy = 24, 25 + bounce

        # Ears
        ear_dy = -1 if f in [1, 2] else 0
        d.polygon([(cx-10, cy-5), (cx-14, cy-12+ear_dy), (cx-4, cy-11+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)
        d.polygon([(cx+10, cy-5), (cx+14, cy-12+ear_dy), (cx+4, cy-11+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)

        # Head / Body
        d.ellipse([cx-13, cy-10, cx+13, cy+12], fill=C_PIG_BASE, outline=C_OUTLINE, width=1)
        d.ellipse([cx-11, cy-9, cx+11, cy+7], fill=C_PIG_LIGHT)
        d.ellipse([cx-10, cy+6, cx+10, cy+11], fill=C_PIG_SHADOW)

        # Red Gym Headband
        d.rectangle([cx-11, cy-9, cx+11, cy-5], fill=C_RED_BAND, outline=C_OUTLINE)
        d.line([cx-14, cy-7, cx-12, cy-4], fill=C_RED_BAND, width=2)

        # Snout
        d.ellipse([cx-5, cy, cx+5, cy+7], fill=C_SNOUT, outline=C_OUTLINE)
        d.point((cx-2, cy+3), fill=C_SNOUT_HOLES)
        d.point((cx+2, cy+3), fill=C_SNOUT_HOLES)

        # Cheeks
        d.rectangle([cx-9, cy+2, cx-7, cy+4], fill=C_CHEEK)
        d.rectangle([cx+7, cy+2, cx+9, cy+4], fill=C_CHEEK)

        # Eyes (Cool confident wink on frame 2)
        if f == 2:
            d.rectangle([cx-7, cy-3, cx-5, cy-1], fill=C_EYE)
            d.point((cx-6, cy-3), fill=(255, 255, 255, 255))
            d.line([cx+5, cy-2, cx+8, cy-2], fill=C_EYE, width=1) # Wink
        else:
            d.rectangle([cx-7, cy-3, cx-5, cy-1], fill=C_EYE)
            d.point((cx-6, cy-3), fill=(255, 255, 255, 255))
            d.rectangle([cx+5, cy-3, cx+7, cy-1], fill=C_EYE)
            d.point((cx+6, cy-3), fill=(255, 255, 255, 255))

        # Smile
        d.line([cx-2, cy+8, cx+2, cy+8], fill=C_OUTLINE, width=1)

        # Thumbs up gesture on left/bottom
        d.ellipse([cx+8, cy+8, cx+13, cy+13], fill=C_PIG_BASE, outline=C_OUTLINE)
        d.line([cx+11, cy+7, cx+11, cy+10], fill=C_PIG_BASE, width=2) # Thumb up

        magnum_frames.append(im)

    # Save Magnum Avatar
    m_upscaled = [f.resize((192, 192), Image.NEAREST) for f in magnum_frames]
    m_upscaled[0].save(os.path.join(OUT_DIR, "profile_magnum.png"))
    
    # Save GIF
    p_magnum = []
    for img in m_upscaled:
        alpha = img.split()[3]
        rgb = img.convert('RGB')
        p = rgb.convert('P', palette=Image.ADAPTIVE, colors=255)
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        p.paste(255, mask)
        p.info['transparency'] = 255
        p_magnum.append(p)
    p_magnum[0].save(os.path.join(OUT_DIR, "magnum_avatar.gif"), save_all=True, append_images=p_magnum[1:], duration=220, loop=0, transparency=255, disposal=2)
    print("Saved profile_magnum.png & magnum_avatar.gif")


    # --- 2. MANOW PROFILE AVATAR ---
    manow_frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)

        # Circular Badge Background (Pink / Peach)
        d.ellipse([2, 2, 45, 45], fill=C_PINK_BG, outline=C_PINK_RING, width=2)

        # Sparkles & Hearts in background
        if f in [0, 2]:
            d.polygon([(8, 12), (10, 10), (12, 12), (10, 14)], fill=(255, 100, 160, 255))
            d.polygon([(36, 12), (38, 10), (40, 12), (38, 14)], fill=C_GOLD)
        else:
            d.polygon([(38, 32), (40, 30), (42, 32), (40, 34)], fill=(255, 100, 160, 255))

        # Manow Pig Head
        bounce = -1 if f in [1, 2] else 0
        cx, cy = 24, 25 + bounce

        # Ears
        ear_dy = -1 if f in [1, 2] else 0
        d.polygon([(cx-10, cy-5), (cx-14, cy-12+ear_dy), (cx-4, cy-11+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)
        d.polygon([(cx+10, cy-5), (cx+14, cy-12+ear_dy), (cx+4, cy-11+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)

        # Head / Body
        d.ellipse([cx-13, cy-10, cx+13, cy+12], fill=C_PIG_BASE, outline=C_OUTLINE, width=1)
        d.ellipse([cx-11, cy-9, cx+11, cy+7], fill=C_PIG_LIGHT)
        d.ellipse([cx-10, cy+6, cx+10, cy+11], fill=C_PIG_SHADOW)

        # Cute Pink Hair Bow on Right Ear
        d.polygon([(cx+6, cy-12), (cx+10, cy-10), (cx+6, cy-8)], fill=C_BOW, outline=C_OUTLINE)
        d.polygon([(cx+14, cy-12), (cx+10, cy-10), (cx+14, cy-8)], fill=C_BOW, outline=C_OUTLINE)
        d.rectangle([cx+9, cy-11, cx+11, cy-9], fill=(255, 230, 100, 255))

        # Snout
        d.ellipse([cx-5, cy, cx+5, cy+7], fill=C_SNOUT, outline=C_OUTLINE)
        d.point((cx-2, cy+3), fill=C_SNOUT_HOLES)
        d.point((cx+2, cy+3), fill=C_SNOUT_HOLES)

        # Rosy Cheeks
        d.rectangle([cx-9, cy+2, cx-7, cy+4], fill=C_CHEEK)
        d.rectangle([cx+7, cy+2, cx+9, cy+4], fill=C_CHEEK)

        # Eyes (Sweet Wink on frame 2)
        if f == 2:
            d.line([cx-8, cy-2, cx-5, cy-2], fill=C_EYE, width=1) # Wink
            d.rectangle([cx+5, cy-3, cx+7, cy-1], fill=C_EYE)
            d.point((cx+6, cy-3), fill=(255, 255, 255, 255))
        else:
            d.rectangle([cx-7, cy-3, cx-5, cy-1], fill=C_EYE)
            d.point((cx-6, cy-3), fill=(255, 255, 255, 255))
            d.rectangle([cx+5, cy-3, cx+7, cy-1], fill=C_EYE)
            d.point((cx+6, cy-3), fill=(255, 255, 255, 255))

        # Sweet Open Smile
        d.polygon([(cx-2, cy+8), (cx+2, cy+8), (cx, cy+10)], fill=(220, 50, 80, 255))

        # Cute hand waving
        hand_y = cy + 4 if f % 2 == 0 else cy + 2
        d.ellipse([cx-14, hand_y, cx-9, hand_y+5], fill=C_PIG_BASE, outline=C_OUTLINE)

        manow_frames.append(im)

    # Save Manow Avatar
    w_upscaled = [f.resize((192, 192), Image.NEAREST) for f in manow_frames]
    w_upscaled[0].save(os.path.join(OUT_DIR, "profile_manow.png"))

    p_manow = []
    for img in w_upscaled:
        alpha = img.split()[3]
        rgb = img.convert('RGB')
        p = rgb.convert('P', palette=Image.ADAPTIVE, colors=255)
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        p.paste(255, mask)
        p.info['transparency'] = 255
        p_manow.append(p)
    p_manow[0].save(os.path.join(OUT_DIR, "manow_avatar.gif"), save_all=True, append_images=p_manow[1:], duration=220, loop=0, transparency=255, disposal=2)
    print("Saved profile_manow.png & manow_avatar.gif")

if __name__ == '__main__':
    make_profile_icons()
