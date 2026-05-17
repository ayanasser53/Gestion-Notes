"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SaisieNotesPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "enseignant") {
      router.push("/");
      return;
    }

    if (emailRef.current) {
      emailRef.current.textContent = localStorage.getItem("email") ?? "";
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white flex justify-center items-start py-3">
      <div className="w-[760px] min-h-[1000px] border border-black bg-white">

        <header className="h-[48px] border-b border-gray-400 flex items-center justify-between px-8">
          <span className="text-[20px] text-gray-800">Bulletins étudiant</span>
          <div className="flex items-center gap-4">
            <span className="text-[15px] text-gray-700">
              Bienvenue Pr. <span ref={emailRef}></span>
            </span>
            <div className="relative w-[32px] h-[28px]">
              <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-red-500" />
            </div>
          </div>
        </header>

        <div className="px-8 pt-6">
          <h2 className="text-[22px] font-bold text-black mb-6">
            Saisie des notes
          </h2>

          <div className="flex gap-4 mb-6 flex-wrap">
            {["Semestre", "Matière", "Classe", "Groupe"].map((label) => (
              <div key={label}>
                <label className="block text-[13px] text-gray-500 mb-1">
                  {label}
                </label>
                <select className="border border-gray-400 rounded px-3 py-2 text-[14px] text-black outline-none focus:border-blue-500">
                  <option value="">{label}</option>
                </select>
              </div>
            ))}
            <div className="flex items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-[14px] font-semibold transition">
                Sélectionner
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-left px-4 py-3 font-semibold">Etudiant</th>
                  <th className="text-center px-4 py-3 font-semibold">TPs</th>
                  <th className="text-center px-4 py-3 font-semibold">Projet</th>
                  <th className="text-center px-4 py-3 font-semibold">Contrôle 1</th>
                  <th className="text-center px-4 py-3 font-semibold">Contrôle 2</th>
                  <th className="text-center px-4 py-3 font-bold">Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-400 text-[13px]">—</td>
                    {["tps", "projet", "ctrl1", "ctrl2"].map((field) => (
                      <td key={field} className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          className="w-[60px] border border-gray-300 rounded px-2 py-1 text-center text-[13px] outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center font-bold text-gray-700">
                      —
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-[14px] font-semibold transition">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}