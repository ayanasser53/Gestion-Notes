import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8081/api/admin";

// ─── helpers ────────────────────────────────────────────────────────────────
const get  = (url) => fetch(url).then(r => r.json());
const post = (url, body) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
const del  = (url) => fetch(url, { method: "DELETE" }).then(r => r.json());

// ─── styles (matching the app's white/blue ENSIAS palette) ──────────────────
const s = {
  page: { padding: "32px 40px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e", maxWidth: 1000 },
  h1:   { fontSize: 26, fontWeight: 700, marginBottom: 28, color: "#1a1a2e" },

  // Filter bar
  filterBar: { display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "flex-end" },
  label: { fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" },
  select: {
    height: 42, border: "1.5px solid #d0d5dd", borderRadius: 8, padding: "0 12px",
    fontSize: 14, color: "#333", background: "#fff", cursor: "pointer", minWidth: 170
  },

  // Add form card
  card: {
    background: "#fff", border: "1.5px solid #e4e7ec", borderRadius: 12,
    padding: "24px 28px", marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,.06)"
  },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#0066cc" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  input: {
    height: 42, border: "1.5px solid #d0d5dd", borderRadius: 8, padding: "0 12px",
    fontSize: 14, color: "#333", width: "100%", boxSizing: "border-box"
  },
  btnPrimary: {
    height: 42, background: "#0074d9", color: "#fff", border: "none",
    borderRadius: 8, padding: "0 24px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", marginTop: 18
  },
  btnDanger: {
    height: 30, background: "transparent", color: "#e03131", border: "1.5px solid #e03131",
    borderRadius: 6, padding: "0 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
  },
  btnSecondary: {
    height: 42, background: "#f1f5f9", color: "#333", border: "1.5px solid #d0d5dd",
    borderRadius: 8, padding: "0 18px", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 18
  },

  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    background: "#f8fafc", borderBottom: "2px solid #e4e7ec", padding: "10px 14px",
    textAlign: "left", fontWeight: 600, color: "#555", fontSize: 13
  },
  td: { padding: "11px 14px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  badge: {
    display: "inline-block", background: "#e8f4fd", color: "#0066cc",
    borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600
  },
  emptyMsg: { textAlign: "center", padding: 40, color: "#999", fontSize: 14 },
  alert: {
    background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8,
    padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#856404"
  },
  success: {
    background: "#d4edda", border: "1px solid #28a745", borderRadius: 8,
    padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#155724"
  },
};

// ─── blank row ───────────────────────────────────────────────────────────────
const blankRow = () => ({
  classeId: "", groupeId: "", matiereId: "", enseignantId: "",
  coeffTps: 0, coeffProjet: 0, coeffCtrl1: 1, coeffCtrl2: 1
});

export default function PlanificationPage() {
  // ── reference data ──
  const [annees,      setAnnees]      = useState([]);
  const [semestres,   setSemestres]   = useState([]);
  const [classes,     setClasses]     = useState([]);
  const [groupes,     setGroupes]     = useState({});   // { classeId: [...] }
  const [matieres,    setMatieres]    = useState([]);
  const [enseignants, setEnseignants] = useState([]);

  // ── filter state ──
  const [selAnnee,    setSelAnnee]    = useState("");
  const [selSemestre, setSelSemestre] = useState("");

  // ── planification list ──
  const [planifs, setPlanifs] = useState([]);

  // ── add-form rows ──
  const [rows,  setRows]  = useState([blankRow()]);
  const [msg,   setMsg]   = useState(null);   // { type: "ok"|"err", text }
  const [saving, setSaving] = useState(false);

  // ── load static lists on mount ──
  useEffect(() => {
    get(`${API}/annees`).then(r => setAnnees(r.data || []));
    get(`${API}/matieres`).then(r => setMatieres(r.data || []));
    get(`${API}/enseignants`).then(r => setEnseignants(r.data || []));
  }, []);

  // ── when annee changes → load semestres + classes ──
  useEffect(() => {
    if (!selAnnee) { setSemestres([]); setClasses([]); setSelSemestre(""); return; }
    get(`${API}/semestres?anneeId=${selAnnee}`).then(r => setSemestres(r.data || []));
    get(`${API}/classes?anneeId=${selAnnee}`).then(r => setClasses(r.data || []));
    setSelSemestre("");
    setPlanifs([]);
  }, [selAnnee]);

  // ── when semestre changes → load planifications ──
  useEffect(() => {
    if (!selSemestre) { setPlanifs([]); return; }
    get(`${API}/planifications?semestreId=${selSemestre}`).then(r => setPlanifs(r.data || []));
  }, [selSemestre]);

  // ── load groupes for a classe when a row changes ──
  const loadGroupes = useCallback((classeId) => {
    if (!classeId || groupes[classeId]) return;
    get(`${API}/classes/${classeId}/groupes`).then(r =>
      setGroupes(prev => ({ ...prev, [classeId]: r.data || [] }))
    );
  }, [groupes]);

  // ── row helpers ──
  const updateRow = (i, field, value) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "classeId") { next[i].groupeId = ""; loadGroupes(value); }
      return next;
    });
  };

  const addRow    = () => setRows(r => [...r, blankRow()]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  // ── save ──
  const handleSave = async () => {
    if (!selSemestre) { setMsg({ type: "err", text: "Veuillez sélectionner un semestre." }); return; }
    const invalid = rows.find(r => !r.groupeId || !r.matiereId || !r.enseignantId);
    if (invalid) { setMsg({ type: "err", text: "Complétez tous les champs obligatoires." }); return; }

    setSaving(true);
    setMsg(null);
    let errors = [];

    for (const row of rows) {
      const res = await post(`${API}/planifications`, {
        semestreId:   parseInt(selSemestre),
        groupeId:     parseInt(row.groupeId),
        matiereId:    parseInt(row.matiereId),
        enseignantId: parseInt(row.enseignantId),
        coeffTps:     parseInt(row.coeffTps)    || 0,
        coeffProjet:  parseInt(row.coeffProjet) || 0,
        coeffCtrl1:   parseInt(row.coeffCtrl1)  || 0,
        coeffCtrl2:   parseInt(row.coeffCtrl2)  || 0,
      });
      if (res.error) errors.push(res.error);
    }

    // Refresh list
    const refreshed = await get(`${API}/planifications?semestreId=${selSemestre}`);
    setPlanifs(refreshed.data || []);
    setRows([blankRow()]);
    setSaving(false);

    if (errors.length) {
      setMsg({ type: "err", text: errors.join(" | ") });
    } else {
      setMsg({ type: "ok", text: `${rows.length} planification(s) enregistrée(s) avec succès.` });
    }
  };

  // ── delete ──
  const handleDelete = async (id) => {
    await del(`${API}/planifications/${id}`);
    setPlanifs(p => p.filter(x => x.id !== id));
  };

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Planification</h1>

      {/* ── Filter bar ── */}
      <div style={s.filterBar}>
        <div>
          <label style={s.label}>Année universitaire</label>
          <select style={s.select} value={selAnnee} onChange={e => setSelAnnee(e.target.value)}>
            <option value="">-- Sélectionner --</option>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Semestre</label>
          <select style={s.select} value={selSemestre} onChange={e => setSelSemestre(e.target.value)}
                  disabled={!selAnnee}>
            <option value="">-- Sélectionner --</option>
            {semestres.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </div>
      </div>

      {/* ── Alert / success ── */}
      {msg && (
        <div style={msg.type === "ok" ? s.success : s.alert}>{msg.text}</div>
      )}

      {/* ── Add-rows form ── */}
      {selSemestre && (
        <div style={s.card}>
          <div style={s.cardTitle}>➕ Ajouter des planifications</div>

          {rows.map((row, i) => (
            <div key={i} style={{ ...s.formGrid, marginBottom: 12, position: "relative" }}>
              {/* Classe */}
              <div>
                <label style={s.label}>Classe *</label>
                <select style={s.select} value={row.classeId}
                        onChange={e => updateRow(i, "classeId", e.target.value)}>
                  <option value="">-- Classe --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.niveauNom} – {c.specialiteNom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Groupe */}
              <div>
                <label style={s.label}>Groupe *</label>
                <select style={s.select} value={row.groupeId}
                        onChange={e => updateRow(i, "groupeId", e.target.value)}
                        disabled={!row.classeId}>
                  <option value="">-- Groupe --</option>
                  {(groupes[row.classeId] || []).map(g => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
              </div>

              {/* Matière */}
              <div>
                <label style={s.label}>Matière *</label>
                <select style={s.select} value={row.matiereId}
                        onChange={e => updateRow(i, "matiereId", e.target.value)}>
                  <option value="">-- Matière --</option>
                  {matieres.map(m => (
                    <option key={m.id} value={m.id}>{m.intitule}</option>
                  ))}
                </select>
              </div>

              {/* Enseignant */}
              <div>
                <label style={s.label}>Enseignant *</label>
                <select style={s.select} value={row.enseignantId}
                        onChange={e => updateRow(i, "enseignantId", e.target.value)}>
                  <option value="">-- Enseignant --</option>
                  {enseignants.map(e => (
                    <option key={e.id} value={e.id}>Pr. {e.nom}</option>
                  ))}
                </select>
              </div>

              {/* Coefficients */}
              <div>
                <label style={s.label}>Coeff TP</label>
                <input style={s.input} type="number" min="0" value={row.coeffTps}
                       onChange={e => updateRow(i, "coeffTps", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Coeff Projet</label>
                <input style={s.input} type="number" min="0" value={row.coeffProjet}
                       onChange={e => updateRow(i, "coeffProjet", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Coeff Ctrl 1</label>
                <input style={s.input} type="number" min="0" value={row.coeffCtrl1}
                       onChange={e => updateRow(i, "coeffCtrl1", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Coeff Ctrl 2</label>
                <input style={s.input} type="number" min="0" value={row.coeffCtrl2}
                       onChange={e => updateRow(i, "coeffCtrl2", e.target.value)} />
              </div>

              {/* Remove row */}
              {rows.length > 1 && (
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button style={s.btnDanger} onClick={() => removeRow(i)}>✕ Retirer</button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button style={s.btnSecondary} onClick={addRow}>+ Ajouter une ligne</button>
            <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* ── Existing planifications table ── */}
      {selSemestre && (
        <div style={s.card}>
          <div style={s.cardTitle}>📋 Planifications existantes</div>
          {planifs.length === 0 ? (
            <div style={s.emptyMsg}>Aucune planification pour ce semestre.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Classe", "Groupe", "Matière", "Enseignant",
                    "C.TPS", "C.Proj", "C.Ctrl1", "C.Ctrl2", "Action"]
                    .map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {planifs.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{p.classeNom}</td>
                    <td style={s.td}><span style={s.badge}>{p.groupeNom}</span></td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{p.matiereIntitule}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{p.matiereCode}</div>
                    </td>
                    <td style={s.td}>Pr. {p.enseignantNom}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>{p.coeffTps}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>{p.coeffProjet}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>{p.coeffCtrl1}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>{p.coeffCtrl2}</td>
                    <td style={s.td}>
                      <button style={s.btnDanger} onClick={() => handleDelete(p.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selSemestre && (
        <div style={{ ...s.emptyMsg, marginTop: 60 }}>
          Sélectionnez une année et un semestre pour gérer les planifications.
        </div>
      )}
    </div>
  );
}