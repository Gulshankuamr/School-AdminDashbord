import React, { useMemo } from "react";

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════
const safeNum = (v) => { const n = Number(v); return isNaN(n) ? null : n; };

const getGrade = (pct) => {
  if (pct >= 91) return "A1"; if (pct >= 81) return "A2";
  if (pct >= 71) return "B1"; if (pct >= 61) return "B2";
  if (pct >= 51) return "C1"; if (pct >= 41) return "C2";
  if (pct >= 33) return "D";  return "E";
};

// Color per grade — matches GFA chart colors (dark grey T1, red T2)
const BAR_COLORS_T1 = [
  "#374151","#374151","#374151","#374151","#374151",
  "#374151","#374151","#374151","#374151","#374151","#374151",
];
const BAR_COLORS_T2 = [
  "#b91c1c","#b91c1c","#b91c1c","#b91c1c","#b91c1c",
  "#b91c1c","#b91c1c","#b91c1c","#b91c1c","#b91c1c","#b91c1c",
];

// Color by percentage for progress bars
const pctColor = (pct) => {
  if (pct >= 91) return "#16a34a";
  if (pct >= 81) return "#2563eb";
  if (pct >= 71) return "#7c3aed";
  if (pct >= 61) return "#0891b2";
  if (pct >= 51) return "#d97706";
  if (pct >= 41) return "#ea580c";
  return "#dc2626";
};

// ═══════════════════════════════════════
//  PARSE — new nested API structure
// ═══════════════════════════════════════
const parseSubjects = (scholastic) => {
  if (!scholastic) return [];
  if (Array.isArray(scholastic)) {
    return scholastic.map(r => {
      const t1 = safeNum(r.total1 ?? r.term1 ?? r.fa1) ?? 0;
      const t2 = safeNum(r.total2 ?? r.term2 ?? r.fa3) ?? 0;
      const overall = safeNum(r.overall) ?? Math.round((t1 + t2) / 2);
      const grade = r.grade || getGrade(overall);
      return {
        subject: (r.subject_name || r.subject || "Subject").toUpperCase(),
        perTest1: safeNum(r.fa1) ?? "—", noteBook1: safeNum(r.fa2) ?? "—",
        subEnrich1: safeNum(r.sa1) ?? "—", halfYearly: "—",
        term1Total: t1, gp1: grade,
        perTest2: safeNum(r.fa3) ?? "—", noteBook2: safeNum(r.fa4) ?? "—",
        subEnrich2: safeNum(r.sa2) ?? "—", annual: "—",
        term2Total: t2, gp2: grade,
        overall, grade,
        term1_exams: [], term2_exams: [], isNew: false,
      };
    });
  }

  const { term1 = {}, term2 = {}, final = {} } = scholastic;
  if (Array.isArray(term1)) {
    return term1.map(r => {
      const t1 = safeNum(r.total1 ?? 0) ?? 0;
      const t2 = safeNum(r.total2 ?? 0) ?? 0;
      const overall = safeNum(r.overall) ?? Math.round((t1 + t2) / 2);
      return {
        subject: (r.subject_name || r.subject || "Subject").toUpperCase(),
        perTest1: "—", noteBook1: "—", subEnrich1: "—", halfYearly: "—",
        term1Total: t1, gp1: r.grade || getGrade(overall),
        perTest2: "—", noteBook2: "—", subEnrich2: "—", annual: "—",
        term2Total: t2, gp2: r.grade || getGrade(overall),
        overall, grade: r.grade || getGrade(overall),
        term1_exams: [], term2_exams: [], isNew: false,
      };
    });
  }

  // NEW nested: term1/term2/final object
  const names = new Set([...Object.keys(term1), ...Object.keys(term2), ...Object.keys(final)]);
  return Array.from(names).map(sub => {
    const t1 = term1[sub] || {};
    const t2 = term2[sub] || {};
    const fin = final[sub] || {};

    const t1Exams = Object.entries(t1.exams || {}).map(([name, e]) => ({
      name, marks: safeNum(e.marks) ?? 0, max_marks: safeNum(e.max_marks) ?? 100,
      normalized: typeof e.normalized === "number" ? Math.round(e.normalized * 10) / 10 : 0,
    }));
    const t2Exams = Object.entries(t2.exams || {}).map(([name, e]) => ({
      name, marks: safeNum(e.marks) ?? 0, max_marks: safeNum(e.max_marks) ?? 100,
      normalized: typeof e.normalized === "number" ? Math.round(e.normalized * 10) / 10 : 0,
    }));

    const t1Total = safeNum(t1.total) ?? 0;
    const t2Total = safeNum(t2.total) ?? 0;
    const finPct  = safeNum(fin.percentage) ?? 0;
    const finMark = safeNum(fin.marks) ?? 0;
    const grade   = fin.grade || getGrade(finPct || finMark);

    // Map exams to GFA columns (Per Test, Note Book, Sub Enrichment, Half Yearly)
    const perTest1    = t1Exams[0]?.marks ?? "—";
    const noteBook1   = t1Exams[1]?.marks ?? "—";
    const subEnrich1  = t1Exams[2]?.marks ?? "—";
    const halfYearly  = t1Exams[3]?.marks ?? (t1Exams.length === 1 ? t1Exams[0]?.marks : "—");
    const perTest2    = t2Exams[0]?.marks ?? "—";
    const noteBook2   = t2Exams[1]?.marks ?? "—";
    const subEnrich2  = t2Exams[2]?.marks ?? "—";
    const annual      = t2Exams[3]?.marks ?? (t2Exams.length === 1 ? t2Exams[0]?.marks : "—");

    return {
      subject: sub.toUpperCase(),
      perTest1, noteBook1, subEnrich1, halfYearly,
      term1Total: t1Total, gp1: grade,
      perTest2, noteBook2, subEnrich2, annual,
      term2Total: t2Total, gp2: grade,
      overall: finPct || finMark,
      finalMark: finMark, finalMax: safeNum(fin.max_marks) ?? 200,
      grade,
      term1_exams: t1Exams, term2_exams: t2Exams, isNew: true,
    };
  });
};

// ═══════════════════════════════════════
//  CUSTOM BAR CHART (pure SVG — no recharts, pixel-perfect like GFA)
// ═══════════════════════════════════════
const GFABarChart = ({ subjects }) => {
  if (!subjects || subjects.length === 0) return null;

  const W = 680, H = 200;
  const PAD_LEFT = 32, PAD_RIGHT = 10, PAD_TOP = 14, PAD_BOTTOM = 50;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const maxVal = 100;
  const yLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Each subject has T1 and T2 bars → 2 bars per subject + gap
  const groupCount = subjects.length;
  const groupW = chartW / groupCount;
  const barW = Math.min(groupW * 0.35, 14);
  const barGap = barW * 0.5;

  const yScale = (val) => chartH - (val / maxVal) * chartH;

  // X-axis labels — "ENG(T-1)" style
  const xLabels = subjects.flatMap((s, i) => {
    const shortName = s.subject.length > 4 ? s.subject.slice(0, 4) : s.subject;
    const gx = PAD_LEFT + i * groupW + groupW / 2;
    return [
      { label: `${shortName}(T-1)`, x: gx - barW / 2 - barGap / 2 },
      { label: `${shortName}(T-2)`, x: gx + barW / 2 + barGap / 2 },
    ];
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Y grid lines */}
      {yLines.map(y => {
        const yPos = PAD_TOP + yScale(y);
        return (
          <g key={y}>
            <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={yPos} y2={yPos}
              stroke={y === 0 ? "#666" : "#e5e7eb"} strokeWidth={y === 0 ? 1.2 : 0.7} />
            <text x={PAD_LEFT - 3} y={yPos + 3} fontSize={7} textAnchor="end" fill="#6b7280">{y}</text>
          </g>
        );
      })}

      {/* Y axis line */}
      <line x1={PAD_LEFT} x2={PAD_LEFT} y1={PAD_TOP} y2={PAD_TOP + chartH} stroke="#666" strokeWidth={1.2} />

      {/* Bars */}
      {subjects.map((s, i) => {
        const gx = PAD_LEFT + i * groupW + groupW / 2;
        const t1 = Math.max(0, Math.min(100, safeNum(s.term1Total) ?? safeNum(s.term1) ?? 0));
        const t2 = Math.max(0, Math.min(100, safeNum(s.term2Total) ?? safeNum(s.term2) ?? 0));
        const t1H = (t1 / maxVal) * chartH;
        const t2H = (t2 / maxVal) * chartH;
        const t1x = gx - barW - barGap / 2;
        const t2x = gx + barGap / 2;

        return (
          <g key={i}>
            {/* T1 bar — dark grey */}
            <rect
              x={t1x} y={PAD_TOP + chartH - t1H}
              width={barW} height={t1H}
              fill="#374151" rx={1}
            />
            {/* T2 bar — red */}
            <rect
              x={t2x} y={PAD_TOP + chartH - t2H}
              width={barW} height={t2H}
              fill="#b91c1c" rx={1}
            />
            {/* X labels — rotated like GFA */}
            <text
              x={t1x + barW / 2} y={PAD_TOP + chartH + 8}
              fontSize={5.5} textAnchor="start" fill="#374151"
              transform={`rotate(-45, ${t1x + barW / 2}, ${PAD_TOP + chartH + 8})`}
            >
              {s.subject.length > 4 ? s.subject.slice(0, 4) : s.subject}(T-1)
            </text>
            <text
              x={t2x + barW / 2} y={PAD_TOP + chartH + 8}
              fontSize={5.5} textAnchor="start" fill="#b91c1c"
              transform={`rotate(-45, ${t2x + barW / 2}, ${PAD_TOP + chartH + 8})`}
            >
              {s.subject.length > 4 ? s.subject.slice(0, 4) : s.subject}(T-2)
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD_LEFT} y={H - 10} width={10} height={7} fill="#374151" rx={1}/>
      <text x={PAD_LEFT + 13} y={H - 4} fontSize={7} fill="#374151">Term-1</text>
      <rect x={PAD_LEFT + 55} y={H - 10} width={10} height={7} fill="#b91c1c" rx={1}/>
      <text x={PAD_LEFT + 68} y={H - 4} fontSize={7} fill="#b91c1c">Term-2</text>
    </svg>
  );
};

// ═══════════════════════════════════════
//  PRINTABLE CHART PAGE — GOLDEN FUTURE ACADEMY EXACT FORMAT
// ═══════════════════════════════════════
export const PrintableChartPage = React.forwardRef(({ data, school }, ref) => {
  if (!data) return null;

  const {
    student_info = {}, attendance = {},
    scholastic, co_scholastic,
    cgpa, overall_percentage,
  } = data;

  const subjects = useMemo(() => parseSubjects(scholastic), [scholastic]);

  const coRows = useMemo(() => {
    if (!co_scholastic) return [];
    const t1 = co_scholastic.term1 || {}, t2 = co_scholastic.term2 || {};
    const acts = new Set([...Object.keys(t1), ...Object.keys(t2)]);
    return Array.from(acts).map(a => ({ activity: a, term1: t1[a] || "—", term2: t2[a] || "—" }));
  }, [co_scholastic]);

  const isPassed = overall_percentage != null && Number(overall_percentage) >= 33;

  const totalT1 = subjects.reduce((a, s) => a + (safeNum(s.term1Total) ?? 0), 0);
  const totalT2 = subjects.reduce((a, s) => a + (safeNum(s.term2Total) ?? 0), 0);
  const totalObtained = subjects.reduce((a, s) => a + (safeNum(s.finalMark ?? s.overall) ?? 0), 0);
  const totalMax = subjects.length * 100 * 2; // 100 per term x 2 terms
  const overallGrade = cgpa || getGrade(Number(overall_percentage) || 0);

  const bc = "1px solid #ccc";
  const tdS = (x = {}) => ({
    border: bc, padding: "3px 4px", fontSize: 7.5, color: "#111",
    verticalAlign: "middle", ...x,
  });
  const thS = (bg = "#374151", x = {}) => ({
    border: bc, padding: "3.5px 4px", background: bg, color: "#fff",
    fontWeight: 700, fontSize: 7.5, textAlign: "center",
    verticalAlign: "middle", ...x,
  });

  // Split co-scholastic into two halves
  const half1 = coRows.slice(0, Math.ceil(coRows.length / 2));
  const half2 = coRows.slice(Math.ceil(coRows.length / 2));

  return (
    <div
      ref={ref}
      id="printable-chart-page"
      style={{
        width: "210mm", minHeight: "297mm",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "5mm 7mm",
        color: "#000",
        pageBreakBefore: "always",
        // GFA watermark pattern
        backgroundImage: "repeating-linear-gradient(45deg,rgba(185,28,28,0.018) 0px,rgba(185,28,28,0.018) 1px,transparent 1px,transparent 10px)",
      }}
    >
      {/* ══ SCHOOL HEADER ══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {/* Logo */}
        <div style={{
          width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
          border: "3px solid #b91c1c",
          background: "linear-gradient(135deg,#7f1d1d,#b91c1c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(185,28,28,0.35)",
        }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>

        {/* School name + details */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            fontSize: 22, fontWeight: 900, color: "#b91c1c",
            letterSpacing: 3, textTransform: "uppercase", lineHeight: 1.1,
            fontStyle: "italic",
            textShadow: "1px 1px 0 rgba(127,29,29,0.2)",
          }}>
            {school?.school_name || "GOLDEN FUTURE ACADEMY"}
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: "#b91c1c", letterSpacing: 1, marginTop: 1 }}>TRUST ON EDUCATION</div>
          <div style={{ fontSize: 7.5, color: "#555", marginTop: 1 }}>{school?.school_address || ""}</div>
          <div style={{ fontSize: 7.5, color: "#555" }}>
            {school?.school_phone_number ? `www... | Phone No. +91-${school.school_phone_number}` : ""}
          </div>
        </div>

        {/* Book icon right */}
        <div style={{ width: 54, height: 54, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="46" height="46" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth={1.1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* ══ PROGRESS REPORT TITLE ══ */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{
          display: "inline-block",
          fontSize: 12, fontWeight: 900, color: "#1a1a1a",
          letterSpacing: 1.5, textTransform: "uppercase",
          borderTop: "2px solid #b91c1c", borderBottom: "2px solid #b91c1c",
          padding: "3px 20px",
        }}>
          PROGRESS REPORT • {student_info?.academic_year || "2024-2025"}
        </div>
      </div>

      {/* ══ STUDENT PROFILE ══ */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#1a1a1a", marginBottom: 4, textDecoration: "underline" }}>Student Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 40px" }}>
          {[
            ["Name of Student", student_info?.name],
            [`Class & Section`, `${student_info?.class_name || "—"} - ${student_info?.section_name || "—"}`],
            ["Mother's Name", student_info?.mother_name],
            ["Roll No", student_info?.roll_no ?? "—"],
            ["Father's Name", student_info?.father_name],
            ["D.O.B.", student_info?.date_of_birth ?? student_info?.dob],
            ["Admission No.", student_info?.admission_no],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ display: "flex", gap: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#222", minWidth: 96, flexShrink: 0 }}>{lbl}</span>
              <span style={{ fontSize: 8, color: "#111" }}>: {val || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SCHOLASTIC TABLE ══ */}
      {subjects.length > 0 ? (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0, fontSize: 7.5 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ ...thS("#1a1a1a"), textAlign: "left", width: 72, verticalAlign: "middle" }}>
                  <div>Scholastic</div>
                </th>
                <th colSpan={6} style={thS("#374151")}>Term-1 (100 marks)</th>
                <th colSpan={6} style={thS("#7f1d1d")}>Term-2 (100 marks)</th>
              </tr>
              <tr>
                {/* T1 columns */}
                <th style={thS("#4b5563", { fontSize: 7 })}>Per Test<br/>(20)</th>
                <th style={thS("#4b5563", { fontSize: 7 })}>Note Book<br/>CW/HW (20)</th>
                <th style={thS("#4b5563", { fontSize: 7 })}>Sub<br/>Enrichment (10)</th>
                <th style={thS("#4b5563", { fontSize: 7 })}>Half Yearly<br/>Exam (50)</th>
                <th style={thS("#374151", { fontSize: 7 })}>Marks<br/>Obtained (100)</th>
                <th style={thS("#374151", { fontSize: 7 })}>GP</th>
                {/* T2 columns */}
                <th style={thS("#991b1b", { fontSize: 7 })}>Per Test<br/>(20)</th>
                <th style={thS("#991b1b", { fontSize: 7 })}>Note Book<br/>CW/HW (20)</th>
                <th style={thS("#991b1b", { fontSize: 7 })}>Sub<br/>Enrichment (10)</th>
                <th style={thS("#991b1b", { fontSize: 7 })}>Annual<br/>Exam (50)</th>
                <th style={thS("#7f1d1d", { fontSize: 7 })}>Marks<br/>Obtained (100)</th>
                <th style={thS("#7f1d1d", { fontSize: 7 })}>GP</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={tdS({ fontWeight: 700, textTransform: "uppercase", textAlign: "left", fontSize: 7.5 })}>{row.subject}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.perTest1}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.noteBook1}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.subEnrich1}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.halfYearly}</td>
                  <td style={tdS({ textAlign: "center", fontWeight: 700, background: "#f1f5f9" })}>{row.term1Total || "—"}</td>
                  <td style={tdS({ textAlign: "center", fontWeight: 900, color: "#374151", fontSize: 8 })}>{row.gp1}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.perTest2}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.noteBook2}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.subEnrich2}</td>
                  <td style={tdS({ textAlign: "center" })}>{row.annual}</td>
                  <td style={tdS({ textAlign: "center", fontWeight: 700, background: "#fff1f2" })}>{row.term2Total || "—"}</td>
                  <td style={tdS({ textAlign: "center", fontWeight: 900, color: "#b91c1c", fontSize: 8 })}>{row.gp2}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ background: "#f0f4ff", fontWeight: 700 }}>
                <td style={tdS({ fontWeight: 800, textAlign: "center" })}>Total</td>
                <td colSpan={3} style={tdS({ textAlign: "center" })}></td>
                <td style={tdS({ textAlign: "center" })}></td>
                <td style={tdS({ textAlign: "center", fontWeight: 800, background: "#dbeafe" })}>{totalT1}</td>
                <td style={tdS()}></td>
                <td colSpan={3} style={tdS({ textAlign: "center" })}></td>
                <td style={tdS({ textAlign: "center" })}></td>
                <td style={tdS({ textAlign: "center", fontWeight: 800, background: "#fee2e2" })}>{totalT2}</td>
                <td style={tdS()}></td>
              </tr>
            </tbody>
          </table>

          {/* Summary bar */}
          <div style={{
            border: bc, borderTop: "none", background: "#fafafa",
            padding: "4px 8px", fontSize: 8, marginBottom: 6,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6,
          }}>
            <span>Total Marks : <b>{totalMax}</b></span>
            <span>Obtain Marks : <b>{totalT1 + totalT2}</b></span>
            <span>Percentage : <b style={{ color: "#b91c1c" }}>{overall_percentage != null ? `${overall_percentage}%` : "—"}</b></span>
            <span>Total Grade : <b style={{ color: "#374151" }}>{overallGrade}</b></span>
          </div>

          {/* Remarks + Attendance row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 8 }}>
            <span><b>Remarks :</b> {isPassed ? "Excellent" : "Needs Improvement"}</span>
            <span><b>Attendance :</b> {attendance?.total_attendance ?? "—"}/{attendance?.total_working_days ?? "—"}</span>
            <span><b>Rank :</b> —</span>
          </div>
        </>
      ) : (
        <div style={{ border: bc, padding: 12, textAlign: "center", color: "#aaa", fontSize: 9, marginBottom: 6 }}>No scholastic records.</div>
      )}

      {/* ══ BAR CHART — GFA STYLE (SVG tower bars) ══ */}
      {subjects.length > 0 && (
        <div style={{ border: bc, borderRadius: 3, padding: "6px 8px 2px", marginBottom: 6, background: "#fafafa" }}>
          <GFABarChart subjects={subjects} />
        </div>
      )}

      {/* ══ CO-SCHOLASTIC + GRADING SCALE ══ */}
      <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
        {/* Left co-scholastic */}
        {(half1.length > 0 || half2.length > 0) && (
          <>
            <div style={{ flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
                <thead>
                  <tr>
                    <th style={thS("#374151", { textAlign: "left" })}>Co Scholastic Area</th>
                    <th style={thS("#374151")}>Term-1</th>
                    <th style={thS("#374151")}>Term-2</th>
                  </tr>
                </thead>
                <tbody>
                  {half1.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                      <td style={tdS({ textTransform: "capitalize", fontWeight: 600 })}>{r.activity}</td>
                      <td style={tdS({ textAlign: "center", fontWeight: 700 })}>{r.term1}</td>
                      <td style={tdS({ textAlign: "center", fontWeight: 700 })}>{r.term2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
                <thead>
                  <tr>
                    <th style={thS("#374151", { textAlign: "left" })}>Co Scholastic Area</th>
                    <th style={thS("#374151")}>Term-1</th>
                    <th style={thS("#374151")}>Term-2</th>
                  </tr>
                </thead>
                <tbody>
                  {half2.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                      <td style={tdS({ textTransform: "capitalize", fontWeight: 600 })}>{r.activity}</td>
                      <td style={tdS({ textAlign: "center", fontWeight: 700 })}>{r.term1}</td>
                      <td style={tdS({ textAlign: "center", fontWeight: 700 })}>{r.term2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Grading scale (right side) */}
        <div style={{ minWidth: 90 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <tbody>
              {[
                ["A1", "Outstanding",    "#16a34a"],
                ["A2", "Excellent",      "#2563eb"],
                ["B1", "Very Good",      "#7c3aed"],
                ["B2", "Good",           "#0891b2"],
                ["C1", "Above Average",  "#d97706"],
                ["C2", "Average",        "#ea580c"],
                ["D",  "Below Average",  "#dc2626"],
              ].map(([g, desc, color]) => (
                <tr key={g}>
                  <td style={{ border: bc, padding: "2.5px 5px", fontWeight: 900, color, textAlign: "center", width: 22, fontSize: 8 }}>{g}</td>
                  <td style={{ border: bc, padding: "2.5px 5px", fontSize: 8, fontWeight: 600 }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ GRADING SCALE TABLE ══ */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 8, color: "#374151", marginBottom: 2 }}>
          <b>Instructions:-</b> Grading scale:- Grades are awarded on a 8-point grading scale as follows
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
          <thead>
            <tr>
              {["91-100", "81-90", "71-80", "61-70", "51-60", "41-50", "33-40", "32 & Below"].map(r => (
                <th key={r} style={{ border: bc, padding: "3px 4px", background: "#b91c1c", color: "#fff", fontWeight: 800, textAlign: "center", fontSize: 7.5 }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {[["A1", "#16a34a"], ["A2", "#2563eb"], ["B1", "#7c3aed"], ["B2", "#0891b2"], ["C1", "#d97706"], ["C2", "#ea580c"], ["D", "#dc2626"], ["E (Need Improvement)", "#991b1b"]].map(([g, c]) => (
                <td key={g} style={{ border: bc, padding: "3px 4px", textAlign: "center", fontWeight: 900, color: c, fontSize: 7.5 }}>{g}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ══ DATE + SIGNATURES ══ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 10, borderTop: "1.5px dashed #aaa" }}>
        <div style={{ fontSize: 8, color: "#374151" }}>
          <b>Date :</b> {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {["CLASS TEACHER", "PRINCIPAL"].map(role => (
            <div key={role} style={{ textAlign: "center" }}>
              <div style={{ width: 90, height: 1, background: "#444", margin: "0 auto 4px" }} />
              <div style={{ fontSize: 8, fontWeight: 800, color: "#222", textTransform: "uppercase", letterSpacing: 1 }}>{role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
PrintableChartPage.displayName = "PrintableChartPage";

// ═══════════════════════════════════════
//  SCREEN WRAPPER
// ═══════════════════════════════════════
const MarksheetPreview = ({ data, school }) => {
  if (!data) return null;
  return (
    <div style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.13)", borderRadius: 2, overflow: "hidden" }}>
      <PrintableChartPage data={data} school={school} />
    </div>
  );
};

export default MarksheetPreview;