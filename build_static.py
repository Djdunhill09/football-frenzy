"""Build the GitHub Pages version of the game into docs/.

Run from anywhere:  python build_static.py
Level data comes from app/levels.py, so Python stays the single source of truth.
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from app.levels import LEVELS  # noqa: E402  (needs the sys.path line above)

DOCS = ROOT / "docs"
SCRIPTS = ["input", "world", "player", "hud", "renderer", "scores", "game", "main"]

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Football Frenzy</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <canvas id="game" width="800" height="450"></canvas>
  <div id="score-panel">
    <form id="score-form" hidden>
      <p id="score-final"></p>
      <label for="score-name">Your name</label>
      <input id="score-name" type="text" maxlength="20" autocomplete="off" required>
      <button type="submit">Submit score</button>
      <p id="score-message" role="status"></p>
    </form>
    <h2>High Scores</h2>
    <ol id="score-list"></ol>
  </div>
  <script>window.STATIC_MODE = true;</script>
{scripts}
</body>
</html>
"""


def main():
    # Start clean so deleted files don't linger in docs/.
    if DOCS.exists():
        shutil.rmtree(DOCS)
    (DOCS / "css").mkdir(parents=True)
    (DOCS / "js").mkdir()

    # JSON keys are strings, which matches how the browser looks levels up.
    (DOCS / "levels.json").write_text(json.dumps(LEVELS, indent=2) + "\n")

    shutil.copy(ROOT / "static/css/style.css", DOCS / "css/style.css")
    for name in SCRIPTS:
        shutil.copy(ROOT / f"static/js/{name}.js", DOCS / f"js/{name}.js")

    tags = "\n".join(f'  <script src="js/{name}.js"></script>' for name in SCRIPTS)
    (DOCS / "index.html").write_text(INDEX_HTML.format(scripts=tags))
    # Stops GitHub Pages from running Jekyll over the files.
    (DOCS / ".nojekyll").write_text("")
    print(f"Built {DOCS} with {len(LEVELS)} levels.")


if __name__ == "__main__":
    main()
