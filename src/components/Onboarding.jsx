// src/components/Onboarding.jsx
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";

export default function Onboarding({ onStart }) {
  const [name, setName] = useState("");

  function handleStart() {
    onStart(name.trim() || "there");
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Decorative background orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,120,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="fadeUp" style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* Logo badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-border)",
          borderRadius: 99, padding: "5px 14px", marginBottom: 36,
        }}>
          <Zap size={12} fill="var(--accent)" color="var(--accent)" />
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: "var(--accent)", letterSpacing: "0.1em",
            fontFamily: "var(--font-display)",
          }}>
            FOCUS CONTROL
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(36px, 9vw, 54px)",
          fontWeight: 700,
          lineHeight: 1.08,
          marginBottom: 20,
          letterSpacing: "-0.03em",
        }}>
          Stop deciding.{" "}
          <span style={{
            background: "var(--accent-grad)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Start doing.
          </span>
        </h1>

        <p style={{
          color: "var(--text-2)",
          fontSize: 15,
          lineHeight: 1.75,
          marginBottom: 40,
          maxWidth: 340,
        }}>
          Tell it your plan in plain words. It builds your schedule, generates interview questions,
          and surfaces job leads — you just follow it.
        </p>

        {/* Input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{
            fontSize: 11, fontWeight: 600, color: "var(--text-3)",
            letterSpacing: "0.1em", display: "block", marginBottom: 10,
            fontFamily: "var(--font-display)",
          }}>
            WHAT SHOULD I CALL YOU?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Your name"
            autoFocus
            style={{ fontSize: 15, padding: "13px 16px" }}
          />
        </div>

        {/* CTA button */}
        <button
          onClick={handleStart}
          style={{
            width: "100%",
            background: "var(--accent-grad)",
            color: "#fff",
            borderRadius: "var(--radius)",
            padding: "14px 0",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.04em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 8px 24px rgba(124,120,255,0.3)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            fontFamily: "var(--font-display)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,120,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,120,255,0.3)";
          }}
        >
          Get started <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
