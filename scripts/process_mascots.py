import os
import sys
import glob
import math
from PIL import Image, ImageOps, ImageEnhance, ImageDraw
import rembg
import numpy as np

IMG_DIR = os.path.abspath('public/images')
OUT_DIR = os.path.abspath('public/mascots')
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Process 4 Background Scenes
print("--- Processing Background Scenes ---", flush=True)
scenes_map = {
    'วันปกติ': 'scene_normal_day.jpg',
    'มีคนไปยิม': 'scene_gym_session.jpg',
    'cardio': 'scene_cardio_food.jpg',
    'หลัง 4 ทุ่ม': 'scene_night_rest.jpg',
}

for fname in os.listdir(IMG_DIR):
    for key, dst_name in scenes_map.items():
        if key in fname and fname.endswith('.jpg'):
            src_p = os.path.join(IMG_DIR, fname)
            dst_p = os.path.join(OUT_DIR, dst_name)
            dst_p_root = os.path.join(IMG_DIR, dst_name)
            im = Image.open(src_p).convert('RGB')
            # Resize if large (max 1280px width)
            if im.width > 1280:
                h = int(im.height * (1280 / im.width))
                im = im.resize((1280, h), Image.Resampling.LANCZOS)
            im.save(dst_p, quality=92)
            im.save(dst_p_root, quality=92)
            print(f"Scene matched: {fname} -> {dst_name}", flush=True)

# 2. Map Mascot Levels
manow_files = {}
magnum_files = {}

for fname in os.listdir(IMG_DIR):
    lower = fname.lower()
    if lower.endswith('.jpg') or lower.endswith('.png'):
        if 'manow' in lower or 'มะนาว' in lower:
            for lv in range(1, 11):
                if f'lv {lv}.' in lower or f'lv{lv}.' in lower or f'level {lv}.' in lower or f'level{lv}.' in lower:
                    manow_files[lv] = os.path.join(IMG_DIR, fname)
                    break
        elif 'maxnum' in lower or 'magnum' in lower or 'แม็กนั่ม' in lower:
            for lv in range(1, 11):
                if f'lv {lv}.' in lower or f'lv{lv}.' in lower or f'level {lv}.' in lower or f'level{lv}.' in lower:
                    magnum_files[lv] = os.path.join(IMG_DIR, fname)
                    break

print(f"Found Manow levels: {sorted(manow_files.keys())}", flush=True)
print(f"Found Magnum levels: {sorted(magnum_files.keys())}", flush=True)

# Helper to generate animated bouncing/wiggling GIF from a transparent cutout
def create_cute_animated_gif(transparent_img, output_gif_path, size=(360, 360)):
    bbox = transparent_img.getbbox()
    if bbox:
        cropped = transparent_img.crop(bbox)
    else:
        cropped = transparent_img

    # Fit into box leaving margin for bounce
    target_w, target_h = int(size[0] * 0.84), int(size[1] * 0.84)
    cropped.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)

    frames = []
    num_frames = 12
    
    for i in range(num_frames):
        # High quality RGBA frame
        frame = Image.new('RGBA', size, (0, 0, 0, 0))
        
        t = (i / num_frames) * 2 * math.pi
        
        # Smooth gentle breathing and bouncing
        dy = int(math.sin(t) * 7)
        sx = 1.0 + 0.03 * math.sin(t)
        sy = 1.0 - 0.03 * math.sin(t)
        rot_angle = math.sin(t) * 2.0
        
        new_w = max(1, int(cropped.width * sx))
        new_h = max(1, int(cropped.height * sy))
        scaled = cropped.resize((new_w, new_h), Image.Resampling.BILINEAR)
        rotated = scaled.rotate(rot_angle, resample=Image.Resampling.BICUBIC, expand=True)
        
        px = (size[0] - rotated.width) // 2
        py = (size[1] - rotated.height) // 2 + dy
        
        frame.paste(rotated, (px, py), rotated)
        
        # Convert to paletted GIF with crisp alpha mask
        alpha = frame.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a > 120 else 0)
        p_frame = frame.convert('RGB').convert('P', palette=Image.Palette.ADAPTIVE, colors=255)
        p_frame.paste(255, ImageOps.invert(mask))
        p_frame.info['transparency'] = 255
        
        frames.append(p_frame)

    frames[0].save(
        output_gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=90, # 90ms per frame ~ 11 fps
        loop=0,
        disposal=2,
        optimize=False
    )

print("Initializing rembg session...", flush=True)
session = rembg.new_session('u2netp') # lightweight 4MB model
print("rembg session ready!", flush=True)

# Process Manow levels
print("--- Processing Manow Levels (1..10) ---", flush=True)
for lv in range(1, 11):
    path = manow_files.get(lv)
    if not path:
        print(f"Warning: Manow Lv {lv} not found!", flush=True)
        continue
    print(f"Processing Manow Lv {lv}...", flush=True)
    raw_img = Image.open(path).convert('RGB')
    if raw_img.width > 1200:
        raw_img = raw_img.resize((1200, int(raw_img.height * (1200 / raw_img.width))), Image.Resampling.LANCZOS)
    cutout = rembg.remove(raw_img, session=session)
    
    png_path = os.path.join(OUT_DIR, f'manow_lv{lv}.png')
    png_root = os.path.join(IMG_DIR, f'manow_lv{lv}.png')
    cutout.save(png_path)
    cutout.save(png_root)
    
    gif_path = os.path.join(OUT_DIR, f'manow_lv{lv}.gif')
    gif_root = os.path.join(IMG_DIR, f'manow_lv{lv}.gif')
    create_cute_animated_gif(cutout, gif_path)
    create_cute_animated_gif(cutout, gif_root)
    print(f"Manow Lv {lv} done! (PNG & GIF)", flush=True)

# Process Magnum levels
print("--- Processing Magnum Levels (1..10) ---", flush=True)
for lv in range(1, 11):
    path = magnum_files.get(lv)
    if not path:
        print(f"Warning: Magnum Lv {lv} not found!", flush=True)
        continue
    print(f"Processing Magnum Lv {lv}...", flush=True)
    raw_img = Image.open(path).convert('RGB')
    if raw_img.width > 1200:
        raw_img = raw_img.resize((1200, int(raw_img.height * (1200 / raw_img.width))), Image.Resampling.LANCZOS)
    cutout = rembg.remove(raw_img, session=session)
    
    png_path = os.path.join(OUT_DIR, f'magnum_lv{lv}.png')
    png_root = os.path.join(IMG_DIR, f'magnum_lv{lv}.png')
    cutout.save(png_path)
    cutout.save(png_root)
    
    gif_path = os.path.join(OUT_DIR, f'magnum_lv{lv}.gif')
    gif_root = os.path.join(IMG_DIR, f'magnum_lv{lv}.gif')
    create_cute_animated_gif(cutout, gif_path)
    create_cute_animated_gif(cutout, gif_root)
    print(f"Magnum Lv {lv} done! (PNG & GIF)", flush=True)

# Process Profile Icons
print("--- Processing Profile Icons ---", flush=True)
for fname in os.listdir(IMG_DIR):
    lower = fname.lower()
    if 'manow icon' in lower:
        print("Processing Manow Icon...", flush=True)
        im = Image.open(os.path.join(IMG_DIR, fname)).convert('RGB')
        cutout = rembg.remove(im, session=session)
        cutout.save(os.path.join(OUT_DIR, 'manow_icon.png'))
        cutout.save(os.path.join(IMG_DIR, 'manow_icon.png'))
    elif 'maxnum icon' in lower or 'magnum icon' in lower:
        print("Processing Magnum Icon...", flush=True)
        im = Image.open(os.path.join(IMG_DIR, fname)).convert('RGB')
        cutout = rembg.remove(im, session=session)
        cutout.save(os.path.join(OUT_DIR, 'magnum_icon.png'))
        cutout.save(os.path.join(IMG_DIR, 'magnum_icon.png'))

print("=== ALL 10 LEVELS, GIFS, SCENES AND ICONS COMPLETED! ===", flush=True)
