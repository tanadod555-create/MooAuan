import os
from PIL import Image, ImageDraw

OUT_DIR = r"c:\Users\thana\Desktop\MooAuan\public\images"
os.makedirs(OUT_DIR, exist_ok=True)

# Load base pig sprite
sheet = Image.open(r"C:\Users\thana\.gemini\antigravity\brain\e525fad4-9342-4b60-bcaa-e7bb4c630aa1\manow_lv3_sprites_1790842764000.jpg").convert('RGBA')
w, h = sheet.size
fw = w // 4

f4 = sheet.crop((3 * fw, 0, 4 * fw, h))
datas = f4.getdata()
new_d = []
for item in datas:
    if (item[0] > 230 and item[1] > 230 and item[2] > 230) or (item[1] > 200 and item[0] < 180 and item[2] < 200):
        new_d.append((255, 255, 255, 0))
    else:
        new_d.append(item)
f4.putdata(new_d)
bbox = f4.getbbox()
pig_base = f4.crop(bbox)

# Base Colors
C_OUTLINE = (0, 0, 0, 255)
C_BLUE_HOODIE = (65, 140, 250, 255)
C_BLUE_DARK = (40, 95, 200, 255)
C_RED_BAND = (245, 55, 75, 255)
C_NAVY_TANK = (30, 45, 75, 255)
C_GOLD = (255, 215, 0, 255)
C_GOLD_LIGHT = (255, 245, 180, 255)
C_SWEAT = (80, 200, 255, 255)
C_CYAN_AURA = (60, 230, 255, 180)
C_IRON = (180, 190, 205, 255)
C_IRON_DARK = (50, 55, 65, 255)

def save_gif(frames, out_name, duration=180):
    p_frames = []
    for img in frames:
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

# ==========================================
# MAGNUM LV1: Couch Gamer Chonky
# ==========================================
def make_magnum_lv1():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        bounce_y = -4 if i in [1, 2] else 0

        # Big Blue Oversized Hoodie
        d.ellipse([100, 140 + bounce_y, 300, 260 + bounce_y], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=4)
        d.ellipse([130, 160 + bounce_y, 270, 240 + bounce_y], fill=(90, 160, 255, 255))
        d.line([185, 175 + bounce_y, 185, 210 + bounce_y], fill=(255, 255, 255, 255), width=3)
        d.line([215, 175 + bounce_y, 215, 210 + bounce_y], fill=(255, 255, 255, 255), width=3)

        # Pig Head/Body
        c.paste(pig_base, (48, 20 + bounce_y), pig_base)

        # Game Controller in hands
        d.rectangle([160, 205 + bounce_y, 240, 240 + bounce_y], fill=(35, 40, 50, 255), outline=C_OUTLINE, width=3)
        d.ellipse([170, 215 + bounce_y, 185, 230 + bounce_y], fill=(240, 60, 60, 255)) # D-pad
        d.ellipse([215, 215 + bounce_y, 230, 230 + bounce_y], fill=(60, 180, 255, 255)) # Buttons

        # Floating Zzz
        if i in [1, 2]:
            d.polygon([(320, 70), (340, 70), (320, 90), (340, 90)], fill=(90, 150, 255, 255))

        frames.append(c)
    save_gif(frames, "magnum_lv1.gif", 220)

# ==========================================
# MAGNUM LV2: Double Cheeseburger Muncher
# ==========================================
def make_magnum_lv2():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        chew_y = 4 if i in [1, 3] else 0

        # Pig Body
        c.paste(pig_base, (48, 20 + chew_y), pig_base)

        # Giant Double Cheeseburger
        bg_y = 150 + chew_y
        d.ellipse([130, bg_y, 270, bg_y + 35], fill=(220, 150, 70, 255), outline=C_OUTLINE, width=4) # Top Bun
        d.rectangle([135, bg_y + 25, 265, bg_y + 38], fill=(80, 190, 60, 255)) # Lettuce
        d.rectangle([135, bg_y + 38, 265, bg_y + 52], fill=(125, 50, 40, 255)) # Patty 1
        d.rectangle([135, bg_y + 52, 265, bg_y + 60], fill=(255, 200, 0, 255)) # Melted Cheese
        d.rectangle([135, bg_y + 60, 265, bg_y + 74], fill=(125, 50, 40, 255)) # Patty 2
        d.ellipse([130, bg_y + 70, 270, bg_y + 95], fill=(200, 130, 60, 255), outline=C_OUTLINE, width=4) # Bottom Bun

        # Tail wagging
        tail_x = 35 if i in [0, 2] else 20
        d.arc([tail_x, 180, tail_x + 35, 215], 0, 270, fill=(240, 140, 160, 255), width=5)

        frames.append(c)
    save_gif(frames, "magnum_lv2.gif", 200)

# ==========================================
# MAGNUM LV3: Jumping Jacks Sweating
# ==========================================
def make_magnum_lv3():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        jump = -18 if i in [1, 3] else 0

        # Blue Workout Shorts
        d.rectangle([115, 175 + jump, 285, 220 + jump], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=4)

        # Pig
        c.paste(pig_base, (48, 25 + jump), pig_base)

        # Red Headband
        d.rectangle([110, 40 + jump, 290, 60 + jump], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Sweat droplets
        if i in [1, 2]:
            d.ellipse([320, 60, 335, 80], fill=C_SWEAT, outline=C_OUTLINE, width=2)

        frames.append(c)
    save_gif(frames, "magnum_lv3.gif", 180)

# ==========================================
# MAGNUM LV4: Treadmill Jogger
# ==========================================
def make_magnum_lv4():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        # Treadmill Base
        d.rectangle([40, 240, 360, 275], fill=(55, 60, 70, 255), outline=C_OUTLINE, width=4)
        offset = (i * 20) % 60
        for sx in range(50 - offset, 350, 40):
            if 40 <= sx <= 350:
                d.line([sx, 243, sx+15, 272], fill=(120, 130, 145, 255), width=4)

        # Console
        d.line([330, 240, 340, 120], fill=(80, 85, 95, 255), width=10)
        d.rectangle([310, 100, 360, 130], fill=(30, 35, 45, 255), outline=C_OUTLINE, width=3)
        d.rectangle([318, 106, 352, 124], fill=(15, 25, 30, 255))
        d.line([322, 115, 348, 115], fill=(60, 180, 255, 255), width=2)
        d.line([220, 140, 335, 125], fill=(80, 85, 95, 255), width=6)

        bounce_y = -10 if i in [1, 3] else 0
        step_x = 4 if i in [0, 2] else -4

        # Pig
        c.paste(pig_base, (50 + step_x, 45 + bounce_y), pig_base)

        # Red Headband
        d.rectangle([112 + step_x, 60 + bounce_y, 292 + step_x, 80 + bounce_y], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Running Sneakers (Blue)
        foot_x1 = 120 + (15 if i in [0, 1] else -15)
        d.ellipse([foot_x1, 230 + (bounce_y//2), foot_x1 + 35, 252], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=3)
        foot_x2 = 190 + (-15 if i in [0, 1] else 15)
        d.ellipse([foot_x2, 230 + (bounce_y//2), foot_x2 + 35, 252], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=3)

        frames.append(c)
    save_gif(frames, "magnum_lv4.gif", 180)

# ==========================================
# MAGNUM LV5: Shadow Boxing (ชกลม)
# ==========================================
def make_magnum_lv5():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        punch_left = (i == 1)
        punch_right = (i == 3)

        # Navy Gym Shorts
        d.rectangle([115, 175, 285, 220], fill=C_NAVY_TANK, outline=C_OUTLINE, width=4)

        # Pig Body
        c.paste(pig_base, (48, 25), pig_base)

        # Red Headband
        d.rectangle([110, 40, 290, 60], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Red Boxing Gloves
        if punch_left:
            d.ellipse([15, 130, 85, 185], fill=C_RED_BAND, outline=C_OUTLINE, width=4)
            d.line([5, 150, 1, 150], fill=C_CYAN_AURA, width=4)
        else:
            d.ellipse([70, 140, 125, 190], fill=C_RED_BAND, outline=C_OUTLINE, width=4)

        if punch_right:
            d.ellipse([315, 130, 385, 185], fill=C_RED_BAND, outline=C_OUTLINE, width=4)
            d.line([395, 150, 399, 150], fill=C_CYAN_AURA, width=4)
        else:
            d.ellipse([275, 140, 330, 190], fill=C_RED_BAND, outline=C_OUTLINE, width=4)

        frames.append(c)
    save_gif(frames, "magnum_lv5.gif", 160)

# ==========================================
# MAGNUM LV6: Speed Cycling (ปั่นจักรยาน)
# ==========================================
def make_magnum_lv6():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        # Bike Body
        d.polygon([(90, 280), (320, 280), (260, 160), (160, 220)], outline=(30, 35, 45, 255), fill=(40, 50, 65, 255), width=6)
        d.ellipse([50, 210, 140, 300], outline=(80, 95, 115, 255), width=6)
        d.ellipse([250, 210, 340, 300], outline=(80, 95, 115, 255), width=6)
        d.line([260, 160, 290, 100], fill=(40, 50, 65, 255), width=8)
        d.line([270, 100, 320, 100], fill=C_OUTLINE, width=6)

        # Pedals
        angles = [(210, 230, 210, 275), (190, 250, 230, 250), (210, 275, 210, 230), (230, 250, 190, 250)]
        p = angles[i]
        d.line(p, fill=C_IRON, width=6)

        # Pig
        lean_x = 45 + (3 if i % 2 == 1 else -3)
        c.paste(pig_base, (lean_x, 15), pig_base)

        # Red Headband & Navy Tank Top
        d.rectangle([lean_x + 62, 30, lean_x + 242, 50], fill=C_RED_BAND, outline=C_OUTLINE, width=3)
        d.rectangle([lean_x + 95, 145, lean_x + 210, 185], fill=C_NAVY_TANK, outline=C_OUTLINE, width=3)

        # Speed motion lines
        if i % 2 == 0:
            d.line([15, 80, 55, 80], fill=C_CYAN_AURA, width=4)
            d.line([25, 110, 60, 110], fill=C_CYAN_AURA, width=4)

        frames.append(c)
    save_gif(frames, "magnum_lv6.gif", 150)

# ==========================================
# MAGNUM LV7: Dumbbell Bicep Curl (ดัมเบล)
# ==========================================
def make_magnum_lv7():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        curl_up = (i in [1, 2])

        # Navy Gym Shorts
        d.rectangle([105, 165, 295, 215], fill=C_NAVY_TANK, outline=C_OUTLINE, width=4)

        # Pig
        c.paste(pig_base, (48, 15), pig_base)

        # Red Headband
        d.rectangle([110, 30, 290, 50], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Dumbbells
        db_y = 100 if curl_up else 170
        # Left Dumbbell
        d.rectangle([30, db_y, 75, db_y + 45], fill=C_IRON_DARK, outline=C_OUTLINE, width=3)
        d.line([52, db_y - 15, 52, db_y + 60], fill=C_IRON, width=6)
        # Right Dumbbell
        d.rectangle([325, db_y, 370, db_y + 45], fill=C_IRON_DARK, outline=C_OUTLINE, width=3)
        d.line([347, db_y - 15, 347, db_y + 60], fill=C_IRON, width=6)

        # Flexing sparkle
        if curl_up:
            d.polygon([(25, 60), (35, 45), (45, 60), (35, 75)], fill=C_GOLD, outline=C_OUTLINE, width=2)
            d.polygon([(355, 60), (365, 45), (375, 60), (365, 75)], fill=C_GOLD, outline=C_OUTLINE, width=2)

        frames.append(c)
    save_gif(frames, "magnum_lv7.gif", 190)

# ==========================================
# MAGNUM LV8: Heavy Bench Press (เบนช์เพรส)
# ==========================================
def make_magnum_lv8():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        bar_y = 135 if i in [1, 2] else 75

        # Bench
        d.rectangle([60, 250, 340, 280], fill=(45, 50, 60, 255), outline=C_OUTLINE, width=4)
        d.line([100, 280, 100, 310], fill=C_OUTLINE, width=8)
        d.line([300, 280, 300, 310], fill=C_OUTLINE, width=8)

        # Pig
        c.paste(pig_base, (48, 85), pig_base)

        # Red Headband
        d.rectangle([110, 100, 290, 120], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Barbell Press
        d.line([15, bar_y, 385, bar_y], fill=C_IRON, width=8)
        # Heavy Iron Plates
        d.rectangle([15, bar_y - 40, 45, bar_y + 40], fill=C_IRON_DARK, outline=C_OUTLINE, width=4)
        d.rectangle([355, bar_y - 40, 385, bar_y + 40], fill=C_IRON_DARK, outline=C_OUTLINE, width=4)

        frames.append(c)
    save_gif(frames, "magnum_lv8.gif", 200)

# ==========================================
# MAGNUM LV9: Deadlift Powerhouse (เดดลิฟต์ ซิกแพก)
# ==========================================
def make_magnum_lv9():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        lift_up = (i in [0, 3])
        bar_y = 160 if lift_up else 230
        body_y = 15 if lift_up else 35

        # Cyan Lightning Aura
        aura_rad = 18 if i % 2 == 0 else 24
        d.ellipse([30 - aura_rad, 20 - aura_rad, 370 + aura_rad, 290 + aura_rad], outline=C_CYAN_AURA, width=4)

        # Leather Weightlifting Belt
        d.rectangle([105, 175 + body_y, 295, 215 + body_y], fill=(20, 20, 25, 255), outline=C_GOLD, width=4)

        # Pig
        c.paste(pig_base, (48, body_y), pig_base)

        # Red Headband
        d.rectangle([110, 15 + body_y, 290, 35 + body_y], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Heavy Barbell
        d.line([10, bar_y, 390, bar_y], fill=C_IRON, width=8)
        d.rectangle([10, bar_y - 45, 45, bar_y + 45], fill=C_IRON_DARK, outline=C_OUTLINE, width=4)
        d.rectangle([45, bar_y - 35, 65, bar_y + 35], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=4)
        d.rectangle([355, bar_y - 45, 390, bar_y + 45], fill=C_IRON_DARK, outline=C_OUTLINE, width=4)
        d.rectangle([335, bar_y - 35, 355, bar_y + 35], fill=C_BLUE_HOODIE, outline=C_OUTLINE, width=4)

        frames.append(c)
    save_gif(frames, "magnum_lv9.gif", 190)

# ==========================================
# MAGNUM LV10: Super Saiyan Chad Gym God
# ==========================================
def make_magnum_lv10():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        float_y = -12 if i in [1, 2] else 0

        # Flaming Golden Super Saiyan Aura
        aura_w = 20 if i % 2 == 0 else 28
        d.ellipse([30 - aura_w, 10 + float_y - aura_w, 370 + aura_w, 300 + float_y + aura_w], outline=C_GOLD, width=6)
        # Flame spikes
        d.polygon([(40, 150 + float_y), (10, 80 + float_y), (50, 110 + float_y)], fill=C_GOLD)
        d.polygon([(360, 150 + float_y), (390, 80 + float_y), (350, 110 + float_y)], fill=C_GOLD)

        # Champion Belt
        d.rectangle([115, 160 + float_y, 285, 205 + float_y], fill=(20, 20, 30, 255), outline=C_GOLD, width=5)

        # Pig
        c.paste(pig_base, (48, 20 + float_y), pig_base)

        # Red Headband
        d.rectangle([110, 35 + float_y, 290, 55 + float_y], fill=C_RED_BAND, outline=C_OUTLINE, width=3)

        # Gold Champion Crown
        d.polygon([(170, 25 + float_y), (185, 5 + float_y), (200, 18 + float_y), (215, 5 + float_y), (230, 25 + float_y)], fill=C_GOLD, outline=C_OUTLINE, width=3)
        d.ellipse([194, 12 + float_y, 206, 22 + float_y], fill=(240, 50, 50, 255))

        # Cyan Lightning bolts
        d.line([40, 220, 70, 250], fill=C_CYAN_AURA, width=4)
        d.line([360, 220, 330, 250], fill=C_CYAN_AURA, width=4)

        frames.append(c)
    save_gif(frames, "magnum_lv10.gif", 170)

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
    print("ALL MAGNUM HIGH-FIDELITY LEVELS (1-10) GENERATED!")
