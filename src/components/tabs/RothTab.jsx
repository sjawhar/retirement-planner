import React from "react";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "../ui";
import { fmt, fmtPct } from "../../utils";

export default function RothTab({ projection, summary, retireAge, ssClaimAge, conversionStrategy }) {
  const age73Data = projection.find((y) => y.age === 73) || {};

  return (
    <div>
      {/* Plain-language explanation */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          padding: 13,
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {conversionStrategy === "none" ? (
          <span>
            <strong>No tax strategy selected.</strong> Change "Roth Strategy" in the sidebar to see how moving money
            from your pre-tax TSP to a tax-free TSP (Roth) could save you money.
          </span>
        ) : (
          <span>
            <strong>What this does:</strong> Between ages {retireAge} and {ssClaimAge - 1}, before Social Security
            starts, your income is low. The app moves money from your pre-tax TSP into a tax-free (Roth) account each
            year — just enough to stay in a low tax bracket ({conversionStrategy === "fill12" ? "12%" : "22%"}). You pay
            a small tax now, but avoid paying a much bigger tax later when required withdrawals at age 73 stack on top
            of Social Security and pensions.
            {summary.taxSavingsVsBaseline > 0 && (
              <span style={{ color: "#059669", fontWeight: 600 }}>
                {" "}
                This saves an estimated <strong>{fmt(summary.taxSavingsVsBaseline)}</strong> in lifetime taxes.
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
              If You Do Nothing
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Lifetime Tax: <strong>{fmt((summary.totalAllTax || 0) + (summary.taxSavingsVsBaseline || 0))}</strong>
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Money Lasts To:{" "}
              <strong>{summary.baselineDepletionAge ? `Age ${summary.baselineDepletionAge}` : "92+"}</strong>
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
              With This Strategy
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Lifetime Tax: <strong>{fmt(summary.totalAllTax || 0)}</strong>
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Money Lasts To: <strong>{summary.depletionAge ? `Age ${summary.depletionAge}` : "92+"}</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <Card title="Total Moved to Tax-Free" value={fmt(summary.totalConversions)} color="#7c3aed" />
        <Card
          title="Best Window"
          value={`Ages ${retireAge}–${ssClaimAge - 1}`}
          subtitle="Before Social Security starts"
          color="#d97706"
        />
        <Card
          title="TSP Pre-Tax at 73"
          value={fmt(age73Data.tradBal || 0)}
          subtitle="Lower = less forced withdrawal"
          color="#dc2626"
        />
        <Card
          title="TSP Tax-Free at 73"
          value={fmt(age73Data.rothBal || 0)}
          subtitle="Never taxed again"
          color="#22c55e"
        />
      </div>

      {/* Conversions + tax rate chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>How Much Gets Moved Each Year</h3>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12 }}>
          Purple bars = money moved from pre-tax → tax-free · Red bars = required withdrawals at 73+ · Yellow line =
          your tax rate
        </div>
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
            <Bar yAxisId="l" dataKey="rothConversion" name="Moved to Tax-Free" fill="#7c3aed" />
            <Bar yAxisId="l" dataKey="rmd" name="Required Withdrawal (73+)" fill="#ef4444" />
            <Line
              yAxisId="r"
              type="stepAfter"
              dataKey="marginalRate"
              name="Your Tax Rate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Year-by-Year Breakdown</h3>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10 }}>
          "Room" = how much you could move before hitting the next tax bracket
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                {[
                  { label: "Age", title: "Your age" },
                  { label: "Already Taxable", title: "Income already taxed before any conversion" },
                  { label: "Room", title: "How much you can convert before hitting the next bracket" },
                  { label: "Moved", title: "Amount moved from pre-tax to tax-free" },
                  { label: "Tax Rate", title: "Tax bracket you're in" },
                  { label: "Tax Cost", title: "Extra tax you pay this year for the conversion" },
                  { label: "Total Moved", title: "Running total of all conversions so far" },
                ].map((h) => (
                  <th
                    key={h.label}
                    title={h.title}
                    style={{
                      padding: "6px 4px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#64748b",
                      fontSize: 8,
                      cursor: "help",
                    }}
                  >
                    {h.label}
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
