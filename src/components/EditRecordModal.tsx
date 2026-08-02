"use client";
import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
  step?: string;
  min?: string;
};

type EditRecordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  record: Record<string, any>;
  fields: FieldDef[];
  endpoint: string; // e.g. "/api/transactions"
  onSuccess: () => void;
};

export function EditRecordModal({
  isOpen,
  onClose,
  title,
  record,
  fields,
  endpoint,
  onSuccess,
}: EditRecordModalProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        let v = record[f.key] ?? "";
        // Format dates to yyyy-MM-dd for <input type="date">
        if (f.type === "date" && v) {
          try { v = new Date(v).toISOString().split("T")[0]; } catch { v = ""; }
        }
        initial[f.key] = v;
      });
      setValues(initial);
    }
  }, [record, isOpen]);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Guardando cambios...");
    try {
      const res = await fetch(`${endpoint}?id=${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Registro actualizado", { id: toastId });
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Error al actualizar", { id: toastId });
      }
    } catch {
      toast.error("Error de red", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 shadow-2xl relative mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#a8b5b0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-white text-xl font-bold tracking-tight mb-6">{title}</h3>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-[#57cc99] transition-all text-sm"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b241c]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  step={field.step}
                  min={field.min}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-5 py-3.5 text-white placeholder-emerald-100/10 focus:outline-none focus:border-[#57cc99] transition-all text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-[#1d4034] text-[#a8b5b0] hover:text-white rounded-full py-3.5 font-bold transition-all duration-300 cursor-pointer text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-[#57cc99] text-[#0b241c] rounded-full py-3.5 font-bold hover:bg-[#80ed99] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg text-xs disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
