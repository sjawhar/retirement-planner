import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fmt, fmtPct } from "../../utils";

export default function YearPlanTab({ projection, ssClaimAge }) {
  return (
    <div>
      {/* Tax burden chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Tax Burden Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="federalTax" name="Federal" fill="#2563eb" stackId="a" />
            <Bar dataKey="stateTax" name="State" fill="#059669" stackId="a" />
            <Bar dataKey="irmaa" name="IRMAA" fill="#dc2626" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Account balances chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Account Balances</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="tradBal" name="Traditional" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rothBal" name="Roth" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "auto" }}>
        <table style={{ width: "100%", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              {[
                "Age",
                "Pension",
                "SS",
                "RMD",
                "Roth Conv",
                "Roth Draw",
                "Home",
                "AGI",
                "Fed Tax",
                "St Tax",
                "IRMAA",
                "Eff%",
                "Trad$",
                "Roth$",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 4px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    fontSize: 8,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projection.map((y, i) => (
              <tr
                key={y.age}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background:
                    y.age === ssClaimAge ? "#eff6ff" : y.age === 73 ? "#fef3c7" : i % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <td style={{ padding: "4px", fontWeight: 700, textAlign: "center" }}>{y.age}</td>
                <td style={{ padding: "4px", textAlign: "right" }}>{fmt(y.pension)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: y.ss > 0 ? "#059669" : "#d1d5db" }}>
                  {fmt(y.ss)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.rmd > 0 ? "#dc2626" : "#d1d5db" }}>
                  {fmt(y.rmd)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.rothConversion > 0 ? "#7c3aed" : "#d1d5db" }}>
                  {fmt(y.rothConversion)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.rothWithdrawal > 0 ? "#22c55e" : "#d1d5db" }}>
                  {fmt(y.rothWithdrawal)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.homeSale > 0 ? "#d97706" : "#d1d5db" }}>
                  {fmt(y.homeSale)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", fontWeight: 600 }}>{fmt(y.agi)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: "#2563eb" }}>{fmt(y.federalTax)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: "#059669" }}>{fmt(y.stateTax)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: y.irmaa > 0 ? "#dc2626" : "#d1d5db" }}>
                  {fmt(y.irmaa)}
                </td>
                <td style={{ padding: "4px", textAlign: "right" }}>{fmtPct(y.effectiveRate)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: "#475569" }}>{fmt(y.tradBal)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: "#16a34a" }}>{fmt(y.rothBal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
