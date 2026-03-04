import React from "react";

export function InputGroup({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 600,
          color: "#4a5568",
          marginBottom: 3,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1, fontStyle: "italic" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function SliderInput({ value, onChange, min, max, step = 1, prefix = "$", suffix = "" }) {
  return (
    <div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#1e293b",
          marginBottom: 3,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8" }}>
        <span>
          {prefix}
          {min.toLocaleString()}
          {suffix}
        </span>
        <span>
          {prefix}
          {max.toLocaleString()}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function TabButton({ active, onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 13px",
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        background: active ? "#1e293b" : "transparent",
        color: active ? "#fff" : "#64748b",
        borderRadius: 8,
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: 5,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {children}
    </button>
  );
}

export function Card({ title, value, subtitle, color = "#2563eb" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "13px 16px",
        border: "1px solid #e2e8f0",
        minWidth: 120,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "#64748b",
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 800,
          color,
          marginTop: 3,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{subtitle}</div>
      )}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}
