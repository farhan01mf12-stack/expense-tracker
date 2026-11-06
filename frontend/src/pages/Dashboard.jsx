import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import {
    getDashboardSummary,
    getDashboardMonthly,
    getDashboardCategories,
} from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import Spinner from "../components/Spinner";
import "../styles/Dashboard.css";

const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#84cc16",
];

function SummaryCard({ label, value, color, formatCurrency }) {
    return (
        <div className={`summary-card summary-card-${color}`}>
            <p className="summary-label">{label}</p>
            <p className="summary-value">{formatCurrency(value)}</p>
        </div>
    );
}

export default function Dashboard() {
    const { formatCurrency } = useCurrency();
    const [summary, setSummary] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, m, c] = await Promise.all([
                getDashboardSummary({ date_from: dateFrom, date_to: dateTo }),
                getDashboardMonthly(year),
                getDashboardCategories({
                    date_from: dateFrom,
                    date_to: dateTo,
                    type: "expense",
                }),
            ]);
            setSummary(s);
            setMonthly(m);
            setCategories(c);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, year]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <Spinner />;
    if (error)
        return (
            <div className="error-state">Failed to load dashboard: {error}</div>
        );

    const monthlyChartData = monthly.map((m) => ({
        ...m,
        month: m.month.slice(0, 7),
    }));

    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Dashboard</h2>
                <div className="filter-bar">
                    <label>
                        From{" "}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </label>
                    <label>
                        To{" "}
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </label>
                    <label>
                        Year{" "}
                        <input
                            type="number"
                            value={year}
                            min="2000"
                            max="2099"
                            onChange={(e) => setYear(e.target.value)}
                            style={{ width: 80 }}
                        />
                    </label>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                            setDateFrom("");
                            setDateTo("");
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="summary-grid">
                <SummaryCard
                    label="Balance"
                    value={summary?.balance}
                    color="blue"
                    formatCurrency={formatCurrency}
                />
                <SummaryCard
                    label="Total Income"
                    value={summary?.total_income}
                    color="green"
                    formatCurrency={formatCurrency}
                />
                <SummaryCard
                    label="Total Expense"
                    value={summary?.total_expense}
                    color="red"
                    formatCurrency={formatCurrency}
                />
                <SummaryCard
                    label="Transactions"
                    value={summary?.transaction_count}
                    color="purple"
                    formatCurrency={formatCurrency}
                />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Monthly Overview ({year})</h3>
                    {monthlyChartData.length === 0 ? (
                        <p className="empty-state">
                            No data for selected year.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Legend />
                                <Bar
                                    dataKey="income"
                                    fill="#10b981"
                                    name="Income"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="expense"
                                    fill="#ef4444"
                                    name="Expense"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Expense by Category</h3>
                    {categories.length === 0 ? (
                        <p className="empty-state">No expense data.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="total"
                                    nameKey="category_name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ category_name, percent }) =>
                                        `${category_name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {categories.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="chart-card">
                <h3>Recent Transactions</h3>
                {!summary?.recent_transactions?.length ? (
                    <p className="empty-state">No transactions yet.</p>
                ) : (
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.recent_transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td>{tx.transaction_date}</td>
                                    <td>{tx.title}</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
