import { useState, useRef } from "react";

const API_URL = "http://localhost:8000/analyze";

const TASK_TYPES = ["development", "testing", "design", "research", "deployment", "planning"];

const RISK_CONFIG = {
  low:    { label: "Low Risk",    color: "#4ADE80", bg: "rgba(74,222,128,0.08)",  bar: "#4ADE80" },
  medium: { label: "Medium Risk", color: "#FBBF24", bg: "rgba(251,191,36,0.08)",  bar: "#FBBF24" },
  high:   { label: "High Risk",   color: "#F87171", bg: "rgba(248,113,113,0.08)", bar: "#F87171" },
};

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: "#475569" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#F1F5F9",
  fontSize: 14,
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

export default function App() {
  const [form, setForm] = useState({
    numberOfDays: 30,
    holidays: 8,
    extraHolidays: 2,
    capacity: 0.8,
    meetings: 3,
    task_type: "development",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const resultRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const risk = result ? RISK_CONFIG[result.risk] || RISK_CONFIG.medium : null;
  const utilPct = result ? Math.min(Math.round(result.utilization_percentage), 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080C14; min-height: 100vh; font-family: 'Syne', sans-serif; color: #F1F5F9; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes barFill { from { width: 0%; } to { width: var(--target-w); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 40px 40px; } }
        input:focus, select:focus { border-color: rgba(99,179,237,0.5) !important; box-shadow: 0 0 0 3px rgba(99,179,237,0.08); }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #63B3ED; border: 2px solid #080C14; box-shadow: 0 0 8px rgba(99,179,237,0.5); }
        select option { background: #0F172A; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        animation: "gridMove 8s linear infinite",
        pointerEvents: "none",
      }}/>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 60% 40% at 70% 20%, rgba(99,179,237,0.06) 0%, transparent 70%)", pointerEvents: "none" }}/>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80", animation: "pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Mono', monospace" }}>API connected · localhost:8000</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F8FAFC" }}>
            LOE<br/>
            <span style={{ color: "#63B3ED" }}>Planning</span> Agent
          </h1>
          <p style={{ marginTop: 14, color: "#64748B", fontSize: 15, maxWidth: 420, lineHeight: 1.6, fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>
            AI-powered effort estimation, risk analysis, and sprint planning.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* Input panel */}
          <div style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: 28,
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#63B3ED" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>Sprint Configuration</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Calendar Days" hint="total">
                  <input type="number" value={form.numberOfDays} onChange={set("numberOfDays")} min={1} style={inputStyle}
                    onFocus={() => setFocusedField("days")} onBlur={() => setFocusedField(null)}/>
                </Field>
                <Field label="Weekly Holidays" hint="days">
                  <input type="number" value={form.holidays} onChange={set("holidays")} min={0} style={inputStyle}
                    onFocus={() => setFocusedField("hol")} onBlur={() => setFocusedField(null)}/>
                </Field>
                <Field label="Extra Holidays" hint="days">
                  <input type="number" value={form.extraHolidays} onChange={set("extraHolidays")} min={0} style={inputStyle}
                    onFocus={() => setFocusedField("extra")} onBlur={() => setFocusedField(null)}/>
                </Field>
                <Field label="Meetings / Week" hint="count">
                  <input type="number" value={form.meetings} onChange={set("meetings")} min={0} style={inputStyle}
                    onFocus={() => setFocusedField("meet")} onBlur={() => setFocusedField(null)}/>
                </Field>
              </div>

              <Field label={`Team Capacity — ${Math.round(form.capacity * 100)}%`}>
                <input type="range" min={0.1} max={1} step={0.05} value={form.capacity} onChange={set("capacity")}
                  style={{ width: "100%", accentColor: "#63B3ED" }}/>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {[10, 25, 50, 75, 100].map(v => (
                    <span key={v} style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{v}%</span>
                  ))}
                </div>
              </Field>

              <Field label="Task Type">
                <select value={form.task_type} onChange={set("task_type")} style={{ ...inputStyle, cursor: "pointer" }}>
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </Field>

              {/* Quick calc preview */}
              <div style={{ background: "rgba(99,179,237,0.04)", border: "1px solid rgba(99,179,237,0.1)", borderRadius: 12, padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748B" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Working days</span>
                  <span style={{ color: "#94A3B8" }}>{Math.max(0, form.numberOfDays - form.holidays - form.extraHolidays)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Base LOE estimate</span>
                  <span style={{ color: "#63B3ED" }}>{Math.max(0, (form.numberOfDays - form.holidays - form.extraHolidays) * form.capacity * 8).toFixed(0)} hrs</span>
                </div>
              </div>

              <button
                onClick={analyze}
                disabled={loading}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12,
                  background: loading ? "rgba(99,179,237,0.1)" : "linear-gradient(135deg, #3B82F6, #63B3ED)",
                  border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                  fontFamily: "'Syne', sans-serif", letterSpacing: "0.03em",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? <><Spinner /> Analyzing…</> : "Run Analysis →"}
              </button>

              {error && (
                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#F87171", fontFamily: "'DM Mono', monospace" }}>
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>

          {/* Results panel */}
          <div ref={resultRef}>
            {!result && !loading && (
              <div style={{
                background: "rgba(15,23,42,0.5)", border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: 20, padding: 40, textAlign: "center", color: "#334155",
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 16px", display: "block", opacity: 0.4 }}>
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>Configure your sprint and run analysis to see results</p>
              </div>
            )}

            {loading && (
              <div style={{
                background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: 40, textAlign: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "#64748B" }}>
                  <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
                  <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace" }}>Consulting the AI agent…</p>
                </div>
              </div>
            )}

            {result && risk && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.4s ease" }}>

                {/* Risk header */}
                <div style={{
                  background: risk.bg, border: `1px solid ${risk.color}30`,
                  borderRadius: 20, padding: "20px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: risk.color, fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Risk Assessment</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: risk.color }}>{risk.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Utilization</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC" }}>{result.utilization_percentage.toFixed(1)}<span style={{ fontSize: 16, color: "#64748B" }}>%</span></div>
                  </div>
                </div>

                {/* Utilization bar */}
                <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    {[0, 70, 90, 100].map(v => (
                      <span key={v} style={{ fontSize: 10, color: v === 70 || v === 90 ? "#64748B" : "#334155", fontFamily: "'DM Mono', monospace" }}>{v}%</span>
                    ))}
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.1)" }}/>
                    <div style={{ position: "absolute", left: "90%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.1)" }}/>
                    <div style={{
                      height: "100%", borderRadius: 3, background: risk.bar,
                      width: `${utilPct}%`,
                      boxShadow: `0 0 8px ${risk.bar}`,
                      animation: "barFill 0.8s ease forwards",
                    }}/>
                  </div>
                </div>

                {/* Metrics grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Working Days", value: result.working_days, unit: "days" },
                    { label: "Base LOE", value: result.base_loe_hours, unit: "hrs" },
                    { label: "Meeting Overhead", value: result.meeting_overhead_hours, unit: "hrs" },
                    { label: "Estimated LOE", value: result.estimated_loe_hours, unit: "hrs", highlight: true },
                  ].map(({ label, value, unit, highlight }) => (
                    <div key={label} style={{
                      background: highlight ? "rgba(99,179,237,0.06)" : "rgba(15,23,42,0.8)",
                      border: `1px solid ${highlight ? "rgba(99,179,237,0.15)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: highlight ? "#63B3ED" : "#F1F5F9" }}>
                        {value}<span style={{ fontSize: 12, color: "#64748B", marginLeft: 3 }}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>AI Suggestions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{
                          minWidth: 22, height: 22, borderRadius: 6,
                          background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#63B3ED", fontFamily: "'DM Mono', monospace",
                        }}>{i + 1}</div>
                        <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginTop: 2 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
