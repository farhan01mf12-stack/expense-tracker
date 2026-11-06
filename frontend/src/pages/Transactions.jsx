import { useState, useEffect, useCallback } from "react";
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories,
} from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import TransactionForm from "../components/TransactionForm";
import Spinner from "../components/Spinner";
import "../styles/Transactions.css";

export default function Transactions({ addToast }) {
    const { formatCurrency } = useCurrency();

    const [data, setData] = useState({
        transactions: [],
        total: 0,
        page: 1,
        total_pages: 1,
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [catFilter, setCatFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("transaction_date");
    const [sortDir, setSortDir] = useState("desc");
    const [page, setPage] = useState(1);
    const perPage = 20;

    const [showCreate, setShowCreate] = useState(false);
    const [editTx, setEditTx] = useState(null);
    const [deleteTx, setDeleteTx] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTransactions({
                search,
                type: typeFilter,
                category_id: catFilter,
                date_from: dateFrom,
                date_to: dateTo,
                sort_by: sortBy,
                sort_dir: sortDir,
                page,
                per_page: perPage,
            });
            setData(result);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [
        search,
        typeFilter,
        catFilter,
        dateFrom,
        dateTo,
        sortBy,
        sortDir,
        page,
    ]);

    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    function handleSort(field) {
        if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortBy(field);
            setSortDir("desc");
        }
        setPage(1);
    }

    async function handleCreate(formData) {
        setSaving(true);
        try {
            await createTransaction(formData);
            addToast("Transaction created");
            setShowCreate(false);
            setPage(1);
            load();
        } catch (e) {
            addToast(e.message, "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(formData) {
        setSaving(true);
        try {
            await updateTransaction(editTx.id, formData);
            addToast("Transaction updated");
            setEditTx(null);
            load();
        } catch (e) {
            addToast(e.message, "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        try {
            await deleteTransaction(deleteTx.id);
            addToast("Transaction deleted");
            setDeleteTx(null);
            load();
        } catch (e) {
            addToast(e.message, "error");
        }
    }

    function clearFilters() {
        setSearch("");
        setTypeFilter("");
        setCatFilter("");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    }

    const sortIcon = (field) =>
        sortBy === field ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅";

    return (
        <div className="transactions-page">
            <div className="page-header">
                <h2>Transactions</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreate(true)}
                >
                    + Add Transaction
                </button>
            </div>

            <div className="filter-panel">
                <input
                    className="filter-input"
                    placeholder="Search title or description…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                <select
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select
                    value={catFilter}
                    onChange={(e) => {
                        setCatFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(1);
                    }}
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(1);
                    }}
                />
                <button
                    className="btn btn-sm btn-outline"
                    onClick={clearFilters}
                >
                    Clear
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : data.transactions.length === 0 ? (
                <div className="empty-state">
                    No transactions found. Add one!
                </div>
            ) : (
                <>
                    <div className="table-wrap">
                        <table className="tx-table">
                            <thead>
                                <tr>
                                    <th
                                        onClick={() =>
                                            handleSort("transaction_date")
                                        }
                                        className="sortable"
                                    >
                                        Date{sortIcon("transaction_date")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("title")}
                                        className="sortable"
                                    >
                                        Title{sortIcon("title")}
                                    </th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th
                                        onClick={() => handleSort("amount")}
                                        className="sortable"
                                    >
                                        Amount{sortIcon("amount")}
                                    </th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.transaction_date}</td>
                                        <td className="tx-title">{tx.title}</td>
                                        <td>{tx.category_name}</td>
                                        <td>
                                            <span
                                                className={`badge badge-${tx.type}`}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td
                                            className={
                                                tx.type === "income"
                                                    ? "amount-income"
                                                    : "amount-expense"
                                            }
                                        >
                                            {tx.type === "income" ? "+" : "-"}
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="tx-desc">
                                            {tx.description || "—"}
                                        </td>
                                        <td className="tx-actions">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => setEditTx(tx)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => setDeleteTx(tx)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <span>
                            Page {data.page} of {data.total_pages} &mdash;{" "}
                            {data.total} transaction
                            {data.total !== 1 ? "s" : ""}
                        </span>
                        <div className="pagination-btns">
                            <button
                                className="btn btn-sm btn-outline"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ‹ Prev
                            </button>
                            <button
                                className="btn btn-sm btn-outline"
                                disabled={page >= data.total_pages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showCreate && (
                <Modal
                    title="Add Transaction"
                    onClose={() => setShowCreate(false)}
                >
                    <TransactionForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreate(false)}
                        loading={saving}
                    />
                </Modal>
            )}
            {editTx && (
                <Modal title="Edit Transaction" onClose={() => setEditTx(null)}>
                    <TransactionForm
                        initial={editTx}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditTx(null)}
                        loading={saving}
                    />
                </Modal>
            )}
            {deleteTx && (
                <ConfirmDialog
                    message={`Delete "${deleteTx.title}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTx(null)}
                />
            )}
        </div>
    );
}
