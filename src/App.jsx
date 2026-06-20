// src/App.jsx
import { useState } from "react";
import { Flame, Sparkles, Pencil, RotateCcw, Bell } from "lucide-react";
import { useSchedule } from "./hooks/useSchedule.js";
import { useDetail } from "./hooks/useDetail.js";
import Onboarding from "./components/Onboarding.jsx";
import HeroCard from "./components/HeroCard.jsx";
import BlockList from "./components/BlockList.jsx";
import DetailModal from "./components/DetailModal.jsx";
import PlanModal from "./components/PlanModal.jsx";
import EditModal from "./components/EditModal.jsx";

export default function App() {
  const schedule = useSchedule();
  const detail   = useDetail();
  const [showPlan, setShowPlan] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!schedule.ready) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 22, height: 22,
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: 99,
        }} className="spin" />
      </div>
    );
  }

  if (!schedule.profile) {
    return <Onboarding onStart={(name) => schedule.saveProfile({ name })} />;
  }

  const today          = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const completedCount = schedule.done.length;
  const totalCount     = schedule.blocks.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const hasStreak      = schedule.streak.count > 0;

  async function handleApplyPlan(text) {
    await schedule.applyPlanText(text);
    setShowPlan(false);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 18px 72px", minHeight: "100dvh" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 10, color: "var(--text-3)", fontWeight: 700,
            letterSpacing: "0.12em", marginBottom: 6,
            fontFamily: "var(--font-display)",
          }}>
            {today.toUpperCase()}
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 28, fontWeight: 700,
            letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>
            Hey, {schedule.profile.name}
          </h1>
          {schedule.notificationPermission !== "granted" && (
            <button
              onClick={schedule.requestNotificationPermission}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 8,
                fontSize: 11,
                color: "var(--accent)",
                fontWeight: 600,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
                borderRadius: 99,
                padding: "4px 10px",
                fontFamily: "var(--font-display)",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Bell size={11} className="pulse" /> Enable Alerts
            </button>
          )}
        </div>

        {/* Streak badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: hasStreak ? "var(--amber-dim)" : "var(--surface)",
            border: `1px solid ${hasStreak ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
            borderRadius: 99, padding: "5px 12px",
            transition: "all 0.2s",
          }}>
            <Flame
              size={13}
              color={hasStreak ? "var(--amber)" : "var(--text-3)"}
              fill={hasStreak ? "var(--amber)" : "none"}
            />
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: hasStreak ? "var(--amber)" : "var(--text-2)",
            }}>
              {schedule.streak.count}
            </span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>
            {completedCount}/{totalCount} done
          </div>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div style={{
          height: 3, background: "var(--surface-2)",
          borderRadius: 99, marginBottom: 22, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: progressPct === 100
              ? "linear-gradient(to right, var(--green), #34d399)"
              : "var(--accent-grad)",
            width: `${progressPct}%`,
            transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }} />
        </div>
      )}

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <HeroCard
        activeBlock={schedule.activeBlock}
        nextBlock={schedule.nextBlock}
        done={schedule.done}
        onToggleDone={schedule.toggleDone}
        onOpenDetail={detail.open}
        quote={schedule.quote}
      />

      {/* ── Schedule header ────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-3)",
          letterSpacing: "0.12em",
          fontFamily: "var(--font-display)",
        }}>
          TODAY'S SCHEDULE
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setShowPlan(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 99,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)", fontSize: 11, fontWeight: 600,
              transition: "opacity 0.15s",
              fontFamily: "var(--font-display)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Sparkles size={11} />
            {schedule.planText ? "Edit plan" : "Set plan"}
          </button>

          <button
            onClick={() => setShowEdit(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 99,
              background: "var(--surface)", border: "1px solid var(--border)",
              color: "var(--text-2)", fontSize: 11, fontWeight: 600,
              transition: "opacity 0.15s",
              fontFamily: "var(--font-display)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Pencil size={11} /> Times
          </button>
        </div>
      </div>

      {/* ── Block list ─────────────────────────────────────────────────── */}
      {schedule.blocks.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No schedule yet</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.8 }}>
            Tap <strong style={{ color: "var(--accent)" }}>Set plan</strong> and describe your day in plain words.
          </div>
        </div>
      ) : (
        <BlockList
          blocks={schedule.blocks}
          done={schedule.done}
          onToggleDone={schedule.toggleDone}
          onOpen={detail.open}
        />
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <button
          onClick={schedule.resetAll}
          style={{
            color: "var(--text-3)", fontSize: 11,
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 99,
            border: "1px solid transparent",
            transition: "all 0.15s",
            fontFamily: "var(--font-display)",
            fontWeight: 600, letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <RotateCcw size={11} /> Reset everything
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showPlan && (
        <PlanModal
          defaultText={schedule.planText}
          onCancel={() => setShowPlan(false)}
          onApply={handleApplyPlan}
        />
      )}

      {showEdit && (
        <EditModal
          blocks={schedule.blocks}
          onCancel={() => setShowEdit(false)}
          onSave={(b) => { schedule.saveBlocks(b); setShowEdit(false); }}
        />
      )}

      {detail.block && (
        <DetailModal
          block={detail.block}
          content={detail.content}
          loading={detail.loading}
          error={detail.error}
          isDone={schedule.done.includes(detail.block.id)}
          onClose={detail.close}
          onRegenerate={detail.regenerate}
          onToggleDone={schedule.toggleDone}
        />
      )}
    </div>
  );
}
