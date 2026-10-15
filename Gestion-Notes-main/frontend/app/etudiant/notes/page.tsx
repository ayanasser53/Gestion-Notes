"use client";

import { useState, useEffect } from "react";

const SEMESTERS: Record<string, { matiere: string; tps: number | null; tpsPct: number; projet: number | null; projetPct: number; cc1: number | null; cc1Pct: number; cc2: number | null; cc2Pct: number }[]> = {
  S1: [
    { matiere: "Algorithmique", tps: 14, tpsPct: 20, projet: 16, projetPct: 20, cc1: 12, cc1Pct: 30, cc2: 13, cc2Pct: 30 },
    { matiere: "Mathématiques", tps: null, tpsPct: 0, projet: null, projetPct: 0, cc1: 15, cc1Pct: 50, cc2: 14, cc2Pct: 50 },
    { matiere: "Systèmes d'exploitation", tps: 13, tpsPct: 30, projet: null, projetPct: 0, cc1: 11, cc1Pct: 35, cc2: 12, cc2Pct: 35 },
    { matiere: "Réseaux", tps: 16, tpsPct: 25, projet: 15, projetPct: 25, cc1: 14, cc1Pct: 25, cc2: 13, cc2Pct: 25 },
    { matiere: "Bases de données", tps: 17, tpsPct: 20, projet: 18, projetPct: 30, cc1: 16, cc1Pct: 25, cc2: 15, cc2Pct: 25 },
    { matiere: "Anglais", tps: null, tpsPct: 0, projet: null, projetPct: 0, cc1: 14, cc1Pct: 50, cc2: 15, cc2Pct: 50 },
  ],
  S2: [
    { matiere: "POO Java", tps: 15, tpsPct: 20, projet: 17, projetPct: 30, cc1: 14, cc1Pct: 25, cc2: 16, cc2Pct: 25 },
    { matiere: "Probabilités & Stats", tps: null, tpsPct: 0, projet: null, projetPct: 0, cc1: 13, cc1Pct: 50, cc2: 12, cc2Pct: 50 },
    { matiere: "Architecture logicielle", tps: 14, tpsPct: 25, projet: 16, projetPct: 25, cc1: 13, cc1Pct: 25, cc2: 15, cc2Pct: 25 },
    { matiere: "Web Development", tps: 18, tpsPct: 20, projet: 19, projetPct: 30, cc1: 17, cc1Pct: 25, cc2: 16, cc2Pct: 25 },
    { matiere: "Gestion de projet", tps: null, tpsPct: 0, projet: 15, projetPct: 50, cc1: 14, cc1Pct: 25, cc2: 13, cc2Pct: 25 },
  ],
};

function computeMoyenne(row: typeof SEMESTERS["S1"][0]): number {
  let total = 0;
  let pct = 0;
  if (row.tps !== null && row.tpsPct > 0) { total += row.tps * row.tpsPct; pct += row.tpsPct; }
  if (row.projet !== null && row.projetPct > 0) { total += row.projet * row.projetPct; pct += row.projetPct; }
  if (row.cc1 !== null && row.cc1Pct > 0) { total += row.cc1 * row.cc1Pct; pct += row.cc1Pct; }
  if (row.cc2 !== null && row.cc2Pct > 0) { total += row.cc2 * row.cc2Pct; pct += row.cc2Pct; }
  if (pct === 0) return 0;
  return Math.round((total / pct) * 100) / 100;
}

function getMention(avg: number): { label: string; color: string } {
  if (avg >= 16) return { label: "Très bien", color: "#16a34a" };
  if (avg >= 14) return { label: "Bien", color: "#2563eb" };
  if (avg >= 12) return { label: "Assez bien", color: "#7c3aed" };
  if (avg >= 10) return { label: "Passable", color: "#d97706" };
  return { label: "Insuffisant", color: "#dc2626" };
}

export default function EtudiantDashboard() {
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [activeSemestre, setActiveSemestre] = useState("");
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("email") || "etudiant@ensias.um5.ac.ma");
    }
    setTimeout(() => setVisible(true), 50);
  }, []);

  const rows = activeSemestre ? SEMESTERS[activeSemestre] ?? [] : [];
  const moyennes = rows.map(computeMoyenne);
  const semesterAvg = moyennes.length > 0
    ? Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 100) / 100
    : null;
  const mention = semesterAvg !== null ? getMention(semesterAvg) : null;

  const displayName = email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f8f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "24px",
        paddingBottom: "40px",
        fontFamily: "'Georgia', serif",
      }}
    >
      <div
        style={{
          width: "760px",
          minHeight: "1000px",
          border: "1px solid #111",
          background: "#fff",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "48px",
            borderBottom: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#333", fontFamily: "Georgia, serif" }}>
            Bulletins étudiant
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #111", display: "inline-block" }} />
            <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #111", display: "inline-block" }} />
            <span style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #3b82f6", display: "inline-block" }} />
          </div>
        </header>

        {/* Sub-header: greeting + logo */}
        <div
          style={{
            height: "56px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#111" }}>
            Bonjour {displayName}
          </span>
          {/* ENSIAS logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: "32px solid #e53e3e" }} />
            <div style={{ borderTop: "1.5px solid #e53e3e", borderBottom: "1.5px solid #e53e3e", padding: "1px 4px", marginTop: "2px" }}>
              <span style={{ color: "#e53e3e", fontSize: "11px", letterSpacing: "0.35em", fontWeight: 600 }}>ENSIAS</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <section style={{ padding: "32px 32px 48px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 4, height: 22, background: "#e53e3e", borderRadius: 2, display: "inline-block" }} />
            Bulletin de notes
          </h1>

          {/* Semester selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              style={{
                height: "40px",
                width: "180px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "0 12px",
                fontSize: "15px",
                color: selectedSemestre ? "#111" : "#888",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">Semestre</option>
              {Object.keys(SEMESTERS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => setActiveSemestre(selectedSemestre)}
              style={{
                height: "40px",
                padding: "0 24px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
            >
              Sélectionner
            </button>
          </div>

          {/* Grades table */}
          <div style={{ border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f9f9f9", borderBottom: "2px solid #ddd" }}>
                  {["Matière", "TPs", "%", "Projet", "%", "Contrôle 1", "%", "Contrôle 2", "%", "Moyenne"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "12px 8px",
                        textAlign: i === 0 ? "left" : "center",
                        fontWeight: 700,
                        color: "#111",
                        fontSize: i === 0 ? "14px" : "13px",
                        borderRight: i < 9 ? "1px solid #e5e5e5" : "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                        {Array.from({ length: 10 }).map((_, j) => (
                          <td key={j} style={{ padding: "14px 8px", borderRight: j < 9 ? "1px solid #eee" : "none" }}>&nbsp;</td>
                        ))}
                      </tr>
                    ))
                  : rows.map((row, i) => {
                      const moy = computeMoyenne(row);
                      const highlight = moy >= 10 ? "#f0fdf4" : "#fff5f5";
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid #eee",
                            background: activeSemestre ? highlight : "#fff",
                            transition: "background 0.2s",
                          }}
                        >
                          <td style={{ padding: "13px 12px", fontWeight: 600, color: "#222", borderRight: "1px solid #eee" }}>{row.matiere}</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#444", borderRight: "1px solid #eee" }}>{row.tps ?? "—"}</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#888", fontSize: "12px", borderRight: "1px solid #eee" }}>{row.tpsPct}%</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#444", borderRight: "1px solid #eee" }}>{row.projet ?? "—"}</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#888", fontSize: "12px", borderRight: "1px solid #eee" }}>{row.projetPct}%</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#444", borderRight: "1px solid #eee" }}>{row.cc1 ?? "—"}</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#888", fontSize: "12px", borderRight: "1px solid #eee" }}>{row.cc1Pct}%</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#444", borderRight: "1px solid #eee" }}>{row.cc2 ?? "—"}</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", color: "#888", fontSize: "12px", borderRight: "1px solid #eee" }}>{row.cc2Pct}%</td>
                          <td style={{ padding: "13px 8px", textAlign: "center", fontWeight: 700, color: moy >= 10 ? "#16a34a" : "#dc2626" }}>{moy.toFixed(2)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Semester average */}
          <div style={{ marginTop: "28px", textAlign: "right" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#555", marginBottom: "6px" }}>
              Moyenne du semestre
            </p>
            <p style={{ fontSize: "38px", fontWeight: 700, color: semesterAvg !== null && semesterAvg < 10 ? "#dc2626" : "#111" }}>
              {semesterAvg !== null ? `${semesterAvg.toFixed(2)} / 20` : "/ 20"}
            </p>
            {mention && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#fff",
                  background: mention.color,
                  letterSpacing: "0.03em",
                }}
              >
                {mention.label}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}