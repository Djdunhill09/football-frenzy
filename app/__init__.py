from pathlib import Path

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException, InternalServerError

SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
}


def create_app():
    root = Path(__file__).resolve().parent.parent
    app = Flask(
        __name__,
        template_folder=root / "templates",
        static_folder=root / "static",
    )
    app.config["MAX_CONTENT_LENGTH"] = 1024

    from app.routes import bp

    app.register_blueprint(bp)

    @app.after_request
    def add_security_headers(response):
        for name, value in SECURITY_HEADERS.items():
            response.headers[name] = value
        return response

    def wants_json():
        return request.path.startswith("/api/")

    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        if wants_json():
            response = jsonify({"error": e.name, "status": e.code})
            response.status_code = e.code
            if e.code == 405 and getattr(e, "valid_methods", None):
                response.headers["Allow"] = ", ".join(e.valid_methods)
            return response
        return e

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        if app.debug:
            raise e  # keep Flask's debugger when debug is explicitly on
        app.logger.exception("Unhandled error")
        if wants_json():
            return jsonify({"error": "Internal Server Error", "status": 500}), 500
        return InternalServerError()

    return app
