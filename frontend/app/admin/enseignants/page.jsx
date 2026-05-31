"use client";

import { useEffect, useState } from "react";
import ReferentielTable from "@/components/ReferentielTable";
import { getEnseignants, createEnseignant } from "@/lib/api";

const COLUMNS = [
  { key: "nom", label: "Nom", placeholder: "Nom" },
  { key: "prenom", label: "Prénom", placeholder: "Prénom" },
];

export default function EnseignantsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getEnseignants()
      .then((res) => {
        setRows(
          (res.data ?? []).map((u) => ({
            id: u.id,
            nom: u.nom ?? "",
            prenom: u.prenom ?? "",
            email: u.email,
          }))
        );
      })
      .catch(() => {
        setRows([
          {
            id: 1,
            nom: "Test",
            prenom: "User",
            email: "test@test.com",
          },
        ]);
      });
  }, []);

  async function handleSave(newRows) {
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

    const res = await getEnseignants();
    setRows(res.data ?? []);
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