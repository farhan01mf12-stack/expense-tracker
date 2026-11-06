import "../styles/Modal.css";

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Confirm</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          <div className="form-actions" style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
