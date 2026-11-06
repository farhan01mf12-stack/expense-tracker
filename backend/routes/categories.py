from flask import Blueprint, request, jsonify
from services.category_service import (
    get_all_categories,
    get_category_by_id,
    create_category,
    update_category,
    delete_category,
)

bp = Blueprint("categories", __name__, url_prefix="/api/categories")

VALID_TYPES = {"income", "expense"}


def ok(data, status=200):
    return jsonify({"success": True, "data": data}), status


def err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


@bp.route("", methods=["GET"])
def list_categories():
    type_filter = request.args.get("type")
    if type_filter and type_filter not in VALID_TYPES:
        return err("type must be 'income' or 'expense'")
    return ok(get_all_categories(type_filter))


@bp.route("/<int:category_id>", methods=["GET"])
def get_category(category_id):
    cat = get_category_by_id(category_id)
    if not cat:
        return err("Category not found", 404)
    return ok(cat)


@bp.route("", methods=["POST"])
def create():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    type_ = (body.get("type") or "").strip().lower()

    if not name:
        return err("name is required")
    if type_ not in VALID_TYPES:
        return err("type must be 'income' or 'expense'")

    cat = create_category(name, type_)
    return ok(cat, 201)


@bp.route("/<int:category_id>", methods=["PUT"])
def update(category_id):
    if not get_category_by_id(category_id):
        return err("Category not found", 404)

    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    type_ = (body.get("type") or "").strip().lower()

    if not name:
        return err("name is required")
    if type_ not in VALID_TYPES:
        return err("type must be 'income' or 'expense'")

    cat = update_category(category_id, name, type_)
    return ok(cat)


@bp.route("/<int:category_id>", methods=["DELETE"])
def delete(category_id):
    if not get_category_by_id(category_id):
        return err("Category not found", 404)

    success, message = delete_category(category_id)
    if not success:
        return err(message, 409)
    return ok({"message": "Category deleted"})
