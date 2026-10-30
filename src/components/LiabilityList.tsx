"use client";
import React, { useState } from "react";
import { Calendar, Percent, Landmark, User, FileText, Pencil, Trash2, CheckCheck, CheckCircle2, CreditCard, RotateCcw } from "lucide-react";
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
  currentPortion?: string;
  nonCurrentPortion?: string;
  classification?: string;
  status?: string;
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
  { key: "status", label: "Estado", type: "select", options: [
    { value: "active", label: "Activa (Con saldo / cuotas vigentes)" },
    { value: "paid", label: "Liquidada (Todas las cuotas pagadas)" },
  ]},
  { key: "installmentAmount", label: "Monto de Cuota", type: "number", step: "0.01", min: "0" },
  { key: "pendingInstallments", label: "Cuotas Pendientes", type: "number", step: "1", min: "0" },
  { key: "dueDate", label: "Próximo Vencimiento", type: "date" },
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function LiabilityList({ liabilities, onAddClick, onMutate }: LiabilityListProps) {
  const [editRecord, setEditRecord] = useState<Liability | null>(null);

  const activeLiabilities = liabilities.filter(l => l.status !== "paid" && parseFloat(l.amount || "0") > 0);
  const paidLiabilities = liabilities.filter(l => l.status === "paid" || parseFloat(l.amount || "0") <= 0);

  const financialLiabilities = activeLiabilities.filter(l => l.type === "financial" || !l.type);
  const personalLiabilities = activeLiabilities.filter(l => l.type === "personal");
  const taxLiabilities = activeLiabilities.filter(l => l.type === "tax");

  // Marcar todas las cuotas como pagadas (Liquidar la deuda completamente)
  const handleMarkAllPaid = async (l: Liability) => {
    if (!confirm(`¿Marcar todas las cuotas de "${l.name}" como pagadas y liquidar la deuda?`)) return;
    const toastId = toast.loading("Liquidando deuda...");
    try {
      const res = await fetch(`/api/liabilities?id=${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: l.name,
          amount: "0.00",
          interestRate: l.interestRate,
          type: l.type,
          dueDate: l.dueDate,
          installmentAmount: l.installmentAmount,
          pendingInstallments: 0,
          status: "paid",
          currency: l.currency,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`¡Todas las cuotas de "${l.name}" pagadas! Deuda liquidada.`, { id: toastId });
        onMutate?.();
      } else {
        toast.error(data.error || "Error al liquidar deuda", { id: toastId });
      }
    } catch {
      toast.error("Error de red", { id: toastId });
    }
  };

  // Pagar 1 cuota mensual
  const handlePayOneInstallment = async (l: Liability) => {
    const pend = l.pendingInstallments ?? 0;
    const instAmt = l.installmentAmount ? parseFloat(l.installmentAmount) : 0;
    const currentAmt = parseFloat(l.amount);

    if (pend <= 1 || (instAmt > 0 && currentAmt <= instAmt)) {
      return handleMarkAllPaid(l);
    }

    const newPend = pend - 1;
    const newAmt = Math.max(0, currentAmt - instAmt);
    const toastId = toast.loading("Registrando pago de cuota...");

    try {
      const res = await fetch(`/api/liabilities?id=${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: l.name,
          amount: newAmt.toFixed(2),
          interestRate: l.interestRate,
          type: l.type,
          dueDate: l.dueDate,
          installmentAmount: l.installmentAmount,
          pendingInstallments: newPend,
          status: newAmt === 0 ? "paid" : "active",
          currency: l.currency,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Cuota pagada. Quedan ${newPend} cuotas pendientes.`, { id: toastId });
        onMutate?.();
      } else {
        toast.error(data.error || "Error al registrar cuota", { id: toastId });
      }
    } catch {
      toast.error("Error de red", { id: toastId });
    }
  };

  // Reabrir deuda si fue marcada como pagada por error
  const handleReopenLiability = async (l: Liability) => {
    const toastId = toast.loading("Reactivando deuda...");
    try {
      const res = await fetch(`/api/liabilities?id=${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: l.name,
          amount: l.installmentAmount && l.pendingInstallments ? (parseFloat(l.installmentAmount) * l.pendingInstallments).toFixed(2) : "100.00",
          interestRate: l.interestRate,
          type: l.type,
          dueDate: l.dueDate,
          installmentAmount: l.installmentAmount,
          pendingInstallments: l.pendingInstallments || 1,
          status: "active",
          currency: l.currency,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Deuda "${l.name}" reactivada`, { id: toastId });
        onMutate?.();
      } else {
        toast.error(data.error || "Error al reactivar", { id: toastId });
      }
    } catch {
      toast.error("Error de red", { id: toastId });
    }
  };

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
    const isPaid = l.status === "paid" || amountNum <= 0;

    return (
      <div key={l.id} className="p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className="text-white font-semibold text-sm group-hover:text-[#57cc99] transition-colors duration-300 truncate">{l.name}</h5>
              {isPaid && (
                <span className="text-[#80ed99] bg-[#80ed99]/10 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#80ed99]/20">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Liquidada
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] text-[#a8b5b0]">
              {interestNum > 0 && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30"><Percent className="w-3 h-3 text-[#57cc99]" />Tasa: <strong className="text-white">{interestNum}%</strong></span>}
              {instAmt > 0 && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30">Cuota: <strong className="text-white">{symbol}{instAmt.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>{pend > 0 && <span className="text-[#a8b5b0]/65">({pend} rest.)</span>}</span>}
              {due && !isPaid && <span className="flex items-center gap-1 bg-[#143028] px-2 py-0.5 rounded border border-[#1d4034]/30"><Calendar className="w-3 h-3 text-[#57cc99]" />Vence: <strong className="text-white">{due.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</strong></span>}
            </div>

            {/* Sincerated Term Breakdown Badge */}
            {!isPaid && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {l.classification === "mixed" ? (
                  <>
                    <span className="text-[9px] text-[#80ed99] bg-[#80ed99]/10 px-2 py-0.5 rounded-full font-bold border border-[#80ed99]/20">
                      Corriente 12m: {symbol}{parseFloat(l.currentPortion || "0").toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[9px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">
                      No Corriente: {symbol}{parseFloat(l.nonCurrentPortion || "0").toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                    </span>
                  </>
                ) : l.classification === "non_current" ? (
                  <span className="text-[9px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">
                    Pasivo No Corriente (&gt; 12 meses)
                  </span>
                ) : (
                  <span className="text-[9px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full font-bold border border-amber-400/20">
                    Pasivo Corriente (&le; 12 meses)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
            <span className={`font-bold text-sm whitespace-nowrap ${isPaid ? "text-[#80ed99]" : "text-rose-400"}`}>
              {isPaid ? "S/ 0.00" : `-${symbol}${amountNum.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {!isPaid ? (
                <>
                  <button
                    onClick={() => handleMarkAllPaid(l)}
                    title="Marcar todas las cuotas como pagadas (Liquidar deuda)"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#80ed99] bg-[#80ed99]/10 hover:bg-[#80ed99]/25 border border-[#80ed99]/30 transition-all cursor-pointer text-[10px] font-bold shadow-sm"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Todas Pagadas</span>
                  </button>
                  {pend > 0 && (
                    <button
                      onClick={() => handlePayOneInstallment(l)}
                      title={`Pagar 1 cuota (${symbol}${instAmt.toLocaleString("es-ES")})`}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#57cc99] bg-[#57cc99]/10 hover:bg-[#57cc99]/20 border border-[#57cc99]/20 transition-all cursor-pointer text-[10px] font-semibold"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>-1 Cuota</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleReopenLiability(l)}
                  title="Reactivar / Reabrir deuda"
                  className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reabrir</span>
                </button>
              )}

              <button onClick={() => setEditRecord(l)} title="Editar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(l.id, l.name)} title="Eliminar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
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
          <div className="space-y-2">
            <h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex justify-between items-center border-b border-[#1d4034]/30 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Bancarias e Inmobiliarias</span>
              <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full font-semibold">{financialLiabilities.length}</span>
            </h4>
            <div className="space-y-3">{financialLiabilities.map(renderItem)}{financialLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay deudas bancarias activas.</p>}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex justify-between items-center border-b border-[#1d4034]/30 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Tributarias (SUNAT)</span>
              <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full font-semibold">{taxLiabilities.length}</span>
            </h4>
            <div className="space-y-3">{taxLiabilities.map(renderItem)}{taxLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay deudas tributarias activas.</p>}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#57cc99] font-bold text-[11px] tracking-wider uppercase flex justify-between items-center border-b border-[#1d4034]/30 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Préstamos Personales</span>
              <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full font-semibold">{personalLiabilities.length}</span>
            </h4>
            <div className="space-y-3">{personalLiabilities.map(renderItem)}{personalLiabilities.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">No hay préstamos personales vigentes.</p>}</div>
          </div>

          {paidLiabilities.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#1d4034]/40">
              <h4 className="text-[#80ed99] font-bold text-[11px] tracking-wider uppercase flex justify-between items-center border-b border-[#1d4034]/30 pb-1.5 mb-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Deudas Liquidadas / Pagadas (Historial)</span>
                <span className="text-[10px] text-[#80ed99] bg-[#80ed99]/10 px-2 py-0.5 rounded-full font-semibold">{paidLiabilities.length}</span>
              </h4>
              <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">{paidLiabilities.map(renderItem)}</div>
            </div>
          )}
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

