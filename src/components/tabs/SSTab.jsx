import React, { useMemo } from "react";
import {
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
import { Card } from "../ui";
import { generateSSTimingData, fmt } from "../../utils";

const COLORS = ["#ef4444", "#f59e0b", "#2563eb", "#22c55e"];

export default function SSTab({ ssPIA, ssClaimAge, spouseSsPIA, spouseSsClaimAge }) {
  const ssTimingData = useMemo(() => generateSSTimingData(ssPIA), [ssPIA]);
  const spouseTimingData = useMemo(
    () => (spouseSsPIA > 0 ? generateSSTimingData(spouseSsPIA) : null),
    [spouseSsPIA]
  );

  return (
    <div>
      {/* Monthly benefit cards */}
      <div className="ss-cards" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {ssTimingData.map((s) => (
          <Card
            key={s.claimAge}
            title={`Claim at ${s.claimAge}`}
            value={`$${s.monthly.toLocaleString()}/mo`}
            subtitle={`${fmt(s.annual)}/yr · ${
              s.claimAge === 67 ? "100%" : Math.round((s.annual / (ssPIA * 12)) * 100) + "%"
            } of PIA`}
            color={s.claimAge === ssClaimAge ? "#2563eb" : "#64748b"}
          />
        ))}
      </div>

      {spouseSsPIA > 0 && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>Combined Household SS</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ssTimingData.map((primary) => {
              const spouseAtSameAge = spouseTimingData?.find(s => s.claimAge === spouseSsClaimAge);
              const combined = primary.monthly + (spouseAtSameAge?.monthly || 0);
              return (
                <div key={primary.claimAge} style={{ flex: 1, minWidth: 120, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#64748b" }}>You claim at {primary.claimAge}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>${combined.toLocaleString()}/mo</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>combined</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
            Spouse claims at {spouseSsClaimAge} · ${spouseTimingData?.find(s => s.claimAge === spouseSsClaimAge)?.monthly?.toLocaleString() || 0}/mo
          </div>
        </div>
      )}

      {/* Cumulative benefit chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Cumulative Benefits by Claiming Age</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="age"
              type="number"
              domain={[62, 92]}
              tick={{ fontSize: 10 }}
              allowDuplicatedCategory={false}
            />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip formatter={(v) => [fmt(v)]} labelFormatter={(l) => "Age " + l} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {ssTimingData.map((s, i) => (
              <Line
                key={s.claimAge}
                data={s.cumulativeByAge}
                dataKey="cumulative"
                name={`Claim ${s.claimAge}`}
                stroke={COLORS[i]}
                strokeWidth={s.claimAge === ssClaimAge ? 3 : 1.5}
                dot={false}
                type="monotone"
              />
            ))}
            <ReferenceLine
              x={80}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "Age 80", position: "top", fontSize: 10 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Break-even analysis */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>Break-Even Analysis</h3>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
          {ssTimingData.map((s, i) => {
            if (i === 0) return null;
            const prev = ssTimingData[i - 1];
            const breakEvenIdx = prev.cumulativeByAge.findIndex(
              (_, idx) =>
                s.cumulativeByAge[idx]?.cumulative >= prev.cumulativeByAge[idx]?.cumulative &&
                s.cumulativeByAge[idx]?.cumulative > 0 &&
                prev.cumulativeByAge[idx]?.cumulative > 0,
            );
            const breakAge = breakEvenIdx >= 0 ? 62 + breakEvenIdx : null;
            return (
              <div key={s.claimAge} style={{ marginBottom: 4 }}>
                <strong>
                  Claim {s.claimAge} vs {prev.claimAge}:
                </strong>{" "}
                {breakAge
                  ? `Break-even at age ${breakAge}. Living past ${breakAge} means ${s.claimAge} pays more.`
                  : "Later claiming catches up at very advanced ages."}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax impact note */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 12,
          padding: 13,
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <strong>Tax Impact:</strong> Delaying SS extends your low-income Roth conversion window. Each year of delay =
        another year converting TSP at 10–12% instead of 22–24% once SS stacks on pension and RMDs. For federal retirees
        with pension bridge income, the conversion savings often exceed the SS benefit difference.
      </div>
    </div>
  );
}
