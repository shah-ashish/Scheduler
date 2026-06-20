// src/components/HeroCard.jsx
import { Check } from "lucide-react";
import { formatClock, formatTime, formatCountdown, toMins, nowMins } from "../lib/time.js";

export default function HeroCard({ activeBlock, nextBlock, done, onToggleDone, onOpenDetail, quote }) {
  const clock   = formatClock(new Date());
  const current = nowMins();
  const isActive = !!activeBlock;
  const isDone   = activeBlock ? done.includes(activeBlock.id) : false;
  const minsLeft = activeBlock ? Math.max(0, toMins(activeBlock.end) - current) : 0;
  const totalMins = activeBlock ? toMins(activeBlock.end) - toMins(activeBlock.start) : 1;
  const progressPct = activeBlock ? Math.max(0, Math.min(100, ((totalMins - minsLeft) / totalMins) * 100)) : 0;

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>

      {/* Ambient glow when active */}
      {isActive && (
        <div style={{
          position: "absolute", inset: -1,
          borderRadius: "calc(var(--radius-lg) + 1px)",
          background: "var(--accent-grad)",
          opacity: 0.18,
          filter: "blur(16px)",
          pointerEvents: "none",
        }} />
      )}

      <div
        onClick={() => activeBlock && activeBlock.type !== "reminder" && onOpenDetail(activeBlock)}
        style={{
          position: "relative",
          background: isActive
            ? "linear-gradient(145deg, var(--surface) 0%, rgba(124,120,255,0.06) 100%)"
            : "var(--surface)",
          border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "24px 22px 20px",
          overflow: "hidden",
          cursor: activeBlock && activeBlock.type !== "reminder" ? "pointer" : "default",
          transition: "border-color 0.25s ease",
          boxShadow: isActive ? "var(--shadow)" : "none",
        }}
      >
        {/* Top accent line when active */}
        {isActive && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "var(--accent-grad)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }} />
        )}

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-3)",
              letterSpacing: "0.12em", marginBottom: 8,
              fontFamily: "var(--font-display)",
            }}>
              RIGHT NOW
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 58, fontWeight: 700,
                lineHeight: 1, letterSpacing: "-0.04em",
                color: "var(--text)",
              }}>
                {clock.time}
              </span>
              <span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}>
                {clock.ampm}
              </span>
            </div>
          </div>

          {/* Live pill */}
          {isActive && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 99, padding: "5px 11px",
            }}>
              <span className="pulse" style={{
                width: 6, height: 6,
                background: "var(--accent)", borderRadius: 99, display: "block",
              }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: "var(--accent)",
                letterSpacing: "0.1em", fontFamily: "var(--font-display)",
              }}>LIVE</span>
            </div>
          )}
        </div>

        {/* Content area */}
        {isActive ? (
          <div>
            {/* Block info */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 18,
                fontWeight: 600, marginBottom: 5, color: "var(--text)",
              }}>
                {activeBlock.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)" }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    borderRadius: 99, padding: "2px 9px", fontWeight: 500,
                  }}
                >
                  {formatCountdown(minsLeft)} left
                </span>
                <span>{activeBlock.sub}</span>
                {activeBlock.type !== "reminder" && (
                  <span style={{ color: "var(--accent)", fontWeight: 500 }}>tap to open →</span>
                )}
              </div>
            </div>

            {/* Block progress bar */}
            <div style={{
              height: 3, background: "var(--surface-3)", borderRadius: 99,
              marginBottom: 14, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "var(--accent-grad)",
                width: `${progressPct}%`,
                transition: "width 0.6s ease",
              }} />
            </div>

            {/* Mark complete button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDone(activeBlock.id); }}
              style={{
                width: "100%",
                background: isDone ? "var(--green-dim)" : "var(--accent-grad)",
                color: isDone ? "var(--green)" : "#fff",
                border: isDone ? "1px solid var(--green-border)" : "none",
                borderRadius: "var(--radius-sm)",
                padding: "12px 0",
                fontWeight: 700, fontSize: 13,
                letterSpacing: "0.04em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "opacity 0.15s, transform 0.15s",
                boxShadow: isDone ? "none" : "0 4px 14px rgba(124,120,255,0.3)",
                fontFamily: "var(--font-display)",
              }}
              onMouseEnter={(e) => !isDone && (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isDone ? <><Check size={14} /> Completed</> : "Mark complete"}
            </button>
          </div>

        ) : nextBlock ? (
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-3)",
              letterSpacing: "0.12em", marginBottom: 10,
              fontFamily: "var(--font-display)",
            }}>NEXT UP</div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "12px 14px",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 15,
                  fontWeight: 600, marginBottom: 3,
                }}>
                  {nextBlock.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                  {formatTime(nextBlock.start)} · in {formatCountdown(toMins(nextBlock.start) - current)}
                </div>
              </div>
              <div style={{
                background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                borderRadius: 99, padding: "4px 10px",
                fontSize: 11, fontWeight: 600, color: "var(--accent)",
              }}>
                up next
              </div>
            </div>
          </div>

        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 0",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 99,
              background: "var(--green-dim)", border: "1px solid var(--green-border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Check size={15} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 1 }}>
                All done for today
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Rest counts too. 🔥</div>
            </div>
          </div>
        )}

        {/* Quote */}
        <div style={{
          marginTop: 18, paddingTop: 14,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <p style={{ fontSize: 11, color: "var(--text-3)", fontStyle: "italic", lineHeight: 1.6 }}>
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
}
