import React, { useState, useMemo, useEffect, useCallback } from "react";
import { DEFAULTS } from "./constants";
import { readStateFromURL, buildShareURL, syncURLToState, fmt, fmtPct } from "./utils";
import { runProjection, summarizeProjection } from "./utils/projection";
import Sidebar from "./components/Sidebar";
import { TabButton, Card, Toast } from "./components/ui";
import YearPlanTab from "./components/tabs/YearPlanTab";
import RothTab from "./components/tabs/RothTab";
import StateTab from "./components/tabs/StateTab";
import SSTab from "./components/tabs/SSTab";

export default function App() {
  // ─── State from URL (or defaults) ────────────────────────────────
  const initialState = useMemo(() => readStateFromURL(), []);
  const [inputs, setInputs] = useState(initialState);
  const [tab, setTab] = useState("yearplan");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 840);
  const [toast, setToast] = useState(null);

  // Sync URL on every input change
  useEffect(() => {
    syncURLToState(inputs);
  }, [inputs]);

  // ─── Core calculations ────────────────────────────────────────────
  const projection = useMemo(() => runProjection(inputs), [inputs]);
  const summary = useMemo(() => summarizeProjection(projection, inputs), [projection, inputs]);

  // ─── Actions ──────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = buildShareURL(inputs);
    navigator.clipboard.writeText(url).then(
      () => {
        setToast("Link copied! Share it to load this exact scenario.");
        setTimeout(() => setToast(null), 2500);
      },
      () => {
        prompt("Copy this URL to share your scenario:", url);
      },
    );
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULTS });
  }, []);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Toast message={toast} />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          padding: "14px 20px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
            }}
          >
            🏛️
          </div>
          <div>
            <h1 className="header-title" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Federal Retirement Tax Planner
            </h1>
            <p className="header-sub" style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
              FERS · TSP · Social Security · Home Sale · State Taxes
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} className="no-print">
          <button
            onClick={handleShare}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            📋 Share This Scenario
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Reset Defaults
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {sidebarOpen ? "◀ Hide" : "▶ Inputs"}
          </button>
        </div>
      </div>

      <div className="app-layout" style={{ display: "flex" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className="sidebar no-print"
            style={{
              width: 275,
              minWidth: 255,
              background: "#fff",
              borderRight: "1px solid #e2e8f0",
              padding: "16px 14px",
              overflowY: "auto",
              height: "calc(100vh - 66px)",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <Sidebar state={inputs} onChange={setInputs} />
          </div>
        )}

        {/* Main content */}
        <div
          className="main-content"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "16px 20px",
            overflowY: "auto",
            height: "calc(100vh - 66px)",
          }}
        >
          {/* Summary cards */}
          <div className="summary-cards" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <Card
              title="Lifetime Fed Tax"
              value={fmt(summary.totalFederalTax)}
              subtitle={`Ages ${inputs.retireAge}–92`}
            />
            <Card
              title="Lifetime State Tax"
              value={fmt(summary.totalStateTax)}
              subtitle={inputs.selectedState}
              color="#059669"
            />
            <Card title="Avg Effective Rate" value={fmtPct(summary.avgEffectiveRate)} color="#7c3aed" />
            <Card
              title="Total Roth Conversions"
              value={fmt(summary.totalConversions)}
              subtitle={
                inputs.conversionStrategy === "none"
                  ? "None"
                  : `Fill ${inputs.conversionStrategy === "fill12" ? "12%" : "22%"}`
              }
              color="#d97706"
            />
          </div>

          {/* Tabs */}
          <div
            className="tab-bar no-print"
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 16,
              background: "#f1f5f9",
              padding: 4,
              borderRadius: 10,
              overflowX: "auto",
            }}
          >
            <TabButton active={tab === "yearplan"} onClick={() => setTab("yearplan")} icon="📅">
              Year-by-Year
            </TabButton>
            <TabButton active={tab === "roth"} onClick={() => setTab("roth")} icon="🔄">
              Roth Optimizer
            </TabButton>
            <TabButton active={tab === "states"} onClick={() => setTab("states")} icon="🗺️">
              State Compare
            </TabButton>
            <TabButton active={tab === "ss"} onClick={() => setTab("ss")} icon="🏦">
              SS Timing
            </TabButton>
          </div>

          {/* Active tab */}
          {tab === "yearplan" && <YearPlanTab projection={projection} ssClaimAge={inputs.ssClaimAge} />}
          {tab === "roth" && (
            <RothTab
              projection={projection}
              summary={summary}
              retireAge={inputs.retireAge}
              ssClaimAge={inputs.ssClaimAge}
              conversionStrategy={inputs.conversionStrategy}
            />
          )}
          {tab === "states" && <StateTab state={inputs} projection={projection} />}
          {tab === "ss" && <SSTab ssPIA={inputs.ssPIA} ssClaimAge={inputs.ssClaimAge} />}

          {/* Disclaimer */}
          <div
            style={{
              marginTop: 20,
              padding: 12,
              background: "#f1f5f9",
              borderRadius: 10,
              fontSize: 10,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            <strong>Disclaimer:</strong> This tool provides estimates for educational planning purposes only — not
            financial, tax, or legal advice. Projections assume 5% annual TSP growth and 2025 tax brackets. State tax
            models are simplified. Consult a qualified financial planner or CPA for personalized advice.
          </div>
        </div>
      </div>
    </div>
  );
}
