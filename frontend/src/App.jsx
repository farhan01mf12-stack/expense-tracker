import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { CurrencyProvider } from "./context/CurrencyContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import "./styles/global.css";

export default function App() {
    const { toasts, addToast, removeToast } = useToast();

    return (
        <CurrencyProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route
                            path="/transactions"
                            element={<Transactions addToast={addToast} />}
                        />
                        <Route
                            path="/categories"
                            element={<Categories addToast={addToast} />}
                        />
                        <Route path="/reports" element={<Reports />} />
                        <Route
                            path="*"
                            element={
                                <div
                                    className="empty-state"
                                    style={{ marginTop: "4rem" }}
                                >
                                    404 — Page not found
                                </div>
                            }
                        />
                    </Routes>
                </Layout>
                <Toast toasts={toasts} removeToast={removeToast} />
            </BrowserRouter>
        </CurrencyProvider>
    );
}
