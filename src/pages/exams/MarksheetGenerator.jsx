import React, { useState, useEffect, useRef } from "react";
import marksheetService from "../../services/examService/marksheetService";
import MarksheetPreview, { PrintableChartPage } from "./MarksheetPreview";

// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════
const ACADEMIC_YEARS = [
  "2026-27","2027-28","2028-29","2029-30","2030-31","2031-32",
];

const GRADING_SCALE = [
  { grade: "A1", desc: "Outstanding"   },
  { grade: "A2", desc: "Excellent"     },
  { grade: "B1", desc: "Very Good"     },
  { grade: "B2", desc: "Good"          },
  { grade: "C1", desc: "Above Average" },
  { grade: "C2", desc: "Average"       },
  { grade: "D",  desc: "Below Average" },
  { grade: "E",  desc: "Needs Effort"  },
];

// ═══════════════════════════════════════════════════════
//  DATA PARSERS
// ═══════════════════════════════════════════════════════
const parseScholastic = (scholastic) => {
  if (!scholastic) return [];
  if (Array.isArray(scholastic)) return scholastic;
  const { term1 = {}, term2 = {}, final = {} } = scholastic;
  if (Array.isArray(term1)) {
    return term1.map((row, i) => ({
      subject:    row.subject_name || row.subject || `Subject ${i + 1}`,
      fa1:        row.fa1 ?? row.marks ?? row.term1 ?? "—",
      fa2:        row.fa2 ?? "—",
      sa1:        row.sa1 ?? "—",
      total1:     row.total1 ?? row.term1_total ?? "—",
      fa3:        row.fa3 ?? "—",
      fa4:        row.fa4 ?? "—",
      sa2:        row.sa2 ?? "—",
      total2:     row.total2 ?? row.term2_total ?? "—",
      fa_final:   row.fa_final ?? row.final ?? "—",
      sa_final:   row.sa_final ?? "—",
      overall:    row.overall ?? row.percentage ?? "—",
      grade:      row.grade ?? "—",
      gp:         row.gp ?? "—",
    }));
  }
  const subjects = new Set([
    ...Object.keys(term1),
    ...Object.keys(term2),
    ...Object.keys(final),
  ]);
  return Array.from(subjects).map((sub) => ({
    subject:  sub,
    fa1: term1[sub] ?? "—", fa2: "—", sa1: "—", total1: term1[sub] ?? "—",
    fa3: term2[sub] ?? "—", fa4: "—", sa2: "—", total2: term2[sub] ?? "—",
    fa_final: final[sub] ?? "—", sa_final: "—", overall: "—",
    grade: "—", gp: "—",
  }));
};

const parseCoScholastic = (co) => {
  if (!co) return [];
  if (Array.isArray(co)) return co;
  const t1 = co.term1 || {};
  const t2 = co.term2 || {};
  const acts = new Set([...Object.keys(t1), ...Object.keys(t2)]);
  return Array.from(acts).map((a) => ({
    activity: a,
    term1: t1[a] || "—",
    term2: t2[a] || "—",
  }));
};

// ═══════════════════════════════════════════════════════
//  DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════
const DropDown = ({ label, value, onChange, options, placeholder, disabled, loading }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full px-3 py-2.5 pr-8 rounded-xl border-2 text-sm font-medium outline-none appearance-none transition-all duration-200
          ${disabled || loading
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            : value
            ? "bg-blue-50 border-blue-500 text-slate-800 cursor-pointer"
            : "bg-white border-slate-200 text-slate-600 cursor-pointer hover:border-blue-400 focus:border-blue-600"
          }`}
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          : <svg className={`w-3.5 h-3.5 ${value ? "text-blue-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        }
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
//  PRINTABLE A4 REPORT CARD  (Page 1)
// ═══════════════════════════════════════════════════════
const PrintableCard = React.forwardRef(({ data, school }, ref) => {
  if (!data) return null;

  const {
    student_info      = {},
    attendance        = {},
    scholastic,
    co_scholastic,
    cgpa,
    overall_percentage,
  } = data;

  const scholasticRows   = parseScholastic(scholastic);
  const coScholasticRows = parseCoScholastic(co_scholastic);
  const isPassed = overall_percentage != null && Number(overall_percentage) >= 33;

  const borderCell = "1px solid #bbb";

  const tdStyle = (extra = {}) => ({
    border: borderCell,
    padding: "3.5px 5px",
    fontSize: 8.5,
    color: "#111",
    ...extra,
  });

  const thStyle = (bg = "#1e3a8a", extra = {}) => ({
    border: borderCell,
    padding: "4px 5px",
    background: bg,
    color: "#fff",
    fontWeight: 700,
    textAlign: "center",
    fontSize: 8,
    letterSpacing: 0.3,
    ...extra,
  });

  return (
    <div
      ref={ref}
      id="printable-report"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        padding: "7mm 9mm 7mm 9mm",
        color: "#000",
      }}
    >
      {/* ── Affiliation ── */}
      <div style={{ textAlign: "right", fontSize: 7.5, color: "#666", marginBottom: 3 }}>
        Affiliation No. 7805-08/17-18
      </div>

      {/* ── School Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        paddingBottom: 8, borderBottom: "2.5px solid #1e3a8a", marginBottom: 8,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
          border: "3px solid #1e3a8a",
          background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            fontSize: 20, fontWeight: 900, color: "#1e3a8a",
            letterSpacing: 2, textTransform: "uppercase", lineHeight: 1.15,
          }}>
            {school?.school_name || student_info?.school_name || "J. PUBLIC SCHOOL"}
          </div>
          <div style={{ fontSize: 8, color: "#555", marginTop: 2 }}>
            An English Medium School With Indian Value
          </div>
          <div style={{ fontSize: 8, color: "#555" }}>
            {school?.school_address || "123 Education Avenue, Knowledge City"}
          </div>
          <div style={{ fontSize: 8, color: "#555" }}>
            {school?.school_phone_number ? `Phone No. +91-${school.school_phone_number}` : ""}
            {school?.school_email ? ` | Email: ${school.school_email}` : ""}
          </div>
        </div>
      </div>

      {/* ── Report Title ── */}
      <div style={{ textAlign: "center", marginBottom: 7 }}>
        <div style={{
          display: "inline-block", width: "100%",
          fontSize: 12, fontWeight: 900, color: "#1e3a8a",
          letterSpacing: 2, textTransform: "uppercase",
          borderTop: "1.5px solid #1e3a8a",
          borderBottom: "1.5px solid #1e3a8a",
          padding: "4px 0",
        }}>
          REPORT CARD • SESSION {student_info?.academic_year || "2024-25"}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, marginTop: 3,
          letterSpacing: 1, textTransform: "uppercase", color: "#222",
        }}>
          CLASS - {student_info?.class_name || "—"}
        </div>
      </div>

      {/* ── Student Profile ── */}
      <div style={{
        marginBottom: 7, background: "#f8faff",
        border: "1px solid #cce", borderRadius: 4, padding: "7px 10px",
      }}>
        <div style={{
          fontSize: 9.5, fontWeight: 800, color: "#1e3a8a",
          marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5,
          borderBottom: "1px solid #dde", paddingBottom: 3,
        }}>
          Student Profile
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 30px" }}>
          {[
            ["Name of Student", student_info?.name],
            ["Roll No",         student_info?.roll_no ?? "—"],
            ["Admission No.",   student_info?.admission_no],
            ["Section",         student_info?.section_name],
            ["Date of Birth",   student_info?.date_of_birth ?? student_info?.dob],
            ["Class",           student_info?.class_name],
            ["Mother's Name",   student_info?.mother_name],
            ["Father's Name",   student_info?.father_name],
            ["Address",         student_info?.address],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#333", minWidth: 88, flexShrink: 0 }}>
                {lbl}
              </span>
              <span style={{ fontSize: 8.5, color: "#111" }}>: {val || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Attendance Banner ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 7, background: "#eff6ff",
        border: "1px solid #bfdbfe", borderRadius: 4, padding: "6px 12px",
      }}>
        <div style={{ display: "flex", gap: 30 }}>
          <span style={{ fontSize: 9 }}><b>Attendance</b></span>
          <span style={{ fontSize: 9 }}>
            Total Working Days : <b style={{ fontSize: 11, color: "#1e3a8a" }}>{attendance?.total_working_days ?? "—"}</b>
          </span>
          <span style={{ fontSize: 9 }}>
            Total Attendance : <b style={{ fontSize: 11, color: "#059669" }}>{attendance?.total_attendance ?? "—"}</b>
          </span>
        </div>
        <span style={{ fontSize: 9 }}>
          Roll No : <b style={{ fontSize: 11, color: "#1e3a8a" }}>{student_info?.roll_no ?? "—"}</b>
        </span>
      </div>

      {/* ── PART 1: SCHOLASTIC AREA ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#1e3a8a", color: "#fff",
        padding: "4px 8px", marginBottom: 0, borderRadius: "3px 3px 0 0",
      }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
          Scholastic Area &nbsp;(8 Point Scale)
        </span>
      </div>

      {scholasticRows.length > 0 ? (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0, fontSize: 8 }}>
            <thead>
              <tr>
                <th rowSpan={3} style={{ ...thStyle(), textAlign: "left", width: 72, verticalAlign: "middle" }}>Subjects</th>
                <th colSpan={4} style={thStyle("#1d4ed8")}>Term-1</th>
                <th colSpan={4} style={thStyle("#1d4ed8")}>Term-2</th>
                <th colSpan={4} style={thStyle("#1e3a8a")}>Final Assessment</th>
              </tr>
              <tr>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>FA-1</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>FA-2</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>SA-1</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>Total</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>FA-3</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>FA-4</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>SA-2</th>
                <th style={thStyle("#2563eb", { fontSize: 7 })}>Total</th>
                <th style={thStyle("#1e3a8a", { fontSize: 7 })}>FA</th>
                <th style={thStyle("#1e3a8a", { fontSize: 7 })}>SA</th>
                <th style={thStyle("#1e3a8a", { fontSize: 7 })}>Overall</th>
                <th style={thStyle("#0f2460", { fontSize: 7 })}>GP</th>
              </tr>
              <tr>
                {["10%","10%","80%","100%","10%","10%","80%","100%","40%","60%","200%",""].map((w, i) => (
                  <th key={i} style={{ ...thStyle("#334155"), fontSize: 6.5 }}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scholasticRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8faff" : "#fff" }}>
                  <td style={tdStyle({ textAlign: "left", fontWeight: 700, textTransform: "uppercase", fontSize: 8 })}>
                    {row.subject_name || row.subject}
                  </td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.fa1}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.fa2}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.sa1}</td>
                  <td style={tdStyle({ textAlign: "center", fontWeight: 700, background: "#eef4ff" })}>{row.total1}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.fa3}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.fa4}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.sa2}</td>
                  <td style={tdStyle({ textAlign: "center", fontWeight: 700, background: "#eef4ff" })}>{row.total2}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.fa_final}</td>
                  <td style={tdStyle({ textAlign: "center" })}>{row.sa_final}</td>
                  <td style={tdStyle({ textAlign: "center", fontWeight: 700 })}>{row.overall}</td>
                  <td style={tdStyle({ textAlign: "center", fontWeight: 900, color: "#1e3a8a", background: "#f0f4ff" })}>{row.gp}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            border: borderCell, borderTop: "none",
            background: "#f0f4ff", padding: "3px 8px",
            fontSize: 8, color: "#444", marginBottom: 7,
            display: "flex", justifyContent: "space-between",
          }}>
            <span>8 Point Scale : A1(91%-100%), A2(81%-90%), B1(71%-80%), B2(61%-70%), C1(51%-60%), C2(41%-50%), D(33%-40%), E(33% AND BELOW)</span>
            <span style={{ fontWeight: 800, color: "#1e3a8a" }}>CGPA &nbsp;{cgpa ?? "—"}</span>
          </div>
        </>
      ) : (
        <div style={{
          border: borderCell, borderTop: "none",
          background: "#f8fafc", padding: 10,
          textAlign: "center", color: "#999", fontSize: 9, marginBottom: 7,
        }}>
          No scholastic records for this session.
        </div>
      )}

      {/* ── RESULT STRIP ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {[
          { label: "CGPA",      value: cgpa ?? "—",
            bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
          { label: "Overall %", value: overall_percentage != null ? `${overall_percentage}%` : "—",
            bg: "#f0fdf4", border: "#bbf7d0", color: "#059669" },
          { label: "Result",    value: overall_percentage != null ? (isPassed ? "PASS ✓" : "FAIL ✗") : "—",
            bg: isPassed ? "#f0fdf4" : "#fef2f2",
            border: isPassed ? "#86efac" : "#fca5a5",
            color: isPassed ? "#059669" : "#dc2626" },
        ].map(({ label, value, bg, border, color }) => (
          <div key={label} style={{
            flex: 1, textAlign: "center",
            background: bg, border: `2px solid ${border}`,
            borderRadius: 6, padding: "5px 8px",
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── CO-SCHOLASTIC + GRADING SCALE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.55fr", gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{
            background: "#4c1d95", color: "#fff",
            padding: "4px 8px", borderRadius: "3px 3px 0 0",
            fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
          }}>Co Scholastic Area</div>
          {coScholasticRows.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
              <thead>
                <tr>
                  <th style={thStyle("#4c1d95", { textAlign: "left" })}>Activity</th>
                  <th style={thStyle("#4c1d95")}>Term-1</th>
                  <th style={thStyle("#4c1d95")}>Term-2</th>
                </tr>
              </thead>
              <tbody>
                {coScholasticRows.slice(0, Math.ceil(coScholasticRows.length / 2)).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "#fff" }}>
                    <td style={tdStyle({ textAlign: "left", fontWeight: 600, textTransform: "capitalize" })}>{row.activity}</td>
                    <td style={tdStyle({ textAlign: "center", fontWeight: 700 })}>{row.term1}</td>
                    <td style={tdStyle({ textAlign: "center", fontWeight: 700 })}>{row.term2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ border: borderCell, borderTop: "none", padding: 8, textAlign: "center", color: "#aaa", fontSize: 8 }}>No data.</div>
          )}
        </div>

        <div>
          <div style={{
            background: "#4c1d95", color: "#fff",
            padding: "4px 8px", borderRadius: "3px 3px 0 0",
            fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
          }}>Co Scholastic Area</div>
          {coScholasticRows.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
              <thead>
                <tr>
                  <th style={thStyle("#4c1d95", { textAlign: "left" })}>Activity</th>
                  <th style={thStyle("#4c1d95")}>Term-1</th>
                  <th style={thStyle("#4c1d95")}>Term-2</th>
                </tr>
              </thead>
              <tbody>
                {coScholasticRows.slice(Math.ceil(coScholasticRows.length / 2)).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "#fff" }}>
                    <td style={tdStyle({ textAlign: "left", fontWeight: 600, textTransform: "capitalize" })}>{row.activity}</td>
                    <td style={tdStyle({ textAlign: "center", fontWeight: 700 })}>{row.term1}</td>
                    <td style={tdStyle({ textAlign: "center", fontWeight: 700 })}>{row.term2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ border: borderCell, borderTop: "none", padding: 8, textAlign: "center", color: "#aaa", fontSize: 8 }}>No data.</div>
          )}
        </div>

        <div>
          <div style={{
            background: "#164e63", color: "#fff",
            padding: "4px 8px", borderRadius: "3px 3px 0 0",
            fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
          }}>Scale</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <tbody>
              {GRADING_SCALE.map((g, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f0fdfe" : "#fff" }}>
                  <td style={tdStyle({ textAlign: "center", fontWeight: 900, color: "#1e3a8a", width: 22 })}>{g.grade}</td>
                  <td style={tdStyle({ fontWeight: 500 })}>{g.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Signatures ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingTop: 14, borderTop: "1.5px dashed #aaa", marginTop: 4,
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
PrintableCard.displayName = "PrintableCard";

// ═══════════════════════════════════════════════════════
//  PRINT HANDLER — both pages (iframe method, colors preserved)
// ═══════════════════════════════════════════════════════
const triggerPrint = (studentName = "Student") => {
  const page1 = document.getElementById("printable-report");
  const page2 = document.getElementById("printable-chart-page");
  if (!page1) return;

  // Clone page2 and force page-break-before
  let page2Html = "";
  if (page2) {
    const clone = page2.cloneNode(true);
    clone.style.pageBreakBefore = "always";
    page2Html = clone.outerHTML;
  }

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Marksheet_${studentName}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      @page { size: A4 portrait; margin: 0; }
      @media print {
        .page-break { page-break-before: always; }
      }
    </style>
  </head>
  <body>
    ${page1.outerHTML}
    ${page2Html}
  </body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 3000);
  };
};

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════
const MarksheetGenerator = () => {
  const [school, setSchool]     = useState(null);
  const [classes, setClasses]   = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [selClass,   setSelClass]   = useState("");
  const [selSection, setSelSection] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [acYear,     setAcYear]     = useState("2026-27");

  const [ldClasses,  setLdClasses]  = useState(false);
  const [ldSections, setLdSections] = useState(false);
  const [ldStudents, setLdStudents] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [marksheetData, setMarksheetData] = useState(null);
  const [error,         setError]         = useState("");

  const canGenerate = selClass && selSection && selStudent && acYear;

  // ── Fetch school profile on mount ──
  useEffect(() => {
    marksheetService.getSchoolProfile()
      .then(setSchool)
      .catch((e) => console.warn("School profile fetch failed:", e.message));
  }, []);

  // ── Fetch classes on mount ──
  useEffect(() => {
    setLdClasses(true);
    marksheetService.getAllClasses()
      .then((d) => setClasses(d.map((c) => ({ value: String(c.class_id), label: c.class_name }))))
      .catch((e) => setError(e.message))
      .finally(() => setLdClasses(false));
  }, []);

  // ── Fetch sections when class changes ──
  useEffect(() => {
    if (!selClass) { setSections([]); setSelSection(""); return; }
    setLdSections(true);
    setSelSection(""); setStudents([]); setSelStudent(""); setMarksheetData(null);
    marksheetService.getSectionsByClass(selClass)
      .then((d) => setSections(d.map((s) => ({ value: String(s.section_id), label: s.section_name }))))
      .catch((e) => setError(e.message))
      .finally(() => setLdSections(false));
  }, [selClass]);

  // ── Fetch students when section changes ──
  useEffect(() => {
    if (!selClass || !selSection) { setStudents([]); setSelStudent(""); return; }
    setLdStudents(true);
    setSelStudent(""); setMarksheetData(null);
    marksheetService.getStudentsByClassAndSection(selClass, selSection)
      .then((d) => setStudents(d.map((s) => ({
        value: String(s.student_id),
        label: s.name,
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLdStudents(false));
  }, [selClass, selSection]);

  // ── Generate marksheet ──
  const handleGenerate = async () => {
    if (!canGenerate) { setError("Please select all fields."); return; }
    setError(""); setMarksheetData(null); setGenerating(true);
    try {
      const data = await marksheetService.generateMarksheet(selStudent, acYear);
      setMarksheetData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Generate Marksheet</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Select class, section and student to generate the professional report card.
          </p>
        </div>

        {school?.school_name && (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-black text-blue-900 leading-tight">{school.school_name}</p>
              <p className="text-[9px] text-blue-600">{school.school_email}</p>
            </div>
          </div>
        )}

        {marksheetData && (
          <button
            type="button"
            onClick={() => triggerPrint(marksheetData?.student_info?.name)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-900 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Download PDF (2 Pages)
          </button>
        )}
      </div>

      {/* ── BODY: LEFT + RIGHT ── */}
      <div className="flex flex-1">

        {/* ═══ LEFT PANEL ═══ */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col gap-4">

          <DropDown label="Class"
            value={selClass} onChange={setSelClass}
            options={classes} placeholder="Select Class" loading={ldClasses} />

          <DropDown label="Section"
            value={selSection} onChange={setSelSection}
            options={sections}
            placeholder={selClass ? "Select Section" : "Select class first"}
            disabled={!selClass} loading={ldSections} />

          <DropDown label="Student"
            value={selStudent} onChange={setSelStudent}
            options={students}
            placeholder={selSection ? "Select Student" : "Select section first"}
            disabled={!selSection} loading={ldStudents} />

          {/* Academic Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Academic Year</label>
            <div className="relative">
              <select
                value={acYear}
                onChange={(e) => setAcYear(e.target.value)}
                className="w-full px-3 py-2.5 pr-8 rounded-xl border-2 border-blue-500 bg-blue-50 text-sm font-medium text-slate-800 appearance-none outline-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0 text-sm">⚠️</span>
              <p className="text-red-700 text-xs font-medium flex-1 leading-relaxed">{error}</p>
              <button type="button" onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
            </div>
          )}

          <div className="flex-1" />

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all duration-200
              ${canGenerate && !generating
                ? "bg-blue-900 hover:bg-blue-800 text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Marksheet
              </>
            )}
          </button>

          {!canGenerate && !error && (
            <p className="text-center text-[10px] text-slate-400 -mt-2">
              {!selClass ? "↑ Select a class first"
                : !selSection ? "↑ Select a section"
                : !selStudent ? "↑ Select a student"
                : ""}
            </p>
          )}

          {/* Page indicator */}
          {marksheetData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] font-bold text-blue-700">📄 2-Page PDF Ready</p>
              <p className="text-[9px] text-blue-500 mt-0.5">Page 1: Report Card</p>
              <p className="text-[9px] text-blue-500">Page 2: Chart Analysis</p>
            </div>
          )}
        </div>

        {/* ═══ RIGHT PANEL — A4 PREVIEW ═══ */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center">

          {/* Empty state */}
          {!marksheetData && !generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center">
                <svg className="w-9 h-9 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-500 font-bold text-sm">Report card will appear here</p>
                <p className="text-slate-400 text-xs mt-1">Select class → section → student → Generate</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
              <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin" />
              <p className="text-slate-500 font-semibold text-sm">Generating report card…</p>
              <p className="text-slate-400 text-xs">Fetching data from server</p>
            </div>
          )}

          {/* A4 Preview — Page 1 + Page 2 */}
          {marksheetData && !generating && (
            <div className="flex flex-col items-center gap-3 w-full">

              {/* Preview label bar */}
              <div className="flex items-center justify-between w-full" style={{ maxWidth: "210mm" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">
                    A4 Preview — {marksheetData?.student_info?.name || "Student"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    | {marksheetData?.student_info?.class_name} · {marksheetData?.student_info?.section_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerPrint(marksheetData?.student_info?.name)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors"
                  >
                    🖨️ Print / PDF (2 Pages)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarksheetData(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>

              {/* PAGE 1 LABEL */}
              <div className="flex items-center gap-2 w-full" style={{ maxWidth: "210mm" }}>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 px-2">PAGE 1 — REPORT CARD</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Page 1: Normal Report Card */}
              <div style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)", borderRadius: 2, overflow: "hidden" }}>
                <PrintableCard data={marksheetData} school={school} />
              </div>

              {/* PAGE 2 LABEL */}
              <div className="flex items-center gap-2 w-full mt-4" style={{ maxWidth: "210mm" }}>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 px-2">PAGE 2 — CHART ANALYSIS</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Page 2: Chart Analysis */}
              <MarksheetPreview data={marksheetData} school={school} />

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarksheetGenerator;