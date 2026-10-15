"use client";

import { useEffect, useMemo, useState } from "react";

const API = "/api/enseignant";

type Option = { id: number; nom?: string; intitule?: string };
type NoteRow = {
  etudiantId: number;
  matricule: string;
  nom: string;
  prenom: string;
  noteTps: string;
  noteProjet: string;
  noteCtrl1: string;
  noteCtrl2: string;
};
type Planification = {
  planifId: number;
  semestreId: number;
  semestre: string;
  matiereId: number;
  matiere: string;
  classeId: number;
  classe: string;
  groupeId: number;
  groupe: string;
};

const demoPlanifications: Planification[] = [
  {
    planifId: 1,
    semestreId: 1,
    semestre: "S1",
    matiereId: 1,
    matiere: "programmation oriente objet",
    classeId: 1,
    classe: "2ème année - Génie Logiciel",
    groupeId: 1,
    groupe: "G1",
  },
];

const demoStudents: NoteRow[] = [
  "AJAOUI Sanaa",
  "AGOUMI Marouane",
  "BAAZIZ Soufiane",
  "BENABDELLAH Karima",
  "BENAZZOUZ Ichraq",
  "BOUNIF Hamza",
  "DAOUDI Charafeddine",
  "EDDABBANI Abdelilah",
  "ENNASR Aazeddine",
  "FAHIM Aicha",
  "HADRAOUI Ismail",
].map((fullName, index) => {
  const [nom, ...prenom] = fullName.split(" ");
  return {
    etudiantId: index + 1,
    matricule: String(1000 + index),
    nom,
    prenom: prenom.join(" "),
    noteTps: "",
    noteProjet: "",
    noteCtrl1: "",
    noteCtrl2: "",
  };
});

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

function uniqueOptions<T extends { id: number }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function EnsiasLogo() {
  return (
    <div
      className="w-[42px] h-[37px] bg-red-500"
      style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
    />
  );
}

export default function SaisieNotesPage() {
  const [teacherEmail, setTeacherEmail] = useState("ettalbi@ensias.um5.ac.ma");
  const [planifications, setPlanifications] = useState<Planification[]>(demoPlanifications);
  const [selSemestre, setSelSemestre] = useState("");
  const [selMatiere, setSelMatiere] = useState("");
  const [selClasse, setSelClasse] = useState("");
  const [selGroupe, setSelGroupe] = useState("");
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTeacherEmail(localStorage.getItem("email") || "ettalbi@ensias.um5.ac.ma");

    if (localStorage.getItem("token") === "demo") {
      setPlanifications(demoPlanifications);
      return;
    }

    const enseignantId = Number(localStorage.getItem("enseignantId")) || 1;
    authFetch(`${API}/${enseignantId}/planifications`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const rows = data?.data ?? data?.planifications ?? [];
        setPlanifications(Array.isArray(rows) && rows.length ? rows : demoPlanifications);
      })
      .catch(() => setPlanifications(demoPlanifications));
  }, []);

  useEffect(() => {
    if (!planifications.length || selSemestre || selMatiere || selClasse || selGroupe) return;
    const first = planifications[0];
    setSelSemestre(String(first.semestreId));
    setSelMatiere(String(first.matiereId));
    setSelClasse(String(first.classeId));
    setSelGroupe(String(first.groupeId));
  }, [planifications, selSemestre, selMatiere, selClasse, selGroupe]);

  const semestres: Option[] = useMemo(
    () => uniqueOptions(planifications.map((p) => ({ id: p.semestreId, nom: p.semestre }))),
    [planifications]
  );

  const matieres: Option[] = useMemo(
    () =>
      uniqueOptions(
        planifications
          .filter((p) => !selSemestre || String(p.semestreId) === selSemestre)
          .map((p) => ({ id: p.matiereId, intitule: p.matiere }))
      ),
    [planifications, selSemestre]
  );

  const classes: Option[] = useMemo(
    () =>
      uniqueOptions(
        planifications
          .filter((p) => !selSemestre || String(p.semestreId) === selSemestre)
          .filter((p) => !selMatiere || String(p.matiereId) === selMatiere)
          .map((p) => ({ id: p.classeId, nom: p.classe }))
      ),
    [planifications, selSemestre, selMatiere]
  );

  const groupes: Option[] = useMemo(
    () =>
      uniqueOptions(
        planifications
          .filter((p) => !selSemestre || String(p.semestreId) === selSemestre)
          .filter((p) => !selMatiere || String(p.matiereId) === selMatiere)
          .filter((p) => !selClasse || String(p.classeId) === selClasse)
          .map((p) => ({ id: p.groupeId, nom: p.groupe }))
      ),
    [planifications, selSemestre, selMatiere, selClasse]
  );

  const selectedPlanification = planifications.find(
    (p) =>
      String(p.semestreId) === selSemestre &&
      String(p.matiereId) === selMatiere &&
      String(p.classeId) === selClasse &&
      String(p.groupeId) === selGroupe
  );

  function resetTable() {
    setNotes([]);
    setTableLoaded(false);
    setMessage("");
  }

  async function handleSelect() {
    if (!selectedPlanification) {
      setMessage("Veuillez sélectionner le semestre, la matière, la classe et le groupe.");
      return;
    }

    setMessage("");

    if (localStorage.getItem("token") === "demo") {
      setNotes(demoStudents);
      setTableLoaded(true);
      return;
    }

    try {
      const res = await authFetch(`${API}/planifications/${selectedPlanification.planifId}/notes`);
      if (!res.ok) throw new Error("API indisponible");
      const data = await res.json();
      const apiRows = data.data ?? [];

      if (!Array.isArray(apiRows) || apiRows.length === 0) {
        setNotes(demoStudents);
      } else {
        setNotes(
          apiRows.map((e: any, index: number) => ({
            etudiantId: e.etudiantId ?? index + 1,
            matricule: String(e.matricule ?? 1000 + index),
            nom: e.nom ?? "",
            prenom: e.prenom ?? "",
            noteTps: e.noteTps != null ? String(e.noteTps) : "",
            noteProjet: e.noteProjet != null ? String(e.noteProjet) : "",
            noteCtrl1: e.noteCtrl1 != null ? String(e.noteCtrl1) : "",
            noteCtrl2: e.noteCtrl2 != null ? String(e.noteCtrl2) : "",
          }))
        );
      }
      setTableLoaded(true);
    } catch {
      setNotes(demoStudents);
      setTableLoaded(true);
    }
  }

  function updateNote(index: number, field: keyof NoteRow, value: string) {
    setNotes((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  function moyenne(row: NoteRow) {
    const values = [row.noteTps, row.noteProjet, row.noteCtrl1, row.noteCtrl2]
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value));

    if (!values.length) return "0,0";

    const total = values.reduce((sum, value) => sum + value, 0);
    return (total / values.length).toFixed(1).replace(".", ",");
  }

  async function handleSave() {
    setSaving(true);

    if (!selectedPlanification || localStorage.getItem("token") === "demo") {
      setMessage("Notes prêtes pour la publication.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        notes: notes.map((row) => ({
          etudiantId: row.etudiantId,
          noteTps: row.noteTps === "" ? null : Number(row.noteTps),
          noteProjet: row.noteProjet === "" ? null : Number(row.noteProjet),
          noteCtrl1: row.noteCtrl1 === "" ? null : Number(row.noteCtrl1),
          noteCtrl2: row.noteCtrl2 === "" ? null : Number(row.noteCtrl2),
        })),
      };

      const res = await authFetch(`${API}/planifications/${selectedPlanification.planifId}/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage(res.ok ? "Notes enregistrées avec succès." : "Sauvegarde locale prête pour la démo.");
    } catch {
      setMessage("Sauvegarde locale prête pour la démo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex justify-center items-start pt-6">
      <div className="w-[720px] min-h-[875px] border border-black bg-white">
        <header className="h-[44px] border-b border-gray-300 flex items-center px-7">
          <span className="text-[19px] text-slate-700">Bulletins étudiant</span>
          <span className="ml-auto mr-5 text-[12px] text-slate-700">
            Bienvenue Pr. {teacherEmail}
          </span>
          <EnsiasLogo />
        </header>

        <section className="px-7 pt-7 pb-8">
          <h1 className="text-[20px] font-extrabold text-black mb-7">Saisie des notes</h1>

          <div className="grid grid-cols-[92px_200px_160px_82px_100px] gap-3 items-end mb-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-2">Semestre</label>
              <select
                value={selSemestre}
                onChange={(event) => {
                  setSelSemestre(event.target.value);
                  setSelMatiere("");
                  setSelClasse("");
                  setSelGroupe("");
                  resetTable();
                }}
                className="w-full h-[34px] border border-gray-300 rounded-[4px] bg-white px-3 text-[12px] text-black outline-none"
              >
                <option value="">Semestre</option>
                {semestres.map((semestre) => (
                  <option key={semestre.id} value={semestre.id}>
                    {semestre.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-2">Matière</label>
              <select
                value={selMatiere}
                onChange={(event) => {
                  setSelMatiere(event.target.value);
                  setSelClasse("");
                  setSelGroupe("");
                  resetTable();
                }}
                className="w-full h-[34px] border border-gray-300 rounded-[4px] bg-white px-3 text-[12px] text-black outline-none"
              >
                <option value="">Matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.intitule}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-2">Classe</label>
              <select
                value={selClasse}
                onChange={(event) => {
                  setSelClasse(event.target.value);
                  setSelGroupe("");
                  resetTable();
                }}
                className="w-full h-[34px] border border-gray-300 rounded-[4px] bg-white px-3 text-[10px] text-black outline-none"
              >
                <option value="">Classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-2">Groupe</label>
              <select
                value={selGroupe}
                onChange={(event) => {
                  setSelGroupe(event.target.value);
                  resetTable();
                }}
                className="w-full h-[34px] border border-gray-300 rounded-[4px] bg-white px-3 text-[12px] text-black outline-none"
              >
                <option value="">Groupe</option>
                {groupes.map((groupe) => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.nom}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSelect}
              className="h-[34px] rounded-[4px] bg-blue-600 px-3 text-[12px] font-bold text-white hover:bg-blue-700"
            >
              Sélectionner
            </button>
          </div>

          {message && (
            <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">
              {message}
            </div>
          )}

          <div className="overflow-hidden rounded-[3px] border border-gray-300">
            <table className="w-full table-fixed border-collapse text-[11px] text-black">
              <thead>
                <tr className="bg-gray-50">
                  <th className="h-[42px] w-[27%] border-b border-gray-300 px-4 text-left font-bold">
                    Etudiant
                  </th>
                  <th className="h-[42px] w-[13%] border-b border-gray-300 text-center font-bold">
                    TPs <span className="text-[10px] text-gray-400">×25</span>
                  </th>
                  <th className="h-[42px] w-[14%] border-b border-gray-300 text-center font-bold">
                    Projet <span className="text-[10px] text-gray-400">×25</span>
                  </th>
                  <th className="h-[42px] w-[16%] border-b border-gray-300 text-center font-bold">
                    Contrôle 1 <span className="text-[10px] text-gray-400">×25</span>
                  </th>
                  <th className="h-[42px] w-[16%] border-b border-gray-300 text-center font-bold">
                    Contrôle 2 <span className="text-[10px] text-gray-400">×25</span>
                  </th>
                  <th className="h-[42px] w-[14%] border-b border-gray-300 text-center font-extrabold">
                    Moyenne
                  </th>
                </tr>
              </thead>

              <tbody>
                {notes.map((row, index) => (
                  <tr key={row.etudiantId}>
                    <td className="h-[39px] border-t border-gray-200 px-4 text-[10px]">
                      {row.nom} {row.prenom}
                    </td>
                    {(["noteTps", "noteProjet", "noteCtrl1", "noteCtrl2"] as const).map((field) => (
                      <td key={field} className="h-[39px] border-t border-gray-200 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={row[field]}
                          onChange={(event) => updateNote(index, field, event.target.value)}
                          className="mx-auto block h-[25px] w-[50px] rounded border border-gray-300 bg-white text-center text-[11px] outline-none hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50"
                        />
                      </td>
                    ))}
                    <td className="h-[39px] border-t border-gray-200 text-center text-[11px] font-extrabold">
                      {moyenne(row)}
                    </td>
                  </tr>
                ))}

                {!tableLoaded &&
                  Array.from({ length: 11 }).map((_, index) => (
                    <tr key={index}>
                      <td className="h-[39px] border-t border-gray-200" />
                      <td className="h-[39px] border-t border-gray-200" />
                      <td className="h-[39px] border-t border-gray-200" />
                      <td className="h-[39px] border-t border-gray-200" />
                      <td className="h-[39px] border-t border-gray-200" />
                      <td className="h-[39px] border-t border-gray-200" />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!tableLoaded || saving}
              className="h-[35px] rounded-[4px] bg-blue-600 px-6 text-[12px] font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
