from flask import Blueprint, request, jsonify
from services.dashboard_service import get_summary, get_monthly_data, get_category_breakdown

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


def ok(data):
    return jsonify({"success": True, "data": data})


@bp.route("/summary", methods=["GET"])
def summary():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    return ok(get_summary(date_from, date_to))


@bp.route("/monthly", methods=["GET"])
def monthly():
    year = request.args.get("year")
    return ok(get_monthly_data(year))


@bp.route("/categories", methods=["GET"])
def categories():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    type_filter = request.args.get("type")
    return ok(get_category_breakdown(date_from, date_to, type_filter))
