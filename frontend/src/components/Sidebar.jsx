import { NavLink } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import "../styles/Sidebar.css";

const links = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/transactions", label: "Transactions", icon: "💳" },
    { to: "/categories", label: "Categories", icon: "🏷️" },
    { to: "/reports", label: "Reports", icon: "📈" },
];

/** Format exchange rate number nicely regardless of magnitude */
function fmtRate(rate) {
    if (rate >= 100)
        return rate.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (rate >= 1)
        return rate.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return rate.toFixed(6);
}

export default function Sidebar({ isOpen, onClose }) {
    const {
        currency,
        changeCurrency,
        exchangeRate,
        rateLoading,
        rateError,
        CURRENCIES,
    } = useCurrency();

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <span className="sidebar-logo">💰</span>
                    <span className="sidebar-title">ExpenseTracker</span>
                </div>

                <nav className="sidebar-nav">
                    {links.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `sidebar-link${isActive ? " sidebar-link-active" : ""}`
                            }
                            onClick={onClose}
                        >
                            <span className="sidebar-icon">{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ── Currency selector ── */}
                <div className="sidebar-currency">
                    <p className="currency-label">
                        <span>💱</span> Currency
                    </p>

                    <select
                        className="currency-select"
                        value={currency.code}
                        onChange={(e) => changeCurrency(e.target.value)}
                        disabled={rateLoading}
                    >
                        {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} — {c.name}
                            </option>
                        ))}
                    </select>

                    <div className="currency-rate-box">
                        {rateLoading ? (
                            <span className="rate-fetching">
                                ⏳ Fetching rates…
                            </span>
                        ) : rateError ? (
                            <span className="rate-err" title={rateError}>
                                ⚠ Rate unavailable
                            </span>
                        ) : currency.code === "USD" ? (
                            <span className="rate-info">
                                Base currency — USD
                            </span>
                        ) : (
                            <span className="rate-info">
                                1 USD&nbsp;=&nbsp;
                                <strong>
                                    {fmtRate(exchangeRate)}&nbsp;{currency.code}
                                </strong>
                            </span>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p>Personal Finance Manager</p>
                </div>
            </aside>
        </>
    );
}
