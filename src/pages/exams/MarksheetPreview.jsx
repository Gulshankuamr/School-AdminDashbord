import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Cell,
} from "recharts";

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const getGradeColor = (marks) => {
  if (marks >= 91) return "#16a34a";
  if (marks >= 81) return "#2563eb";
  if (marks >= 71) return "#7c3aed";
  if (marks >= 61) return "#0891b2";
  if (marks >= 51) return "#d97706";
  if (marks >= 41) return "#ea580c";
  if (marks >= 33) return "#dc2626";
  return "#991b1b";
};

const getGrade = (marks) => {
  if (marks >= 91) return "A1";
  if (marks >= 81) return "A2";
  if (marks >= 71) return "B1";
  if (marks >= 61) return "B2";
  if (marks >= 51) return "C1";
  if (marks >= 41) return "C2";
  if (marks >= 33) return "D";
  return "E";
};

const parseOverall = (val) => {
  if (val === undefined || val === null || val === "—") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// ═══════════════════════════════════════════════════
//  PARSE SCHOLASTIC  →  flat subject list
// ═══════════════════════════════════════════════════
const parseSubjects = (scholastic) => {
  if (!scholastic) return [];

  // Already flat array (like our parseScholastic output)
  if (Array.isArray(scholastic)) {
    return scholastic.map((r) => ({
      subject: (r.subject_name || r.subject || "Subject").toUpperCase(),
      term1:   parseOverall(r.total1 ?? r.term1 ?? r.fa1) ?? 0,
      term2:   parseOverall(r.total2 ?? r.term2 ?? r.fa3) ?? 0,
      overall: parseOverall(r.overall ?? r.total1) ?? 0,
    }));
  }

  // Object with term1/term2/final keys
  const { term1 = {}, term2 = {}, final = {} } = scholastic;

  if (Array.isArray(term1)) {
    return term1.map((r) => ({
      subject: (r.subject_name || r.subject || "Subject").toUpperCase(),
      term1:   parseOverall(r.total1 ?? r.term1 ?? 0) ?? 0,
      term2:   parseOverall(r.total2 ?? r.term2 ?? 0) ?? 0,
      overall: parseOverall(r.overall ?? 0) ?? 0,
    }));
  }

  const subjects = new Set([...Object.keys(term1), ...Object.keys(term2), ...Object.keys(final)]);
  return Array.from(subjects).map((sub) => ({
    subject: sub.toUpperCase(),
    term1:   parseOverall(term1[sub]) ?? 0,
    term2:   parseOverall(term2[sub]) ?? 0,
    overall: parseOverall(final[sub] ?? term2[sub]) ?? 0,
  }));
};

// ═══════════════════════════════════════════════════
//  CUSTOM BAR LABEL
// ═══════════════════════════════════════════════════
const CustomBarLabel = ({ x, y, width, value }) => {
  if (!value && value !== 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} fill="#374151" fontSize={9} fontWeight={700} textAnchor="middle">
      {value}
    </text>
  );
};

// ═══════════════════════════════════════════════════
//  MINI PROGRESS BAR ROW
// ═══════════════════════════════════════════════════
const ProgressRow = ({ subject, marks, max = 100 }) => {
  const pct = Math.min(100, (marks / max) * 100);
  const color = getGradeColor(marks);
  const grade = getGrade(marks);
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 8.5 }}>
        <span style={{ fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.3 }}>
          {subject}
        </span>
        <span style={{ fontWeight: 900, color, fontSize: 9 }}>
          {marks} &nbsp;
          <span style={{
            background: color, color: "#fff", padding: "1px 5px",
            borderRadius: 99, fontSize: 7.5, fontWeight: 700,
          }}>{grade}</span>
        </span>
      </div>
      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════
const StatCard = ({ label, value, sub, color, bg }) => (
  <div style={{
    flex: 1, textAlign: "center",
    background: bg, border: `1.5px solid ${color}33`,
    borderRadius: 8, padding: "8px 6px",
  }}>
    <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 7.5, fontWeight: 800, color: "#555", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 7, color: "#888", marginTop: 1 }}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════════════
//  PRINTABLE CHART PAGE (Page 2)
// ═══════════════════════════════════════════════════
export const PrintableChartPage = React.forwardRef(({ data, school }, ref) => {
  if (!data) return null;

  const { student_info = {}, attendance = {}, scholastic, co_scholastic, cgpa, overall_percentage } = data;
  const subjects = useMemo(() => parseSubjects(scholastic), [scholastic]);

  const barData = subjects.map((s) => ({
    name: s.subject.length > 6 ? s.subject.slice(0, 6) + "." : s.subject,
    fullName: s.subject,
    "Term-1": s.term1,
    "Term-2": s.term2,
  }));

  const radarData = subjects.map((s) => ({
    subject: s.subject.length > 7 ? s.subject.slice(0, 7) : s.subject,
    marks: s.overall || Math.round((s.term1 + s.term2) / 2),
    fullMark: 100,
  }));

  const sortedByMarks = [...subjects].sort((a, b) =>
    (b.overall || b.term2) - (a.overall || a.term2)
  );
  const strong  = sortedByMarks.slice(0, 2);
  const weak    = sortedByMarks.slice(-2).reverse();
  const avgMarks = subjects.length
    ? Math.round(subjects.reduce((s, x) => s + (x.overall || x.term2), 0) / subjects.length)
    : 0;

  const borderCell = "1px solid #bbb";

  // Co-scholastic
  const coRows = (() => {
    if (!co_scholastic) return [];
    const t1 = co_scholastic.term1 || {};
    const t2 = co_scholastic.term2 || {};
    const acts = new Set([...Object.keys(t1), ...Object.keys(t2)]);
    return Array.from(acts).map((a) => ({ activity: a, term1: t1[a] || "—", term2: t2[a] || "—" }));
  })();

  const isPassed = overall_percentage != null && Number(overall_percentage) >= 33;

  return (
    <div
      ref={ref}
      id="printable-chart-page"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "7mm 9mm 7mm 9mm",
        color: "#000",
        pageBreakBefore: "always",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        paddingBottom: 7, borderBottom: "2.5px solid #1e3a8a", marginBottom: 7,
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%", flexShrink: 0,
          border: "3px solid #1e3a8a",
          background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1e3a8a", letterSpacing: 2, textTransform: "uppercase" }}>
            {school?.school_name || student_info?.school_name || "J. PUBLIC SCHOOL"}
          </div>
          <div style={{ fontSize: 7.5, color: "#555" }}>
            {school?.school_address || ""} {school?.school_phone_number ? `| Ph: ${school.school_phone_number}` : ""}
          </div>
        </div>
      </div>

      {/* ── Title ── */}
      <div style={{
        textAlign: "center", marginBottom: 7,
        borderTop: "1.5px solid #1e3a8a", borderBottom: "1.5px solid #1e3a8a",
        padding: "3px 0",
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#1e3a8a", letterSpacing: 2, textTransform: "uppercase" }}>
          SCHOLASTIC PERFORMANCE ANALYSIS &nbsp;•&nbsp; SESSION {student_info?.academic_year || "2024-25"}
        </span>
      </div>

      {/* ── Student info strip ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        background: "#f0f4ff", border: "1px solid #c7d7fe",
        borderRadius: 4, padding: "5px 10px", marginBottom: 7, fontSize: 8.5,
      }}>
        {[
          ["Student", student_info?.name || "—"],
          ["Class", student_info?.class_name || "—"],
          ["Section", student_info?.section_name || "—"],
          ["Roll No", student_info?.roll_no || "—"],
          ["Attendance", `${attendance?.total_attendance ?? "—"} / ${attendance?.total_working_days ?? "—"}`],
        ].map(([k, v]) => (
          <span key={k}><b style={{ color: "#1e3a8a" }}>{k}:</b> {v}</span>
        ))}
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <StatCard label="CGPA"       value={cgpa ?? "—"}
          color="#1e3a8a" bg="#eff6ff" />
        <StatCard label="Overall %"  value={overall_percentage != null ? `${overall_percentage}%` : "—"}
          color="#059669" bg="#f0fdf4" />
        <StatCard label="Result"     value={overall_percentage != null ? (isPassed ? "PASS ✓" : "FAIL ✗") : "—"}
          color={isPassed ? "#059669" : "#dc2626"}
          bg={isPassed ? "#f0fdf4" : "#fef2f2"} />
        <StatCard label="Avg Marks"  value={subjects.length ? avgMarks : "—"}
          sub="All Subjects"
          color="#7c3aed" bg="#faf5ff" />
        <StatCard label="Total Subj" value={subjects.length || "—"}
          color="#0891b2" bg="#ecfeff" />
      </div>

      {subjects.length === 0 ? (
        <div style={{
          border: "1px dashed #ccc", borderRadius: 6, padding: 20,
          textAlign: "center", color: "#aaa", fontSize: 10, marginBottom: 10,
        }}>
          No scholastic data available for chart analysis.
        </div>
      ) : (
        <>
          {/* ── BAR CHART + SUBJECT BARS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 8, marginBottom: 8 }}>

            {/* Bar Chart */}
            <div style={{
              border: "1px solid #e2e8f0", borderRadius: 6,
              padding: "8px 6px 4px",
            }}>
              <div style={{
                fontSize: 8.5, fontWeight: 800, color: "#1e3a8a",
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
                paddingBottom: 3, borderBottom: "1px solid #e2e8f0",
              }}>
                📊 Term-wise Subject Performance
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} margin={{ top: 14, right: 4, left: -22, bottom: 0 }} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 7, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 7 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 9, padding: "4px 8px" }}
                    formatter={(val, name, props) => [val, name]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend wrapperStyle={{ fontSize: 8, paddingTop: 4 }} />
                  <Bar dataKey="Term-1" fill="#1d4ed8" label={<CustomBarLabel />} radius={[2,2,0,0]} />
                  <Bar dataKey="Term-2" fill="#dc2626" label={<CustomBarLabel />} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div style={{
              border: "1px solid #e2e8f0", borderRadius: 6,
              padding: "8px 6px 4px",
            }}>
              <div style={{
                fontSize: 8.5, fontWeight: 800, color: "#1e3a8a",
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
                paddingBottom: 3, borderBottom: "1px solid #e2e8f0",
              }}>
                🎯 Subject Skill Radar
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7, fontWeight: 600, fill: "#334155" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 6 }} />
                  <Radar name="Marks" dataKey="marks" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.22} strokeWidth={1.5} />
                  <Tooltip contentStyle={{ fontSize: 9 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SUBJECT PROGRESS BARS TABLE ── */}
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: 6,
            padding: "8px 10px", marginBottom: 8,
          }}>
            <div style={{
              fontSize: 8.5, fontWeight: 800, color: "#1e3a8a",
              textTransform: "uppercase", letterSpacing: 0.5,
              marginBottom: 7, paddingBottom: 3, borderBottom: "1px solid #e2e8f0",
            }}>
              📈 Subject-wise Performance Overview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              {subjects.map((s, i) => (
                <ProgressRow
                  key={i}
                  subject={s.subject}
                  marks={s.overall || Math.round((s.term1 + s.term2) / 2) || 0}
                />
              ))}
            </div>
          </div>

          {/* ── STRONG / WEAK + CO-SCHOLASTIC ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>

            {/* Strong Subjects */}
            <div style={{ border: "1px solid #bbf7d0", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                background: "#16a34a", color: "#fff", padding: "4px 8px",
                fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
              }}>🏆 Top Subjects</div>
              <div style={{ padding: "6px 8px" }}>
                {strong.length ? strong.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "3px 0", borderBottom: i < strong.length - 1 ? "1px solid #f0fdf4" : "none",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>{s.subject}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 900, color: "#fff",
                      background: "#16a34a", padding: "1px 6px", borderRadius: 99,
                    }}>{s.overall || s.term2}</span>
                  </div>
                )) : <div style={{ fontSize: 8, color: "#aaa", padding: 4 }}>No data</div>}
              </div>
            </div>

            {/* Weak Subjects */}
            <div style={{ border: "1px solid #fecaca", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                background: "#dc2626", color: "#fff", padding: "4px 8px",
                fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
              }}>⚠ Needs Improvement</div>
              <div style={{ padding: "6px 8px" }}>
                {weak.length ? weak.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "3px 0", borderBottom: i < weak.length - 1 ? "1px solid #fff5f5" : "none",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>{s.subject}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 900, color: "#fff",
                      background: "#dc2626", padding: "1px 6px", borderRadius: 99,
                    }}>{s.overall || s.term2}</span>
                  </div>
                )) : <div style={{ fontSize: 8, color: "#aaa", padding: 4 }}>No data</div>}
              </div>
            </div>

            {/* Co-Scholastic */}
            <div style={{ border: "1px solid #ddd6fe", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                background: "#4c1d95", color: "#fff", padding: "4px 8px",
                fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
              }}>🎨 Co-Scholastic</div>
              {coRows.length ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      <th style={{ padding: "3px 6px", textAlign: "left", fontWeight: 800, borderBottom: "1px solid #ede9fe" }}>Activity</th>
                      <th style={{ padding: "3px 6px", textAlign: "center", fontWeight: 800, borderBottom: "1px solid #ede9fe" }}>T1</th>
                      <th style={{ padding: "3px 6px", textAlign: "center", fontWeight: 800, borderBottom: "1px solid #ede9fe" }}>T2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "#fff" }}>
                        <td style={{ padding: "3px 6px", textTransform: "capitalize", fontWeight: 600 }}>{r.activity}</td>
                        <td style={{ padding: "3px 6px", textAlign: "center", fontWeight: 700, color: "#4c1d95" }}>{r.term1}</td>
                        <td style={{ padding: "3px 6px", textAlign: "center", fontWeight: 700, color: "#4c1d95" }}>{r.term2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 8, fontSize: 8, color: "#aaa", textAlign: "center" }}>No data</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Grading Scale Table ── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          background: "#1e3a8a", color: "#fff", padding: "3px 8px",
          borderRadius: "4px 4px 0 0", fontSize: 8, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          Instructions — Grading Scale (8 Point)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
          <thead>
            <tr style={{ background: "#1d4ed8", color: "#fff" }}>
              {["91-100", "81-90", "71-80", "61-70", "51-60", "41-50", "33-40", "32 & Below"].map((r) => (
                <th key={r} style={{ padding: "3px 4px", border: borderCell, fontWeight: 800, textAlign: "center" }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {["A1", "A2", "B1", "B2", "C1", "C2", "D", "E (Need Improvement)"].map((g) => (
                <td key={g} style={{ padding: "3px 4px", border: borderCell, textAlign: "center", fontWeight: 900, color: "#1e3a8a" }}>{g}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Signatures ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingTop: 12, borderTop: "1.5px dashed #aaa",
      }}>
        {["Director", "Class Teacher", "Principal"].map((role) => (
          <div key={role} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ width: 110, height: 1, background: "#444", margin: "0 auto 5px" }} />
            <div style={{ fontSize: 8.5, fontWeight: 800, color: "#333", textTransform: "uppercase", letterSpacing: 1.5 }}>{role}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
PrintableChartPage.displayName = "PrintableChartPage";

// ═══════════════════════════════════════════════════
//  SCREEN PREVIEW WRAPPER
// ═══════════════════════════════════════════════════
const MarksheetPreview = ({ data, school }) => {
  if (!data) return null;
  return (
    <div style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)", borderRadius: 2, overflow: "hidden", marginTop: 16 }}>
      <PrintableChartPage data={data} school={school} />
    </div>
  );
};

export default MarksheetPreview;