"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ClassesPage() {
  const [annees,      setAnnees]      = useState([]);
  const [niveaux,     setNiveaux]     = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [anneeId,     setAnneeId]     = useState(null);
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);

  // ── Charger les données de référence au montage ───────────────────────────
  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/annees"),
      apiFetch("/api/admin/niveaux"),
      apiFetch("/api/admin/specialites"),
    ])
      .then(([a, n, s]) => {
        setAnnees(a.data || []);
        setNiveaux(n.data || []);
        setSpecialites(s.data || []);
        if (a.data?.length) setAnneeId(a.data[0].id);
      })
      .catch(() => showToast("Erreur de chargement", "error"));
  }, []);

  // ── Charger les classes quand l'année change ──────────────────────────────
  useEffect(() => {
    if (!anneeId) return;
    loadClasses(anneeId);
  }, [anneeId]);

  function loadClasses(id) {
    setLoading(true);
    apiFetch(`/api/admin/classes?anneeId=${id}`)
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { isNew: true, niveauId: "", specialiteId: "", groupes: 1 },
    ]);
  }

  function updateRow(i, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  async function removeRow(i) {
    const row = rows[i];
    if (row.id) {
      try {
        await apiFetch(`/api/admin/classes/${row.id}`, { method: "DELETE" });
        showToast("Classe supprimée");
      } catch (e) {
        showToast(e.message, "error");
        return;
      }
    }
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    const newRows = rows.filter((r) => r.isNew);
    if (!newRows.length) {
      showToast("Aucune nouvelle ligne à enregistrer");
      return;
    }
    setSaving(true);
    try {
      for (const row of newRows) {
        if (!row.niveauId || !row.specialiteId) {
          throw new Error("Niveau et spécialité sont obligatoires");
        }
        await apiFetch("/api/admin/classes", {
          method: "POST",
          body: JSON.stringify({
            niveauId:     parseInt(row.niveauId),
            specialiteId: parseInt(row.specialiteId),
            groupes:      parseInt(row.groupes) || 1,
            anneeId:      anneeId,
          }),
        });
      }
      showToast("Classes enregistrées avec succès");
      loadClasses(anneeId);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">

      {/* Titre */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[17px] font-semibold text-gray-900">Classes</h2>
        <span className="text-[11px] font-bold font-mono bg-blue-50 text-blue-600
                         border border-blue-200 rounded-full px-2.5 py-0.5">
          {rows.filter(r => !r.isNew).length}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Sélecteur année */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Année scolaire
        </label>
        <select
          value={anneeId || ""}
          onChange={(e) => setAnneeId(parseInt(e.target.value))}
          className="h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {annees.map((a) => (
            <option key={a.id} value={a.id}>{a.libelle}</option>
          ))}
        </select>
        <button
          onClick={() => loadClasses(anneeId)}
          className="h-9 px-4 text-sm font-semibold text-white bg-blue-600
                     rounded-lg hover:bg-blue-700 transition-all"
        >
          Sélectionner
        </button>
      </div>

      <div className="border-t border-dashed border-gray-200 mb-4" />

      {/* En-têtes colonnes */}
      <div className="grid grid-cols-[1.2fr_2fr_110px_56px_40px] gap-3 px-1 pb-2 mb-2
                      border-b border-gray-200 text-[11px] font-bold uppercase
                      tracking-widest text-gray-400 font-mono">
        <span>Niveau</span>
        <span>Spécialité</span>
        <span>Groupes</span>
        <span className="text-center">Étudiants</span>
        <span />
      </div>

      {/* Lignes */}
      {loading ? (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="4"/>
            <path fill="#9ca3af" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Chargement...
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8 italic">
              Aucune classe pour cette année — cliquez sur "Ajouter une ligne"
            </div>
          )}

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.2fr_2fr_110px_56px_40px] gap-3 items-center
                         animate-[rowIn_0.18s_ease]"
            >
              {/* Niveau */}
              {row.isNew ? (
                <select
                  value={row.niveauId || ""}
                  onChange={(e) => updateRow(i, "niveauId", e.target.value)}
                  className="h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Niveau</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>{n.nom}</option>
                  ))}
                </select>
              ) : (
                <div className="h-9 px-3 text-sm border border-gray-200 rounded-lg
                                bg-gray-50 text-gray-600 flex items-center">
                  {row.niveauNom}
                </div>
              )}

              {/* Spécialité */}
              {row.isNew ? (
                <select
                  value={row.specialiteId || ""}
                  onChange={(e) => updateRow(i, "specialiteId", e.target.value)}
                  className="h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Spécialité</option>
                  {specialites.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              ) : (
                <div className="h-9 px-3 text-sm border border-gray-200 rounded-lg
                                bg-gray-50 text-gray-600 flex items-center">
                  {row.specialiteNom}
                </div>
              )}

              {/* Groupes */}
              <select
                value={row.groupes || 1}
                disabled={!row.isNew}
                onChange={(e) => updateRow(i, "groupes", e.target.value)}
                className={[
                  "h-9 px-3 text-sm border rounded-lg transition-all",
                  "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  row.isNew
                    ? "border-gray-300 bg-white text-gray-900"
                    : "border-gray-200 bg-gray-50 text-gray-600",
                ].join(" ")}
              >
                {[1,2,3,4,5,6,7,8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              {/* Affecter étudiants */}
              {row.id ? (
                <Link
                  href={`/admin/classes/affectation?classeId=${row.id}&anneeId=${anneeId}`}
                  title="Affecter les étudiants aux groupes"
                  className="w-9 h-9 flex items-center justify-center border border-gray-200
                             rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600
                             hover:border-blue-200 transition-all text-lg"
                >
                  🎓
                </Link>
              ) : (
                <div title="Enregistrez d'abord la classe" className="w-9 h-9 flex items-center justify-center border border-gray-100
                                rounded-lg text-gray-300 text-lg bg-gray-50">
                  🎓
                </div>
              )}

              {/* Supprimer */}
              <button
                onClick={() => removeRow(i)}
                className="w-9 h-9 flex items-center justify-center border border-gray-200
                           rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500
                           hover:border-red-200 transition-all text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-200">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium
                     text-gray-600 bg-white border border-gray-300 rounded-lg
                     hover:bg-gray-50 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Ajouter une ligne
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold
                     text-white bg-blue-600 rounded-lg hover:bg-blue-700
                     disabled:opacity-50 transition-all"
        >
          {saving ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
              <path fill="white" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 6.5l3 3 6-6" stroke="white" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={[
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3",
          "text-[13px] font-medium text-white rounded-lg shadow-xl",
          toast.type === "success" ? "bg-gray-900" : "bg-red-600",
        ].join(" ")}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}