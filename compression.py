"""
Batch-Kompression von Bildern für die Galerie.

Verkleinert alle Bilder in einem Ordner auf eine maximale Breite/Höhe
und komprimiert sie (JPEG oder WebP), ohne das Original zu überschreiben.

Nutzung:
    python compress_images.py

Passe die Einstellungen unten im Abschnitt "KONFIGURATION" an.
"""

from pathlib import Path
from PIL import Image

# ---------------- KONFIGURATION ----------------
INPUT_DIR = Path("static/img_no_compression")          # Ordner mit den Original-Bildern
OUTPUT_DIR = Path("static/img")        # Ordner für die komprimierten Bilder
MAX_SIZE = 1400                    # maximale Breite/Höhe in Pixel
QUALITY = 80                       # 1–100, 75–85 ist meist ein guter Kompromiss
OUTPUT_FORMAT = "webp"             # "webp" oder "jpeg"
# -------------------------------------------------

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def compress_image(src_path: Path, dst_path: Path) -> tuple[int, int]:
    """Öffnet ein Bild, verkleinert es und speichert es komprimiert.
    Gibt (Originalgröße, neue Größe) in Bytes zurück."""
    original_size = src_path.stat().st_size

    with Image.open(src_path) as img:
        # PNG mit Transparenz -> für JPEG-Export in RGB umwandeln
        if OUTPUT_FORMAT.lower() == "jpeg" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Seitenverhältnis beibehalten, nur verkleinern (nie vergrößern)
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

        save_kwargs = {"quality": QUALITY, "optimize": True}
        if OUTPUT_FORMAT.lower() == "webp":
            save_kwargs["method"] = 6  # beste Kompression, etwas langsamer

        img.save(dst_path, format=OUTPUT_FORMAT.upper(), **save_kwargs)

    new_size = dst_path.stat().st_size
    return original_size, new_size


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    images = [
        p for p in INPUT_DIR.iterdir() 
        if p.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not images:
        print(f"Keine Bilder in '{INPUT_DIR}' gefunden.")
        return

    total_before = 0
    total_after = 0
    counter = 0
    for src in sorted(images):
        if "Maximilian" in src.stem: 
            ext = ".webp" if OUTPUT_FORMAT.lower() == "webp" else ".jpg"
            dst = OUTPUT_DIR / ("MaxiBrunnen" + f"{counter}" + ext)

            before, after = compress_image(src, dst)
            total_before += before
            total_after += after

            saved_pct = 100 * (1 - after / before) if before else 0
            print(f"{src.name:30s} {before/1024:8.1f} KB -> {after/1024:8.1f} KB "
                f"({saved_pct:.0f}% kleiner)")
            counter += 1

    print("\n---")
    print(f"Gesamt vorher:  {total_before/1024/1024:.2f} MB")
    print(f"Gesamt nachher: {total_after/1024/1024:.2f} MB")
    if total_before:
        print(f"Ersparnis:      {100 * (1 - total_after/total_before):.0f}%")


if __name__ == "__main__":
    main()