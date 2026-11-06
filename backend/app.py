import os
from flask import Flask, jsonify
from flask_cors import CORS
from database.db import init_db
from routes.transactions import bp as transactions_bp
from routes.categories import bp as categories_bp
from routes.dashboard import bp as dashboard_bp

app = Flask(__name__)

# ── CORS ────────────────────────────────────────────────────────
# Accepts requests from:
#  - the Vercel frontend (set FRONTEND_URL env var on Render)
#  - localhost for local dev
_frontend_url = os.environ.get("FRONTEND_URL", "")
_origins = ["http://localhost:5173", "http://localhost:3000"]
if _frontend_url:
    _origins.append(_frontend_url.rstrip("/"))

CORS(app, origins=_origins, supports_credentials=True)

# ── Blueprints ──────────────────────────────────────────────────
app.register_blueprint(transactions_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(dashboard_bp)


# ── Health check (Render uses this to confirm service is up) ────
@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


# ── Error handlers ──────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "error": "Method not allowed"}), 405


@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500


# ── DB init on module load (covers both Gunicorn workers & direct run) ──
init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
