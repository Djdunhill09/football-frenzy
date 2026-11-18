import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import app.scores as scores
from app import create_app
from app.routes import reset_rate_limit


class SecurityTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        patcher = mock.patch.object(scores, "SCORES_FILE", Path(self.tmp.name) / "scores.json")
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(self.tmp.cleanup)
        reset_rate_limit()
        self.app = create_app()
        self.client = self.app.test_client()

    def post(self, payload):
        return self.client.post("/api/scores", json=payload)

    def test_huge_score_rejected(self):
        self.assertEqual(self.post({"name": "A", "score": 5000000}).status_code, 400)

    def test_negative_score_rejected(self):
        self.assertEqual(self.post({"name": "A", "score": -100}).status_code, 400)

    def test_non_multiple_of_100_rejected(self):
        self.assertEqual(self.post({"name": "A", "score": 2950}).status_code, 400)

    def test_valid_score_accepted(self):
        r = self.post({"name": "Blitz", "score": 2900})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()[0], {"name": "Blitz", "score": 2900})

    def test_stored_invalid_entries_dropped(self):
        scores.SCORES_FILE.write_text(json.dumps([
            {"name": "ok", "score": 300},
            {"name": "big", "score": 5000000},
            {"name": "odd", "score": 250},
        ]))
        self.assertEqual(self.client.get("/api/scores").get_json(), [{"name": "ok", "score": 300}])

    def test_text_plain_rejected(self):
        r = self.client.post("/api/scores", data='{"name":"A","score":100}', content_type="text/plain")
        self.assertEqual(r.status_code, 400)
        self.assertIn("error", r.get_json())

    def test_oversized_body_413(self):
        r = self.client.post("/api/scores", data="x" * 5000, content_type="application/json")
        self.assertEqual(r.status_code, 413)
        self.assertIn("error", r.get_json())

    def test_rate_limit_429_on_sixth(self):
        codes = [self.post({"name": "A", "score": 100}).status_code for _ in range(6)]
        self.assertEqual(codes, [201] * 5 + [429])
        self.assertIn("error", self.post({"name": "A", "score": 100}).get_json())

    def test_security_headers(self):
        for path in ("/", "/api/scores", "/api/levels/banana"):
            h = self.client.get(path).headers
            self.assertEqual(h["Content-Security-Policy"], "default-src 'self'; frame-ancestors 'none'")
            self.assertEqual(h["X-Content-Type-Options"], "nosniff")
            self.assertEqual(h["X-Frame-Options"], "DENY")
            self.assertEqual(h["Referrer-Policy"], "no-referrer")

    def test_debug_off(self):
        self.assertFalse(self.app.debug)
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("FLASK_DEBUG", None)
            import importlib
            import run
            importlib.reload(run)
            self.assertFalse(run.DEBUG)

    def test_unknown_level_json_404(self):
        r = self.client.get("/api/levels/banana")
        self.assertEqual(r.status_code, 404)
        self.assertTrue(r.is_json)

    def test_405_json(self):
        r = self.client.delete("/api/scores")
        self.assertEqual(r.status_code, 405)
        self.assertTrue(r.is_json)

    def test_500_json_no_traceback(self):
        with mock.patch("app.routes.load_scores", side_effect=RuntimeError("secret detail")):
            self.app.config["PROPAGATE_EXCEPTIONS"] = False
            r = self.client.get("/api/scores")
        self.assertEqual(r.status_code, 500)
        self.assertTrue(r.is_json)
        self.assertNotIn("secret detail", r.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
