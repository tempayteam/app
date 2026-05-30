#!/usr/bin/env python3
"""Generate TempPay favicon PNGs and ICO (orange rounded square + white $)."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ORANGE = (249, 115, 22, 255)
WHITE = (255, 255, 255, 255)
ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    size_px = max(8, int(size * 0.58))
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.isfile(path):
            try:
                return ImageFont.truetype(path, size_px)
            except OSError:
                continue
    return ImageFont.load_default()


def make_icon(px: int) -> Image.Image:
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = max(2, int(px * 0.22))
    draw.rounded_rectangle([0, 0, px - 1, px - 1], radius=r, fill=ORANGE)
    font = _font(px)
    text = "$"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (px - tw) / 2 - bbox[0]
    y = (px - th) / 2 - bbox[1] - (px * 0.02)
    draw.text((x, y), text, font=font, fill=WHITE)
    return img


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    sizes = [16, 32, 192, 512]
    images: dict[int, Image.Image] = {s: make_icon(s) for s in sizes}

    images[16].save(PUBLIC / "favicon-16x16.png", format="PNG")
    images[32].save(PUBLIC / "favicon-32x32.png", format="PNG")
    images[192].save(PUBLIC / "logo192.png", format="PNG")
    images[512].save(PUBLIC / "logo512.png", format="PNG")

    # Multi-size ICO for older browsers
    images[32].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(32, 32), (16, 16)],
    )
    print(
        "Wrote TempPay icons:",
        PUBLIC / "favicon.ico",
        PUBLIC / "favicon-16x16.png",
        PUBLIC / "favicon-32x32.png",
        PUBLIC / "logo192.png",
        PUBLIC / "logo512.png",
    )


if __name__ == "__main__":
    main()
