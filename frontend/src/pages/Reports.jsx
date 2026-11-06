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
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts";
import { getDashboardMonthly, getDashboardCategories } from "../services/api";
import { useCurrency } from "../context/CurrencyContext";
import Spinner from "../components/Spinner";
import "../styles/Reports.css";

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

export default function Reports() {
    const { formatCurrency } = useCurrency();
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [monthly, setMonthly] = useState([]);
    const [expCats, setExpCats] = useState([]);
    const [incCats, setIncCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [m, ec, ic] = await Promise.all([
                getDashboardMonthly(year),
                getDashboardCategories({
                    date_from: dateFrom,
                    date_to: dateTo,
                    type: "expense",
                }),
                getDashboardCategories({
                    date_from: dateFrom,
                    date_to: dateTo,
                    type: "income",
                }),
            ]);
            setMonthly(m.map((r) => ({ ...r, month: r.month.slice(0, 7) })));
            setExpCats(ec);
            setIncCats(ic);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [year, dateFrom, dateTo]);

    useEffect(() => {
        load();
    }, [load]);

    const totalIncome = monthly.reduce((s, r) => s + r.income, 0);
    const totalExpense = monthly.reduce((s, r) => s + r.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    return (
        <div className="reports-page">
            <div className="page-header">
                <h2>Financial Reports</h2>
                <div className="filter-bar">
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

            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <>
                    <div className="report-summary">
                        <div className="report-stat">
                            <span>Total Income ({year})</span>
                            <strong className="amount-income">
                                {formatCurrency(totalIncome)}
                            </strong>
                        </div>
                        <div className="report-stat">
                            <span>Total Expense ({year})</span>
                            <strong className="amount-expense">
                                {formatCurrency(totalExpense)}
                            </strong>
                        </div>
                        <div className="report-stat">
                            <span>Net Balance ({year})</span>
                            <strong
                                className={
                                    totalBalance >= 0
                                        ? "amount-income"
                                        : "amount-expense"
                                }
                            >
                                {formatCurrency(totalBalance)}
                            </strong>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Income vs Expense by Month ({year})</h3>
                        {monthly.length === 0 ? (
                            <p className="empty-state">No data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(v) => formatCurrency(v)}
                                    />
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
                        <h3>Monthly Balance Trend ({year})</h3>
                        {monthly.length === 0 ? (
                            <p className="empty-state">No data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(v) => formatCurrency(v)}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#6366f1"
                                        name="Balance"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <h3>Expense Breakdown by Category</h3>
                            {expCats.length === 0 ? (
                                <p className="empty-state">No expenses.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={expCats}
                                            dataKey="total"
                                            nameKey="category_name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({
                                                category_name,
                                                percent,
                                            }) =>
                                                `${category_name} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {expCats.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        COLORS[
                                                            i % COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v) => formatCurrency(v)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="chart-card">
                            <h3>Income Breakdown by Category</h3>
                            {incCats.length === 0 ? (
                                <p className="empty-state">
                                    No income recorded.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={incCats}
                                            dataKey="total"
                                            nameKey="category_name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({
                                                category_name,
                                                percent,
                                            }) =>
                                                `${category_name} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {incCats.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        COLORS[
                                                            i % COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v) => formatCurrency(v)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Monthly Summary Table ({year})</h3>
                        {monthly.length === 0 ? (
                            <p className="empty-state">No data.</p>
                        ) : (
                            <table className="tx-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Income</th>
                                        <th>Expense</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly.map((r) => (
                                        <tr key={r.month}>
                                            <td>{r.month}</td>
                                            <td className="amount-income">
                                                {formatCurrency(r.income)}
                                            </td>
                                            <td className="amount-expense">
                                                {formatCurrency(r.expense)}
                                            </td>
                                            <td
                                                className={
                                                    r.balance >= 0
                                                        ? "amount-income"
                                                        : "amount-expense"
                                                }
                                            >
                                                {formatCurrency(r.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
