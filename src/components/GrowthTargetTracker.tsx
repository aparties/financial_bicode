import React from "react";
import { ShieldCheck, ShieldAlert, Target } from "lucide-react";

type GrowthTargetTrackerProps = {
  currentNetWorth: number;
  growthTarget20: number;
  projectedGrowth: number;
  growthProgress: number;
};

export function GrowthTargetTracker({
  currentNetWorth,
  growthTarget20,
  projectedGrowth,
  growthProgress,
}: GrowthTargetTrackerProps) {
  const targetNetWorth = currentNetWorth + growthTarget20;
  const isGoalMet = growthProgress >= 100;

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      {/* Target Icon in corner */}
      <div className="absolute top-8 right-8 text-[#57cc99]/15 group-hover:scale-110 transition-transform duration-500">
        <Target className="w-12 h-12" />
      </div>

      <h3 className="text-white text-xl font-bold tracking-tight mb-1">Objetivo de Crecimiento Anual</h3>
      <p className="text-xs text-[#a8b5b0] max-w-xl">
        De acuerdo con análisis financieros de referencia, se debe crecer al menos un **20% al año** en patrimonio neto para mitigar deudas operativas y consolidar la solvencia.
      </p>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Patrimonio Actual */}
        <div className="p-5 rounded-2xl bg-[#081a14] border border-[#1d4034]/30">
          <span className="text-[#a8b5b0] text-[10px] uppercase font-bold tracking-wider block mb-1">
            Patrimonio Actual
          </span>
          <span className="text-white font-extrabold text-lg block">
            S/{currentNetWorth.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 20% Target Increment */}
        <div className="p-5 rounded-2xl bg-[#081a14] border border-[#1d4034]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-[#57cc99]" />
          <span className="text-[#57cc99] text-[10px] uppercase font-bold tracking-wider block mb-1">
            Meta Incremento (+20%)
          </span>
          <span className="text-white font-extrabold text-lg block">
            +S/{growthTarget20.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Patrimonio Objetivo */}
        <div className="p-5 rounded-2xl bg-[#081a14] border border-[#1d4034]/30">
          <span className="text-[#a8b5b0] text-[10px] uppercase font-bold tracking-wider block mb-1">
            Patrimonio Objetivo
          </span>
          <span className="text-white font-extrabold text-lg block">
            S/{targetNetWorth.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Progress bar tracking future project margin vs 20% net worth goal */}
      <div className="space-y-3 p-5 rounded-2xl bg-[#081a14]/40 border border-[#1d4034]/20">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#a8b5b0] font-semibold">
            Margen de Proyectos TI Futuros: <strong className="text-white">S/{projectedGrowth.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</strong>
          </span>
          <span className="text-[#57cc99] font-bold text-sm bg-[#57cc99]/10 px-2 py-0.5 rounded-full">
            {growthProgress.toFixed(1)}% cubierto
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#081a14] rounded-full h-3 overflow-hidden border border-[#1d4034]/40">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
              isGoalMet ? "from-[#57cc99] to-[#80ed99]" : "from-amber-400 to-[#57cc99]"
            }`}
            style={{ width: `${Math.min(growthProgress, 100)}%` }}
          />
        </div>

        {/* Dynamic status feedback */}
        <div className="flex items-start gap-3 text-xs pt-1.5">
          {isGoalMet ? (
            <ShieldCheck className="w-5 h-5 text-[#80ed99] shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <p className={isGoalMet ? "text-[#80ed99] font-semibold leading-relaxed" : "text-[#a8b5b0] leading-relaxed"}>
            {isGoalMet
              ? "¡Meta de crecimiento patrimonial cubierta! Tus proyectos planificados garantizan un crecimiento superior al 20% anual."
              : `En camino. Para mitigar riesgos de deuda y consolidar tu meta de crecimiento, requieres registrar S/${Math.max(0, growthTarget20 - projectedGrowth).toLocaleString("es-ES", { minimumFractionDigits: 0 })} adicionales en márgenes de proyectos tecnológicos.`}
          </p>
        </div>
      </div>
    </div>
  );
}
