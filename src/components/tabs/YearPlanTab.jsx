import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fmt, fmtPct } from "../../utils";

export default function YearPlanTab({ projection, ssClaimAge }) {
  return (
    <div>
      {/* Income vs Expenses chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine x={ssClaimAge} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: "SS", position: "insideTopLeft", fill: "#3b82f6", fontSize: 10 }} />
            <ReferenceLine x={65} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Medicare", position: "insideTopLeft", fill: "#10b981", fontSize: 10 }} />
            <ReferenceLine x={73} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "RMDs", position: "insideTopLeft", fill: "#f59e0b", fontSize: 10 }} />
            <Area type="monotone" dataKey="annualPension" name="Pension" stackId="a" fill="#3b82f6" stroke="#2563eb" />
            <Area type="monotone" dataKey="totalSS" name="Social Security" stackId="a" fill="#10b981" stroke="#059669" />
            <Area type="monotone" dataKey="rmd" name="RMD" stackId="a" fill="#f59e0b" stroke="#d97706" />
            <Area type="monotone" dataKey="rothWithdrawal" name="Roth Draw" stackId="a" fill="#8b5cf6" stroke="#7c3aed" />
            <Line type="monotone" dataKey="totalExpenses" name="Total Expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account balances chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Account Balances</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={projection.map(y => ({ ...y, totalNetWorth: y.tradBal + y.rothBal }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {projection.find(y => y.savingsDepleted) && (
              <ReferenceLine x={projection.find(y => y.savingsDepleted).age} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Savings depleted", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }} />
            )}
            <Line type="monotone" dataKey="totalNetWorth" name="Total Net Worth" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" dot={false} />
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
                "Spouse SS",
                "RMD",
                "Roth Draw",
                "Home",
                "AGI",
                "Fed Tax",
                "St Tax",
                "IRMAA",
                "Health Ins",
                "Net/Mo",
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
                <td style={{ padding: "4px", textAlign: "right" }}>{fmt(y.annualPension || y.pension)}</td>
                <td style={{ padding: "4px", textAlign: "right", color: (y.totalSS || y.ss) > 0 ? "#059669" : "#d1d5db" }}>
                  {fmt(y.totalSS || y.ss)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.spouseSS > 0 ? "#059669" : "#d1d5db" }}>
                  {fmt(y.spouseSS)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", color: y.rmd > 0 ? "#dc2626" : "#d1d5db" }}>
                  {fmt(y.rmd)}
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
                <td style={{ padding: "4px", textAlign: "right", color: y.annualHealthCost > 0 ? "#dc2626" : "#d1d5db" }}>
                  {fmt(y.annualHealthCost)}
                </td>
                <td style={{ padding: "4px", textAlign: "right", fontWeight: 600, color: y.netMonthlyIncome < 0 ? "#dc2626" : "#059669" }}>
                  {fmt(y.netMonthlyIncome)}
                </td>
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
