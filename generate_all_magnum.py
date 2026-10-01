import os
from PIL import Image, ImageDraw

OUT_DIR = r"c:\Users\thana\Desktop\MooAuan\public\images"
os.makedirs(OUT_DIR, exist_ok=True)

# Color Palette for Magnum
C_OUTLINE = (30, 35, 45, 255)
C_PIG_LIGHT = (255, 215, 225, 255)
C_PIG_BASE = (255, 180, 195, 255)
C_PIG_SHADOW = (230, 140, 160, 255)
C_SNOUT = (255, 145, 175, 255)
C_SNOUT_HOLES = (160, 45, 80, 255)
C_EYE = (25, 25, 35, 255)
C_CHEEK = (255, 110, 145, 180)
C_BLUE_HOODIE = (65, 135, 245, 255)
C_BLUE_SHADOW = (40, 95, 195, 255)
C_RED_BAND = (245, 55, 75, 255)
C_NAVY_TANK = (30, 45, 75, 255)
C_SWEAT = (80, 200, 255, 255)
C_GOLD = (255, 215, 0, 255)
C_GOLD_SHADOW = (218, 165, 32, 255)
C_CYAN_AURA = (70, 230, 255, 180)
C_IRON = (140, 150, 165, 255)
C_IRON_DARK = (60, 65, 75, 255)

def draw_magnum_base(draw, x, y, w=24, h=20, blink=False, mouth='smile', ears_up=False, headband=False):
    # Head/Body
    draw.ellipse([x-w//2, y-h//2, x+w//2, y+h//2], fill=C_PIG_BASE, outline=C_OUTLINE, width=1)
    draw.ellipse([x-w//2+1, y-h//2+1, x+w//2-2, y+h//2-3], fill=C_PIG_LIGHT)
    draw.ellipse([x-w//2+2, y+h//2-6, x+w//2-2, y+h//2-1], fill=C_PIG_SHADOW)
    
    # Ears
    ear_dy = -2 if ears_up else 0
    # Left Ear
    draw.polygon([(x-w//2+1, y-h//2+4), (x-w//2-3, y-h//2-2+ear_dy), (x-w//2+5, y-h//2-3+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)
    draw.polygon([(x-w//2+1, y-h//2+2), (x-w//2-1, y-h//2-1+ear_dy), (x-w//2+3, y-h//2-1+ear_dy)], fill=C_PIG_SHADOW)
    # Right Ear
    draw.polygon([(x+w//2-1, y-h//2+4), (x+w//2+3, y-h//2-2+ear_dy), (x+w//2-5, y-h//2-3+ear_dy)], fill=C_PIG_BASE, outline=C_OUTLINE)
    draw.polygon([(x+w//2-1, y-h//2+2), (x+w//2+1, y-h//2-1+ear_dy), (x+w//2-3, y-h//2-1+ear_dy)], fill=C_PIG_SHADOW)

    # Red Headband (if active)
    if headband:
        draw.rectangle([x-w//2+2, y-h//2+2, x+w//2-2, y-h//2+5], fill=C_RED_BAND, outline=C_OUTLINE)
        draw.line([x-w//2-2, y-h//2+3, x-w//2, y-h//2+6], fill=C_RED_BAND, width=2)

    # Snout
    snout_w, snout_h = 9, 6
    draw.ellipse([x-snout_w//2, y+1, x+snout_w//2, y+1+snout_h], fill=C_SNOUT, outline=C_OUTLINE, width=1)
    draw.point((x-2, y+4), fill=C_SNOUT_HOLES)
    draw.point((x+2, y+4), fill=C_SNOUT_HOLES)

    # Cheeks
    draw.rectangle([x-w//2+3, y+3, x-w//2+5, y+5], fill=C_CHEEK)
    draw.rectangle([x+w//2-5, y+3, x+w//2-3, y+5], fill=C_CHEEK)

    # Eyes
    if blink:
        draw.line([x-6, y-1, x-4, y-1], fill=C_EYE, width=1)
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

def save_gif(frames, out_name, duration=200):
    upscaled = [f.resize((f.width * 4, f.height * 4), Image.NEAREST) for f in frames]
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

# --- MAGNUM LV1: Couch Gamer Chonky ---
def make_magnum_lv1():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        tummy_bounce = -1 if f in [1, 2] else 0
        
        # Legs sitting
        d.rectangle([10, 36, 17, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([31, 36, 38, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)

        # Big Chonky Body in Blue Hoodie
        d.ellipse([10, 16 + tummy_bounce, 38, 42], fill=C_BLUE_HOODIE, outline=C_OUTLINE)
        d.ellipse([14, 20 + tummy_bounce, 34, 38], fill=(95, 160, 255, 255))
        # Hoodie strings
        d.line([21, 24, 21, 30], fill=(255, 255, 255, 255))
        d.line([27, 24, 27, 30], fill=(255, 255, 255, 255))

        # Head
        draw_magnum_base(d, 24, 18 + tummy_bounce, w=23, h=18, blink=(f == 3))

        # Game controller in hands
        d.rectangle([18, 30 + tummy_bounce, 30, 36 + tummy_bounce], fill=(40, 45, 55, 255), outline=C_OUTLINE)
        d.point((21, 33 + tummy_bounce), fill=(255, 70, 70, 255)) # D-pad/button
        d.point((27, 33 + tummy_bounce), fill=(70, 180, 255, 255)) # Button

        # Zzz or chips
        if f in [1, 2]:
            d.text((37, 8), "Z", fill=(100, 150, 255, 255))
        frames.append(im)
    save_gif(frames, "magnum_lv1.gif", 240)

# --- MAGNUM LV2: Burger Glutton ---
def make_magnum_lv2():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        chew_dy = 1 if f in [1, 3] else 0

        # Body
        draw_magnum_base(d, 24, 20, w=24, h=20, mouth='open' if f in [1, 3] else 'smile', ears_up=(f % 2 == 1))

        # Big Double Cheeseburger in hands
        bg_y = 26 + chew_dy
        d.ellipse([16, bg_y, 32, bg_y+4], fill=(215, 145, 65, 255), outline=C_OUTLINE) # Top bun
        d.rectangle([17, bg_y+3, 31, bg_y+5], fill=(80, 190, 60, 255)) # Lettuce
        d.rectangle([17, bg_y+5, 31, bg_y+7], fill=(130, 50, 40, 255)) # Patty
        d.rectangle([17, bg_y+7, 31, bg_y+8], fill=(255, 200, 0, 255)) # Cheese
        d.ellipse([16, bg_y+8, 32, bg_y+11], fill=(200, 130, 55, 255), outline=C_OUTLINE) # Bottom bun

        # Tail wagging
        tail_x = 7 if f in [0, 2] else 5
        d.arc([tail_x, 26, tail_x+5, 31], 0, 270, fill=C_PIG_SHADOW, width=2)
        frames.append(im)
    save_gif(frames, "magnum_lv2.gif", 200)

# --- MAGNUM LV3: Jumping Jacks Sweating ---
def make_magnum_lv3():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        jump = -3 if f in [1, 3] else 0

        # Legs
        if f in [1, 3]: # Legs apart
            d.rectangle([12, 32 + jump, 16, 42 + jump], fill=C_PIG_SHADOW, outline=C_OUTLINE)
            d.rectangle([32, 32 + jump, 36, 42 + jump], fill=C_PIG_SHADOW, outline=C_OUTLINE)
            d.rectangle([11, 28 + jump, 37, 33 + jump], fill=C_BLUE_HOODIE, outline=C_OUTLINE)
        else: # Legs together
            d.rectangle([19, 32, 23, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)
            d.rectangle([25, 32, 29, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)
            d.rectangle([17, 28, 31, 33], fill=C_BLUE_HOODIE, outline=C_OUTLINE)

        # Head & Body
        draw_magnum_base(d, 24, 20 + jump, w=22, h=18, headband=True, mouth='open' if f in [1, 3] else 'smile', ears_up=(f in [1, 3]))

        # Arms
        if f in [1, 3]: # Arms up
            d.line([13, 20 + jump, 8, 10 + jump], fill=C_PIG_BASE, width=3)
            d.line([35, 20 + jump, 40, 10 + jump], fill=C_PIG_BASE, width=3)
        else: # Arms down
            d.line([13, 20, 9, 28], fill=C_PIG_BASE, width=3)
            d.line([35, 20, 39, 28], fill=C_PIG_BASE, width=3)

        # Sweat drops
        if f in [1, 2]:
            d.rectangle([36, 12, 38, 15], fill=C_SWEAT)
        frames.append(im)
    save_gif(frames, "magnum_lv3.gif", 180)

# --- MAGNUM LV4: Treadmill Jogger ---
def make_magnum_lv4():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        # Treadmill
        d.rectangle([4, 40, 44, 44], fill=(70, 75, 85, 255), outline=C_OUTLINE)
        d.line([4, 42, 44, 42], fill=(120, 130, 145, 255))
        d.line([10, 44, 10, 47], fill=(50, 50, 60, 255), width=2)
        d.line([38, 44, 38, 47], fill=(50, 50, 60, 255), width=2)
        d.line([38, 40, 40, 26], fill=(90, 95, 110, 255), width=2)
        d.line([36, 26, 42, 26], fill=(50, 50, 60, 255), width=2)

        bounce = -2 if f % 2 == 1 else 0
        leg_step = 2 if f in [0, 2] else -2

        # Running legs
        d.rectangle([20 + leg_step, 34 + bounce, 23 + leg_step, 40], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([25 - leg_step, 34 + bounce, 28 - leg_step, 40], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([19 + leg_step, 38, 24 + leg_step, 40], fill=C_BLUE_HOODIE)
        d.rectangle([24 - leg_step, 38, 29 - leg_step, 40], fill=C_BLUE_HOODIE)

        draw_magnum_base(d, 24, 23 + bounce, w=21, h=17, headband=True, ears_up=(f % 2 == 1))
        frames.append(im)
    save_gif(frames, "magnum_lv4.gif", 180)

# --- MAGNUM LV5: Shadow Boxing ---
def make_magnum_lv5():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        punch_left = (f == 1)
        punch_right = (f == 3)

        # Legs in boxing stance
        d.rectangle([18, 32, 22, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([26, 32, 30, 42], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([16, 28, 32, 33], fill=C_NAVY_TANK, outline=C_OUTLINE)

        # Head/Body
        draw_magnum_base(d, 24, 21, w=20, h=17, headband=True, mouth='open' if (punch_left or punch_right) else 'smile')

        # Red Boxing Gloves
        # Left Glove
        if punch_left:
            d.rectangle([6, 18, 12, 24], fill=C_RED_BAND, outline=C_OUTLINE) # Extended punch
            d.line([13, 21, 6, 21], fill=(255, 200, 200, 255), width=2)
            d.line([3, 19, 1, 19], fill=C_SWEAT, width=2) # Impact line
        else:
            d.rectangle([12, 20, 16, 25], fill=C_RED_BAND, outline=C_OUTLINE) # Guard

        # Right Glove
        if punch_right:
            d.rectangle([36, 18, 42, 24], fill=C_RED_BAND, outline=C_OUTLINE) # Extended punch
            d.line([43, 19, 46, 19], fill=C_SWEAT, width=2) # Impact line
        else:
            d.rectangle([32, 20, 36, 25], fill=C_RED_BAND, outline=C_OUTLINE) # Guard

        frames.append(im)
    save_gif(frames, "magnum_lv5.gif", 160)

# --- MAGNUM LV6: Speed Cycling ---
def make_magnum_lv6():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        # Bike
        d.polygon([(12, 42), (36, 42), (28, 28), (18, 36)], outline=(50, 60, 75, 255), width=2)
        d.ellipse([8, 32, 20, 44], outline=(70, 85, 105, 255), width=2)
        d.ellipse([26, 32, 38, 44], outline=(70, 85, 105, 255), width=2)
        d.line([28, 28, 30, 20], fill=(60, 60, 70, 255), width=2)
        d.line([27, 20, 33, 20], fill=C_OUTLINE, width=2)
        d.line([18, 36, 16, 26], fill=(60, 60, 70, 255), width=2)

        # Pedals
        angles = [(23, 35, 23, 41), (20, 38, 26, 38), (23, 41, 23, 35), (26, 38, 20, 38)]
        p = angles[f]
        d.line(p, fill=C_IRON, width=2)

        # Body leaning forward
        draw_magnum_base(d, 23, 19, w=19, h=16, headband=True, mouth='open')
        # Tank top
        d.rectangle([16, 22, 30, 26], fill=C_NAVY_TANK)

        # Speed effect
        if f % 2 == 0:
            d.line([2, 18, 8, 18], fill=C_CYAN_AURA, width=1)
            d.line([3, 24, 7, 24], fill=C_CYAN_AURA, width=1)
        frames.append(im)
    save_gif(frames, "magnum_lv6.gif", 150)

# --- MAGNUM LV7: Dumbbell Bicep Curl ---
def make_magnum_lv7():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        curl_up = (f in [1, 2])

        # Strong Legs
        d.rectangle([16, 32, 21, 44], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([27, 32, 32, 44], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([15, 28, 33, 33], fill=C_NAVY_TANK, outline=C_OUTLINE)

        # Fit Body with Biceps
        draw_magnum_base(d, 24, 19, w=19, h=16, headband=True, mouth='open' if curl_up else 'smile')
        # Tank Top
        d.rectangle([17, 21, 31, 28], fill=C_NAVY_TANK)

        # Dumbbells in hands
        db_y = 18 if curl_up else 28
        # Left Dumbbell
        d.rectangle([9, db_y, 13, db_y+5], fill=C_IRON_DARK, outline=C_OUTLINE)
        d.line([11, db_y-2, 11, db_y+7], fill=C_IRON, width=2)
        # Right Dumbbell
        d.rectangle([35, db_y, 39, db_y+5], fill=C_IRON_DARK, outline=C_OUTLINE)
        d.line([37, db_y-2, 37, db_y+7], fill=C_IRON, width=2)

        # Flexing sparkle
        if curl_up:
            d.polygon([(7, 12), (9, 10), (11, 12), (9, 14)], fill=C_GOLD)
            d.polygon([(37, 12), (39, 10), (41, 12), (39, 14)], fill=C_GOLD)

        frames.append(im)
    save_gif(frames, "magnum_lv7.gif", 200)

# --- MAGNUM LV8: Bench Press Powerhouse ---
def make_magnum_lv8():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        bar_y = 20 if f in [1, 2] else 12

        # Gym Bench
        d.rectangle([8, 36, 40, 40], fill=(50, 55, 65, 255), outline=C_OUTLINE)
        d.line([12, 40, 12, 46], fill=(30, 30, 40, 255), width=2)
        d.line([36, 40, 36, 46], fill=(30, 30, 40, 255), width=2)

        # Pig Lying Down
        draw_magnum_base(d, 24, 30, w=20, h=14, headband=True, mouth='open')

        # Heavy Barbell Press
        d.line([4, bar_y, 44, bar_y], fill=C_IRON, width=2)
        # Iron Weight Plates
        d.rectangle([4, bar_y-5, 8, bar_y+5], fill=C_IRON_DARK, outline=C_OUTLINE)
        d.rectangle([40, bar_y-5, 44, bar_y+5], fill=C_IRON_DARK, outline=C_OUTLINE)

        # Arms holding bar
        d.line([18, 30, 16, bar_y], fill=C_PIG_BASE, width=3)
        d.line([30, 30, 32, bar_y], fill=C_PIG_BASE, width=3)

        frames.append(im)
    save_gif(frames, "magnum_lv8.gif", 220)

# --- MAGNUM LV9: Deadlift Chad (Shredded 6-pack) ---
def make_magnum_lv9():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        lift_up = (f in [0, 3])
        bar_y = 26 if lift_up else 36
        body_y = 17 if lift_up else 22

        # Cyan Power Aura
        d.ellipse([8, 6, 40, 44], outline=C_CYAN_AURA, width=1)

        # Strong Legs
        d.rectangle([15, 30, 20, 44], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([28, 30, 33, 44], fill=C_PIG_SHADOW, outline=C_OUTLINE)

        # Weightlifting Belt
        d.rectangle([14, body_y+8, 34, body_y+12], fill=(20, 20, 25, 255), outline=C_GOLD)

        # Muscular Body & Head
        draw_magnum_base(d, 24, body_y, w=19, h=16, headband=True, mouth='open')
        # 6-Pack Abs definition
        if lift_up:
            d.line([22, body_y+3, 22, body_y+8], fill=C_PIG_SHADOW, width=1)
            d.line([26, body_y+3, 26, body_y+8], fill=C_PIG_SHADOW, width=1)
            d.line([21, body_y+5, 27, body_y+5], fill=C_PIG_SHADOW, width=1)

        # Heavy Barbell
        d.line([2, bar_y, 46, bar_y], fill=C_IRON, width=2)
        d.rectangle([2, bar_y-6, 7, bar_y+6], fill=C_IRON_DARK, outline=C_OUTLINE)
        d.rectangle([41, bar_y-6, 46, bar_y+6], fill=C_IRON_DARK, outline=C_OUTLINE)

        # Lightning sparks
        if lift_up:
            d.line([6, 12, 10, 16], fill=C_CYAN_AURA, width=1)
            d.line([38, 12, 42, 16], fill=C_CYAN_AURA, width=1)

        frames.append(im)
    save_gif(frames, "magnum_lv9.gif", 200)

# --- MAGNUM LV10: Super Saiyan Gym God Chad ---
def make_magnum_lv10():
    frames = []
    for f in range(4):
        im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        float_y = -3 if f in [1, 2] else 0

        # Flaming Golden Aura
        aura_w = 40 if f % 2 == 0 else 44
        d.ellipse([24-aura_w//2, 4+float_y, 24+aura_w//2, 44+float_y], outline=C_GOLD, width=2)
        # Aura flame spikes
        d.polygon([(10, 20+float_y), (4, 10+float_y), (14, 14+float_y)], fill=C_GOLD)
        d.polygon([(38, 20+float_y), (44, 10+float_y), (34, 14+float_y)], fill=C_GOLD)

        # Muscular Legs
        d.rectangle([16, 29+float_y, 21, 41+float_y], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([27, 29+float_y, 32, 41+float_y], fill=C_PIG_SHADOW, outline=C_OUTLINE)
        d.rectangle([14, 25+float_y, 34, 30+float_y], fill=(20, 20, 30, 255), outline=C_GOLD)

        # Massive Muscular Body & Head
        draw_magnum_base(d, 24, 17+float_y, w=20, h=16, headband=True, mouth='open')
        # 6-Pack + Pecs
        d.line([21, 19+float_y, 27, 19+float_y], fill=C_PIG_SHADOW, width=1)
        d.line([22, 20+float_y, 22, 25+float_y], fill=C_PIG_SHADOW, width=1)
        d.line([26, 20+float_y, 26, 25+float_y], fill=C_PIG_SHADOW, width=1)

        # Flexing Huge Biceps
        d.ellipse([6, 13+float_y, 14, 21+float_y], fill=C_PIG_BASE, outline=C_OUTLINE)
        d.ellipse([34, 13+float_y, 42, 21+float_y], fill=C_PIG_BASE, outline=C_OUTLINE)

        # Champion Gold Crown
        d.polygon([(18, 6+float_y), (20, 3+float_y), (24, 7+float_y), (28, 3+float_y), (30, 6+float_y)], fill=C_GOLD, outline=C_GOLD_SHADOW)
        d.point((24, 5+float_y), fill=(255, 50, 50, 255))

        # Cyan Energy Lightning
        d.line([10, 30, 14, 34], fill=C_CYAN_AURA, width=1)
        d.line([38, 30, 34, 34], fill=C_CYAN_AURA, width=1)

        frames.append(im)
    save_gif(frames, "magnum_lv10.gif", 180)

if __name__ == '__main__':
    make_magnum_lv1()
    make_magnum_lv2()
    make_magnum_lv3()
    make_magnum_lv4()
    make_magnum_lv5()
    make_magnum_lv6()
    make_magnum_lv7()
    make_magnum_lv8()
    make_magnum_lv9()
    make_magnum_lv10()
    print("ALL MAGNUM LEVELS (1-10) GENERATED SUCCESSFULLY!")
