"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AffectationEtudiantsPage() {
  const searchParams = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [affectes, setAffectes] = useState([]);
  const [anneeId, setAnneeId] = useState(searchParams.get("anneeId") || "");
  const [classeId, setClasseId] = useState(searchParams.get("classeId") || "");
  const [groupeId, setGroupeId] = useState("");
  const [lignes, setLignes] = useState([""]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const requestedAnneeId = searchParams.get("anneeId");
    const requestedClasseId = searchParams.get("classeId");

    apiFetch("/api/admin/annees")
      .then((res) => {
        const annees = res.data || [];
        const id = requestedAnneeId || annees[0]?.id || "";
        setAnneeId(id);
        return id;
      })
      .then((id) => {
        if (!id) return;
        return apiFetch(`/api/admin/classes?anneeId=${id}`);
      })
      .then((res) => {
        const data = res?.data || [];
        setClasses(data);
        const found = data.find((c) => String(c.id) === String(requestedClasseId));
        if (found) setClasseId(requestedClasseId);
        else if (data.length) setClasseId(data[0].id);
      })
      .catch(() => showToast("Erreur de chargement", "error"));
  }, [searchParams]);

  useEffect(() => {
    if (!classeId) return;
    apiFetch(`/api/admin/classes/${classeId}/groupes`)
      .then((res) => {
        const data = res.data || [];
        setGroupes(data);
        setGroupeId(data[0]?.id || "");
      })
      .catch(() => setGroupes([]));
  }, [classeId]);

  useEffect(() => {
    if (groupeId) chargerEtudiants();
  }, [groupeId]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function chargerEtudiants() {
    try {
      const [d, a] = await Promise.all([
        apiFetch("/api/admin/etudiants/disponibles"),
        apiFetch(`/api/admin/groupes/${groupeId}/etudiants`),
      ]);
      setDisponibles(d.data || []);
      setAffectes(a.data || []);
      setLignes([""]);
    } catch {
      setDisponibles([]);
      setAffectes([]);
    }
  }

  const selectedClasse = classes.find((c) => String(c.id) === String(classeId));
  const selectedGroupe = groupes.find((g) => String(g.id) === String(groupeId));

  const etudiantsOptions = useMemo(() => {
    const dejaChoisis = lignes.filter(Boolean).map(String);
    return disponibles.filter((e) => !dejaChoisis.includes(String(e.id)));
  }, [disponibles, lignes]);

  function ajouterLigne() {
    setLignes((prev) => [...prev, ""]);
  }

  function changerLigne(index, value) {
    setLignes((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  async function enregistrer() {
    if (!groupeId) return showToast("Choisir un groupe", "error");
    const ids = lignes.filter(Boolean).map(Number);
    if (!ids.length) return showToast("Choisir au moins un étudiant", "error");

    try {
      await apiFetch(`/api/admin/groupes/${groupeId}/etudiants`, {
        method: "POST",
        body: JSON.stringify({ etudiantIds: ids }),
      });
      showToast("Étudiants affectés avec succès");
      chargerEtudiants();
    } catch (e) {
      showToast(e.message || "Erreur d'enregistrement", "error");
    }
  }

  async function retirer(etudiantId) {
    try {
      await apiFetch(`/api/admin/etudiants/${etudiantId}/groupe`, { method: "DELETE" });
      showToast("Étudiant retiré du groupe");
      chargerEtudiants();
    } catch (e) {
      showToast(e.message || "Erreur", "error");
    }
  }

  return (
    <div className="relative max-w-xl">
      <h2 className="text-[16px] font-bold text-gray-900 mb-7">
        Classes - Ajout d'étudiants
      </h2>

      <p className="text-[13px] text-gray-800 mb-5">
        Étudiants en classe de{" "}
        <span className="font-bold">
          {selectedClasse ? `${selectedClasse.niveauNom} ${selectedClasse.specialiteNom}` : "..."}
        </span>{" "}
        {anneeId && <span>{classes[0]?.anneeLibelle || ""}</span>}
      </p>

      <div className="mb-5">
        <label className="block text-[11px] text-gray-600 mb-1">Choisir un groupe</label>
        <div className="flex items-center gap-2">
          <select
            value={groupeId}
            onChange={(e) => setGroupeId(e.target.value)}
            className="h-9 w-28 px-3 text-[12px] border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Groupe</option>
            {groupes.map((g, i) => (
              <option key={g.id} value={g.id}>{g.nom || `Groupe ${String.fromCharCode(65 + i)}`}</option>
            ))}
          </select>
          <button
            onClick={chargerEtudiants}
            className="h-9 px-4 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sélectionner
          </button>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 mb-5" />

      <div className="mb-3">
        <label className="block text-[12px] font-semibold text-gray-800 mb-2">Etudiants</label>

        <div className="space-y-1">
          {affectes.map((e) => (
            <div key={`a-${e.id}`} className="flex items-center gap-2">
              <div className="h-9 flex-1 px-3 border border-gray-300 rounded-md bg-gray-50 text-[12px] flex items-center">
                {e.nom} {e.prenom}
              </div>
              <button
                onClick={() => retirer(e.id)}
                className="h-9 px-3 text-[11px] text-red-500 border border-red-100 rounded-md hover:bg-red-50"
                title="Retirer du groupe"
              >
                ×
              </button>
            </div>
          ))}

          {lignes.map((value, index) => {
            const courant = disponibles.find((e) => String(e.id) === String(value));
            const options = courant ? [courant, ...etudiantsOptions] : etudiantsOptions;
            return (
              <select
                key={index}
                value={value}
                onChange={(e) => changerLigne(index, e.target.value)}
                className="h-9 w-full px-3 border border-gray-300 rounded-md bg-white text-[12px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Sélectionner un étudiant</option>
                {options.map((e) => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
                ))}
              </select>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end mb-5">
        <button
          onClick={ajouterLigne}
          className="h-7 px-3 text-[12px] text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          + Ajouter une ligne
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={enregistrer}
          className="h-10 px-7 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 text-sm text-white rounded-lg shadow-xl ${toast.type === "error" ? "bg-red-600" : "bg-gray-900"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
