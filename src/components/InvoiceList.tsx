"use client";
import React, { useState } from "react";
import { FileText, CheckCircle2, AlertCircle, Clock, CalendarRange, PenTool, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EditRecordModal, FieldDef } from "./EditRecordModal";

type Invoice = {
  id: string;
  clientName: string;
  amount: string;
  status: string;
  paymentTerms: string;
  dueDate?: string | Date;
  currency?: string;
};

type InvoiceListProps = {
  invoices: Invoice[];
  onAddClick?: () => void;
  onMutate?: () => void;
};

const INV_FIELDS: FieldDef[] = [
  { key: "clientName", label: "Cliente / Descripción", type: "text" },
  { key: "amount", label: "Monto", type: "number", step: "0.01", min: "0.01" },
  { key: "status", label: "Estado", type: "select", options: [
    { value: "paid", label: "Cobrada" },
    { value: "pending", label: "Por Cobrar" },
    { value: "overdue", label: "Vencida" },
    { value: "unbilled", label: "Por Facturar" },
  ]},
  { key: "paymentTerms", label: "Condiciones", type: "select", options: [
    { value: "immediate", label: "Contado" },
    { value: "30_days", label: "Crédito 30 días" },
    { value: "60_days", label: "Crédito 60 días" },
    { value: "custom", label: "Plazo especial" },
  ]},
  { key: "dueDate", label: "Vencimiento", type: "date" },
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function InvoiceList({ invoices, onAddClick, onMutate }: InvoiceListProps) {
  const [editRecord, setEditRecord] = useState<Invoice | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <span className="text-[#80ed99] bg-[#80ed99]/10 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-[#80ed99]/20"><CheckCircle2 className="w-3 h-3" /> Cobrada</span>;
      case "overdue": return <span className="text-rose-400 bg-rose-400/10 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-rose-400/20"><AlertCircle className="w-3 h-3" /> Vencida</span>;
      case "unbilled": return <span className="text-amber-400 bg-amber-400/10 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-400/20"><PenTool className="w-3 h-3" /> Por Facturar</span>;
      default: return <span className="text-[#57cc99] bg-[#57cc99]/10 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-[#57cc99]/20"><Clock className="w-3 h-3" /> Por Cobrar</span>;
    }
  };

  const getTermLabel = (terms: string) => {
    if (terms === "30_days") return "Crédito 30d";
    if (terms === "60_days") return "Crédito 60d";
    if (terms === "custom") return "Plazo Esp.";
    return "Contado";
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar factura de "${name}"?`)) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success("Factura eliminada", { id: toastId }); onMutate?.(); }
      else toast.error(data.error || "Error al eliminar", { id: toastId });
    } catch { toast.error("Error de red", { id: toastId }); }
  };

  const renderGroup = (title: string, list: Invoice[], emptyMsg: string, iconColorClass: string) => (
    <div className="space-y-3">
      <h4 className="text-[#57cc99] font-bold text-xs uppercase tracking-wider border-b border-[#1d4034]/30 pb-1.5 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full font-semibold">{list.length}</span>
      </h4>
      <div className="space-y-3">
        {list.map((inv) => {
          const amountNum = parseFloat(inv.amount);
          const due = inv.dueDate ? (typeof inv.dueDate === "string" ? new Date(inv.dueDate) : inv.dueDate) : null;
          const symbol = inv.currency === "USD" ? "$" : "S/";
          return (
            <div key={inv.id} className="flex justify-between items-center p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group/item">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-xl shrink-0 ${iconColorClass}`}><FileText className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <h5 className="text-white font-semibold text-sm group-hover/item:text-[#57cc99] transition-colors duration-300 truncate">{inv.clientName}</h5>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {getStatusBadge(inv.status)}
                    <span className="text-[9px] text-[#57cc99] bg-[#57cc99]/10 px-2 py-0.5 rounded-full font-bold border border-[#57cc99]/10 flex items-center gap-1">
                      <CalendarRange className="w-3 h-3" /> {getTermLabel(inv.paymentTerms)}
                    </span>
                    {due && inv.status !== "paid" && (
                      <span className="text-[10px] text-[#a8b5b0]">Vence: {due.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                  <button onClick={() => setEditRecord(inv)} title="Editar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(inv.id, inv.clientName)} title="Eliminar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-white font-bold text-sm">{symbol}{amountNum.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">{emptyMsg}</p>}
      </div>
    </div>
  );

  const unbilled = invoices.filter(i => i.status === "unbilled");
  const pending = invoices.filter(i => i.status === "pending" || i.status === "overdue");
  const paid = invoices.filter(i => i.status === "paid");

  return (
    <>
      <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold tracking-tight">Trabajos y Facturas</h3>
          {onAddClick ? (
            <button onClick={onAddClick} className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95">+ Factura</button>
          ) : (
            <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase bg-[#57cc99]/10 px-3 py-1 rounded-full">Facturación</span>
          )}
        </div>
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {renderGroup("Pendientes de Facturar", unbilled, "No hay trabajos pendientes de facturar.", "text-amber-400 bg-amber-400/10")}
          {renderGroup("Cuentas por Cobrar", pending, "No hay facturas pendientes.", "text-[#57cc99] bg-[#57cc99]/15")}
          {renderGroup("Cobradas (Historial)", paid, "No hay facturas cobradas.", "text-[#80ed99] bg-[#80ed99]/10")}
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          title="Editar Factura"
          record={editRecord}
          fields={INV_FIELDS}
          endpoint="/api/invoices"
          onSuccess={() => { onMutate?.(); setEditRecord(null); }}
        />
      )}
    </>
  );
}
