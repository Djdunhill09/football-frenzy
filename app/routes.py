import threading
import time

from flask import Blueprint, jsonify, render_template, request

from app.levels import get_level
from app.scores import MAX_NAME_LENGTH, MAX_SCORE, add_score, is_valid_score, load_scores

bp = Blueprint("main", __name__)

RATE_LIMIT = 5
RATE_WINDOW = 60  # seconds
_hits = {}  # ip -> list of request timestamps
_hits_lock = threading.Lock()


def _rate_limited(ip):
    now = time.monotonic()
    with _hits_lock:
        # Drop expired entries for every IP so the dict can't grow without bound.
        for key in list(_hits):
            _hits[key] = [t for t in _hits[key] if now - t < RATE_WINDOW]
            if not _hits[key]:
                del _hits[key]
        recent = _hits.setdefault(ip, [])
        if len(recent) >= RATE_LIMIT:
            return True
        recent.append(now)
        return False


def reset_rate_limit():
    with _hits_lock:
        _hits.clear()


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/api/levels/<int:level_number>")
def level(level_number):
    data = get_level(level_number)
    if data is None:
        return jsonify({"error": "Level not found"}), 404
    return jsonify(data)


@bp.route("/api/scores", methods=["GET"])
def get_scores():
    return jsonify(load_scores())


@bp.route("/api/scores", methods=["POST"])
def post_score():
    if _rate_limited(request.remote_addr or "unknown"):
        return jsonify({"error": "Too many requests, try again in a minute"}), 429
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Send JSON with a name and a score"}), 400
    name = data.get("name")
    score = data.get("score")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Name is required"}), 400
    if not is_valid_score(score):
        return jsonify({
            "error": f"Score must be a multiple of 100 between 0 and {MAX_SCORE}"
        }), 400
    return jsonify(add_score(name.strip()[:MAX_NAME_LENGTH], score)), 201
