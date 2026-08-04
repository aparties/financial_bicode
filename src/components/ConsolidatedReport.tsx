import React from "react";
import { Landmark, TrendingUp, ShieldAlert, BadgeDollarSign, Wallet2, Users, PenTool, Home, Boxes, Download } from "lucide-react";

type ConsolidatedSummary = {
  totalBalance: number;
  totalUnbilled: number;
  totalReceivables: number;
  totalFixedAssets: number;
  totalInventory: number;
  totalAssets: number;
  totalFinancialLiabilities: number;
  totalPersonalLiabilities: number;
  totalLiabilities: number;
  consolidated: number;
};

type ConsolidatedReportProps = {
  summary: ConsolidatedSummary;
  exchangeRate: number;
  onExportCsv?: () => void;
};

export function ConsolidatedReport({ summary, exchangeRate, onExportCsv }: ConsolidatedReportProps) {
  const isNetWorthPositive = summary.consolidated >= 0;

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#57cc99]/5 rounded-full blur-[85px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-white text-xl font-bold tracking-tight">Reporte Patrimonial Consolidado</h3>
        
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 bg-[#0b241c] border border-[#57cc99]/30 text-[#57cc99] text-xs font-bold rounded-full px-4 py-2 hover:bg-[#57cc99] hover:text-[#0b241c] transition-all duration-300 cursor-pointer shadow-md self-start sm:self-auto"
            title="Descargar reporte completo en archivo .csv"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Reporte CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Consolidated Net Worth Panel */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-[#081a14] border border-[#1d4034]/60 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase mb-2 block">
            Patrimonio Neto
          </span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isNetWorthPositive ? "text-[#80ed99]" : "text-rose-400"}`}>
            S/{summary.consolidated.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-[10px] text-[#a8b5b0] mt-3 max-w-[160px] leading-relaxed">
            Ecuación: Activos Totales (Banco + Por cobrar + Oficinas/Equipos + Licencias) - Pasivos Totales (Bancos + Personas)
          </p>
        </div>

        {/* Activos vs Pasivos Breakdown Details */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Activos Column */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#081a14]/40 border border-[#1d4034]/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1d4034]/40">
                <span className="text-[#80ed99] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Activos Totales
                </span>
                <span className="text-white font-bold text-sm">
                  S/{summary.totalAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-3 mt-3">
                {/* 1. Liquid Balance */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-[#57cc99]" /> Saldo en Cuentas
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalBalance.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {/* 2. Unbilled Work */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-amber-400" /> Trabajos por Facturar
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalUnbilled.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 3. Invoiced Receivables */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-[#57cc99]" /> Facturas por Cobrar
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalReceivables.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 4. Fixed Assets (Offices, Servers) */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#57cc99]" /> Infraestructura y Oficinas
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalFixedAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 5. Software Licenses */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-[#57cc99]" /> Licencias de Software
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalInventory.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pasivos Column (Banks vs People) */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#081a14]/40 border border-[#1d4034]/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1d4034]/40">
                <span className="text-rose-400 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Pasivos Totales
                </span>
                <span className="text-white font-bold text-sm">
                  S/{summary.totalLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <Wallet2 className="w-3.5 h-3.5 text-[#57cc99]" /> Entidades Bancarias
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalFinancialLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a8b5b0] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#57cc99]" /> Préstamos Personales
                  </span>
                  <span className="text-white font-semibold">
                    S/{summary.totalPersonalLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#a8b5b0] italic mt-4 pt-2 border-t border-[#1d4034]/10 space-y-1">
              <div>* El patrimonio neto incluye el valor de tu infraestructura TI, oficinas corporativas y licencias en stock.</div>
              <div>* Tipo de cambio referencial para consolidar activos y pasivos en dólares: <strong className="text-[#80ed99]">1 USD = S/ {exchangeRate.toFixed(2)}</strong>.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
