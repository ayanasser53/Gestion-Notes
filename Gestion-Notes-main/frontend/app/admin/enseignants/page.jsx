"use client";

import { useEffect, useState } from "react";
import ReferentielTable from "@/components/ReferentielTable";
import { getEnseignants, createEnseignant } from "@/lib/api";

const COLUMNS = [
  { key: "nom", label: "Nom", placeholder: "Nom" },
  { key: "prenom", label: "Prénom", placeholder: "Prénom" },
  { key: "email", label: "Email", placeholder: "Email" },
];

export default function EnseignantsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const res = await getEnseignants();

      // SAFE ACCESS (backend returns { data: [...] })
      const data = res?.data?.data || [];

      setRows(
        data.map((u) => ({
          id: u.id,
          nom: u.nom || "",
          prenom: u.prenom || "",
          email: u.email || "",
        }))
      );
    } catch (err) {
      console.error("Error loading enseignants:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // ================= SAVE DATA =================
  async function handleSave(newRows) {
    try {
      for (const row of newRows) {
        if (!row.tempEmail || !row.tempPassword) {
          throw new Error("Email et mot de passe requis");
        }

        await createEnseignant({
          email: row.tempEmail,
          password: row.tempPassword,
          nom: row.nom,
          prenom: row.prenom,
        });
      }

      await loadData();
    } catch (err) {
      console.error("Error saving enseignants:", err);
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <ReferentielTable
      title="Enseignants"
      columns={COLUMNS}
      initialRows={rows}
      onSave={handleSave}
    />
  );
}