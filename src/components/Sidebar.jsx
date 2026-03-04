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

      <InputGroup label="TSP Traditional Balance">
        <SliderInput value={state.tspTraditional} onChange={set("tspTraditional")} min={0} max={2500000} step={10000} />
      </InputGroup>

      <InputGroup label="TSP Roth Balance">
        <SliderInput value={state.tspRoth} onChange={set("tspRoth")} min={0} max={750000} step={5000} />
      </InputGroup>

      {state.filing === "mfj" && (
        <>
          <SectionTitle>Spouse's Income</SectionTitle>

          <InputGroup label="Spouse's Monthly Pension">
            <SliderInput value={state.spousePension} onChange={set("spousePension")} min={0} max={5000} step={50} />
          </InputGroup>

          <InputGroup label="Spouse's SS Estimate (monthly PIA)">
            <SliderInput value={state.spouseSsPIA} onChange={set("spouseSsPIA")} min={0} max={4800} step={50} />
          </InputGroup>

          <InputGroup label="Spouse's SS Claim Age">
            <SliderInput value={state.spouseSsClaimAge} onChange={set("spouseSsClaimAge")} min={62} max={70} prefix="" suffix=" yrs" />
          </InputGroup>
        </>
      )}

      <InputGroup label="SS PIA (monthly)" hint="Benefit at full retirement age">
        <SliderInput value={state.ssPIA} onChange={set("ssPIA")} min={0} max={4800} step={50} />
      </InputGroup>

      <InputGroup label="SS Claim Age">
        <SliderInput value={state.ssClaimAge} onChange={set("ssClaimAge")} min={62} max={70} prefix="" suffix=" yrs" />
      </InputGroup>

      <InputGroup label="Annual Investment Income">
        <SliderInput
          value={state.investmentIncome}
          onChange={set("investmentIncome")}
          min={0}
          max={60000}
          step={1000}
        />
      </InputGroup>

      <InputGroup label="Home Sale Gain (above exclusion)" hint="Taxable portion above $250K/$500K">
        <SliderInput value={state.homeSaleGain} onChange={set("homeSaleGain")} min={0} max={500000} step={5000} />
      </InputGroup>

      {state.homeSaleGain > 0 && (
        <InputGroup label="Sale at Age">
          <SliderInput
            value={state.homeSaleYear}
            onChange={set("homeSaleYear")}
            min={state.retireAge}
            max={78}
            prefix=""
            suffix=" yrs"
          />
        </InputGroup>
      )}

      <SectionTitle>Expenses & Insurance</SectionTitle>

      <InputGroup label="Monthly Spending">
        <SliderInput
          value={state.monthlySpending}
          onChange={set("monthlySpending")}
          min={2000}
          max={15000}
          step={100}
        />
      </InputGroup>

      <InputGroup label="Health Insurance">
        <select value={state.healthInsurance} onChange={(e) => set("healthInsurance")(e.target.value)} style={selectStyle}>
          <option value="fehb">FEHB (Federal Employee Health Benefits)</option>
          <option value="aca">ACA Marketplace</option>
          <option value="employer">Spouse's Employer Plan</option>
          <option value="none">No Coverage / Other</option>
        </select>
      </InputGroup>

      <InputGroup label="Monthly Insurance Cost" hint="Household total">
        <SliderInput value={state.healthInsuranceCost} onChange={set("healthInsuranceCost")} min={0} max={3000} step={50} />
      </InputGroup>

      <InputGroup label="Inflation Rate">
        <SliderInput value={state.inflationRate} onChange={set("inflationRate")} min={0} max={0.05} step={0.005} suffix="%" formatValue={(v) => (v * 100).toFixed(1)} />
      </InputGroup>

      <SectionTitle>Strategy</SectionTitle>

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
