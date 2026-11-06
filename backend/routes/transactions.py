from flask import Blueprint, request, jsonify
from services.transaction_service import (
    get_all_transactions,
    get_transaction_by_id,
    create_transaction,
    update_transaction,
    delete_transaction,
)
from services.category_service import get_category_by_id

bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")

VALID_TYPES = {"income", "expense"}


def ok(data, status=200):
    return jsonify({"success": True, "data": data}), status


def err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


def _parse_body(body):
    """Validate and extract transaction fields from request body."""
    title = (body.get("title") or "").strip()
    type_ = (body.get("type") or "").strip().lower()
    description = (body.get("description") or "").strip()
    transaction_date = (body.get("transaction_date") or "").strip()
    category_id = body.get("category_id")

    try:
        amount = float(body.get("amount", 0))
    except (TypeError, ValueError):
        return None, "amount must be a number"

    if not title:
        return None, "title is required"
    if type_ not in VALID_TYPES:
        return None, "type must be 'income' or 'expense'"
    if amount <= 0:
        return None, "amount must be greater than 0"
    if not transaction_date:
        return None, "transaction_date is required"
    if not category_id:
        return None, "category_id is required"

    try:
        category_id = int(category_id)
    except (TypeError, ValueError):
        return None, "category_id must be an integer"

    category = get_category_by_id(category_id)
    if not category:
        return None, "Category not found"
    if category["type"] != type_:
        return (
            None,
            f"Category type '{category['type']}' does not match transaction type '{type_}'",
        )

    return {
        "title": title,
        "amount": amount,
        "type_": type_,
        "description": description or None,
        "transaction_date": transaction_date,
        "category_id": category_id,
    }, None


@bp.route("", methods=["GET"])
def list_transactions():
    filters = {
        "type": request.args.get("type"),
        "category_id": request.args.get("category_id"),
        "date_from": request.args.get("date_from"),
        "date_to": request.args.get("date_to"),
        "search": request.args.get("search"),
    }
    try:
        page = int(request.args.get("page", 1))
        per_page = min(int(request.args.get("per_page", 20)), 100)
    except ValueError:
        page, per_page = 1, 20

    sort_by = request.args.get("sort_by", "transaction_date")
    sort_dir = request.args.get("sort_dir", "desc")

    result = get_all_transactions(filters, sort_by, sort_dir, page, per_page)
    return ok(result)


@bp.route("/<int:transaction_id>", methods=["GET"])
def get_one(transaction_id):
    tx = get_transaction_by_id(transaction_id)
    if not tx:
        return err("Transaction not found", 404)
    return ok(tx)


@bp.route("", methods=["POST"])
def create():
    body = request.get_json(silent=True) or {}
    data, error = _parse_body(body)
    if error:
        return err(error)

    tx = create_transaction(**data)
    return ok(tx, 201)


@bp.route("/<int:transaction_id>", methods=["PUT"])
def update(transaction_id):
    if not get_transaction_by_id(transaction_id):
        return err("Transaction not found", 404)

    body = request.get_json(silent=True) or {}
    data, error = _parse_body(body)
    if error:
        return err(error)

    tx = update_transaction(transaction_id, **data)
    return ok(tx)


@bp.route("/<int:transaction_id>", methods=["DELETE"])
def delete(transaction_id):
    if not get_transaction_by_id(transaction_id):
        return err("Transaction not found", 404)

    delete_transaction(transaction_id)
    return ok({"message": "Transaction deleted"})
