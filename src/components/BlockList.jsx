// src/components/BlockList.jsx
import { BookOpen, Briefcase, Sunrise, Target, Check } from "lucide-react";
import { formatTime, blockStatus, nowMins } from "../lib/time.js";

const ICONS = { sunrise: Sunrise, book: BookOpen, briefcase: Briefcase, target: Target };

const ICON_COLORS = {
  active: { bg: "rgba(124,120,255,0.12)", color: "var(--accent)" },
  done:   { bg: "rgba(16,185,129,0.1)",   color: "var(--green)"  },
  future: { bg: "var(--surface-3)",        color: "var(--text-3)" },
  past:   { bg: "var(--surface-2)",        color: "var(--text-3)" },
};

function BlockRow({ block, isDone, onToggleDone, onOpen, current }) {
  const status  = isDone ? "done" : blockStatus(block, current);
  const Icon    = ICONS[block.icon] || Target;
  const isActive = status === "active";
  const isPast   = status === "past" && !isDone;
  const iconStyle = ICON_COLORS[isDone ? "done" : status] || ICON_COLORS.future;

  return (
    <div
      onClick={() => onOpen(block)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 14px",
        borderRadius: "var(--radius)",
        background: isActive ? "linear-gradient(to right, rgba(124,120,255,0.05), transparent)" : "var(--surface)",
        border: `1px solid ${isActive ? "var(--accent-border)" : isDone ? "var(--green-border)" : "var(--border-subtle)"}`,
        opacity: isPast ? 0.5 : 1,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.15s, background 0.15s, opacity 0.15s, transform 0.1s",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.transform = "translateX(2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
    >
      {/* Left border accent */}
      <div style={{
        position: "absolute", left: 0, top: "16%", bottom: "16%", width: 2.5,
        borderRadius: 99,
        background: isActive
          ? "var(--accent-grad)"
          : isDone ? "var(--green)" : "transparent",
        transition: "background 0.2s",
      }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: "var(--radius-sm)",
        background: iconStyle.bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${isDone ? "var(--green-border)" : isActive ? "var(--accent-border)" : "transparent"}`,
        transition: "background 0.2s",
      }}>
        <Icon size={16} color={iconStyle.color} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: isDone ? "var(--green)" : isActive ? "var(--text)" : "var(--text)",
          marginBottom: 3,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          textDecoration: isDone ? "line-through" : "none",
          textDecorationColor: "var(--green-border)",
        }}>
          {block.label}
        </div>
        <div style={{
          fontSize: 11, color: "var(--text-3)", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {formatTime(block.start)}–{formatTime(block.end)}
          {isActive && (
            <span style={{
              fontSize: 10, color: "var(--accent)", fontWeight: 700,
              letterSpacing: "0.05em",
              fontFamily: "var(--font-display)",
            }}>
              NOW
            </span>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleDone(block.id); }}
        style={{
          width: 26, height: 26, borderRadius: 99, flexShrink: 0,
          background: isDone ? "var(--green)" : "transparent",
          border: `1.5px solid ${isDone ? "var(--green)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s ease",
          boxShadow: isDone ? "0 0 8px rgba(16,185,129,0.3)" : "none",
        }}
        onMouseEnter={(e) => !isDone && (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => !isDone && (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {isDone && <Check size={13} color="white" strokeWidth={2.8} />}
      </button>
    </div>
  );
}

export default function BlockList({ blocks, done, onToggleDone, onOpen }) {
  const current = nowMins();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {blocks.map((b) => (
        <BlockRow
          key={b.id}
          block={b}
          isDone={done.includes(b.id)}
          onToggleDone={onToggleDone}
          onOpen={onOpen}
          current={current}
        />
      ))}
    </div>
  );
}
