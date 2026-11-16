from pathlib import Path

from flask import Flask


def create_app():
    root = Path(__file__).resolve().parent.parent
    app = Flask(
        __name__,
        template_folder=root / "templates",
        static_folder=root / "static",
    )

    from app.routes import bp

    app.register_blueprint(bp)
    return app
