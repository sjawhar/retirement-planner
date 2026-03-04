import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { STATE_TAX_PROFILES, DEFAULT_COMPARE_STATES } from "../../constants";
import { calcStateTax, fmt } from "../../utils";

export default function StateTab({ state, projection }) {
  const { selectedState } = state;

  const stateComparison = useMemo(() => {
    const states = [selectedState, ...DEFAULT_COMPARE_STATES.filter((s) => s !== selectedState)];

    return states.map((st) => {
      let total = 0;
      for (const year of projection) {
        total += calcStateTax(
          st, year.pension, year.ss, year.traditionalWithdrawal,
          year.investmentIncome + year.homeSale, year.age,
        );
      }
      const years = projection.length;
      return {
        state: st,
        avgAnnual: Math.round(total / years),
        total: Math.round(total),
        profile: STATE_TAX_PROFILES[st],
      };
    });
  }, [selectedState, projection]);

  return (
    <div>
      {/* Bar chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Lifetime State Tax: Ages {projection[0]?.age}–{projection[projection.length - 1]?.age}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stateComparison} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={105} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} />
            <Bar dataKey="total" name="Lifetime State Tax" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* State cards */}
      <div
        className="state-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}
      >
        {stateComparison.map((s, i) => (
          <div
            key={s.state}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 14,
              border: i === 0 ? "2px solid #2563eb" : "1px solid #e2e8f0",
              position: "relative",
            }}
          >
            {i === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -9,
                  left: 12,
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 8,
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                CURRENT
              </div>
            )}
            <h4 style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700 }}>{s.state}</h4>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>{s.profile?.label || ""}</div>
            <div style={{ fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: "#64748b" }}>Avg/Year: </span>
              <strong style={{ color: "#059669" }}>{fmt(s.avgAnnual)}</strong>
            </div>
            <div style={{ fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: "#64748b" }}>Lifetime: </span>
              <strong>{fmt(s.total)}</strong>
            </div>
            {i > 0 && (
              <div style={{ fontSize: 11 }}>
                <span style={{ color: "#64748b" }}>vs {stateComparison[0].state}: </span>
                <strong
                  style={{
                    color:
                      s.total < stateComparison[0].total
                        ? "#22c55e"
                        : s.total > stateComparison[0].total
                          ? "#dc2626"
                          : "#64748b",
                  }}
                >
                  {s.total < stateComparison[0].total
                    ? "Save " + fmt(stateComparison[0].total - s.total)
                    : s.total > stateComparison[0].total
                      ? "+ " + fmt(s.total - stateComparison[0].total)
                      : "Same"}
                </strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
