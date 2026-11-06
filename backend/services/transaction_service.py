from database.db import get_connection


def _build_filter_query(filters):
    conditions = []
    params = []

    if filters.get("type"):
        conditions.append("t.type = ?")
        params.append(filters["type"])

    if filters.get("category_id"):
        conditions.append("t.category_id = ?")
        params.append(filters["category_id"])

    if filters.get("date_from"):
        conditions.append("t.transaction_date >= ?")
        params.append(filters["date_from"])

    if filters.get("date_to"):
        conditions.append("t.transaction_date <= ?")
        params.append(filters["date_to"])

    if filters.get("search"):
        conditions.append("(t.title LIKE ? OR t.description LIKE ?)")
        term = f"%{filters['search']}%"
        params.extend([term, term])

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    return where, params


def get_all_transactions(filters=None, sort_by="transaction_date", sort_dir="desc", page=1, per_page=20):
    filters = filters or {}
    allowed_sorts = {"transaction_date", "amount", "title", "created_at"}
    if sort_by not in allowed_sorts:
        sort_by = "transaction_date"
    sort_dir = "ASC" if sort_dir.lower() == "asc" else "DESC"

    conn = get_connection()
    try:
        where, params = _build_filter_query(filters)

        count_row = conn.execute(
            f"SELECT COUNT(*) FROM transactions t {where}", params
        ).fetchone()[0]

        offset = (page - 1) * per_page
        rows = conn.execute(
            f"""
            SELECT t.*, c.name AS category_name, c.type AS category_type
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            {where}
            ORDER BY t.{sort_by} {sort_dir}
            LIMIT ? OFFSET ?
            """,
            params + [per_page, offset],
        ).fetchall()

        return {
            "transactions": [dict(r) for r in rows],
            "total": count_row,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, -(-count_row // per_page)),
        }
    finally:
        conn.close()


def get_transaction_by_id(transaction_id):
    conn = get_connection()
    try:
        row = conn.execute(
            """
            SELECT t.*, c.name AS category_name, c.type AS category_type
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = ?
            """,
            (transaction_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create_transaction(title, amount, type_, description, transaction_date, category_id):
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO transactions (title, amount, type, description, transaction_date, category_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (title, amount, type_, description, transaction_date, category_id),
        )
        conn.commit()
        return get_transaction_by_id(cursor.lastrowid)
    finally:
        conn.close()


def update_transaction(transaction_id, title, amount, type_, description, transaction_date, category_id):
    conn = get_connection()
    try:
        conn.execute(
            """
            UPDATE transactions
            SET title = ?, amount = ?, type = ?, description = ?,
                transaction_date = ?, category_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (title, amount, type_, description, transaction_date, category_id, transaction_id),
        )
        conn.commit()
        return get_transaction_by_id(transaction_id)
    finally:
        conn.close()


def delete_transaction(transaction_id):
    conn = get_connection()
    try:
        rows_affected = conn.execute(
            "DELETE FROM transactions WHERE id = ?", (transaction_id,)
        ).rowcount
        conn.commit()
        return rows_affected > 0
    finally:
        conn.close()
