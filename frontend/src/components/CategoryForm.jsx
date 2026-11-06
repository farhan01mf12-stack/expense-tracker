import { useState } from "react";
import "../styles/Form.css";

export default function CategoryForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    ...initial,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Category Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Groceries"
          required
          maxLength={80}
        />
      </div>
      <div className="form-group">
        <label>Type *</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save Category"}
        </button>
      </div>
    </form>
  );
}
