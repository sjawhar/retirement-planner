import React from "react";
import { InputGroup, SliderInput } from "./ui";
import { STATE_NAMES } from "../constants";

const selectStyle = {
  width: "100%",
  padding: "7px 8px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  fontSize: 13,
  background: "#fff",
};

const SectionTitle = ({ children }) => (
  <div
    className="sidebar-section-title"
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: "#2563eb",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      margin: "14px 0 10px",
    }}
  >
    {children}
  </div>
);

export default function Sidebar({ state, onChange }) {
  const set = (field) => (value) => onChange({ ...state, [field]: value });

  return (
    <div className="sidebar-inner">
      <SectionTitle>Your Situation</SectionTitle>

      <InputGroup label="Filing Status">
        <select value={state.filing} onChange={(e) => set("filing")(e.target.value)} style={selectStyle}>
          <option value="mfj">Married Filing Jointly</option>
          <option value="single">Single</option>
        </select>
      </InputGroup>

      <InputGroup label="Your Current Age">
        <SliderInput value={state.currentAge} onChange={set("currentAge")} min={45} max={72} prefix="" suffix=" yrs" />
      </InputGroup>

      <InputGroup label="Retirement Age">
        <SliderInput
          value={state.retireAge}
          onChange={(v) => set("retireAge")(Math.max(v, state.currentAge))}
          min={50}
          max={72}
          prefix=""
          suffix=" yrs"
        />
      </InputGroup>

      {state.filing === "mfj" && (
        <InputGroup label="Spouse's Age">
          <SliderInput value={state.spouseAge} onChange={set("spouseAge")} min={40} max={78} prefix="" suffix=" yrs" />
        </InputGroup>
      )}

      <SectionTitle>Your Income</SectionTitle>

      <InputGroup label="Your Monthly Pension">
        <SliderInput value={state.monthlyPension} onChange={set("monthlyPension")} min={0} max={5000} step={50} />
      </InputGroup>

      <InputGroup label="Your TSP Traditional">
        <SliderInput value={state.tspTraditional} onChange={set("tspTraditional")} min={0} max={2500000} step={10000} />
      </InputGroup>

      <InputGroup label="Your TSP Roth">
        <SliderInput value={state.tspRoth} onChange={set("tspRoth")} min={0} max={750000} step={5000} />
      </InputGroup>

      {state.filing === "mfj" && (
        <>
          <SectionTitle>Spouse's Income</SectionTitle>

          <InputGroup label="Spouse's Monthly Pension">
            <SliderInput value={state.spousePension} onChange={set("spousePension")} min={0} max={5000} step={50} />
          </InputGroup>

          <InputGroup label="Spouse's TSP Traditional">
            <SliderInput
              value={state.spouseTspTraditional}
              onChange={set("spouseTspTraditional")}
              min={0}
              max={2500000}
              step={10000}
            />
          </InputGroup>

          <InputGroup label="Spouse's TSP Roth">
            <SliderInput value={state.spouseTspRoth} onChange={set("spouseTspRoth")} min={0} max={750000} step={5000} />
          </InputGroup>

          <InputGroup label="Spouse's SS Estimate (monthly PIA)">
            <SliderInput value={state.spouseSsPIA} onChange={set("spouseSsPIA")} min={0} max={4800} step={50} />
          </InputGroup>

          <InputGroup label="Spouse's SS Claim Age">
            <SliderInput
              value={state.spouseSsClaimAge}
              onChange={set("spouseSsClaimAge")}
              min={62}
              max={70}
              prefix=""
              suffix=" yrs"
            />
          </InputGroup>
        </>
      )}

      <InputGroup label="SS PIA (monthly)" hint="Benefit at full retirement age">
        <SliderInput value={state.ssPIA} onChange={set("ssPIA")} min={0} max={4800} step={50} />
      </InputGroup>

      <InputGroup label="SS Claim Age">
        <SliderInput value={state.ssClaimAge} onChange={set("ssClaimAge")} min={62} max={70} prefix="" suffix=" yrs" />
      </InputGroup>

      <InputGroup label="Other US-Reported Income" hint="Any rental, investment, or other income reported on US taxes">
        <SliderInput value={state.investmentIncome} onChange={set("investmentIncome")} min={0} max={60000} step={500} />
      </InputGroup>

      <SectionTitle>Home Sale</SectionTitle>

      <InputGroup label="Home Value" hint="Estimated sale price">
        <SliderInput value={state.homeValue} onChange={set("homeValue")} min={0} max={1500000} step={10000} />
      </InputGroup>

      {state.homeValue > 0 && (
        <>
          <InputGroup label="Purchase Price / Cost Basis">
            <SliderInput
              value={state.homeCostBasis}
              onChange={set("homeCostBasis")}
              min={0}
              max={1000000}
              step={5000}
            />
          </InputGroup>

          <InputGroup label="Sell at Age">
            <SliderInput
              value={state.homeSaleAge}
              onChange={set("homeSaleAge")}
              min={state.currentAge}
              max={78}
              prefix=""
              suffix=" yrs"
            />
          </InputGroup>

          {/* Show calculated gain and exclusion */}
          {(() => {
            const gain = Math.max(0, state.homeValue - state.homeCostBasis);
            const exclusion = state.filing === "mfj" ? 500000 : 250000;
            const taxable = Math.max(0, gain - exclusion);
            const costs = state.homeValue * 0.06;
            const netProceeds = state.homeValue - costs;
            return (
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.7, marginBottom: 8, padding: "0 2px" }}>
                Gain: ${gain.toLocaleString()} · Exclusion: ${exclusion.toLocaleString()}
                <br />
                Taxable gain:{" "}
                <strong style={{ color: taxable > 0 ? "#dc2626" : "#16a34a" }}>${taxable.toLocaleString()}</strong>
                <br />
                Net proceeds (after ~6% costs): <strong>${netProceeds.toLocaleString()}</strong>
              </div>
            );
          })()}
        </>
      )}

      <SectionTitle>Peru Property</SectionTitle>

      <InputGroup label="Future Purchase Cost" hint="Cash purchase for primary Peru residence">
        <SliderInput
          value={state.peruPropertyCost}
          onChange={set("peruPropertyCost")}
          min={0}
          max={300000}
          step={5000}
        />
      </InputGroup>

      {state.peruPropertyCost > 0 && (
        <InputGroup label="Purchase at Age">
          <SliderInput
            value={state.peruPropertyAge}
            onChange={set("peruPropertyAge")}
            min={state.currentAge}
            max={70}
            prefix=""
            suffix=" yrs"
          />
        </InputGroup>
      )}

      <InputGroup label="Peru Rental Income (annual)" hint="Stays in Peru — not on US taxes. Shown for reference only.">
        <SliderInput
          value={state.peruRentalIncome}
          onChange={set("peruRentalIncome")}
          min={0}
          max={36000}
          step={500}
        />
      </InputGroup>

      <SectionTitle>Expenses & Insurance</SectionTitle>

      <InputGroup label="Monthly Spending" hint="US-side expenses (Peru covered by rental income)">
        <SliderInput
          value={state.monthlySpending}
          onChange={set("monthlySpending")}
          min={2000}
          max={15000}
          step={100}
        />
      </InputGroup>

      <SectionTitle>Travel</SectionTitle>

      <InputGroup label="Annual Travel Budget" hint="US, South America, international combined">
        <SliderInput
          value={state.annualTravelBudget}
          onChange={set("annualTravelBudget")}
          min={0}
          max={36000}
          step={500}
        />
      </InputGroup>

      <InputGroup label="Health Insurance">
        <select
          value={state.healthInsurance}
          onChange={(e) => set("healthInsurance")(e.target.value)}
          style={selectStyle}
        >
          <option value="fehb">FEHB (Federal Employee Health Benefits)</option>
          <option value="aca">ACA Marketplace</option>
          <option value="employer">Spouse's Employer Plan</option>
          <option value="none">No Coverage / Other</option>
        </select>
      </InputGroup>

      <InputGroup label="Monthly Insurance Cost" hint="Household total">
        <SliderInput
          value={state.healthInsuranceCost}
          onChange={set("healthInsuranceCost")}
          min={0}
          max={3000}
          step={50}
        />
      </InputGroup>

      <InputGroup label="Inflation Rate">
        <SliderInput
          value={state.inflationRate}
          onChange={set("inflationRate")}
          min={0}
          max={0.05}
          step={0.005}
          suffix="%"
          formatValue={(v) => (v * 100).toFixed(1)}
        />
      </InputGroup>

      <SectionTitle>Strategy</SectionTitle>

      <InputGroup label="I Want My Money to Last To" hint="The app calculates max spending to hit zero at this age">
        <SliderInput
          value={state.targetEndAge}
          onChange={set("targetEndAge")}
          min={75}
          max={100}
          prefix=""
          suffix=" yrs"
        />
      </InputGroup>

      <InputGroup label="Current State">
        <select value={state.selectedState} onChange={(e) => set("selectedState")(e.target.value)} style={selectStyle}>
          {STATE_NAMES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </InputGroup>

      <InputGroup label="Roth Strategy">
        <select
          value={state.conversionStrategy}
          onChange={(e) => set("conversionStrategy")(e.target.value)}
          style={selectStyle}
        >
          <option value="fill12">Fill 12% bracket</option>
          <option value="fill22">Fill 22% bracket</option>
          <option value="none">No conversions</option>
        </select>
      </InputGroup>
    </div>
  );
}
