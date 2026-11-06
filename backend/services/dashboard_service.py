from database.db import get_connection


def get_summary(date_from=None, date_to=None):
    conn = get_connection()
    try:
        conditions = []
        params = []
        if date_from:
            conditions.append("transaction_date >= ?")
            params.append(date_from)
        if date_to:
            conditions.append("transaction_date <= ?")
            params.append(date_to)
        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        rows = conn.execute(
            f"""
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
                COUNT(*) AS transaction_count
            FROM transactions
            {where}
            """,
            params,
        ).fetchone()

        total_income = rows["total_income"] or 0
        total_expense = rows["total_expense"] or 0

        # Recent transactions
        recent_rows = conn.execute(
            """
            SELECT t.*, c.name AS category_name
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT 10
            """
        ).fetchall()

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "transaction_count": rows["transaction_count"] or 0,
            "recent_transactions": [dict(r) for r in recent_rows],
        }
    finally:
        conn.close()


def get_monthly_data(year=None):
    conn = get_connection()
    try:
        params = []
        year_filter = ""
        if year:
            year_filter = "WHERE strftime('%Y', transaction_date) = ?"
            params.append(str(year))

        rows = conn.execute(
            f"""
            SELECT
                strftime('%Y-%m', transaction_date) AS month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            {year_filter}
            GROUP BY month
            ORDER BY month
            """,
            params,
        ).fetchall()

        monthly = []
        for r in rows:
            d = dict(r)
            d["balance"] = d["income"] - d["expense"]
            monthly.append(d)

        return monthly
    finally:
        conn.close()


def get_category_breakdown(date_from=None, date_to=None, type_filter=None):
    conn = get_connection()
    try:
        conditions = []
        params = []
        if date_from:
            conditions.append("t.transaction_date >= ?")
            params.append(date_from)
        if date_to:
            conditions.append("t.transaction_date <= ?")
            params.append(date_to)
        if type_filter:
            conditions.append("t.type = ?")
            params.append(type_filter)

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        rows = conn.execute(
            f"""
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                c.type AS category_type,
                SUM(t.amount) AS total,
                COUNT(t.id) AS count
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            {where}
            GROUP BY c.id
            ORDER BY total DESC
            """,
            params,
        ).fetchall()

        return [dict(r) for r in rows]
    finally:
        conn.close()
