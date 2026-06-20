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

  // Visual style state depending on active/completed status
  const cardBg = isActive
    ? isDone
      ? "linear-gradient(145deg, var(--surface) 0%, rgba(16,185,129,0.03) 100%)"
      : "var(--accent-grad)"
    : "var(--surface)";

  const cardBorder = isActive
    ? isDone
      ? "1px solid var(--green-border)"
      : "1px solid rgba(255, 255, 255, 0.25)"
    : "1px solid var(--border-subtle)";

  const cardShadow = isActive && !isDone
    ? "0 16px 36px rgba(124, 120, 255, 0.35), 0 4px 12px rgba(124, 120, 255, 0.2)"
    : "none";

  const glowBg = isDone ? "var(--green)" : "var(--accent-grad)";
  const glowOpacity = isDone ? 0.08 : 0.25;
  const glowBlur = isDone ? "12px" : "24px";

  const textPrimary = isActive && !isDone ? "#ffffff" : "var(--text)";
  const textSecondary = isActive && !isDone ? "rgba(255, 255, 255, 0.75)" : "var(--text-2)";
  const textMuted = isActive && !isDone ? "rgba(255, 255, 255, 0.55)" : "var(--text-3)";
  const borderTopColor = isActive && !isDone ? "rgba(255, 255, 255, 0.15)" : "var(--border-subtle)";

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>

      {/* Ambient glow when active */}
      {isActive && (
        <div style={{
          position: "absolute", inset: -4,
          borderRadius: "calc(var(--radius-lg) + 4px)",
          background: glowBg,
          opacity: glowOpacity,
          filter: `blur(${glowBlur})`,
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }} />
      )}

      <div
        onClick={() => activeBlock && activeBlock.type !== "reminder" && onOpenDetail(activeBlock)}
        style={{
          position: "relative",
          background: cardBg,
          border: cardBorder,
          borderRadius: "var(--radius-lg)",
          padding: "24px 22px 20px",
          overflow: "hidden",
          cursor: activeBlock && activeBlock.type !== "reminder" ? "pointer" : "default",
          transition: "all 0.3s ease",
          boxShadow: cardShadow,
        }}
      >
        {/* Top accent line when active */}
        {isActive && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: isDone ? "var(--green)" : "rgba(255, 255, 255, 0.3)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }} />
        )}

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: textMuted,
              letterSpacing: "0.12em", marginBottom: 8,
              fontFamily: "var(--font-display)",
              transition: "color 0.3s ease",
            }}>
              RIGHT NOW
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 58, fontWeight: 700,
                lineHeight: 1, letterSpacing: "-0.04em",
                color: textPrimary,
                transition: "color 0.3s ease",
              }}>
                {clock.time}
              </span>
              <span style={{ fontSize: 16, color: textSecondary, fontWeight: 500, transition: "color 0.3s ease" }}>
                {clock.ampm}
              </span>
            </div>
          </div>

          {/* Live pill */}
          {isActive && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isDone ? "var(--green-dim)" : "rgba(255, 255, 255, 0.18)",
              border: isDone ? "1px solid var(--green-border)" : "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 99, padding: "5px 11px",
              transition: "all 0.3s ease",
            }}>
              <span className="pulse" style={{
                width: 6, height: 6,
                background: isDone ? "var(--green)" : "#ffffff", borderRadius: 99, display: "block",
              }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: isDone ? "var(--green)" : "#ffffff",
                letterSpacing: "0.1em", fontFamily: "var(--font-display)",
              }}>
                {isDone ? "DONE" : "LIVE"}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        {isActive ? (
          <div>
            {/* Block info */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 22,
                fontWeight: 700, marginBottom: 5, color: textPrimary,
                transition: "all 0.3s ease",
              }}>
                {activeBlock.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: textSecondary, transition: "color 0.3s ease" }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    background: isActive && !isDone ? "rgba(255, 255, 255, 0.18)" : "var(--surface-2)",
                    border: isActive && !isDone ? "none" : "1px solid var(--border)",
                    borderRadius: 99, padding: "2px 9px", fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  {formatCountdown(minsLeft)} left
                </span>
                <span>{activeBlock.sub}</span>
                {activeBlock.type !== "reminder" && (
                  <span style={{ color: isActive && !isDone ? "#ffffff" : "var(--accent)", fontWeight: 700 }}>tap to open →</span>
                )}
              </div>
            </div>

            {/* Block progress bar */}
            <div style={{
              height: 4, background: isActive && !isDone ? "rgba(255, 255, 255, 0.25)" : "var(--surface-3)", borderRadius: 99,
              marginBottom: 14, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: isActive && !isDone ? "#ffffff" : "var(--accent-grad)",
                width: `${progressPct}%`,
                transition: "width 0.6s ease",
              }} />
            </div>

            {/* Mark complete button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDone(activeBlock.id); }}
              style={{
                width: "100%",
                background: isDone ? "var(--green-dim)" : "rgba(255, 255, 255, 0.22)",
                color: isDone ? "var(--green)" : "#ffffff",
                border: isDone ? "1px solid var(--green-border)" : "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 0",
                fontWeight: 700, fontSize: 13,
                letterSpacing: "0.04em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all 0.2s ease",
                boxShadow: "none",
                fontFamily: "var(--font-display)",
              }}
              onMouseEnter={(e) => {
                if (!isDone) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDone) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isDone ? <><Check size={14} color="var(--green)" /> Completed</> : "Mark complete"}
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
          borderTop: `1px solid ${borderTopColor}`,
        }}>
          <p style={{ fontSize: 11, color: textMuted, fontStyle: "italic", lineHeight: 1.6, transition: "color 0.3s ease" }}>
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
}
