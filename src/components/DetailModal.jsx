// src/components/DetailModal.jsx
import { X, RefreshCw, ExternalLink, Check, Loader2 } from "lucide-react";
import { formatTime } from "../lib/time.js";

function pad(n) { return String(n).padStart(2, "0"); }

export default function DetailModal({ block, content, loading, error, isDone, onClose, onRegenerate, onToggleDone }) {
  if (!block) return null;

  const typeLabel = block.type === "interview"  ? "Interview Prep"
                  : block.type === "jobsearch"  ? "Job Search"
                  : "Reminder";

  const typeBg    = block.type === "interview"  ? "var(--accent-dim)"
                  : block.type === "jobsearch"  ? "var(--green-dim)"
                  : "var(--surface-2)";

  const typeColor = block.type === "interview"  ? "var(--accent)"
                  : block.type === "jobsearch"  ? "var(--green)"
                  : "var(--text-3)";

  const typeBorder = block.type === "interview"  ? "var(--accent-border)"
                   : block.type === "jobsearch"  ? "var(--green-border)"
                   : "var(--border)";

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="fadeUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, margin: "0 auto",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: `1px solid ${typeBorder}`,
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "0 20px 36px",
          maxHeight: "90dvh", overflowY: "auto",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
            {/* Type badge */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: typeBg, border: `1px solid ${typeBorder}`,
              borderRadius: 99, padding: "3px 10px", marginBottom: 8,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: typeColor,
                letterSpacing: "0.1em",
                fontFamily: "var(--font-display)",
              }}>
                {typeLabel.toUpperCase()}
              </span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 20,
              fontWeight: 700, letterSpacing: "-0.015em",
              lineHeight: 1.2, marginBottom: 4,
            }}>
              {block.label}
            </h2>
            <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              {formatTime(block.start)} – {formatTime(block.end)}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 99, flexShrink: 0,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Reminder */}
        {block.type === "reminder" && (
          <div style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 18,
          }}>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
              {block.note || block.sub}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            color: "var(--text-3)", fontSize: 13, padding: "28px 0",
            justifyContent: "center",
          }}>
            <Loader2 size={16} className="spin" color="var(--accent)" />
            <span>{block.type === "jobsearch" ? "Finding open roles…" : "Generating questions…"}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.22)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 16,
            fontSize: 12, color: "var(--red)", lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* Interview questions */}
        {!loading && block.type === "interview" && Array.isArray(content) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {content.map((q, i) => (
              <div key={i} style={{
                display: "flex", gap: 12,
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)", padding: "11px 13px",
              }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700,
                  color: "var(--accent)", flexShrink: 0,
                  minWidth: 20, paddingTop: 2, lineHeight: 1.8,
                }}>
                  {pad(i + 1)}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>{q}</span>
              </div>
            ))}
          </div>
        )}

        {/* Job listings */}
        {!loading && block.type === "jobsearch" && Array.isArray(content) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {content.map((j, i) => (
              <a
                key={i}
                href={j.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: "12px 14px",
                  transition: "border-color 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-border)";
                  e.currentTarget.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                    {j.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{j.company}</div>
                </div>
                <ExternalLink size={13} color="var(--accent)" style={{ flexShrink: 0, marginLeft: 14 }} />
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {block.type !== "reminder" && !loading && (
            <button
              onClick={onRegenerate}
              style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "10px 0",
                color: "var(--text-2)", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "border-color 0.15s",
                fontFamily: "var(--font-display)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-border)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <RefreshCw size={12} /> Regenerate
            </button>
          )}

          <button
            onClick={() => onToggleDone(block.id)}
            style={{
              background: isDone ? "var(--green-dim)" : "var(--accent-grad)",
              color: isDone ? "var(--green)" : "#fff",
              border: isDone ? "1px solid var(--green-border)" : "none",
              borderRadius: "var(--radius-sm)", padding: "12px 0",
              fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isDone ? "none" : "0 4px 14px rgba(124,120,255,0.3)",
              fontFamily: "var(--font-display)",
            }}
          >
            {isDone ? <><Check size={14} /> Marked done</> : "Mark complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
