import React, { useState } from "react";
import { Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";

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

type FinancialCalendarProps = {
  invoices: Invoice[];
  liabilities: Liability[];
};

export function FinancialCalendar({ invoices, liabilities }: FinancialCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // First day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Change month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Helper to find events for a specific day
  const getDayEvents = (day: number) => {
    const dayDate = new Date(year, month, day);
    const dayStart = new Date(year, month, day, 0, 0, 0, 0).getTime();
    const dayEnd = new Date(year, month, day, 23, 59, 59, 999).getTime();

    const dayInvoices = invoices.filter((inv) => {
      if (inv.status === "paid" || inv.status === "unbilled" || !inv.dueDate) return false;
      const dueTime = new Date(inv.dueDate).getTime();
      return dueTime >= dayStart && dueTime <= dayEnd;
    });

    const dayLiabilities = liabilities.filter((l) => {
      if (!l.dueDate) return false;
      const dueTime = new Date(l.dueDate).getTime();
      return dueTime >= dayStart && dueTime <= dayEnd;
    });

    return { invoices: dayInvoices, liabilities: dayLiabilities };
  };

  // Events of selected day
  const selectedEvents = selectedDay ? getDayEvents(selectedDay) : { invoices: [], liabilities: [] };
  const hasSelectedEvents = selectedEvents.invoices.length > 0 || selectedEvents.liabilities.length > 0;

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#57cc99]/10 p-3 rounded-full text-[#57cc99]">
            <CalendarIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Calendario de Pagos y Cobros</h3>
            <p className="text-xs text-[#a8b5b0] mt-0.5">Controla visualmente tus próximos cobros y amortizaciones.</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2.5 bg-[#081a14] border border-[#1d4034] rounded-full px-3 py-1.5 self-start sm:self-auto">
          <button onClick={prevMonth} className="text-[#a8b5b0] hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-bold text-xs min-w-[90px] text-center select-none">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="text-[#a8b5b0] hover:text-white transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
        {/* Week headers */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="text-[#57cc99] font-bold py-2 uppercase tracking-widest text-[9px]">
            {day}
          </div>
        ))}

        {/* Blank days before start of month */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div key={`blank-${index}`} className="aspect-square" />
        ))}

        {/* Month days */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const day = idx + 1;
          const { invoices: dayInvs, liabilities: dayLias } = getDayEvents(day);
          const hasInvoices = dayInvs.length > 0;
          const hasLiabilities = dayLias.length > 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={`day-${day}`}
              onClick={() => setSelectedDay(day)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-2 transition-all duration-300 relative border cursor-pointer hover:border-[#57cc99]/40 ${
                isSelected
                  ? "bg-[#57cc99] border-[#57cc99] text-[#0b241c] shadow-lg shadow-[#57cc99]/20 font-bold scale-105"
                  : "bg-[#081a14] border-[#1d4034]/55 text-white hover:bg-[#0b241c]"
              }`}
            >
              <span className="text-xs">{day}</span>
              <div className="flex gap-1 justify-center mt-1">
                {hasInvoices && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#0b241c]" : "bg-[#80ed99]"}`} />
                )}
                {hasLiabilities && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-rose-950" : "bg-rose-400"}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day events panel */}
      {selectedDay && (
        <div className="mt-6 p-5 rounded-2xl bg-[#081a14] border border-[#1d4034]/50">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#1d4034]/30 pb-2">
            Eventos del {selectedDay} de {monthNames[month]}
          </h4>
          
          <div className="space-y-3">
            {/* Invoices to collect */}
            {selectedEvents.invoices.map(inv => {
              const invSymbol = inv.currency === "USD" ? "$" : "S/";
              return (
                <div key={inv.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#57cc99]/15 p-1.5 rounded text-[#57cc99]">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-white font-semibold block">{inv.clientName}</span>
                      <span className="text-[10px] text-[#a8b5b0]">Cobro programado</span>
                    </div>
                  </div>
                  <strong className="text-[#80ed99]">+{invSymbol}{parseFloat(inv.amount).toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>
                </div>
              );
            })}

            {/* Liabilities to pay */}
            {selectedEvents.liabilities.map(l => {
              const lSymbol = l.currency === "USD" ? "$" : "S/";
              return (
                <div key={l.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="bg-rose-500/10 p-1.5 rounded text-rose-400">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-white font-semibold block">{l.name}</span>
                      <span className="text-[10px] text-[#a8b5b0]">Pago programado</span>
                    </div>
                  </div>
                  <strong className="text-rose-400">-{lSymbol}{parseFloat(l.amount).toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>
                </div>
              );
            })}

            {!hasSelectedEvents && (
              <p className="text-xs text-[#a8b5b0]/60 italic py-2 text-center">No hay cobros ni pagos programados para este día.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
