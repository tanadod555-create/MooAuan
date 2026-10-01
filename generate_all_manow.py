import os
from PIL import Image, ImageDraw

OUT_DIR = r"c:\Users\thana\Desktop\MooAuan\public\images"
os.makedirs(OUT_DIR, exist_ok=True)

# Color Palette
C_OUTLINE = (60, 20, 35, 255)
C_PINK_LIGHT = (255, 210, 222, 255)
C_PINK_BASE = (255, 175, 195, 255)
C_PINK_SHADOW = (235, 130, 160, 255)
C_SNOUT = (255, 140, 175, 255)
C_SNOUT_HOLES = (180, 50, 90, 255)
C_CHEEK = (255, 90, 135, 200)
C_EYE = (40, 20, 30, 255)
C_BOW = (255, 75, 130, 255)
C_BOW_SHADOW = (215, 45, 95, 255)
C_SWEAT = (80, 190, 255, 255)
C_GOLD = (255, 215, 0, 255)
C_GOLD_SHADOW = (218, 165, 32, 255)
C_MINT = (110, 225, 180, 255)
C_PURPLE = (180, 120, 230, 255)
C_AURA = (255, 230, 120, 160)

def draw_pig_base(draw, x, y, w=24, h=20, blink=False, mouth='smile', ears_up=False, fit_level=1):
    # Body/Head
    # Shading & Base
    draw.ellipse([x-w//2, y-h//2, x+w//2, y+h//2], fill=C_PINK_BASE, outline=C_OUTLINE, width=1)
    draw.ellipse([x-w//2+1, y-h//2+1, x+w//2-2, y+h//2-3], fill=C_PINK_LIGHT)
    draw.ellipse([x-w//2+2, y+h//2-6, x+w//2-2, y+h//2-1], fill=C_PINK_SHADOW)
    
    # Ears
    ear_dy = -2 if ears_up else 0
    # Left Ear
    draw.polygon([(x-w//2+1, y-h//2+4), (x-w//2-3, y-h//2-2+ear_dy), (x-w//2+5, y-h//2-3+ear_dy)], fill=C_PINK_BASE, outline=C_OUTLINE)
    draw.polygon([(x-w//2+1, y-h//2+2), (x-w//2-1, y-h//2-1+ear_dy), (x-w//2+3, y-h//2-1+ear_dy)], fill=C_PINK_SHADOW)
    # Right Ear
    draw.polygon([(x+w//2-1, y-h//2+4), (x+w//2+3, y-h//2-2+ear_dy), (x+w//2-5, y-h//2-3+ear_dy)], fill=C_PINK_BASE, outline=C_OUTLINE)
    draw.polygon([(x+w//2-1, y-h//2+2), (x+w//2+1, y-h//2-1+ear_dy), (x+w//2-3, y-h//2-1+ear_dy)], fill=C_PINK_SHADOW)

    # Snout
    snout_w, snout_h = 9, 6
    draw.ellipse([x-snout_w//2, y+1, x+snout_w//2, y+1+snout_h], fill=C_SNOUT, outline=C_OUTLINE, width=1)
    draw.point((x-2, y+4), fill=C_SNOUT_HOLES)
    draw.point((x+2, y+4), fill=C_SNOUT_HOLES)

    # Cheeks
    draw.rectangle([x-w//2+3, y+2, x-w//2+5, y+4], fill=C_CHEEK)
    draw.rectangle([x+w//2-5, y+2, x+w//2-3, y+4], fill=C_CHEEK)

    # Eyes
    if blink:
        draw.line([x-6, y-1, x-4, y-1], fill=C_EYE, width=1)
        draw.line([x+4, y-1, x+6, y-1], fill=C_EYE, width=1)
    elif mouth == 'wink':
        draw.point((x-5, y-1), fill=C_EYE)
        draw.line([x+4, y-1, x+6, y-1], fill=C_EYE, width=1)
    else:
        draw.rectangle([x-6, y-2, x-4, y], fill=C_EYE)
        draw.point((x-5, y-2), fill=(255, 255, 255, 255))
        draw.rectangle([x+4, y-2, x+6, y], fill=C_EYE)
        draw.point((x+5, y-2), fill=(255, 255, 255, 255))

    # Mouth
    if mouth == 'open':
        draw.polygon([(x-2, y+9), (x+2, y+9), (x, y+11)], fill=(160, 40, 60, 255))
    elif mouth == 'smile':
        draw.line([x-2, y+9, x+2, y+9], fill=C_OUTLINE, width=1)

    # Cute Head Bow
    draw.polygon([(x-8, y-h//2-2), (x-4, y-h//2), (x-8, y-h//2+2)], fill=C_BOW, outline=C_OUTLINE)
    draw.polygon([(x, y-h//2-2), (x-4, y-h//2), (x, y-h//2+2)], fill=C_BOW, outline=C_OUTLINE)
    draw.rectangle([x-5, y-h//2-1, x-3, y-h//2+1], fill=C_BOW_SHADOW)

def save_gif(frames, out_name, duration=200):
    upscaled = [f.resize((f.width * 4, f.height * 4), Image.NEAREST) for f in frames]
    # Convert to paletted GIF with transparency
    p_frames = []
    for img in upscaled:
        alpha = img.split()[3]
        rgb = img.convert('RGB')
        p = rgb.convert('P', palette=Image.ADAPTIVE, colors=255)
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        p.paste(255, mask)
        p.info['transparency'] = 255
        p_frames.append(p)

    out_path = os.path.join(OUT_DIR, out_name)
    p_frames[0].save(out_path, save_all=True, append_images=p_frames[1:], duration=duration, loop=0, transparency=255, disposal=2)
    print(f"Saved: {out_path}")

# --- LEVEL 4: Treadmill Jogger ---
def make_lv4():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        # Treadmill Base
        d.rectangle([4, 40, 44, 44], fill=(70, 75, 85, 255), outline=C_OUTLINE)
        d.line([4, 42, 44, 42], fill=(120, 130, 145, 255))
        d.line([10, 44, 10, 47], fill=(50, 50, 60, 255), width=2)
        d.line([38, 44, 38, 47], fill=(50, 50, 60, 255), width=2)
        # Treadmill Handlebars
        d.line([38, 40, 40, 26], fill=(90, 95, 110, 255), width=2)
        d.line([36, 26, 42, 26], fill=(50, 50, 60, 255), width=2)

        # Pig bounce
        bounce = -2 if f % 2 == 1 else 0
        leg_step = 2 if f in [0, 2] else -2
        
        # Legs
        d.rectangle([20 + leg_step, 34 + bounce, 23 + leg_step, 40], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([25 - leg_step, 34 + bounce, 28 - leg_step, 40], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        # Shoes
        d.rectangle([19 + leg_step, 38, 24 + leg_step, 40], fill=(255, 100, 150, 255))
        d.rectangle([24 - leg_step, 38, 29 - leg_step, 40], fill=(255, 100, 150, 255))

        # Body
        draw_pig_base(d, 24, 24 + bounce, w=22, h=18, blink=(f == 2), ears_up=(f % 2 == 1))

        # Sweat drop
        if f in [1, 3]:
            d.rectangle([34, 14 + (f*2), 36, 17 + (f*2)], fill=C_SWEAT)
        frames.append(im)
    save_gif(frames, "manow_lv4.gif", 180)

# --- LEVEL 5: Jump Rope Cardio ---
def make_lv5():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        jump_y = -6 if f in [1, 2] else 0

        # Jump Rope (curved line)
        if f == 0: # Rope below feet
            d.arc([8, 30, 40, 46], 0, 180, fill=C_PURPLE, width=1)
        elif f == 1: # Rope swinging side up
            d.line([8, 24, 12, 10], fill=C_PURPLE, width=1)
            d.line([40, 24, 36, 10], fill=C_PURPLE, width=1)
        elif f == 2: # Rope overhead
            d.arc([8, 4, 40, 20], 180, 360, fill=C_PURPLE, width=1)
        elif f == 3: # Rope swinging down
            d.line([8, 12, 12, 28], fill=C_PURPLE, width=1)
            d.line([40, 12, 36, 28], fill=C_PURPLE, width=1)

        # Little legs
        d.rectangle([19, 32 + jump_y, 22, 38 + jump_y], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([26, 32 + jump_y, 29, 38 + jump_y], fill=C_PINK_SHADOW, outline=C_OUTLINE)

        # Athletic shorts
        d.rectangle([17, 28 + jump_y, 31, 33 + jump_y], fill=C_MINT, outline=C_OUTLINE)

        # Body
        draw_pig_base(d, 24, 22 + jump_y, w=20, h=17, blink=(f == 3), ears_up=(f in [1, 2]))

        # Arms holding rope handles
        d.rectangle([10, 22 + jump_y, 14, 25 + jump_y], fill=C_PINK_BASE, outline=C_OUTLINE)
        d.rectangle([34, 22 + jump_y, 38, 25 + jump_y], fill=C_PINK_BASE, outline=C_OUTLINE)
        d.rectangle([9, 21 + jump_y, 11, 26 + jump_y], fill=C_PURPLE)
        d.rectangle([37, 21 + jump_y, 39, 26 + jump_y], fill=C_PURPLE)

        frames.append(im)
    save_gif(frames, "manow_lv5.gif", 160)

# --- LEVEL 6: Spin Bike Hustle ---
def make_lv6():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        # Bike Body
        d.polygon([(12, 42), (36, 42), (28, 28), (18, 36)], outline=(70, 75, 90, 255), width=2)
        # Wheels / Flywheel
        d.ellipse([8, 32, 20, 44], outline=(100, 110, 130, 255), width=2)
        d.ellipse([26, 32, 38, 44], outline=(100, 110, 130, 255), width=2)
        # Handlebar & Seat
        d.line([28, 28, 30, 20], fill=(60, 60, 70, 255), width=2)
        d.line([27, 20, 33, 20], fill=C_OUTLINE, width=2)
        d.line([18, 36, 16, 26], fill=(60, 60, 70, 255), width=2)
        d.rectangle([13, 25, 19, 27], fill=C_BOW)

        # Pedals rotation
        angles = [(23, 35, 23, 41), (20, 38, 26, 38), (23, 41, 23, 35), (26, 38, 20, 38)]
        p = angles[f]
        d.line(p, fill=(200, 200, 210, 255), width=2)

        # Pig body leaning
        lean_x = 22 + (1 if f % 2 == 1 else 0)
        draw_pig_base(d, lean_x, 19, w=19, h=16, mouth='smile', ears_up=(f % 2 == 0))
        # Sports Bra
        d.rectangle([lean_x-7, 22, lean_x+7, 26], fill=C_BOW)

        # Motion lines / Sweat
        if f in [0, 2]:
            d.line([4, 20, 8, 20], fill=(200, 220, 255, 200), width=1)
            d.line([4, 25, 7, 25], fill=(200, 220, 255, 200), width=1)
            d.rectangle([36, 14, 38, 16], fill=C_SWEAT)

        frames.append(im)
    save_gif(frames, "manow_lv6.gif", 150)

# --- LEVEL 7: Pilates Ball S-Curve ---
def make_lv7():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        ball_squash = 2 if f in [1, 3] else 0
        bounce_y = -3 if f in [0, 2] else 0

        # Big Yoga Pilates Ball
        d.ellipse([10, 24 + ball_squash, 38, 46], fill=(255, 160, 195, 255), outline=C_OUTLINE, width=1)
        d.ellipse([14, 26 + ball_squash, 34, 42], fill=(255, 190, 215, 255))
        d.line([10, 35 + ball_squash, 38, 35 + ball_squash], fill=(255, 120, 170, 255), width=1)

        # Pig sitting on ball
        draw_pig_base(d, 24, 18 + bounce_y + ball_squash, w=18, h=15, mouth='wink' if f == 1 else 'smile', ears_up=True)
        # Yoga Top & Leggings
        d.rectangle([18, 21 + bounce_y + ball_squash, 30, 25 + bounce_y + ball_squash], fill=C_MINT)

        # Sparkles ✨
        if f in [1, 2]:
            d.polygon([(38, 10), (40, 8), (42, 10), (40, 12)], fill=(255, 230, 80, 255))
            d.polygon([(8, 14), (10, 12), (12, 14), (10, 16)], fill=(255, 230, 80, 255))

        frames.append(im)
    save_gif(frames, "manow_lv7.gif", 200)

# --- LEVEL 8: Kettlebell Squat Pump ---
def make_lv8():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        squat_y = 4 if f in [1, 2] else 0

        # Legs
        d.rectangle([16, 32 + squat_y, 20, 44], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([28, 32 + squat_y, 32, 44], fill=C_PINK_SHADOW, outline=C_OUTLINE)

        # Athletic Gym Shorts (Dark Slate)
        d.rectangle([15, 27 + squat_y, 33, 33 + squat_y], fill=(45, 55, 70, 255), outline=C_OUTLINE)

        # Pig body with 11-line abs
        draw_pig_base(d, 24, 19 + squat_y, w=18, h=15, mouth='open' if f in [1, 2] else 'smile', ears_up=(f in [0, 3]))
        # 11-line abs
        d.line([22, 23 + squat_y, 22, 27 + squat_y], fill=C_PINK_SHADOW, width=1)
        d.line([26, 23 + squat_y, 26, 27 + squat_y], fill=C_PINK_SHADOW, width=1)

        # Kettlebell in hands
        kb_y = 28 + squat_y if f in [1, 2] else 24 + squat_y
        d.ellipse([21, kb_y, 27, kb_y+6], fill=C_BOW, outline=C_OUTLINE)
        d.arc([22, kb_y-4, 26, kb_y], 180, 360, fill=C_OUTLINE, width=1)

        # Energy bursts
        if f in [0, 3]:
            d.line([8, 18, 5, 18], fill=C_GOLD, width=1)
            d.line([40, 18, 43, 18], fill=C_GOLD, width=1)

        frames.append(im)
    save_gif(frames, "manow_lv8.gif", 200)

# --- LEVEL 9: Barbell Squat Queen ---
def make_lv9():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        squat_y = 5 if f in [1, 2] else 0

        # Neon Aura
        d.ellipse([10, 8 + squat_y, 38, 42 + squat_y], outline=(255, 100, 180, 140), width=1)

        # Legs & Toned Thighs
        d.rectangle([15, 30 + squat_y, 20, 44], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([28, 30 + squat_y, 32, 44], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([14, 26 + squat_y, 34, 31 + squat_y], fill=(30, 30, 40, 255), outline=C_OUTLINE)

        # Barbell across back/shoulders
        bb_y = 13 + squat_y
        d.line([4, bb_y, 44, bb_y], fill=(180, 185, 195, 255), width=2)
        # Weight Plates (Magenta/Pink bumper plates)
        d.rectangle([4, bb_y-5, 8, bb_y+5], fill=C_BOW, outline=C_OUTLINE)
        d.rectangle([40, bb_y-5, 44, bb_y+5], fill=C_BOW, outline=C_OUTLINE)

        # Pig body
        draw_pig_base(d, 24, 18 + squat_y, w=18, h=15, mouth='smile' if f == 0 else 'open', ears_up=True)
        # Abs
        d.line([22, 23 + squat_y, 22, 27 + squat_y], fill=C_PINK_SHADOW, width=1)
        d.line([26, 23 + squat_y, 26, 27 + squat_y], fill=C_PINK_SHADOW, width=1)

        # Hands on barbell
        d.rectangle([12, bb_y-1, 15, bb_y+3], fill=C_PINK_BASE, outline=C_OUTLINE)
        d.rectangle([33, bb_y-1, 36, bb_y+3], fill=C_PINK_BASE, outline=C_OUTLINE)

        frames.append(im)
    save_gif(frames, "manow_lv9.gif", 200)

# --- LEVEL 10: Pixel Fitness Goddess ---
def make_lv10():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        float_y = -3 if f in [1, 2] else 0

        # Golden Angel Wings Flapping
        wing_dy = -2 if f in [1, 2] else 2
        # Left Wing
        d.polygon([(14, 18 + float_y), (2, 8 + float_y + wing_dy), (4, 22 + float_y)], fill=C_GOLD, outline=C_GOLD_SHADOW)
        d.polygon([(12, 19 + float_y), (5, 12 + float_y + wing_dy), (6, 20 + float_y)], fill=(255, 250, 200, 255))
        # Right Wing
        d.polygon([(34, 18 + float_y), (46, 8 + float_y + wing_dy), (44, 22 + float_y)], fill=C_GOLD, outline=C_GOLD_SHADOW)
        d.polygon([(36, 19 + float_y), (43, 12 + float_y + wing_dy), (42, 20 + float_y)], fill=(255, 250, 200, 255))

        # Golden Radiant Halo / Aura
        d.ellipse([14, 4 + float_y, 34, 10 + float_y], outline=C_GOLD, width=1)

        # Toned Legs Floating
        d.rectangle([17, 30 + float_y, 21, 40 + float_y], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        d.rectangle([27, 30 + float_y, 31, 40 + float_y], fill=C_PINK_SHADOW, outline=C_OUTLINE)
        # Golden Goddess Activewear
        d.rectangle([16, 24 + float_y, 32, 29 + float_y], fill=C_GOLD, outline=C_GOLD_SHADOW)

        # Pig Body
        draw_pig_base(d, 24, 18 + float_y, w=18, h=15, mouth='wink' if f == 2 else 'smile', ears_up=True)
        # Abs
        d.line([22, 22 + float_y, 22, 26 + float_y], fill=C_PINK_SHADOW, width=1)
        d.line([26, 22 + float_y, 26, 26 + float_y], fill=C_PINK_SHADOW, width=1)

        # Golden Tiara / Crown
        d.polygon([(19, 9 + float_y), (21, 6 + float_y), (24, 9 + float_y), (27, 6 + float_y), (29, 9 + float_y)], fill=C_GOLD, outline=C_GOLD_SHADOW)
        d.point((24, 8 + float_y), fill=(255, 70, 130, 255))

        # Floating Heart Sparkles 💕
        sparkle_y = (f * 3) % 12
        d.polygon([(8, 28 - sparkle_y), (10, 26 - sparkle_y), (12, 28 - sparkle_y), (10, 30 - sparkle_y)], fill=(255, 100, 180, 255))
        d.polygon([(36, 32 - sparkle_y), (38, 30 - sparkle_y), (40, 32 - sparkle_y), (38, 34 - sparkle_y)], fill=C_GOLD)

        frames.append(im)
    save_gif(frames, "manow_lv10.gif", 180)

if __name__ == '__main__':
    make_lv4()
    make_lv5()
    make_lv6()
    make_lv7()
    make_lv8()
    make_lv9()
    make_lv10()
    print("ALL MANOW LEVELS (1-10) GENERATED SUCCESSFULLY!")
