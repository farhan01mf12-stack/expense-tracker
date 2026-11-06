import { useState, useEffect, useCallback } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import CategoryForm from "../components/CategoryForm";
import Spinner from "../components/Spinner";
import "../styles/Categories.css";

export default function Categories({ addToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteCat, setDeleteCat] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await getCategories(typeFilter || undefined);
      setCategories(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(formData) {
    setSaving(true);
    try {
      await createCategory(formData);
      addToast("Category created");
      setShowCreate(false);
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
      await updateCategory(editCat.id, formData);
      addToast("Category updated");
      setEditCat(null);
      load();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteCategory(deleteCat.id);
      addToast("Category deleted");
      setDeleteCat(null);
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");
  const filtered = typeFilter === "income" ? income : typeFilter === "expense" ? expense : categories;

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2>Categories</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Category</button>
      </div>

      <div className="filter-bar">
        <button className={`btn btn-sm ${typeFilter === "" ? "btn-primary" : "btn-outline"}`} onClick={() => setTypeFilter("")}>All</button>
        <button className={`btn btn-sm ${typeFilter === "income" ? "btn-primary" : "btn-outline"}`} onClick={() => setTypeFilter("income")}>Income</button>
        <button className={`btn btn-sm ${typeFilter === "expense" ? "btn-primary" : "btn-outline"}`} onClick={() => setTypeFilter("expense")}>Expense</button>
      </div>

      {loading ? <Spinner /> : error ? (
        <div className="error-state">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No categories found.</div>
      ) : (
        <div className="cat-grid">
          {filtered.map((cat) => (
            <div key={cat.id} className={`cat-card cat-card-${cat.type}`}>
              <div className="cat-card-info">
                <span className="cat-name">{cat.name}</span>
                <span className={`badge badge-${cat.type}`}>{cat.type}</span>
              </div>
              <div className="cat-actions">
                <button className="btn btn-sm btn-outline" onClick={() => setEditCat(cat)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteCat(cat)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Add Category" onClose={() => setShowCreate(false)}>
          <CategoryForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
        </Modal>
      )}

      {editCat && (
        <Modal title="Edit Category" onClose={() => setEditCat(null)}>
          <CategoryForm
            initial={editCat}
            onSubmit={handleUpdate}
            onCancel={() => setEditCat(null)}
            loading={saving}
          />
        </Modal>
      )}

      {deleteCat && (
        <ConfirmDialog
          message={`Delete category "${deleteCat.name}"? Transactions using it must be reassigned first.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCat(null)}
        />
      )}
    </div>
  );
}
