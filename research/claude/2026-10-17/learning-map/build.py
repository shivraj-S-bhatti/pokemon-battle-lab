"""Rebuild the recovered standalone learning map using its local thumbnails."""
import base64
from pathlib import Path

root = Path(__file__).resolve().parent
text = (root / "team-reasoning.src.html").read_text()
for key, filename in [("T1", "wrR6MquGU6A.jpg"), ("T2", "VSAeOI0CLx0.jpg")]:
    image = base64.b64encode((root / filename).read_bytes()).decode()
    text = text.replace("{{" + key + "}}", "data:image/jpeg;base64," + image)
(root / "team-reasoning.html").write_text(text)
