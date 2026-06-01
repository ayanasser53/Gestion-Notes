"use client";

import { useEffect, useState } from "react";
import { getMatieres, createMatiere, deleteMatiere, getEnseignants } from "@/lib/api";

export default function MatieresPage() {
  const [rows, setRows] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMatieres()
      .then((res) => setRows(res.data ?? []))
      .catch(() => setRows([]));

    getEnseignants()
      .then((res) => setEnseignants(res.data ?? []))
      .catch(() => setEnseignants([]));
  }, []);

  function addLine() {
    setNewRows((prev) => [
      ...prev,
      { tempId: Date.now(), intitule: "", enseignantId: "" },
    ]);
  }

  function updateNewRow(tempId, field, value) {
    setNewRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      for (const row of newRows) {
        if (!row.intitule) {
          setMessage("L'intitulé est obligatoire !");
          setSaving(false);
          return;
        }
        await createMatiere({
          intitule: row.intitule,
          enseignantId: row.enseignantId || null,
        });
      }
      const res = await getMatieres();
      setRows(res.data ?? []);
      setNewRows([]);
      setMessage("Enregistré avec succès ✅");
    } catch (e) {
      setMessage(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMatiere(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setMessage(e.message || "Erreur suppression");
    }
  }

  function getEnseignantNom(enseignantId) {
    const e = enseignants.find((e) => e.id === enseignantId);
    return e ? `Pr. ${e.nom}` : "—";
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-[20px] font-bold text-black mb-6">Matières</h2>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-sm font-medium ${
          message.includes("✅")
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}>
          {message}
        </div>
      )}

      <div className="border border-gray-300 rounded overflow-hidden mb-4">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="text-left px-4 py-3 font-semibold">Intitulé</th>
              <th className="text-left px-4 py-3 font-semibold">Enseignée par</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{row.intitule}</td>
                <td className="px-4 py-2 text-gray-700">
                  {getEnseignantNom(row.enseignantId)}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}

            {newRows.map((row) => (
              <tr key={row.tempId} className="border-b border-gray-200 bg-blue-50">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.intitule}
                    onChange={(e) => updateNewRow(row.tempId, "intitule", e.target.value)}
                    placeholder="Intitulé de la matière"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-[13px] outline-none focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={row.enseignantId}
                    onChange={(e) => updateNewRow(row.tempId, "enseignantId", e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-[13px] outline-none focus:border-blue-500"
                  >
                    <option value="">Enseignée par</option>
                    {enseignants.map((e) => (
                      <option key={e.id} value={e.id}>
                        Pr. {e.nom} {e.prenom}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() =>
                      setNewRows((prev) =>
                        prev.filter((r) => r.tempId !== row.tempId)
                      )
                    }
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={addLine}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-[13px] hover:bg-gray-50 transition"
        >
          + Ajouter une ligne
        </button>
        <button
          onClick={handleSave}
          disabled={saving || newRows.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-[13px] font-semibold transition disabled:opacity-40"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}