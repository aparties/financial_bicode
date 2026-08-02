"use client";
import React, { useState } from "react";
import { Calendar, Percent, Landmark, User, FileText, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EditRecordModal, FieldDef } from "./EditRecordModal";

type Liability = {
  id: string;
  name: string;
  amount: string;
  interestRate: string;
  type: string;
  dueDate?: string | Date;
  installmentAmount?: string;
  pendingInstallments?: number;
  currency?: string;
};

type LiabilityListProps = {
  liabilities: Liability[];
  onAddClick?: () => void;
  onMutate?: () => void;
};

const LIA_FIELDS: FieldDef[] = [
  { key: "name", label: "Nombre / Acreedor", type: "text" },
  { key: "amount", label: "Monto Total", type: "number", step: "0.01", min: "0" },
  { key: "interestRate", label: "Tasa Interés (%)", type: "number", step: "0.01", min: "0" },
  { key: "type", label: "Tipo", type: "select", options: [
    { value: "financial", label: "Financiero (Banco / Leasing)" },
    { value: "personal", label: "Personal" },
    { value: "tax", label: "Tributario (SUNAT)" },
  ]},
  { key: "installmentAmount", label: "Monto de Cuota", type: "number", step: "0.01", min: "0" },
  { key: "pendingInstallments", label: "Cuotas Pendientes", type: "number", step: "1", min: "0" },
  { key: "dueDate", label: "Próximo Vencimiento", type: "date" },
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function LiabilityList({ liabilities, onAddClick, onMutate }: LiabilityListProps) {
  const [editRecord, setEditRecord] = useState<Liability | null>(null);

  const financialLiabilities = liabilities.filter(l => l.type === "financial" || !l.type);
  const personalLiabilities = liabilities.filter(l => l.type === "personal");
  const taxLiabilities = liabilities.filter(l => l.type === "tax");

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`/api/liabilities?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success("Pasivo eliminado", { id: toastId }); onMutate?.(); }
      else toast.error(data.error || "Error al eliminar", { id: toastId });
    } catch { toast.error("Error de red", { id: toastId }); }
  };

  const renderItem = (l: Liability) => {
    const amountNum = parseFloat(l.amount);
    const interestNum = parseFloat(l.interestRate);
    const due = l.dueDate ? (typeof l.dueDate === "string" ? new Date(l.dueDate) : l.dueDate) : null;
    const instAmt = l.installmentAmount ? parseFloat(l.installmentAmount) : 0;
    const pend = l.pendingInstallments ?? 0;
    const symbol = l.currency === "USD" ? "$" : "S/";

    return (
      <div key={l.id} className="p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <div className="space-y-2 min-w-0 flex-1">
            <h5 className="text-white font-semibold text-sm group-hover:text-[#57cc99] transition-colors duration-300 truncate">{l.name}</h5>
            <div className="flex flex-wrap gap-2 text-[10px] text-[#a8b5b0]">
              {interestNum > 0 && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30"><Percent className="w-3 h-3 text-[#57cc99]" />Tasa: <strong className="text-white">{interestNum}%</strong></span>}
              {instAmt > 0 && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30">Cuota: <strong className="text-white">{symbol}{instAmt.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>{pend > 0 && <span className="text-[#a8b5b0]/65">({pend} rest.)</span>}</span>}
              {due && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30"><Calendar className="w-3 h-3 text-[#57cc99]" />Vence: <strong className="text-white">{due.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</strong></span>}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={() => setEditRecord(l)} title="Editar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(l.id, l.name)} title="Eliminar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <span className="text-rose-400 font-bold text-sm whitespace-nowrap">-{symbol}{amountNum.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold tracking-tight">Pasivos y Deudas</h3>
          {onAddClick ? <button onClick={onAddClick} className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95">+ Deuda</button>
            : <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase bg-[#57cc99]/10 px-3 py-1 rounded-full">Obligaciones</span>}
        </div>
        <div className="space-y-6">
          <div className="space-y-2"><h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1d4034]/30 pb-1.5 mb-2"><Landmark className="w-3.5 h-3.5" /> Bancarias e Inmobiliarias</h4><div className="space-y-3">{financialLiabilities.map(renderItem)}{financialLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay deudas financieras vigentes.</p>}</div></div>
          <div className="space-y-2"><h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1d4034]/30 pb-1.5 mb-2"><FileText className="w-3.5 h-3.5" /> Tributarias (SUNAT)</h4><div className="space-y-3">{taxLiabilities.map(renderItem)}{taxLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay deudas tributarias activas.</p>}</div></div>
          <div className="space-y-2"><h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1d4034]/30 pb-1.5 mb-2"><User className="w-3.5 h-3.5" /> Préstamos Personales</h4><div className="space-y-3">{personalLiabilities.map(renderItem)}{personalLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay préstamos personales vigentes.</p>}</div></div>
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          title="Editar Pasivo / Deuda"
          record={editRecord}
          fields={LIA_FIELDS}
          endpoint="/api/liabilities"
          onSuccess={() => { onMutate?.(); setEditRecord(null); }}
        />
      )}
    </>
  );
}
