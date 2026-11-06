import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "expense_tracker.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL CHECK(amount > 0),
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            description TEXT,
            transaction_date DATE NOT NULL,
            category_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    """)

    # Seed default categories only if table is empty
    existing = cursor.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
    if existing == 0:
        default_categories = [
            ("Salary", "income"),
            ("Freelance", "income"),
            ("Investment", "income"),
            ("Other Income", "income"),
            ("Food & Dining", "expense"),
            ("Transportation", "expense"),
            ("Housing & Rent", "expense"),
            ("Utilities", "expense"),
            ("Healthcare", "expense"),
            ("Entertainment", "expense"),
            ("Shopping", "expense"),
            ("Education", "expense"),
            ("Travel", "expense"),
            ("Personal Care", "expense"),
            ("Other Expense", "expense"),
        ]
        cursor.executemany(
            "INSERT INTO categories (name, type) VALUES (?, ?)", default_categories
        )

    conn.commit()
    conn.close()
