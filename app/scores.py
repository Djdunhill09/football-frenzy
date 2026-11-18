import json
import os
import tempfile
import threading
from pathlib import Path

from app.levels import LEVELS

SCORES_FILE = Path(__file__).resolve().parent.parent / "data" / "scores.json"
MAX_ENTRIES = 10
MAX_NAME_LENGTH = 20

# Scoring: 500 per touchdown, 100 per football.
TOUCHDOWN_POINTS = 500
FOOTBALL_POINTS = 100
MAX_SCORE = len(LEVELS) * TOUCHDOWN_POINTS + FOOTBALL_POINTS * sum(
    len(level.get("footballs", [])) for level in LEVELS.values()
)  # 3 * 500 + 14 * 100 = 2900

_lock = threading.Lock()


def is_valid_score(score):
    """True for a whole number (not bool) from 0 to MAX_SCORE, in steps of 100."""
    return (
        isinstance(score, int)
        and not isinstance(score, bool)
        and 0 <= score <= MAX_SCORE
        and score % 100 == 0
    )


def _read():
    try:
        entries = json.loads(SCORES_FILE.read_text())
    except (OSError, ValueError):
        return []
    if not isinstance(entries, list):
        return []
    return [
        {"name": e["name"], "score": e["score"]}
        for e in entries
        if isinstance(e, dict) and isinstance(e.get("name"), str) and is_valid_score(e.get("score"))
    ]


def _write(entries):
    """Write atomically: temp file in the same directory, then os.replace."""
    SCORES_FILE.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=SCORES_FILE.parent, prefix=".scores-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(entries, f, indent=2)
        os.replace(tmp, SCORES_FILE)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def load_scores():
    """Return the saved board, or an empty one if the file is missing or unreadable."""
    with _lock:
        return _read()


def add_score(name, score):
    """Add an entry, keep the top 10 (highest first), save, and return the board."""
    with _lock:
        entries = _read()
        entries.append({"name": name, "score": score})
        entries.sort(key=lambda e: e["score"], reverse=True)  # stable: earlier ties stay ahead
        entries = entries[:MAX_ENTRIES]
        _write(entries)
        return entries
