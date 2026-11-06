import { useState, useEffect } from "react";
import { getCategories } from "../services/api";
import "../styles/Form.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    description: "",
    transaction_date: today(),
    category_id: "",
    ...initial,
  });
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    getCategories(form.type)
      .then(setCategories)
      .finally(() => setCatLoading(false));
  }, [form.type]);

  // Reset category when type changes
  function handleTypeChange(e) {
    setForm((f) => ({ ...f, type: e.target.value, category_id: "" }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      category_id: parseInt(form.category_id),
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Transaction title"
            required
            maxLength={120}
          />
        </div>
        <div className="form-group">
          <label>Amount *</label>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type *</label>
          <select name="type" value={form.type} onChange={handleTypeChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input
            name="transaction_date"
            type="date"
            value={form.transaction_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Category *</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
          disabled={catLoading}
        >
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save Transaction"}
        </button>
      </div>
    </form>
  );
}
