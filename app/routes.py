from flask import Blueprint, jsonify, render_template, request

from app.levels import get_level
from app.scores import MAX_NAME_LENGTH, add_score, load_scores

bp = Blueprint("main", __name__)


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
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Send JSON with a name and a score"}), 400
    name = data.get("name")
    score = data.get("score")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Name is required"}), 400
    # bool is a subclass of int in Python, so rule it out explicitly.
    if not isinstance(score, int) or isinstance(score, bool) or score < 0:
        return jsonify({"error": "Score must be a whole number of 0 or more"}), 400
    return jsonify(add_score(name.strip()[:MAX_NAME_LENGTH], score)), 201
