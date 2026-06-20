// src/components/EditModal.jsx
import { useState } from "react";
import { X } from "lucide-react";

export default function EditModal({ blocks, onCancel, onSave }) {
  const [local, setLocal] = useState(blocks.map((b) => ({ ...b })));

  function update(id, field, value) {
    setLocal(local.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end",
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        className="fadeUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, margin: "0 auto",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "24px 20px 32px",
          maxHeight: "85dvh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Edit times</h2>
          <button onClick={onCancel} style={{ color: "var(--text-2)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {local.map((b) => (
            <div key={b.id} style={{ paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>
              <input
                type="text"
                value={b.label}
                onChange={(e) => update(b.id, "label", e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input type="time" value={b.start} onChange={(e) => update(b.id, "start", e.target.value)} />
                <input type="time" value={b.end} onChange={(e) => update(b.id, "end", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSave(local)}
          style={{
            width: "100%", background: "var(--accent)", color: "#0d0d0d",
            border: "none", borderRadius: "var(--radius)", padding: "13px 0",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.02em",
          }}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
