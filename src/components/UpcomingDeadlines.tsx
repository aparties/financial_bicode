import React from "react";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

type Invoice = {
  id: string;
  clientName: string;
  amount: string;
  status: string;
  dueDate?: string | Date;
  currency?: string;
};

type Liability = {
  id: string;
  name: string;
  amount: string;
  dueDate?: string | Date;
  currency?: string;
};

type UpcomingDeadlinesProps = {
  invoices: Invoice[];
  liabilities: Liability[];
};

export function UpcomingDeadlines({ invoices, liabilities }: UpcomingDeadlinesProps) {
  const now = Date.now();
  const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

  // Filter invoices due in next 30 days (or overdue)
  const upcomingInvoices = invoices
    .filter((inv) => {
      if (inv.status === "paid" || inv.status === "unbilled" || !inv.dueDate) return false;
      const dueTime = new Date(inv.dueDate).getTime();
      return dueTime <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Filter liabilities due in next 30 days (or overdue)
  const upcomingLiabilities = liabilities
    .filter((l) => {
      if (!l.dueDate) return false;
      const dueTime = new Date(l.dueDate).getTime();
      return dueTime <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const renderInvoiceDeadline = (inv: Invoice) => {
    const amount = parseFloat(inv.amount);
    const dueDate = new Date(inv.dueDate!);
    const isOverdue = dueDate.getTime() < now;
    const symbol = inv.currency === "USD" ? "$" : "S/";

    return (
      <div
        key={inv.id}
        className="flex items-center justify-between p-3.5 rounded-xl bg-[#081a14]/60 border border-[#1d4034]/50 text-xs hover:border-[#57cc99]/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#57cc99]/10 p-2 rounded-lg text-[#57cc99]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-white font-semibold line-clamp-1">{inv.clientName}</h5>
            <span className={`text-[10px] block mt-0.5 ${isOverdue ? "text-rose-400 font-semibold" : "text-[#a8b5b0]"}`}>
              Vence: {dueDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
              {isOverdue && " (Vencida)"}
            </span>
          </div>
        </div>
        <span className="text-[#80ed99] font-bold whitespace-nowrap">
          +{symbol}{amount.toLocaleString("es-ES", { minimumFractionDigits: 0 })}
        </span>
      </div>
    );
  };

  const renderLiabilityDeadline = (l: Liability) => {
    const amount = parseFloat(l.amount);
    const dueDate = new Date(l.dueDate!);
    const isOverdue = dueDate.getTime() < now;
    const symbol = l.currency === "USD" ? "$" : "S/";

    return (
      <div
        key={l.id}
        className="flex items-center justify-between p-3.5 rounded-xl bg-[#081a14]/60 border border-[#1d4034]/50 text-xs hover:border-rose-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-white font-semibold line-clamp-1">{l.name}</h5>
            <span className={`text-[10px] block mt-0.5 ${isOverdue ? "text-rose-400 font-semibold" : "text-[#a8b5b0]"}`}>
              Vence: {dueDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
              {isOverdue && " (Vencida)"}
            </span>
          </div>
        </div>
        <span className="text-rose-400 font-bold whitespace-nowrap">
          -{symbol}{amount.toLocaleString("es-ES", { minimumFractionDigits: 0 })}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-[#57cc99]" />
        <h3 className="text-white text-xl font-bold tracking-tight">Cronograma de Vencimientos (30 días)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cobros */}
        <div className="space-y-3">
          <h4 className="text-[#57cc99] font-bold text-xs uppercase tracking-wider border-b border-[#1d4034]/30 pb-2 flex justify-between items-center">
            <span>Cobros de Facturas</span>
            <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full">{upcomingInvoices.length}</span>
          </h4>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {upcomingInvoices.map(renderInvoiceDeadline)}
            {upcomingInvoices.length === 0 && (
              <p className="text-xs text-[#a8b5b0]/60 italic py-4 text-center">No hay cobros para los próximos 30 días.</p>
            )}
          </div>
        </div>

        {/* Pagos */}
        <div className="space-y-3">
          <h4 className="text-rose-400 font-bold text-xs uppercase tracking-wider border-b border-[#1d4034]/30 pb-2 flex justify-between items-center">
            <span>Cuotas de Deuda / Préstamos</span>
            <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full">{upcomingLiabilities.length}</span>
          </h4>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {upcomingLiabilities.map(renderLiabilityDeadline)}
            {upcomingLiabilities.length === 0 && (
              <p className="text-xs text-[#a8b5b0]/60 italic py-4 text-center">No hay pagos programados en los próximos 30 días.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
