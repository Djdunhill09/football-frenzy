import os

from app import create_app

app = create_app()

# Debug is off unless FLASK_DEBUG=1 is set in the environment.
DEBUG = os.environ.get("FLASK_DEBUG") == "1"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=DEBUG)
