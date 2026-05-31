"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const PAGE_TITLES = {
  "/admin/enseignants": "Référentiel des enseignants",
  "/admin/etudiants":   "Référentiel des étudiants",
  "/admin/classes":     "Référentiel des classes",
  "/admin/classes/affectation": "Affectation des étudiants / classes",
  "/admin/matieres":    "Référentiel des matières",
  "/admin/planning":    "Planification",
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Référentiel ENSIAS";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8 px-4 font-sans">
      {/* Page title above the frame */}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-5">
        {title}
      </h1>

      {/* App frame */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Topbar />

        {/* Welcome bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[12.5px] text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Bienvenue MMe.AYA(administrateur)
        </div>

        {/* Sidebar + content */}
        <div className="flex min-h-[420px]">
          <Sidebar />
          <main className="flex-1 p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
