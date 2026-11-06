from flask import Flask, jsonify
from flask_cors import CORS
from database.db import init_db
from routes.transactions import bp as transactions_bp
from routes.categories import bp as categories_bp
from routes.dashboard import bp as dashboard_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(transactions_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(dashboard_bp)


@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "error": "Method not allowed"}), 405


@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
