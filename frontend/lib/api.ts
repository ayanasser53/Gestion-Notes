const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erreur serveur");
  }

  return res.json();
}

// Etudiants
export const getEtudiants = () =>
  apiFetch("/api/admin/etudiants");

export const createEtudiant = (body: any) =>
  apiFetch("/api/admin/etudiants", {
    method: "POST",
    body: JSON.stringify(body),
  });

// Enseignants
export const getEnseignants = () =>
  apiFetch("/api/admin/enseignants");

export const createEnseignant = (body: any) =>
  apiFetch("/api/admin/enseignants", {
    method: "POST",
    body: JSON.stringify(body),
  });