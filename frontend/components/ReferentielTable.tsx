"use client";

import { useState, useCallback } from "react";
import Toast, { ToastState } from "./Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column {
  key: string;
  label: string;
  placeholder: string;
  width?: string;   // tailwind width class e.g. "w-24"
}

export interface RowData {
  id?: number;
  email?: string;
  isNew?: boolean;
  tempEmail?: string;
  tempPassword?: string;
  [key: string]: unknown;
}

interface Props {
  title: string;
  columns: Column[];
  initialRows: RowData[];
  onSave: (rows: RowData[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReferentielTable({
  title,
  columns,
  initialRows,
  onSave,
  onDelete,
}: Props) {
  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  function updateField(i: number, field: string, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addRow() {
    const empty: RowData = { isNew: true, tempEmail: "", tempPassword: "" };
    columns.forEach((c) => (empty[c.key] = ""));
    setRows((prev) => [...prev, empty]);
  }

  async function removeRow(i: number) {
    const row = rows[i];
    if (row.id) {
      try {
        await onDelete(row.id);
        showToast("Supprimé avec succès", "success");
      } catch (e: unknown) {
        showToast((e as Error).message, "error");
        return;
      }
    }
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    const newRows = rows.filter((r) => r.isNew);
    if (!newRows.length) {
      showToast("Aucune nouvelle ligne à enregistrer", "success");
      return;
    }
    setSaving(true);
    try {
      await onSave(newRows);
      showToast(`${title} enregistré(e)s avec succès`, "success");
      // Strip isNew flags after save
      setRows((prev) =>
        prev.map((r) => (r.isNew ? { ...r, isNew: false } : r))
      );
    } catch (e: unknown) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">
          {title}
        </h2>
        <span className="text-[11px] font-bold font-mono bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-0.5">
          {rows.length}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Column headers */}
      <div
        className="grid gap-2 px-1 pb-2 mb-2 border-b border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-400 font-mono"
        style={{
          gridTemplateColumns:
            columns.map((c) => c.width ?? "1fr").join(" ") + " 34px",
        }}
      >
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-1.5 animate-[rowIn_0.18s_ease]">
            {/* Main fields */}
            <div
              className="grid gap-2 items-center"
              style={{
                gridTemplateColumns:
                  columns.map((c) => c.width ?? "1fr").join(" ") + " 34px",
              }}
            >
              {columns.map((c) => (
                <input
                  key={c.key}
                  type="text"
                  value={String(row[c.key] ?? "")}
                  placeholder={c.placeholder}
                  readOnly={!row.isNew && !!row.id}
                  onChange={(e) => updateField(i, c.key, e.target.value)}
                  className={[
                    "h-9 px-3 text-[13px] rounded-lg border transition-all w-full",
                    "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    !row.isNew && row.id
                      ? "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
                      : "bg-white border-gray-300 text-gray-900",
                  ].join(" ")}
                />
              ))}
              <button
                onClick={() => removeRow(i)}
                className="w-[34px] h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all text-xs"
                title="Supprimer"
              >
                ✕
              </button>
            </div>

            {/* Extra fields for new rows */}
            {row.isNew && (
              <div className="grid grid-cols-2 gap-2 pl-0 animate-[rowIn_0.18s_ease]">
                <input
                  type="email"
                  value={String(row.tempEmail ?? "")}
                  placeholder="Email (@ensias.um5.ac.ma)"
                  onChange={(e) => updateField(i, "tempEmail", e.target.value)}
                  className="h-9 px-3 text-[13px] rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <input
                  type="password"
                  value={String(row.tempPassword ?? "")}
                  placeholder="Mot de passe"
                  onChange={(e) => updateField(i, "tempPassword", e.target.value)}
                  className="h-9 px-3 text-[13px] rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-200">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Ajouter une ligne
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 6.5l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
