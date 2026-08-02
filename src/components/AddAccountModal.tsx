import React from "react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type AddAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export function AddAccountModal({ isOpen, onClose, onSubmitSuccess }: AddAccountModalProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      balance: "",
      type: "checking",
      currency: "PEN", // 'PEN' | 'USD'
    },
    onSubmit: async ({ value }) => {
      // Input validation
      if (!value.name.trim()) {
        toast.error("El nombre de la cuenta es obligatorio");
        return;
      }
      if (!value.balance || isNaN(parseFloat(value.balance))) {
        toast.error("Por favor ingresa un saldo inicial válido");
        return;
      }

      const toastId = toast.loading("Guardando cuenta...");
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || "¡Cuenta creada con éxito!", { id: toastId });
          form.reset();
          onSubmitSuccess();
          onClose();
        } else {
          toast.error(data.error || "Error al crear la cuenta", { id: toastId });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error de conexión al servidor", { id: toastId });
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-lg bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 shadow-2xl relative mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#a8b5b0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-white text-2xl font-bold tracking-tight mb-6">
          Registrar Nueva Cuenta
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Account name */}
          <form.Field
            name="name"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Nombre de la Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: BBVA Negocios, Santander Reserva USD"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-emerald-100/10 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
              </div>
            )}
          />

          {/* Moneda */}
          <form.Field
            name="currency"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Moneda
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "PEN", label: "Soles (S/)" },
                    { value: "USD", label: "Dólares ($)" },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => field.handleChange(c.value as any)}
                      className={`py-3 px-4 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                        field.state.value === c.value
                          ? "bg-[#57cc99] text-[#0b241c] shadow-lg shadow-[#57cc99]/20"
                          : "bg-[#081a14] border border-[#1d4034] text-[#a8b5b0] hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          {/* Initial balance */}
          <form.Field
            name="balance"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-emerald-100/10 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
              </div>
            )}
          />

          {/* Account type selector */}
          <form.Field
            name="type"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Tipo de Cuenta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "checking", label: "Corriente" },
                    { value: "savings", label: "Ahorros" },
                    { value: "credit", label: "Crédito" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => field.handleChange(t.value as any)}
                      className={`py-3.5 px-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                        field.state.value === t.value
                          ? "bg-[#57cc99] text-[#0b241c] shadow-lg shadow-[#57cc99]/20"
                          : "bg-[#081a14] border border-[#1d4034] text-[#a8b5b0] hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#1d4034] text-[#a8b5b0] hover:text-white rounded-full py-4 font-bold transition-all duration-300 cursor-pointer text-center text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#57cc99] text-[#0b241c] rounded-full py-4 font-bold hover:bg-[#80ed99] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[#57cc99]/20 text-center text-xs"
            >
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
