# Gestion des Notes — Frontend

Interface web en Next.js 16 (App Router), React 19 et Tailwind CSS 4.
Voir le [README principal](../README.md) pour la présentation complète du projet.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

Le backend doit tourner sur `http://localhost:8081`. Les appels `/api/*` lui sont redirigés via `next.config.ts`.

## Organisation

```
app/
├── page.tsx                  # Connexion (admin, enseignant, étudiant)
├── admin/                    # Espace administrateur : référentiel et planification
├── enseignant/saisie-notes/  # Saisie des notes
└── etudiant/notes/           # Bulletin étudiant
components/                   # Sidebar, Topbar, ReferentielTable, Toast
lib/api.ts                    # Client HTTP vers l'API
```
