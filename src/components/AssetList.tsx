"use client";
import React, { useState } from "react";
import { Home, Server, Laptop, Key, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EditRecordModal, FieldDef } from "./EditRecordModal";

type Asset = {
  id: string;
  name: string;
  value: string;
  type: string;
  currency: string;
};

type AssetListProps = {
  assets: Asset[];
  onAddClick?: () => void;
  onMutate?: () => void;
};

const ASSET_FIELDS: FieldDef[] = [
  { key: "name", label: "Nombre del Activo", type: "text" },
  { key: "value", label: "Valor", type: "number", step: "0.01", min: "0" },
  { key: "type", label: "Tipo", type: "select", options: [
    { value: "property", label: "Oficinas / Inmuebles" },
    { value: "servers", label: "Servidores / Infraestructura" },
    { value: "hardware", label: "Equipos / Hardware" },
    { value: "software_licenses", label: "Licencias de Software" },
  ]},
  { key: "currency", label: "Moneda", type: "select", options: [{ value: "PEN", label: "Soles (S/)" }, { value: "USD", label: "Dólares ($)" }] },
];

export function AssetList({ assets, onAddClick, onMutate }: AssetListProps) {
  const [editRecord, setEditRecord] = useState<Asset | null>(null);

  const getIcon = (type: string) => {
    if (type === "servers") return Server;
    if (type === "hardware") return Laptop;
    if (type === "software_licenses") return Key;
    return Home;
  };

  const getAssetTypeLabel = (type: string) => {
    if (type === "servers") return "Servidores / Infraestructura";
    if (type === "hardware") return "Equipos / Hardware";
    if (type === "software_licenses") return "Licencias de Software";
    return "Oficinas / Inmuebles";
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    const toastId = toast.loading("Eliminando...");
    try {
      const res = await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { toast.success("Activo eliminado", { id: toastId }); onMutate?.(); }
      else toast.error(data.error || "Error al eliminar", { id: toastId });
    } catch { toast.error("Error de red", { id: toastId }); }
  };

  const fixedAssets = assets.filter(a => a.type !== "software_licenses");
  const inventoryAssets = assets.filter(a => a.type === "software_licenses");

  const renderGroup = (title: string, list: Asset[], emptyMsg: string) => (
    <div className="space-y-3">
      <h4 className="text-[#57cc99] font-bold text-xs uppercase tracking-wider border-b border-[#1d4034]/30 pb-1.5 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-[10px] text-[#a8b5b0] bg-[#0b241c] px-2 py-0.5 rounded-full font-semibold">{list.length}</span>
      </h4>
      <div className="space-y-3">
        {list.map((ast) => {
          const Icon = getIcon(ast.type);
          const valueNum = parseFloat(ast.value);
          const symbol = ast.currency === "USD" ? "$" : "S/";
          return (
            <div key={ast.id} className="flex justify-between items-center p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group/item">
              <div className="flex items-center gap-4 min-w-0">
                <div className="bg-[#57cc99]/10 p-3 rounded-xl text-[#57cc99] shrink-0"><Icon className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <h5 className="text-white font-semibold text-sm group-hover/item:text-[#57cc99] transition-colors duration-300 truncate">{ast.name}</h5>
                  <span className="text-xs text-[#a8b5b0]">{getAssetTypeLabel(ast.type)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                  <button onClick={() => setEditRecord(ast)} title="Editar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-[#57cc99] hover:bg-[#57cc99]/10 transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(ast.id, ast.name)} title="Eliminar" className="p-1.5 rounded-lg text-[#a8b5b0] hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-white font-bold text-sm">{symbol}{valueNum.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-xs text-[#a8b5b0]/60 italic py-2 pl-2">{emptyMsg}</p>}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold tracking-tight">Activos Físicos y TI</h3>
          {onAddClick ? <button onClick={onAddClick} className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95">+ Añadir</button>
            : <span className="text-[#57cc99] font-bold text-[10px] tracking-widest uppercase bg-[#57cc99]/10 px-3 py-1 rounded-full">Propiedades</span>}
        </div>
        <div className="space-y-6">
          {renderGroup("Infraestructura y Oficinas", fixedAssets, "No hay infraestructura ni oficinas registradas.")}
          {renderGroup("Licencias y Software", inventoryAssets, "No hay licencias ni software en stock.")}
        </div>
      </div>

      {editRecord && (
        <EditRecordModal
          isOpen={!!editRecord}
          onClose={() => setEditRecord(null)}
          title="Editar Activo"
          record={editRecord}
          fields={ASSET_FIELDS}
          endpoint="/api/assets"
          onSuccess={() => { onMutate?.(); setEditRecord(null); }}
        />
      )}
    </>
  );
}
