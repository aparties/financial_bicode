import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type ProjectStressTestProps = {
  stressRevenueChange: number; // e.g. -20 for -20%
  setStressRevenueChange: (val: number) => void;
  stressCostChange: number; // e.g. 15 for +15%
  setStressCostChange: (val: number) => void;
};

export function ProjectStressTest({
  stressRevenueChange,
  setStressRevenueChange,
  stressCostChange,
  setStressCostChange,
}: ProjectStressTestProps) {
  const handleReset = () => {
    setStressRevenueChange(0);
    setStressCostChange(0);
  };

  const isStressed = stressRevenueChange !== 0 || stressCostChange !== 0;

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-450/10 p-3 rounded-full text-amber-400 bg-amber-400/10">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Simulador de Estrés de Proyectos TI</h3>
            <p className="text-xs text-[#a8b5b0] mt-0.5">Evalúa tu resiliencia ante pérdidas de contratos o incrementos en costos de servidores y desarrollo.</p>
          </div>
        </div>
        {isStressed && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#57cc99] hover:text-[#80ed99] bg-[#57cc99]/10 px-3.5 py-1.5 rounded-full border border-[#57cc99]/20 transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Revenue stress multiplier slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#a8b5b0] uppercase tracking-wider block">Pérdida de Contratos / Churn de Clientes</span>
            <span className={stressRevenueChange < 0 ? "text-rose-400 font-extrabold text-sm" : "text-[#a8b5b0] font-bold"}>
              {stressRevenueChange}%
            </span>
          </div>
          <input
            type="range"
            min="-40"
            max="0"
            step="5"
            value={stressRevenueChange}
            onChange={(e) => setStressRevenueChange(parseInt(e.target.value))}
            className="w-full h-2 bg-[#081a14] rounded-lg appearance-none cursor-pointer accent-[#57cc99] border border-[#1d4034]"
          />
          <span className="text-[10px] text-[#a8b5b0]/80 block leading-relaxed italic">
            * Simula caídas por pérdida de clientes recurrentes, cancelaciones de contratos o demoras en firmas de proyectos de software.
          </span>
        </div>

        {/* Cost stress multiplier slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#a8b5b0] uppercase tracking-wider block">Incremento en Costos Cloud / Salarios Devs</span>
            <span className={stressCostChange > 0 ? "text-rose-400 font-extrabold text-sm" : "text-[#a8b5b0] font-bold"}>
              +{stressCostChange}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={stressCostChange}
            onChange={(e) => setStressCostChange(parseInt(e.target.value))}
            className="w-full h-2 bg-[#081a14] rounded-lg appearance-none cursor-pointer accent-[#57cc99] border border-[#1d4034]"
          />
          <span className="text-[10px] text-[#a8b5b0]/80 block leading-relaxed italic">
            * Simula el incremento en tarifas cloud (AWS/Azure/GCP) o encarecimiento salarial de ingenieros de software clave.
          </span>
        </div>
      </div>
    </div>
  );
}
