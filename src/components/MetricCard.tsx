import React from "react";
import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
};

export function MetricCard({ title, value, subtext, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-3xl p-5 hover:shadow-xl hover:border-[#57cc99]/30 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[120px]">
      {/* Subtle decorative glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#57cc99]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase leading-tight">
          {title}
        </span>
        <div className="shrink-0 bg-[#57cc99]/10 border border-[#57cc99]/10 p-2 rounded-xl text-[#57cc99]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          className="text-white font-extrabold leading-none tracking-tight break-all"
          style={{ fontSize: "clamp(1rem, 2.2vw, 1.6rem)" }}
          title={value}
        >
          {value}
        </p>

        {subtext && (
          <p className="text-[#a8b5b0] text-[11px] mt-1.5 leading-snug">{subtext}</p>
        )}

        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "text-[#80ed99] bg-[#80ed99]/10"
                  : "text-rose-400 bg-rose-400/10"
              }`}
            >
              {trend.value}
            </span>
            <span className="text-[#a8b5b0] text-[10px]">últimos 30 días</span>
          </div>
        )}
      </div>
    </div>
  );
}
