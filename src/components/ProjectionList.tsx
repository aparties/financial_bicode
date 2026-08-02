"use client";
import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EditRecordModal, FieldDef } from "./EditRecordModal";

type Projection = {
  id: string;
  name: string;
  estimatedRevenue: string;
  estimatedCost: string;
  status: string;
  currency?: string;
};

type ProjectionListProps = {
  projections: Projection[];
  onAddClick?: () => void;
  onMutate?: () => void;
};

const PRJ_FIELDS: FieldDef[] = [
  { key: "name", label: "Nombre del Proyecto", type: "text" },
  { key: "estimatedRevenue", label: "Ingreso Estimado", type: "number", step: "0.01", min: "0" },
  { key: "estimatedCost", label: "Costo Estimado", type: "number", step: "0.01", min: "0" },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "planned", label: "Planeado" },
    { value: "active", label: "En Curso" },
    { value: "completed", label: "Completado" },
  ]},
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function ProjectionList({ projections, onAddClick, onMutate }: ProjectionListProps) {
  const [editRecord, setEditRecord] = useState<Projection | null>(null);

  const getStatusBadge = (status: string) => {
    if (status === "active") return <span className="text-[#80ed99] bg-[#80ed99]/10 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#80ed99]/20">En Curso</span>;
    if (status === "completed") return <span className="text-blue-400 bg-blue-400/10 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-400/20">Completado</span>;
    return <span className="text-[#57cc99] bg-[#57cc99]/10 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#57cc99]/20">Planeado</span>;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el proyecto "${name}"?`)) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`/api/projections?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success("Proyecto eliminado", { id: toastId }); onMutate?.(); }
      else toast.error(data.error || "Error al eliminar", { id: toastId });
    } catch { toast.error("Error de red", { id: toastId }); }
  };

  return (
    <>
      <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Proyectos y Servicios Proyectados</h3>
            <p className="text-xs text-[#a8b5b0] mt-1">Estimación de márgenes de ganancia para tus próximos proyectos tecnológicos y servicios SaaS.</p>
          </div>
          {onAddClick && (
            <button onClick={onAddClick} className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95 whitespace-nowrap">+ Proyecto</button>
          )}
        </div>

        <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {projections.map((prj) => {
            const rev = parseFloat(prj.estimatedRevenue);
            const cost = parseFloat(prj.estimatedCost);
            const margin = rev - cost;
            const marginPercent = rev > 0 ? (margin / rev) * 100 : 0;
            const symbol = prj.currency === "USD" ? "$" : "S/";

            return (
              <div key={prj.id} className="p-5 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-semibold text-sm group-hover:text-[#57cc99] transition-colors duration-300 truncate">{prj.name}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(prj.status)}
                      {/* Edit/Delete on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => setEditRecord(prj)} title="Editar" className="p-1 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(prj.id, prj.name)} title="Eliminar" className="p-1 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[10px] text-[#57cc99] font-bold uppercase tracking-wider block mb-0.5">Margen Proyectado</span>
                    <span className={`text-base font-extrabold ${margin >= 0 ? "text-[#80ed99]" : "text-rose-400"}`}>
                      {symbol}{margin.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#a8b5b0] block mt-0.5">({marginPercent.toFixed(1)}% retorno)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1d4034]/30 text-xs">
                  <div className="flex justify-between items-center bg-[#143028]/50 px-3 py-1.5 rounded-lg border border-[#1d4034]/30">
                    <span className="text-[#a8b5b0]">Ingresos Est.:</span>
                    <strong className="text-[#80ed99]">{symbol}{rev.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-[#143028]/50 px-3 py-1.5 rounded-lg border border-[#1d4034]/30">
                    <span className="text-[#a8b5b0]">Costos Est.:</span>
                    <strong className="text-rose-400">{symbol}{cost.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>
                  </div>
                </div>
              </div>
            );
          })}

          {projections.length === 0 && (
            <div className="text-center py-12 text-[#a8b5b0] text-sm">No hay proyecciones registradas.</div>
          )}
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          title="Editar Proyecto"
          record={editRecord}
          fields={PRJ_FIELDS}
          endpoint="/api/projections"
          onSuccess={() => { onMutate?.(); setEditRecord(null); }}
        />
      )}
    </>
  );
}
