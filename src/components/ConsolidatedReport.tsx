import React from "react";
import { Landmark, TrendingUp, ShieldAlert, BadgeDollarSign, Wallet2, Users, PenTool, Home, Boxes, Download, Layers, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

type ConsolidatedSummary = {
  totalBalance: number;
  totalUnbilled: number;
  totalReceivables: number;
  totalFixedAssets: number;
  totalInventory: number;
  totalAssets: number;
  totalCurrentAssets?: number;
  totalNonCurrentAssets?: number;
  totalCurrentLiabilities?: number;
  totalNonCurrentLiabilities?: number;
  totalFinancialLiabilities: number;
  totalPersonalLiabilities: number;
  totalLiabilities: number;
  workingCapital?: number;
  currentRatio?: number;
  acidTestRatio?: number;
  consolidated: number;
};

type ConsolidatedReportProps = {
  summary: ConsolidatedSummary;
  exchangeRate: number;
  onExportCsv?: () => void;
};

export function ConsolidatedReport({ summary, exchangeRate, onExportCsv }: ConsolidatedReportProps) {
  const isNetWorthPositive = summary.consolidated >= 0;
  
  const currentAssets = summary.totalCurrentAssets ?? (summary.totalBalance + summary.totalUnbilled + summary.totalReceivables + summary.totalInventory);
  const nonCurrentAssets = summary.totalNonCurrentAssets ?? summary.totalFixedAssets;
  
  const currentLiabilities = summary.totalCurrentLiabilities ?? (summary.totalLiabilities * 0.6);
  const nonCurrentLiabilities = summary.totalNonCurrentLiabilities ?? (summary.totalLiabilities - currentLiabilities);
  
  const workingCap = summary.workingCapital ?? (currentAssets - currentLiabilities);
  const isWorkingCapPositive = workingCap >= 0;
  const currentRatio = summary.currentRatio ?? (currentLiabilities > 0 ? currentAssets / currentLiabilities : 1.0);

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#57cc99]/5 rounded-full blur-[85px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase block">Balance General Sincerado</span>
          <h3 className="text-white text-xl font-bold tracking-tight">Reporte Patrimonial y Liquidez</h3>
        </div>
        
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
        
        {/* Consolidated Net Worth & Working Capital Panel */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-[#081a14] border border-[#1d4034]/60 flex flex-col justify-between relative overflow-hidden space-y-6">
          <div>
            <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase mb-1 block">
              Patrimonio Neto Real
            </span>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isNetWorthPositive ? "text-[#80ed99]" : "text-rose-400"}`}>
              S/{summary.consolidated.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-[#a8b5b0] mt-1 leading-relaxed">
              Activos Totales menos Pasivos Totales consolidados.
            </p>
          </div>

          {/* Sincerated Working Capital Box */}
          <div className="p-4 rounded-2xl bg-[#0b241c] border border-[#1d4034]/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#a8b5b0] text-[10px] uppercase font-bold tracking-wider">
                Capital de Trabajo Neto
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isWorkingCapPositive 
                  ? "text-[#80ed99] bg-[#80ed99]/10 border border-[#80ed99]/20" 
                  : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
              }`}>
                {isWorkingCapPositive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                {isWorkingCapPositive ? "Superávit" : "Déficit"}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold ${isWorkingCapPositive ? "text-white" : "text-rose-400"}`}>
                {isWorkingCapPositive ? "+" : ""}S/{workingCap.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-[#57cc99] font-semibold">
                Ratio: {currentRatio.toFixed(2)}x
              </span>
            </div>
            <p className="text-[9px] text-[#a8b5b0]/80 leading-tight">
              Activo Corriente (S/{currentAssets.toLocaleString("es-ES", { maximumFractionDigits: 0 })}) − Pasivo Corriente (S/{currentLiabilities.toLocaleString("es-ES", { maximumFractionDigits: 0 })}).
            </p>
          </div>

          <div className="text-[10px] text-[#a8b5b0] pt-2 border-t border-[#1d4034]/40">
            T.C. referencial: <strong className="text-[#80ed99]">1 USD = S/ {exchangeRate.toFixed(2)}</strong>
          </div>
        </div>

        {/* Sincerated Activos vs Pasivos Details */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Activos Sincerados Column */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#081a14]/60 border border-[#1d4034]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1d4034]/60">
                <span className="text-[#80ed99] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Activos Totales
                </span>
                <span className="text-white font-bold text-base">
                  S/{summary.totalAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 1. Activos Corrientes (Corto Plazo) */}
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between items-center bg-[#143028]/50 px-2.5 py-1 rounded-lg border border-[#1d4034]/30">
                  <span className="text-[10px] font-black uppercase text-[#57cc99] tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Activo Corriente (Corto Plazo)
                  </span>
                  <span className="text-xs font-bold text-[#80ed99]">
                    S/{currentAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Landmark className="w-3 h-3 text-[#57cc99]" /> Bancos y Efectivo
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalBalance.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <BadgeDollarSign className="w-3 h-3 text-[#57cc99]" /> Facturas por Cobrar
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalReceivables.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <PenTool className="w-3 h-3 text-amber-400" /> Trabajos por Facturar
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalUnbilled.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Boxes className="w-3 h-3 text-[#57cc99]" /> Licencias / Software Stock
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalInventory.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Activos No Corrientes (Largo Plazo / Fijos) */}
              <div className="mt-4 space-y-2 pt-3 border-t border-[#1d4034]/30">
                <div className="flex justify-between items-center bg-[#143028]/50 px-2.5 py-1 rounded-lg border border-[#1d4034]/30">
                  <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Activo No Corriente (Fijo)
                  </span>
                  <span className="text-xs font-bold text-purple-300">
                    S/{nonCurrentAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Home className="w-3 h-3 text-purple-300" /> Inmuebles, Lotes y Chacras
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalFixedAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Pasivos Sincerados Column */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#081a14]/60 border border-[#1d4034]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1d4034]/60">
                <span className="text-rose-400 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Pasivos Totales
                </span>
                <span className="text-white font-bold text-base">
                  S/{summary.totalLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 1. Pasivos Corrientes (Corto Plazo <= 1 año) */}
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between items-center bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pasivo Corriente (&le; 12 meses)
                  </span>
                  <span className="text-xs font-bold text-rose-300">
                    S/{currentLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Wallet2 className="w-3 h-3 text-rose-400" /> Cuotas Bancarias (12 meses)
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalFinancialLiabilities > 0 ? (currentLiabilities * (summary.totalFinancialLiabilities / (summary.totalLiabilities || 1))).toLocaleString("es-ES", { minimumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Users className="w-3 h-3 text-rose-400" /> Deudas Operativas / Corto Plazo
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{summary.totalPersonalLiabilities > 0 ? (currentLiabilities * (summary.totalPersonalLiabilities / (summary.totalLiabilities || 1))).toLocaleString("es-ES", { minimumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Pasivos No Corrientes (Largo Plazo > 1 año) */}
              <div className="mt-4 space-y-2 pt-3 border-t border-[#1d4034]/30">
                <div className="flex justify-between items-center bg-[#143028]/50 px-2.5 py-1 rounded-lg border border-[#1d4034]/30">
                  <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Pasivo No Corriente (&gt; 12 meses)
                  </span>
                  <span className="text-xs font-bold text-indigo-300">
                    S/{nonCurrentLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a8b5b0] flex items-center gap-1.5 text-[11px]">
                      <Wallet2 className="w-3 h-3 text-indigo-300" /> Saldo Créditos a Largo Plazo
                    </span>
                    <span className="text-white font-medium text-[11px]">
                      S/{nonCurrentLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-[#a8b5b0]/80 italic pt-2 border-t border-[#1d4034]/20">
              * Deuda sincerada: solo la porción de los próximos 12 meses afecta el capital de trabajo inmediato.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

