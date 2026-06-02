"use client";

import { useEffect, useState } from "react";
import ReferentielTable from "@/components/ReferentielTable";
import { getEtudiants, createEtudiant } from "@/lib/api";

const COLUMNS = [
  { key: "matricule", label: "Matricule", placeholder: "Auto généré", width: "120px" },
  { key: "nom", label: "Nom", placeholder: "Nom" },
  { key: "prenom", label: "Prénom", placeholder: "Prénom" },
];

export default function EtudiantsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getEtudiants()
      .then((res) => {
        setRows(res.data ?? res);
      })
      .catch(() => setRows([]));
  }, []);

  async function handleSave(newRows) {
    for (const row of newRows) {
      const res = await createEtudiant({
        email: row.tempEmail,
        password: row.tempPassword,
        nom: row.nom,
        prenom: row.prenom,
      });

      const created = res.data ?? res;

      setRows((prev) => [
        ...prev,
        {
          id: created.id,
          matricule: created.matricule,
          nom: row.nom,
          prenom: row.prenom,
          email: row.tempEmail,
        },
      ]);
    }
  }

  return (
    <ReferentielTable
      title="Étudiants"
      columns={COLUMNS}
      initialRows={rows}
      onSave={handleSave}
    />
  );
}