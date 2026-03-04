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

      <SectionTitle>Income Sources</SectionTitle>

      <InputGroup label="FERS Pension (annual)" hint="Estimated annual pension">
        <SliderInput value={state.pension} onChange={set("pension")} min={10000} max={130000} step={1000} />
      </InputGroup>

      <InputGroup label="TSP Traditional Balance">
        <SliderInput value={state.tspTraditional} onChange={set("tspTraditional")} min={0} max={2500000} step={10000} />
      </InputGroup>

      <InputGroup label="TSP Roth Balance">
        <SliderInput value={state.tspRoth} onChange={set("tspRoth")} min={0} max={750000} step={5000} />
      </InputGroup>

      <InputGroup label="SS PIA (monthly)" hint="Benefit at full retirement age">
        <SliderInput value={state.ssPIA} onChange={set("ssPIA")} min={0} max={4800} step={50} />
      </InputGroup>

      <InputGroup label="SS Claim Age">
        <SliderInput value={state.ssClaimAge} onChange={set("ssClaimAge")} min={62} max={70} prefix="" suffix=" yrs" />
      </InputGroup>

      <InputGroup label="Annual Investment Income">
        <SliderInput value={state.investmentIncome} onChange={set("investmentIncome")} min={0} max={60000} step={1000} />
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

      <SectionTitle>Planning</SectionTitle>

      <InputGroup label="Annual Living Expenses">
        <SliderInput value={state.livingExpenses} onChange={set("livingExpenses")} min={30000} max={220000} step={2000} />
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
