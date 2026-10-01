import os
from PIL import Image, ImageDraw

OUT_DIR = r"c:\Users\thana\Desktop\MooAuan\public\images"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Load authentic base pig from Lv3 (which has full standing body and face)
sheet = Image.open(r"C:\Users\thana\.gemini\antigravity\brain\e525fad4-9342-4b60-bcaa-e7bb4c630aa1\manow_lv3_sprites_1790842764000.jpg").convert('RGBA')
w, h = sheet.size
fw = w // 4

# Extract frame 4
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
C_PINK_FOOT = (255, 120, 160, 255)
C_MINT = (120, 230, 185, 255)
C_PURPLE = (175, 120, 235, 255)
C_GOLD = (255, 215, 0, 255)
C_GOLD_LIGHT = (255, 245, 180, 255)
C_SWEAT = (80, 200, 255, 255)
C_ROSE_HOT = (255, 60, 130, 255)

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
# LEVEL 5: Jump Rope Cardio (กระโดดเชือก)
# ==========================================
def make_lv5():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)
        jump_y = -25 if i in [1, 2] else 0

        # Jump Rope
        if i == 0: # Rope swinging under feet
            d.arc([40, 240, 360, 305], 0, 180, fill=C_PURPLE, width=6)
        elif i == 1: # Rope side going up
            d.line([40, 180, 80, 50], fill=C_PURPLE, width=6)
            d.line([360, 180, 320, 50], fill=C_PURPLE, width=6)
        elif i == 2: # Rope overhead
            d.arc([40, 5, 360, 80], 180, 360, fill=C_PURPLE, width=6)
        elif i == 3: # Rope side going down
            d.line([40, 60, 80, 220], fill=C_PURPLE, width=6)
            d.line([360, 60, 320, 220], fill=C_PURPLE, width=6)

        # Athletic Mint Shorts
        d.rectangle([115, 175 + jump_y, 285, 220 + jump_y], fill=C_MINT, outline=C_OUTLINE, width=4)

        # Pig
        c.paste(pig_base, (48, 25 + jump_y), pig_base)

        # Feet in air
        foot_dy = 12 if jump_y < 0 else 0
        d.ellipse([120, 225 + jump_y - foot_dy, 155, 255 + jump_y - foot_dy], fill=C_PINK_FOOT, outline=C_OUTLINE, width=3)
        d.ellipse([245, 225 + jump_y - foot_dy, 280, 255 + jump_y - foot_dy], fill=C_PINK_FOOT, outline=C_OUTLINE, width=3)

        # Hands holding purple rope handles
        d.ellipse([45, 135 + jump_y, 75, 165 + jump_y], fill=C_PURPLE, outline=C_OUTLINE, width=3)
        d.ellipse([325, 135 + jump_y, 355, 165 + jump_y], fill=C_PURPLE, outline=C_OUTLINE, width=3)

        frames.append(c)
    save_gif(frames, "manow_lv5.gif", 160)

# ==========================================
# LEVEL 6: Spin Bike Hustler (ปั่นจักรยาน)
# ==========================================
def make_lv6():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        # Stationary Bike Body
        d.polygon([(90, 280), (320, 280), (260, 160), (160, 220)], outline=(50, 55, 65, 255), fill=(70, 75, 90, 255), width=6)
        # Flywheel
        d.ellipse([50, 210, 140, 300], outline=(100, 110, 130, 255), width=6)
        d.ellipse([250, 210, 340, 300], outline=(100, 110, 130, 255), width=6)
        # Handlebar & Seat
        d.line([260, 160, 290, 100], fill=(50, 55, 65, 255), width=8)
        d.line([270, 100, 320, 100], fill=C_OUTLINE, width=6) # Grip
        d.line([160, 220, 140, 150], fill=(50, 55, 65, 255), width=8)
        d.rectangle([115, 140, 165, 155], fill=C_ROSE_HOT, outline=C_OUTLINE, width=3) # Seat

        # Rotating Pedals
        angles = [(210, 230, 210, 275), (190, 250, 230, 250), (210, 275, 210, 230), (230, 250, 190, 250)]
        p = angles[i]
        d.line(p, fill=(200, 205, 220, 255), width=6)
        d.ellipse([p[0]-6, p[1]-6, p[0]+6, p[1]+6], fill=C_ROSE_HOT)
        d.ellipse([p[2]-6, p[3]-6, p[2]+6, p[3]+6], fill=C_ROSE_HOT)

        # Pig
        lean_x = 45 + (3 if i % 2 == 1 else -3)
        c.paste(pig_base, (lean_x, 15), pig_base)

        # Pink Sports Bra
        d.rectangle([lean_x + 95, 145, lean_x + 210, 185], fill=C_ROSE_HOT, outline=C_OUTLINE, width=3)

        # Speed motion lines & sweat
        if i % 2 == 0:
            d.line([15, 80, 55, 80], fill=(160, 220, 255, 200), width=4)
            d.line([25, 110, 60, 110], fill=(160, 220, 255, 200), width=4)
            d.ellipse([345, 60, 360, 80], fill=C_SWEAT, outline=C_OUTLINE, width=2)

        frames.append(c)
    save_gif(frames, "manow_lv6.gif", 150)

# ==========================================
# LEVEL 7: Pilates Ball S-Curve (พิลาทิสบอล)
# ==========================================
def make_lv7():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        ball_squash = 8 if i in [1, 3] else 0
        bounce_y = -10 if i in [0, 2] else 0

        # Big Pilates Fitness Ball (Pink / Rose)
        d.ellipse([80, 150 + ball_squash, 320, 310], fill=(255, 170, 200, 255), outline=C_OUTLINE, width=5)
        d.ellipse([110, 165 + ball_squash, 290, 285], fill=(255, 200, 220, 255))
        d.line([80, 230 + ball_squash, 320, 230 + ball_squash], fill=C_ROSE_HOT, width=4)

        # Pig sitting & bouncing
        c.paste(pig_base, (48, 10 + bounce_y + ball_squash), pig_base)

        # Mint Yoga Outfit
        d.rectangle([140, 140 + bounce_y + ball_squash, 260, 180 + bounce_y + ball_squash], fill=C_MINT, outline=C_OUTLINE, width=3)

        # Sparkles ✨
        if i in [1, 2]:
            d.polygon([(340, 60), (350, 45), (360, 60), (350, 75)], fill=C_GOLD, outline=C_OUTLINE, width=2)
            d.polygon([(45, 90), (55, 75), (65, 90), (55, 105)], fill=C_GOLD, outline=C_OUTLINE, width=2)

        frames.append(c)
    save_gif(frames, "manow_lv7.gif", 180)

# ==========================================
# LEVEL 8: Kettlebell Squat Pump (เคตเทิลเบล)
# ==========================================
def make_lv8():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        squat_y = 18 if i in [1, 2] else 0

        # Toned Legs
        d.rectangle([115, 200 + squat_y, 160, 275], fill=(245, 160, 180, 255), outline=C_OUTLINE, width=4)
        d.rectangle([240, 200 + squat_y, 285, 275], fill=(245, 160, 180, 255), outline=C_OUTLINE, width=4)
        # Shoes
        d.ellipse([110, 260, 165, 285], fill=C_ROSE_HOT, outline=C_OUTLINE, width=3)
        d.ellipse([235, 260, 290, 285], fill=C_ROSE_HOT, outline=C_OUTLINE, width=3)

        # Gym Activewear Shorts
        d.rectangle([105, 165 + squat_y, 295, 215 + squat_y], fill=(40, 45, 60, 255), outline=C_OUTLINE, width=4)

        # Pig Body
        c.paste(pig_base, (48, 15 + squat_y), pig_base)

        # Kettlebell (lifting up/down)
        kb_y = 195 + squat_y if i in [1, 2] else 155 + squat_y
        d.ellipse([175, kb_y, 225, kb_y + 50], fill=C_ROSE_HOT, outline=C_OUTLINE, width=4)
        d.arc([185, kb_y - 25, 215, kb_y + 5], 180, 360, fill=C_OUTLINE, width=6)
        # Weight label
        d.ellipse([190, kb_y + 15, 210, kb_y + 35], fill=(255, 255, 255, 255))

        # Power burst lines
        if i in [0, 3]:
            d.line([30, 120, 10, 120], fill=C_GOLD, width=4)
            d.line([370, 120, 390, 120], fill=C_GOLD, width=4)

        frames.append(c)
    save_gif(frames, "manow_lv8.gif", 190)

# ==========================================
# LEVEL 9: Barbell Squat Queen (บาร์เบลควีน)
# ==========================================
def make_lv9():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        squat_y = 22 if i in [1, 2] else 0

        # Pulsing Magenta Power Aura
        aura_rad = 18 if i % 2 == 0 else 24
        d.ellipse([30 - aura_rad, 20 + squat_y - aura_rad, 370 + aura_rad, 290 + squat_y + aura_rad], outline=(255, 90, 180, 150), width=4)

        # Muscular Legs
        d.rectangle([115, 205 + squat_y, 160, 275], fill=(245, 160, 180, 255), outline=C_OUTLINE, width=4)
        d.rectangle([240, 205 + squat_y, 285, 275], fill=(245, 160, 180, 255), outline=C_OUTLINE, width=4)
        d.rectangle([105, 165 + squat_y, 295, 215 + squat_y], fill=(25, 25, 35, 255), outline=C_OUTLINE, width=4)

        # Barbell across back
        bb_y = 55 + squat_y
        d.line([10, bb_y, 390, bb_y], fill=(190, 195, 205, 255), width=8)
        # Heavy Magenta Bumper Plates
        d.rectangle([10, bb_y - 45, 45, bb_y + 45], fill=C_ROSE_HOT, outline=C_OUTLINE, width=4)
        d.rectangle([45, bb_y - 35, 65, bb_y + 35], fill=C_PURPLE, outline=C_OUTLINE, width=4)
        d.rectangle([355, bb_y - 45, 390, bb_y + 45], fill=C_ROSE_HOT, outline=C_OUTLINE, width=4)
        d.rectangle([335, bb_y - 35, 355, bb_y + 35], fill=C_PURPLE, outline=C_OUTLINE, width=4)

        # Pig
        c.paste(pig_base, (48, 15 + squat_y), pig_base)

        # Pig hands gripping bar
        d.ellipse([95, bb_y - 12, 125, bb_y + 12], fill=(255, 180, 195, 255), outline=C_OUTLINE, width=3)
        d.ellipse([275, bb_y - 12, 305, bb_y + 12], fill=(255, 180, 195, 255), outline=C_OUTLINE, width=3)

        frames.append(c)
    save_gif(frames, "manow_lv9.gif", 190)

# ==========================================
# LEVEL 10: Pixel Fitness Goddess (ร่างทอง)
# ==========================================
def make_lv10():
    frames = []
    for i in range(4):
        c = Image.new('RGBA', (400, 320), (255, 255, 255, 0))
        d = ImageDraw.Draw(c)

        float_y = -12 if i in [1, 2] else 0
        wing_dy = -8 if i in [1, 2] else 6

        # Golden Angel Wings Flapping Behind
        # Left Wing
        d.polygon([(90, 110 + float_y), (15, 40 + float_y + wing_dy), (25, 130 + float_y)], fill=C_GOLD, outline=C_OUTLINE, width=4)
        d.polygon([(80, 115 + float_y), (35, 60 + float_y + wing_dy), (45, 120 + float_y)], fill=C_GOLD_LIGHT)
        # Right Wing
        d.polygon([(310, 110 + float_y), (385, 40 + float_y + wing_dy), (375, 130 + float_y)], fill=C_GOLD, outline=C_OUTLINE, width=4)
        d.polygon([(320, 115 + float_y), (365, 60 + float_y + wing_dy), (355, 120 + float_y)], fill=C_GOLD_LIGHT)

        # Golden Radiant Halo overhead
        d.ellipse([130, 5 + float_y, 270, 30 + float_y], outline=C_GOLD, width=5)

        # Golden Champion Activewear
        d.rectangle([115, 160 + float_y, 285, 205 + float_y], fill=C_GOLD, outline=C_OUTLINE, width=4)

        # Pig
        c.paste(pig_base, (48, 20 + float_y), pig_base)

        # Golden Tiara / Crown on head
        d.polygon([(170, 32 + float_y), (185, 12 + float_y), (200, 26 + float_y), (215, 12 + float_y), (230, 32 + float_y)], fill=C_GOLD, outline=C_OUTLINE, width=3)
        d.ellipse([194, 20 + float_y, 206, 30 + float_y], fill=C_ROSE_HOT)

        # Floating Golden Hearts & Sparkles 💕✨
        s_y = (i * 12) % 36
        d.polygon([(45, 180 - s_y), (55, 165 - s_y), (65, 180 - s_y), (55, 195 - s_y)], fill=C_GOLD, outline=C_OUTLINE, width=2)
        d.polygon([(335, 200 - s_y), (345, 185 - s_y), (355, 200 - s_y), (345, 215 - s_y)], fill=C_ROSE_HOT, outline=C_OUTLINE, width=2)

        frames.append(c)
    save_gif(frames, "manow_lv10.gif", 170)

if __name__ == '__main__':
    make_lv5()
    make_lv6()
    make_lv7()
    make_lv8()
    make_lv9()
    make_lv10()
    print("ALL MANOW HIGH-FIDELITY LEVELS (5-10) GENERATED!")
