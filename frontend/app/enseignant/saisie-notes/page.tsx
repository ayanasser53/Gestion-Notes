"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "/api/enseignant";

// Always send JWT token with every request
function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

interface SelectOption { id: number; nom?: string; intitule?: string }
interface NoteRow {
  etudiantId: number;
  matricule: string;
  nom: string;
  prenom: string;
  noteTps: string;
  noteProjet: string;
  noteCtrl1: string;
  noteCtrl2: string;
  moyenne: string | null;
}
interface Coeffs { coeffTps: number; coeffProjet: number; coeffCtrl1: number; coeffCtrl2: number }
interface Planification {
  planifId: number;
  matiereId: number;
  matiere: string;
  groupeId: number;
  groupe: string;
  classeId: number;
  classe: string;
  coeffTps: number;
  coeffProjet: number;
  coeffCtrl1: number;
  coeffCtrl2: number;
}

export default function SaisieNotesPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLSpanElement>(null);
  const [enseignantId, setEnseignantId] = useState<number | null>(null);

  // Filter options
  const [semestres, setSemestres] = useState<SelectOption[]>([]);
  const [matieres, setMatieres] = useState<SelectOption[]>([]);
  const [groupes, setGroupes] = useState<SelectOption[]>([]);

  // Selected values
  const [selSemestre, setSelSemestre] = useState("");
  const [selMatiere, setSelMatiere] = useState("");
  const [selGroupe, setSelGroupe] = useState("");

  // Table data
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [coeffs, setCoeffs] = useState<Coeffs | null>(null);
  const [planifId, setPlanifId] = useState<number | null>(null);
  const [planifications, setPlanifications] = useState<Planification[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [tableLoaded, setTableLoaded] = useState(false);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "enseignant") { router.push("/"); return; }
    if (emailRef.current) emailRef.current.textContent = localStorage.getItem("email") ?? "";

    const id = Number(localStorage.getItem("enseignantId"));
    if (!id) { router.push("/"); return; }
    setEnseignantId(id);
  }, [router]);

  // Load filters once we have enseignantId
  useEffect(() => {
    if (!enseignantId) return;
    authFetch(`${API}/${enseignantId}/filters`)
      .then(r => r.json())
      .then(data => {
        setSemestres(data.semestres ?? []);
        setMatieres(data.matieres ?? []);
        setGroupes(data.groupes ?? []);
      })
      .catch(() => setMessage({ text: "Erreur lors du chargement des filtres.", type: "error" }));
  }, [enseignantId]);

  // Load planifications when semestre changes (to filter matieres/groupes)
  useEffect(() => {
    if (!enseignantId || !selSemestre) return;
    authFetch(`${API}/${enseignantId}/planifications/semestre?semestreId=${selSemestre}`)
      .then(r => r.json())
      .then(data => setPlanifications(data.data ?? []))
      .catch(() => {});
  }, [enseignantId, selSemestre]);

  // Derived filtered options based on selected semestre
  const filteredMatieres = selSemestre
    ? [...new Map(planifications.map(p => [p.matiereId, { id: p.matiereId, intitule: p.matiere }])).values()]
    : matieres;

  const filteredGroupes = selMatiere
    ? [...new Map(
        planifications
          .filter(p => String(p.matiereId) === selMatiere)
          .map(p => [p.groupeId, { id: p.groupeId, nom: p.groupe }])
      ).values()]
    : groupes;

  // Find planification id from selected filters
  const findPlanifId = useCallback(() => {
    const match = planifications.find(
      p => String(p.matiereId) === selMatiere && String(p.groupeId) === selGroupe
    );
    return match?.planifId ?? null;
  }, [planifications, selMatiere, selGroupe]);

  const handleSelect = async () => {
    if (!selSemestre || !selMatiere || !selGroupe) {
      setMessage({ text: "Veuillez sélectionner Semestre, Matière et Groupe.", type: "error" });
      return;
    }
    const pid = findPlanifId();
    if (!pid) {
      setMessage({ text: "Aucune planification trouvée pour cette combinaison.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await authFetch(`${API}/planifications/${pid}/notes`);
      const data = await res.json();
      setPlanifId(pid);
      setCoeffs({
        coeffTps: data.coeffTps,
        coeffProjet: data.coeffProjet,
        coeffCtrl1: data.coeffCtrl1,
        coeffCtrl2: data.coeffCtrl2,
      });
      setNotes((data.data ?? []).map((e: any) => ({
        etudiantId: e.etudiantId,
        matricule: e.matricule,
        nom: e.nom,
        prenom: e.prenom,
        noteTps: e.noteTps != null ? String(e.noteTps) : "",
        noteProjet: e.noteProjet != null ? String(e.noteProjet) : "",
        noteCtrl1: e.noteCtrl1 != null ? String(e.noteCtrl1) : "",
        noteCtrl2: e.noteCtrl2 != null ? String(e.noteCtrl2) : "",
        moyenne: e.moyenne != null ? String(e.moyenne) : null,
      })));
      setTableLoaded(true);
    } catch {
      setMessage({ text: "Erreur lors du chargement des notes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Compute moyenne locally for display (using coeffs from backend)
  const computeMoyenne = (row: NoteRow): string => {
    if (!coeffs) return "—";
    // Coefficients are percentages that sum to 100
    let total = 0, usedCoeff = 0;
    const add = (val: string, c: number) => {
      const n = parseFloat(val);
      if (!isNaN(n)) { total += n * c; usedCoeff += c; }
    };
    add(row.noteTps,    coeffs.coeffTps);
    add(row.noteProjet, coeffs.coeffProjet);
    add(row.noteCtrl1,  coeffs.coeffCtrl1);
    add(row.noteCtrl2,  coeffs.coeffCtrl2);
    // Normalise by the used portion so partial entry still gives a meaningful preview
    return usedCoeff === 0 ? "—" : (total / usedCoeff).toFixed(2);
  };

  const handleNoteChange = (idx: number, field: keyof NoteRow, value: string) => {
    setNotes(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    if (!planifId) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        notes: notes.map(r => ({
          etudiantId: r.etudiantId,
          noteTps: r.noteTps !== "" ? parseFloat(r.noteTps) : null,
          noteProjet: r.noteProjet !== "" ? parseFloat(r.noteProjet) : null,
          noteCtrl1: r.noteCtrl1 !== "" ? parseFloat(r.noteCtrl1) : null,
          noteCtrl2: r.noteCtrl2 !== "" ? parseFloat(r.noteCtrl2) : null,
        })),
      };
      const res = await authFetch(`${API}/planifications/${planifId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message ?? "Notes enregistrées avec succès.", type: "success" });
        // Refresh to get updated moyennes from backend
        await handleSelect();
      } else {
        setMessage({ text: data.error ?? "Erreur lors de l'enregistrement.", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur réseau lors de l'enregistrement.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex justify-center items-start py-3">
      <div className="w-[760px] min-h-[1000px] border border-black bg-white">

        {/* Header */}
<header className="h-[48px] border-b border-gray-400 flex items-center justify-between px-8">
  <span className="text-[20px] text-gray-800">Bulletins étudiant</span>
  <div className="flex items-center gap-3">
    <span className="text-[15px] text-gray-700">
      Bienvenue Pr. <span ref={emailRef}></span>
    </span>
    {/* ENSIAS logo — scaled down for header */}
    <div className="flex flex-col items-center">
      <div className="relative w-[24px] h-[21px]">
        <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[21px] border-l-transparent border-r-transparent border-b-red-500" />
      </div>
      <div className="border-t border-b border-red-500 px-[2px] leading-none">
        <span className="text-red-500 tracking-[0.2em] text-[8px] font-normal pl-[1px]">ENSIAS</span>
      </div>
    </div>
  </div>
</header>

        <div className="px-8 pt-6">
          <h2 className="text-[22px] font-bold text-black mb-6">Saisie des notes</h2>

          {/* Filters */}
          <div className="flex gap-4 mb-4 flex-wrap">
            {/* Semestre */}
            <div>
              <label className="block text-[13px] text-gray-500 mb-1">Semestre</label>
              <select
                value={selSemestre}
                onChange={e => { setSelSemestre(e.target.value); setSelMatiere(""); setSelGroupe(""); setTableLoaded(false); }}
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-black outline-none focus:border-blue-500"
              >
                <option value="">Semestre</option>
                {semestres.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>

            {/* Matière */}
            <div>
              <label className="block text-[13px] text-gray-500 mb-1">Matière</label>
              <select
                value={selMatiere}
                onChange={e => { setSelMatiere(e.target.value); setSelGroupe(""); setTableLoaded(false); }}
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-black outline-none focus:border-blue-500"
                disabled={!selSemestre}
              >
                <option value="">Matière</option>
                {filteredMatieres.map(m => <option key={m.id} value={m.id}>{m.intitule}</option>)}
              </select>
            </div>

            {/* Groupe */}
            <div>
              <label className="block text-[13px] text-gray-500 mb-1">Groupe</label>
              <select
                value={selGroupe}
                onChange={e => { setSelGroupe(e.target.value); setTableLoaded(false); }}
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-black outline-none focus:border-blue-500"
                disabled={!selMatiere}
              >
                <option value="">Groupe</option>
                {filteredGroupes.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSelect}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded text-[14px] font-semibold transition"
              >
                {loading ? "Chargement…" : "Sélectionner"}
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 px-4 py-2 rounded text-[13px] font-medium ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-300" : "bg-red-50 text-red-700 border border-red-300"
            }`}>
              {message.text}
            </div>
          )}

          {/* Table */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-left px-4 py-3 font-semibold">Etudiant</th>
                  <th className="text-center px-4 py-3 font-semibold">
                    TPs {coeffs ? <span className="text-gray-400 text-[11px]">×{coeffs.coeffTps}</span> : ""}
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Projet {coeffs ? <span className="text-gray-400 text-[11px]">×{coeffs.coeffProjet}</span> : ""}
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Contrôle 1 {coeffs ? <span className="text-gray-400 text-[11px]">×{coeffs.coeffCtrl1}</span> : ""}
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Contrôle 2 {coeffs ? <span className="text-gray-400 text-[11px]">×{coeffs.coeffCtrl2}</span> : ""}
                  </th>
                  <th className="text-center px-4 py-3 font-bold">Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {tableLoaded && notes.length > 0 ? (
                  notes.map((row, i) => {
                    const moy = computeMoyenne(row);
                    const moyNum = parseFloat(moy);
                    return (
                      <tr key={row.etudiantId} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-[13px]">
                          <span className="font-medium text-gray-800">{row.nom} {row.prenom}</span>
                          <span className="ml-2 text-gray-400 text-[11px]">{row.matricule}</span>
                        </td>
                        {(["noteTps", "noteProjet", "noteCtrl1", "noteCtrl2"] as const).map(field => (
                          <td key={field} className="px-4 py-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.25"
                              value={row[field]}
                              onChange={e => handleNoteChange(i, field, e.target.value)}
                              className="w-[60px] border border-gray-300 rounded px-2 py-1 text-center text-[13px] outline-none focus:border-blue-500"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center font-bold">
                          <span className={
                            isNaN(moyNum) ? "text-gray-400" :
                            moyNum >= 10 ? "text-green-600" : "text-red-500"
                          }>
                            {moy}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : tableLoaded && notes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-[13px]">
                      Aucun étudiant trouvé pour cette planification.
                    </td>
                  </tr>
                ) : (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-gray-400 text-[13px]">—</td>
                      {["tps", "projet", "ctrl1", "ctrl2"].map(field => (
                        <td key={field} className="px-4 py-2 text-center">
                          <input
                            type="number" min="0" max="20" disabled
                            className="w-[60px] border border-gray-200 rounded px-2 py-1 text-center text-[13px] outline-none bg-gray-50 text-gray-300 cursor-not-allowed"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center font-bold text-gray-300">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-4 mb-6">
            <button
              onClick={handleSave}
              disabled={!tableLoaded || saving || notes.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded text-[14px] font-semibold transition"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}