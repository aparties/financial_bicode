import React from "react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type AddLiabilityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export function AddLiabilityModal({ isOpen, onClose, onSubmitSuccess }: AddLiabilityModalProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      amount: "",
      interestRate: "",
      type: "financial", // 'financial' | 'personal' | 'tax'
      dueDate: "",
      installmentAmount: "",
      pendingInstallments: "",
      currency: "PEN", // 'PEN' | 'USD'
    },
    onSubmit: async ({ value }) => {
      // Input validation
      if (!value.name.trim()) {
        toast.error("El nombre o entidad acreedora es obligatorio");
        return;
      }
      if (!value.amount || isNaN(parseFloat(value.amount)) || parseFloat(value.amount) < 0) {
        toast.error("Por favor ingresa un monto de deuda válido");
        return;
      }
      
      const rate = value.interestRate === "" ? "0" : value.interestRate;
      if (isNaN(parseFloat(rate)) || parseFloat(rate) < 0) {
        toast.error("Por favor ingresa una tasa de interés válida (o 0)");
        return;
      }

      const instAmount = value.installmentAmount === "" ? "0" : value.installmentAmount;
      if (isNaN(parseFloat(instAmount)) || parseFloat(instAmount) < 0) {
        toast.error("El monto de la cuota mensual debe ser un número válido");
        return;
      }

      const pendInst = value.pendingInstallments === "" ? "0" : value.pendingInstallments;
      if (isNaN(parseInt(pendInst)) || parseInt(pendInst) < 0) {
        toast.error("El número de cuotas pendientes debe ser un entero válido");
        return;
      }

      const toastId = toast.loading("Guardando pasivo/préstamo...");
      try {
        const response = await fetch("/api/liabilities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...value,
            interestRate: rate,
            installmentAmount: instAmount,
            pendingInstallments: pendInst,
            dueDate: value.dueDate || null,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || "¡Deuda registrada con éxito!", { id: toastId });
          form.reset();
          onSubmitSuccess();
          onClose();
        } else {
          toast.error(data.error || "Error al registrar la deuda", { id: toastId });
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
      <div className="w-full max-w-lg bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 shadow-2xl relative mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#a8b5b0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-white text-2xl font-bold tracking-tight mb-6">
          Registrar Deuda / Préstamo
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
          noValidate
        >
          {/* Debt Classification Type */}
          <form.Field
            name="type"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Clasificación de Deuda
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "financial", label: "Bancaria" },
                    { value: "personal", label: "Personal" },
                    { value: "tax", label: "SUNAT / Tributo" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => field.handleChange(t.value as any)}
                      className={`py-3 px-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer text-center ${
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

          {/* Creditor name */}
          <form.Field
            name="name"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Acreedor / Entidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: BBVA Préstamo Comercial, SUNAT Deuda"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-[#a8b5b0]/20 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
              </div>
            )}
          />

          {/* Outstanding amount & Interest rate */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="amount"
              children={(field) => (
                <div>
                  <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                    Monto Adeudado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-[#a8b5b0]/20 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                  />
                </div>
              )}
            />

            <form.Field
              name="interestRate"
              children={(field) => (
                <div>
                  <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                    Tasa Interés Anual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-[#a8b5b0]/20 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                  />
                </div>
              )}
            />
          </div>

          {/* Installment details */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="installmentAmount"
              children={(field) => (
                <div>
                  <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                    Cuota Mensual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional (0.00)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-[#a8b5b0]/20 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                  />
                </div>
              )}
            />

            <form.Field
              name="pendingInstallments"
              children={(field) => (
                <div>
                  <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                    Cuotas Pendientes
                  </label>
                  <input
                    type="number"
                    placeholder="Opcional (0)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-[#a8b5b0]/20 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                  />
                </div>
              )}
            />
          </div>

          {/* Due date */}
          <form.Field
            name="dueDate"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Fecha Vencimiento Próxima Cuota / Total
                </label>
                <input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
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
              Guardar Deuda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
