# Expense Tracker

A full-stack personal finance management web application built with React (Vite) + Flask + SQLite.

## Features

- **Dashboard** — balance summary cards, income vs expense bar chart, category pie chart, recent transactions, monthly overview with year filter
- **Transactions** — full CRUD, search/filter by type/category/date/text, sortable columns, pagination
- **Categories** — full CRUD, income/expense separation, protected deletion (blocked if in use)
- **Reports** — monthly bar chart, balance trend line chart, category pie charts, monthly summary table, date-range filtering

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Recharts |
| Backend | Python 3, Flask 3, Flask-CORS |
| Database | SQLite3 |

## Project Structure

```
expense-tracker/
├── backend/
│   ├── app.py               # Flask application entry point
│   ├── requirements.txt
│   ├── database/
│   │   └── db.py            # SQLite connection & initialization
│   ├── routes/
│   │   ├── transactions.py  # /api/transactions
│   │   ├── categories.py    # /api/categories
│   │   └── dashboard.py     # /api/dashboard
│   └── services/
│       ├── transaction_service.py
│       ├── category_service.py
│       └── dashboard_service.py
└── frontend/
    └── src/
        ├── components/      # Reusable UI (Layout, Modal, Forms, etc.)
        ├── pages/           # Dashboard, Transactions, Categories, Reports
        ├── services/        # api.js — all fetch calls
        ├── hooks/           # useToast
        └── styles/          # Per-component CSS
```

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend

```bash
cd expense-tracker/backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
python app.py
```

Backend runs on **http://localhost:5000**. Database is auto-initialized with default categories on first start.

### Frontend

```bash
cd expense-tracker/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

> Open http://localhost:5173 in your browser. Both servers must be running.

## API Endpoints

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List (supports `search`, `type`, `category_id`, `date_from`, `date_to`, `sort_by`, `sort_dir`, `page`, `per_page`) |
| GET | `/api/transactions/:id` | Get single |
| POST | `/api/transactions` | Create |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List (supports `?type=income\|expense`) |
| GET | `/api/categories/:id` | Get single |
| POST | `/api/categories` | Create |
| PUT | `/api/categories/:id` | Update |
| DELETE | `/api/categories/:id` | Delete (blocked if in use) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Balance, income, expense totals + recent transactions. Supports `date_from`, `date_to` |
| GET | `/api/dashboard/monthly` | Monthly income/expense/balance. Supports `?year=YYYY` |
| GET | `/api/dashboard/categories` | Spending by category. Supports `date_from`, `date_to`, `type` |

All responses follow:
```json
{ "success": true, "data": ... }
{ "success": false, "error": "message" }
```

## Database

SQLite file: `backend/database/expense_tracker.db` (auto-created on first run).

Default categories seeded automatically: Salary, Freelance, Investment, Food & Dining, Transportation, Housing & Rent, Utilities, Healthcare, Entertainment, Shopping, Education, Travel, Personal Care, and more.

## Known Limitations

- No user authentication (single-user app)
- No data export (CSV/PDF)
- SQLite not suitable for high concurrency production deployments
