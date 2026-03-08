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
import { fmt } from "../../utils";

export default function YearPlanTab({ projection, ssClaimAge }) {
  const firstYear = projection[0];
  const monthlyPension = firstYear ? Math.round(firstYear.annualPension / 12) : 0;

  return (
    <div>
      {/* Plain-language explainer */}
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 12,
          padding: 13,
          marginBottom: 16,
          fontSize: 12,
          lineHeight: 1.7,
          color: "#334155",
        }}
      >
        <strong>How to read this:</strong> All dollar amounts below are <strong>per year</strong>. Your combined federal
        pensions are <strong>${monthlyPension.toLocaleString()}/month</strong> ($
        {firstYear?.annualPension?.toLocaleString()}/year). The colored areas in the chart show where your money comes
        from each year. The red dashed line is what you need to cover expenses. When the colored area is below the red
        line, you're drawing from savings.
      </div>

      {/* Income vs Expenses chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Where Your Money Comes From Each Year</h3>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12 }}>
          Colored areas = income sources · Red dashed line = what you spend
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 10 }}
              label={{ value: "Your Age", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k/yr"} />
            <Tooltip formatter={(v, n) => [fmt(v) + "/yr", n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine
              x={ssClaimAge}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{ value: "Social Security starts", position: "insideTopLeft", fill: "#3b82f6", fontSize: 9 }}
            />
            <ReferenceLine
              x={65}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: "Medicare starts", position: "insideTopLeft", fill: "#10b981", fontSize: 9 }}
            />
            <ReferenceLine
              x={73}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: "Required withdrawals", position: "insideTopLeft", fill: "#f59e0b", fontSize: 9 }}
            />
            <Area
              type="monotone"
              dataKey="annualPension"
              name="Federal Pensions"
              stackId="a"
              fill="#3b82f6"
              stroke="#2563eb"
            />
            <Area
              type="monotone"
              dataKey="totalSS"
              name="Social Security"
              stackId="a"
              fill="#10b981"
              stroke="#059669"
            />
            <Area
              type="monotone"
              dataKey="rmd"
              name="TSP Required Withdrawal"
              stackId="a"
              fill="#f59e0b"
              stroke="#d97706"
            />
            <Area
              type="monotone"
              dataKey="cashEarnings"
              name="Cash Interest/Earnings"
              stackId="a"
              fill="#a3e635"
              stroke="#84cc16"
            />
            <Area
              type="monotone"
              dataKey="rothWithdrawal"
              name="From Tax-Free Savings"
              stackId="a"
              fill="#8b5cf6"
              stroke="#7c3aed"
            />
            <Area
              type="monotone"
              dataKey="cashWithdrawal"
              name="From Home Sale Savings"
              stackId="a"
              fill="#06b6d4"
              stroke="#0891b2"
            />
            <Line
              type="monotone"
              dataKey="totalExpenses"
              name="What You Spend"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account balances chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>How Much You Have Left</h3>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12 }}>
          TSP = your current TSP accounts · TSP Roth = money moved to Roth · Cash = home sale proceeds
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={projection.map((y) => ({ ...y, totalNetWorth: y.tradBal + y.rothBal + y.cashBal }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 10 }}
              label={{ value: "Your Age", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {projection.find((y) => y.savingsDepleted) && (
              <ReferenceLine
                x={projection.find((y) => y.savingsDepleted).age}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: "Money runs out", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="totalNetWorth"
              name="Everything Combined"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line type="monotone" dataKey="tradBal" name="TSP" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="rothBal"
              name="TSP Roth"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line type="monotone" dataKey="cashBal" name="Cash Savings" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "auto" }}>
        <div style={{ padding: "10px 14px 0", fontSize: 10, color: "#94a3b8" }}>
          All amounts are <strong>per year</strong> except Net/Mo (which is monthly).
        </div>
        <table style={{ width: "100%", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              {[
                { label: "Age", title: "Your age that year" },
                { label: "Pensions", title: "Combined federal pensions (annual)" },
                { label: "Soc Sec", title: "Your Social Security (annual)" },
                { label: "Spouse SS", title: "Spouse Social Security (annual)" },
                { label: "TSP Req'd", title: "Required minimum withdrawal from TSP at age 73+" },
                { label: "Tax-Free", title: "Withdrawn from tax-free (Roth) savings" },
                { label: "Cash", title: "Withdrawn from cash savings (home sale proceeds)" },
                { label: "Earnings", title: "Interest/investment earnings on cash savings (available for travel, etc.)" },
                { label: "Peru Rent", title: "Peru rental income (stays in Peru, not on US taxes)" },
                { label: "Events", title: "One-time events with dollar amounts" },
                { label: "Income", title: "Adjusted Gross Income (what the IRS sees)" },
                { label: "Fed Tax", title: "Federal income tax paid" },
                { label: "State Tax", title: "State income tax paid" },
                { label: "Medicare+", title: "IRMAA: extra Medicare premium if income is high" },
                { label: "Health$", title: "Health insurance cost (annual)" },
                { label: "Net/Mo", title: "What's left each month after all taxes and expenses" },
                { label: "TSP Pre-Tax", title: "TSP Traditional balance (taxed when withdrawn)" },
                { label: "TSP Tax-Free", title: "TSP Roth balance (not taxed when withdrawn)" },
                { label: "Cash$", title: "Cash savings balance (from home sale)" },
              ].map((h) => (
                <th
                  key={h.label}
                  title={h.title}
                  style={{
                    padding: "6px 4px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#64748b",
                    whiteSpace: "nowrap",
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
            {projection.map((y, i) => {
              // Build event string for notable one-time events
              const events = [];
              if (y.homeSaleProceeds > 0) events.push(`Sell home +${fmt(y.homeSaleProceeds)}`);
              if (y.peruPurchase > 0) events.push(`Peru home -${fmt(y.peruPurchase)}`);
              const eventStr = events.join(" | ");

              return (
                <tr
                  key={y.age}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background:
                      y.age === ssClaimAge ? "#eff6ff" : y.age === 73 ? "#fef3c7" : i % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  <td style={{ padding: "4px", fontWeight: 700, textAlign: "center" }}>{y.age}</td>
                  <td style={{ padding: "4px", textAlign: "right" }}>{fmt(y.annualPension)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: y.totalSS > 0 ? "#059669" : "#d1d5db" }}>
                    {fmt(y.totalSS)}
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", color: y.spouseSS > 0 ? "#059669" : "#d1d5db" }}>
                    {fmt(y.spouseSS)}
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", color: y.rmd > 0 ? "#dc2626" : "#d1d5db" }}>
                    {fmt(y.rmd)}
                  </td>
                  <td
                    style={{ padding: "4px", textAlign: "right", color: y.rothWithdrawal > 0 ? "#22c55e" : "#d1d5db" }}
                  >
                    {fmt(y.rothWithdrawal)}
                  </td>
                  <td
                    style={{ padding: "4px", textAlign: "right", color: y.cashWithdrawal > 0 ? "#06b6d4" : "#d1d5db" }}
                  >
                    {fmt(y.cashWithdrawal)}
                  </td>
                  <td
                    style={{ padding: "4px", textAlign: "right", color: y.cashEarnings > 0 ? "#84cc16" : "#d1d5db" }}
                  >
                    {fmt(y.cashEarnings)}
                  </td>
                  <td
                    style={{ padding: "4px", textAlign: "right", color: y.peruRentalIncome > 0 ? "#f97316" : "#d1d5db" }}
                  >
                    {fmt(y.peruRentalIncome)}
                  </td>
                  <td
                    style={{ padding: "4px", textAlign: "left", color: "#d97706", fontSize: 8, whiteSpace: "nowrap" }}
                  >
                    {eventStr}
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", fontWeight: 600 }}>{fmt(y.agi)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: "#2563eb" }}>{fmt(y.federalTax)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: "#059669" }}>{fmt(y.stateTax)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: y.irmaa > 0 ? "#dc2626" : "#d1d5db" }}>
                    {fmt(y.irmaa)}
                  </td>
                  <td
                    style={{
                      padding: "4px",
                      textAlign: "right",
                      color: y.annualHealthCost > 0 ? "#dc2626" : "#d1d5db",
                    }}
                  >
                    {fmt(y.annualHealthCost)}
                  </td>
                  <td
                    style={{
                      padding: "4px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: y.netMonthlyIncome < 0 ? "#dc2626" : "#059669",
                    }}
                  >
                    {fmt(y.netMonthlyIncome)}
                  </td>
                  <td style={{ padding: "4px", textAlign: "right", color: "#475569" }}>{fmt(y.tradBal)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: "#16a34a" }}>{fmt(y.rothBal)}</td>
                  <td style={{ padding: "4px", textAlign: "right", color: "#0891b2" }}>{fmt(y.cashBal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
