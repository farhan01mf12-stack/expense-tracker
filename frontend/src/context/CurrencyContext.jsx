import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

export const CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    { code: "THB", symbol: "฿", name: "Thai Baht" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso" },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "MXN", symbol: "$", name: "Mexican Peso" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "SAR", symbol: "SR", name: "Saudi Riyal" },
];

// These currencies use no decimal places
const ZERO_DECIMAL = new Set(["JPY", "KRW", "IDR", "VND"]);

const LS_CURRENCY = "et_currency"; // selected currency code
const LS_RATES = "et_rates_v2"; // cached rates object
const RATE_TTL = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    // Default: USD
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem(LS_CURRENCY);
        return CURRENCIES.find((c) => c.code === saved) ?? CURRENCIES[0];
    });

    // rates[code] = how many `code` units equal 1 USD  (rate from open.er-api.com)
    const [rates, setRates] = useState({ USD: 1 });
    const [rateLoading, setRateLoading] = useState(false);
    const [rateError, setRateError] = useState(null);

    // Fetch ALL rates at once from open.er-api.com (base USD, free, ~150 currencies)
    const fetchRates = useCallback(async () => {
        // Serve from cache if fresh
        try {
            const cached = JSON.parse(localStorage.getItem(LS_RATES) || "null");
            if (cached && Date.now() - cached.ts < RATE_TTL) {
                setRates(cached.rates);
                return;
            }
        } catch (_) {
            /* ignore */
        }

        setRateLoading(true);
        setRateError(null);
        try {
            const res = await fetch("https://open.er-api.com/v6/latest/USD");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.result !== "success")
                throw new Error(json["error-type"] || "API error");

            const newRates = { USD: 1, ...json.rates };
            setRates(newRates);
            localStorage.setItem(
                LS_RATES,
                JSON.stringify({ rates: newRates, ts: Date.now() }),
            );
        } catch (e) {
            setRateError(
                `Gagal mengambil kurs: ${e.message}. Menampilkan nilai USD.`,
            );
            // Keep whatever rates we have; fall back to USD = 1
        } finally {
            setRateLoading(false);
        }
    }, []);

    // Fetch rates once on mount
    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    function changeCurrency(code) {
        const found = CURRENCIES.find((c) => c.code === code);
        if (!found) return;
        localStorage.setItem(LS_CURRENCY, code);
        setCurrency(found);
    }

    // Current exchange rate: 1 USD → N currency units
    const exchangeRate = rates[currency.code] ?? 1;

    /**
     * Convert a USD-stored amount to the selected currency and format.
     * DB always stores values in USD.
     */
    function formatCurrency(usdAmount) {
        const converted = (usdAmount ?? 0) * exchangeRate;
        const code = currency.code;

        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: code,
                maximumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
                minimumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
            }).format(converted);
        } catch {
            // Fallback for any Intl edge case
            const decimals = ZERO_DECIMAL.has(code) ? 0 : 2;
            return `${currency.symbol} ${converted.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}`;
        }
    }

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                changeCurrency,
                formatCurrency,
                exchangeRate,
                rateLoading,
                rateError,
                CURRENCIES,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
    return ctx;
}
