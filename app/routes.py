from flask import Blueprint, jsonify, render_template

from app.levels import get_level

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
