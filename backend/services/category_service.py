from database.db import get_connection


def get_all_categories(type_filter=None):
    conn = get_connection()
    try:
        if type_filter:
            rows = conn.execute(
                "SELECT * FROM categories WHERE type = ? ORDER BY name",
                (type_filter,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM categories ORDER BY type, name"
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_category_by_id(category_id):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM categories WHERE id = ?", (category_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create_category(name, type_):
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO categories (name, type) VALUES (?, ?)", (name, type_)
        )
        conn.commit()
        return get_category_by_id(cursor.lastrowid)
    finally:
        conn.close()


def update_category(category_id, name, type_):
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE categories SET name = ?, type = ? WHERE id = ?",
            (name, type_, category_id),
        )
        conn.commit()
        return get_category_by_id(category_id)
    finally:
        conn.close()


def delete_category(category_id):
    conn = get_connection()
    try:
        # Check if any transactions use this category
        count = conn.execute(
            "SELECT COUNT(*) FROM transactions WHERE category_id = ?",
            (category_id,),
        ).fetchone()[0]
        if count > 0:
            return False, f"Category used by {count} transaction(s). Reassign or delete them first."
        conn.execute("DELETE FROM categories WHERE id = ?", (category_id,))
        conn.commit()
        return True, None
    finally:
        conn.close()
