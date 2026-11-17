import json
from pathlib import Path

SCORES_FILE = Path(__file__).resolve().parent.parent / "data" / "scores.json"
MAX_ENTRIES = 10
MAX_NAME_LENGTH = 20


def load_scores():
    """Return the saved board, or an empty one if the file is missing or unreadable."""
    try:
        entries = json.loads(SCORES_FILE.read_text())
    except (OSError, ValueError):
        return []
    if not isinstance(entries, list):
        return []
    return [
        {"name": e["name"], "score": e["score"]}
        for e in entries
        if isinstance(e, dict) and isinstance(e.get("name"), str) and isinstance(e.get("score"), int)
    ]


def add_score(name, score):
    """Add an entry, keep the top 10 (highest first), save, and return the board."""
    entries = load_scores()
    entries.append({"name": name, "score": score})
    entries.sort(key=lambda e: e["score"], reverse=True)  # stable: earlier ties stay ahead
    entries = entries[:MAX_ENTRIES]
    SCORES_FILE.parent.mkdir(exist_ok=True)
    SCORES_FILE.write_text(json.dumps(entries, indent=2))
    return entries
