import React from "react";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "../ui";
import { fmt, fmtPct } from "../../utils";

export default function RothTab({ projection, summary, retireAge, ssClaimAge, conversionStrategy }) {
  const age73Data = projection.find((y) => y.age === 73) || {};

  return (
    <div>
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          padding: 13,
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {conversionStrategy === "none" ? (
          <span>No Roth conversions — change strategy in sidebar to see potential savings.</span>
        ) : (
          <span>
            <strong>Strategy:</strong> Converting traditional savings to Roth at low tax rates before Social Security
            and RMDs stack up.
            {summary.taxSavingsVsBaseline > 0 && (
              <span style={{ color: "#059669", fontWeight: 600 }}>
                {" "}
                This saves an estimated <strong>{fmt(summary.taxSavingsVsBaseline)}</strong> in lifetime taxes vs. no
                conversions.
              </span>
            )}
          </span>
        )}
      </div>

      {conversionStrategy !== "none" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              minWidth: 200,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div
              style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 8, textTransform: "uppercase" }}
            >
              Without Optimization
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Lifetime Tax: <strong>{fmt((summary.totalAllTax || 0) + (summary.taxSavingsVsBaseline || 0))}</strong>
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Savings Last To: <strong>{summary.depletionAge ? `Age ${summary.depletionAge}` : "92+"}</strong>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 200,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div
              style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 8, textTransform: "uppercase" }}
            >
              With Roth Conversions
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Lifetime Tax: <strong>{fmt(summary.totalAllTax || 0)}</strong>
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Savings Last To: <strong>{summary.depletionAge ? `Age ${summary.depletionAge}` : "92+"}</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <Card title="Total Converted" value={fmt(summary.totalConversions)} color="#7c3aed" />
        <Card
          title="Best Window"
          value={`Ages ${retireAge}–${ssClaimAge - 1}`}
          subtitle="Before SS starts"
          color="#d97706"
        />
        <Card title="Trad at 73" value={fmt(age73Data.tradBal || 0)} subtitle="Lower = smaller RMDs" color="#dc2626" />
        <Card title="Roth at 73" value={fmt(age73Data.rothBal || 0)} subtitle="Tax-free" color="#22c55e" />
      </div>

      {/* Conversions + marginal rate chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Conversions & Marginal Rate</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={projection.filter((y) => y.age <= 80)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="l" tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <YAxis
              yAxisId="r"
              orientation="right"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => (v * 100).toFixed(0) + "%"}
            />
            <Tooltip
              formatter={(v, n) => (n.includes("Rate") ? [fmtPct(v), n] : [fmt(v), n])}
              labelFormatter={(l) => "Age " + l}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="l" dataKey="rothConversion" name="Roth Conversion" fill="#7c3aed" />
            <Bar yAxisId="l" dataKey="rmd" name="RMD" fill="#ef4444" />
            <Line
              yAxisId="r"
              type="stepAfter"
              dataKey="marginalRate"
              name="Marginal Rate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>Conversion Detail</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                {["Age", "Base Taxable", "Room", "Converted", "Rate", "Tax Cost", "Cumulative"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "6px 4px", textAlign: "right", fontWeight: 600, color: "#64748b", fontSize: 8 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projection
                .filter((y) => y.rothConversion > 0 || y.age <= ssClaimAge + 2)
                .slice(0, 25)
                .map((y, i) => {
                  const cumulative = projection.filter((p) => p.age <= y.age).reduce((s, p) => s + p.rothConversion, 0);
                  return (
                    <tr
                      key={y.age}
                      style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                    >
                      <td style={{ padding: "4px", fontWeight: 700, textAlign: "center" }}>{y.age}</td>
                      <td style={{ padding: "4px", textAlign: "right" }}>{fmt(y.taxableIncome - y.rothConversion)}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#64748b" }}>{fmt(y.conversionRoom)}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#7c3aed", fontWeight: 600 }}>
                        {fmt(y.rothConversion)}
                      </td>
                      <td style={{ padding: "4px", textAlign: "right" }}>{fmtPct(y.marginalRate)}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#dc2626" }}>
                        {fmt(y.conversionTaxCost)}
                      </td>
                      <td style={{ padding: "4px", textAlign: "right", fontWeight: 600 }}>{fmt(cumulative)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
