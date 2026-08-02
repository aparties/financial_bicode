"use client";
import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Home, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EditRecordModal, FieldDef } from "./EditRecordModal";

type Transaction = {
  id: string;
  type: string;
  amount: string;
  description: string;
  category: string;
  currency: string;
  date: string | Date;
};

type TransactionListProps = {
  transactions: Transaction[];
  onAddClick?: () => void;
  onMutate?: () => void;
};

const TX_FIELDS: FieldDef[] = [
  { key: "type", label: "Tipo", type: "select", options: [{ value: "income", label: "Ingreso" }, { value: "expense", label: "Gasto" }, { value: "rent", label: "Alquiler" }] },
  { key: "amount", label: "Monto", type: "number", step: "0.01", min: "0.01" },
  { key: "description", label: "Descripción", type: "text" },
  { key: "category", label: "Categoría", type: "select", options: [
    { value: "Ingreso Empresa", label: "Ingreso Empresa" },
    { value: "Planilla Trabajadores", label: "Planilla Trabajadores" },
    { value: "Educación", label: "Educación" },
    { value: "Alimentación", label: "Alimentación" },
    { value: "Servicios Básicos", label: "Servicios Básicos" },
    { value: "Ocio", label: "Ocio" },
    { value: "Transporte", label: "Transporte" },
    { value: "Alquiler", label: "Alquiler" },
    { value: "Gastos Empresa", label: "Gastos Empresa" },
    { value: "Otros", label: "Otros" },
  ]},
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function TransactionList({ transactions, onAddClick, onMutate }: TransactionListProps) {
  const [editRecord, setEditRecord] = useState<Transaction | null>(null);

  const getIcon = (type: string) => {
    if (type === "income") return ArrowUpRight;
    if (type === "rent") return Home;
    return ArrowDownLeft;
  };

  const getIconColor = (type: string) => {
    if (type === "income") return "text-[#80ed99] bg-[#80ed99]/10";
    if (type === "rent") return "text-amber-400 bg-amber-400/10";
    return "text-rose-400 bg-rose-400/10";
  };

  const getAmountColor = (type: string) => {
    if (type === "income") return "text-[#80ed99]";
    if (type === "rent") return "text-amber-400";
    return "text-rose-400";
  };

  const handleDelete = async (id: string, description: string) => {
    if (!confirm(`¿Eliminar "${description}"? Esta acción no se puede deshacer.`)) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Transacción eliminada", { id: toastId });
        onMutate?.();
      } else {
        toast.error(data.error || "Error al eliminar", { id: toastId });
      }
    } catch {
      toast.error("Error de red", { id: toastId });
    }
  };

  return (
    <>
      <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold tracking-tight">Transacciones Recientes</h3>
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95"
            >
              + Registrar
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const Icon = getIcon(tx.type);
            const amountNum = parseFloat(tx.amount);
            const txDate = new Date(tx.date);
            const symbol = tx.currency === "USD" ? "$" : "S/";

            return (
              <div
                key={tx.id}
                className="flex justify-between items-center p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl shrink-0 ${getIconColor(tx.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-sm group-hover:text-[#57cc99] transition-colors duration-300 truncate">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#57cc99] font-bold tracking-wide uppercase bg-[#57cc99]/10 px-2 py-0.5 rounded-full">
                        {tx.category}
                      </span>
                      <span className="text-xs text-[#a8b5b0]">
                        {txDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {/* Edit/Delete buttons — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditRecord(tx)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className={`font-bold text-sm ${getAmountColor(tx.type)}`}>
                    {tx.type === "income" ? "+" : "-"}{symbol}{amountNum.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div className="text-center py-12 text-[#a8b5b0] text-sm">
              No hay transacciones registradas.
            </div>
          )}
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          title="Editar Transacción"
          record={editRecord}
          fields={TX_FIELDS}
          endpoint="/api/transactions"
          onSuccess={() => { onMutate?.(); setEditRecord(null); }}
        />
      )}
    </>
  );
}
