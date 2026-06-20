// src/components/PlanModal.jsx
import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";

export default function PlanModal({ defaultText, onCancel, onApply }) {
  const [text, setText] = useState(defaultText || "");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function handleBuild() {
    if (!text.trim()) { setErr("Write your plan first."); return; }
    setBusy(true); setErr("");
    try {
      await onApply(text);
    } catch (e) {
      setErr(e.message || "Couldn't parse that — try adding clearer times for each task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
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
          borderTop: "1px solid var(--accent-border)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "0 20px 36px",
          maxHeight: "90dvh",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 18px" }}>
          <div style={{
            width: 36, height: 4, borderRadius: 99,
            background: "var(--border)",
          }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Sparkles size={14} color="var(--accent)" />
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: 18,
                fontWeight: 700, letterSpacing: "-0.01em",
              }}>
                Your plan
              </h2>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>
              Describe your day in plain English — times, tasks, goals.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: 30, height: 30, borderRadius: 99,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"e.g. 7am – React interview questions\n10am – DSA practice\n1pm – AI/ML learning\n9pm – Job search"}
            style={{ minHeight: 148, resize: "vertical", lineHeight: 1.8 }}
            autoFocus
          />
        </div>

        {err && (
          <div style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(248,113,113,0.22)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px", marginTop: 10,
            fontSize: 12, color: "var(--red)", lineHeight: 1.6,
          }}>
            {err}
          </div>
        )}

        <button
          onClick={handleBuild}
          disabled={busy}
          style={{
            width: "100%", marginTop: 12,
            background: busy ? "var(--surface-2)" : "var(--accent-grad)",
            color: busy ? "var(--text-2)" : "#fff",
            border: busy ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius)", padding: "13px 0",
            fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: busy ? "none" : "0 4px 16px rgba(124,120,255,0.3)",
            transition: "opacity 0.15s",
            fontFamily: "var(--font-display)",
          }}
        >
          {busy
            ? <><Loader2 size={14} className="spin" /> Building schedule…</>
            : <><Sparkles size={14} /> Build my schedule</>
          }
        </button>
      </div>
    </div>
  );
}
