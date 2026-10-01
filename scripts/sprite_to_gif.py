"""
Sprite Sheet → Transparent Animated WebP & GIF Converter
Detects grid layout, cuts individual poses, removes background, assembles transparent animated WebP, GIF, and PNG.
"""
import os
import sys
import io
import numpy as np
from PIL import Image

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── Configuration ───────────────────────────────────────────────
SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'mascots')
GIF_SIZE = (400, 400)       # final frame size
GIF_DURATION = 250          # ms per frame
USE_REMBG = True            # set False for fast testing without bg removal

# Source image mapping: (filename_pattern, output_prefix, output_type, grid_cols, grid_rows)
IMAGE_MAP = {
    'Manow Lv 1.jpg':  ('manow', 1, 3, 2),   # 1248x832 → 3×2 (boba tea)
    'Manow Lv 2.jpg':  ('manow', 2, 4, 1),   # 1248x832 → 4×1 (cake)
    'Manow Lv 3.jpg':  ('manow', 3, 4, 1),   # 1248x832 → 4×1 (stretch)
    'Manow Lv 4.jpg':  ('manow', 4, 4, 1),   # 2912x1440 → 4×1 (high-res)
    'Manow Lv 5.jpg':  ('manow', 5, 4, 1),   # 2752x1536 → 4×1 (high-res)
    'Manow Lv 6.jpg':  ('manow', 6, 4, 1),   # 1456x720 → 4×1
    'Manow Lv 7.jpg':  ('manow', 7, 4, 1),
    'Manow Lv 8.jpg':  ('manow', 8, 4, 1),
    'Manow Lv 9.jpg':  ('manow', 9, 4, 1),
    'Manow Lv 10.jpg': ('manow', 10, 4, 1),
    'manow icon.jpg':  ('manow', 'icon', 4, 1),

    # Maxnum (male)
    'maxnum lv 1.jpg':  ('maxnum', 1, 4, 1),   # 1456x720 → 4×1
    'maxnum lv2.jpg':   ('maxnum', 2, 4, 1),
    'maxnum lv 3.jpg':  ('maxnum', 3, 4, 1),
    'maxnum lv 4.jpg':  ('maxnum', 4, 2, 2),   # 896x1200 → 2×2
    'maxnum lv 5.jpg':  ('maxnum', 5, 4, 1),
    'maxnum lv 6.jpg':  ('maxnum', 6, 4, 1),
    'maxnum lv 7.jpg':  ('maxnum', 7, 4, 1),
    'maxnum lv 8.jpg':  ('maxnum', 8, 4, 1),
    'maxnum lv 9.jpg':  ('maxnum', 9, 4, 1),
    'maxnum lv 10.jpg': ('maxnum', 10, 4, 1),
    'maxnum icon.jpg':  ('maxnum', 'icon', 2, 3), # 896x1200 → 2×3
}


def remove_bg(img: Image.Image) -> Image.Image:
    """Remove background using rembg with u2netp model."""
    if not USE_REMBG:
        return img.convert('RGBA')
    from rembg import remove
    session = remove_bg._session
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    result = remove(img_bytes.read(), session=session, post_process_mask=True)
    return Image.open(io.BytesIO(result)).convert('RGBA')

remove_bg._session = None


def trim_transparent(img: Image.Image, padding: int = 5) -> Image.Image:
    """Trim transparent edges from RGBA image, keeping some padding."""
    arr = np.array(img)
    alpha = arr[:, :, 3]
    rows = np.any(alpha > 10, axis=1)
    cols = np.any(alpha > 10, axis=0)
    if not rows.any() or not cols.any():
        return img
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    rmin = max(0, rmin - padding)
    rmax = min(arr.shape[0], rmax + padding)
    cmin = max(0, cmin - padding)
    cmax = min(arr.shape[1], cmax + padding)
    return img.crop((cmin, rmin, cmax, rmax))


def fit_to_square(img: Image.Image, size: tuple) -> Image.Image:
    """Fit image into a square canvas maintaining aspect ratio, centered."""
    img = trim_transparent(img)
    w, h = img.size
    target_w, target_h = size
    inner_w, inner_h = int(target_w * 0.9), int(target_h * 0.9)
    scale = min(inner_w / w, inner_h / h)
    new_w, new_h = int(w * scale), int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size, (0, 0, 0, 0))
    x = (target_w - new_w) // 2
    y = (target_h - new_h) // 2
    canvas.paste(img_resized, (x, y), img_resized)
    return canvas


def cut_grid(img: Image.Image, cols: int, rows: int) -> list:
    """Cut an image into a grid of cols×rows cells."""
    w, h = img.size
    cell_w = w // cols
    cell_h = h // rows
    frames = []
    for r in range(rows):
        for c in range(cols):
            x1 = c * cell_w
            y1 = r * cell_h
            x2 = x1 + cell_w
            y2 = y1 + cell_h
            cell = img.crop((x1, y1, x2, y2))
            frames.append(cell)
    return frames


def save_transparent_webp(frames: list, duration: int, out_path: str):
    """Save RGBA frames as an Animated WebP with 32-bit alpha transparency."""
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        quality=95,
        method=0
    )



def save_transparent_gif(frames: list, duration: int, out_path: str):
    """Save RGBA frames as transparent GIF."""
    processed_frames = []
    for f in frames:
        rgba = f.convert('RGBA')
        alpha = np.array(rgba)[:, :, 3]
        mask = alpha < 128
        
        rgb = rgba.convert('RGB')
        p_img = rgb.quantize(colors=255, dither=Image.Dither.NONE)
        
        p_arr = np.array(p_img)
        p_arr[mask] = 255
        
        final_frame = Image.fromarray(p_arr, mode='P')
        palette = list(p_img.getpalette()[:765])
        if len(palette) < 765:
            palette = palette + [0] * (765 - len(palette))
        palette.extend([0, 0, 0])  # index 255
        final_frame.putpalette(palette)
        final_frame.info['transparency'] = 255
        final_frame.info['duration'] = duration
        final_frame.info['disposal'] = 2
        processed_frames.append(final_frame)
        
    processed_frames[0].save(
        out_path,
        save_all=True,
        append_images=processed_frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        transparency=255,
        optimize=False
    )


def process_image(filename: str, prefix: str, level_or_tag, cols: int, rows: int):
    """Process a single sprite sheet into WebP, GIF, and PNG."""
    src_path = os.path.join(SRC_DIR, filename)
    if not os.path.exists(src_path):
        print(f"  ⚠ SKIP (not found): {filename}", flush=True)
        return False

    tag_str = f"lv{level_or_tag}" if isinstance(level_or_tag, int) else str(level_or_tag)
    out_base = f"{prefix}_{tag_str}"

    print(f"\n{'='*60}", flush=True)
    print(f"  📦 Processing: {filename}", flush=True)
    print(f"     Grid: {cols}×{rows} = {cols*rows} frames", flush=True)
    print(f"     Output: {out_base}.webp / .gif / .png", flush=True)
    print(f"{'='*60}", flush=True)

    img = Image.open(src_path).convert('RGB')
    raw_frames = cut_grid(img, cols, rows)

    clean_frames = []
    for i, frame in enumerate(raw_frames):
        print(f"  🧹 Removing background: frame {i+1}/{len(raw_frames)}...", flush=True)
        clean = remove_bg(frame)
        fitted = fit_to_square(clean, GIF_SIZE)
        clean_frames.append(fitted)

    if not clean_frames:
        print(f"  ❌ No frames produced!", flush=True)
        return False

    # Ping-pong animation loop
    if len(clean_frames) > 2:
        anim_frames = clean_frames + clean_frames[-2:0:-1]
    else:
        anim_frames = clean_frames

    for target_dir in [OUT_DIR, SRC_DIR]:
        # 1. Static PNG
        png_path = os.path.join(target_dir, f"{out_base}.png")
        clean_frames[0].save(png_path, 'PNG')
        
        # 2. Animated WebP (32-bit pure alpha)
        webp_path = os.path.join(target_dir, f"{out_base}.webp")
        save_transparent_webp(anim_frames, GIF_DURATION, webp_path)

        # 3. Transparent GIF
        gif_path = os.path.join(target_dir, f"{out_base}.gif")
        save_transparent_gif(anim_frames, GIF_DURATION, gif_path)

    print(f"  ✅ Saved: {out_base} (.webp, .gif, .png)", flush=True)
    return True


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    if USE_REMBG:
        print("🔧 Loading rembg model (u2netp)...", flush=True)
        from rembg import new_session
        remove_bg._session = new_session('u2netp')
        print("✅ rembg model loaded!", flush=True)

    target_tag = None
    target_prefix = None
    if len(sys.argv) >= 2:
        target_prefix = sys.argv[1].lower()
    if len(sys.argv) >= 3:
        try:
            target_tag = int(sys.argv[2])
        except ValueError:
            target_tag = sys.argv[2].lower()

    success_count = 0
    total = 0

    for filename, (prefix, level_or_tag, cols, rows) in IMAGE_MAP.items():
        if target_prefix and prefix != target_prefix:
            continue
        if target_tag and level_or_tag != target_tag:
            continue

        total += 1
        if process_image(filename, prefix, level_or_tag, cols, rows):
            success_count += 1

    print(f"\n{'='*60}", flush=True)
    print(f"🎉 Done! Processed {success_count}/{total} images successfully.", flush=True)
    print(f"{'='*60}", flush=True)


if __name__ == '__main__':
    main()
