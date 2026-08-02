import React from "react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type AddInvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export function AddInvoiceModal({ isOpen, onClose, onSubmitSuccess }: AddInvoiceModalProps) {
  const form = useForm({
    defaultValues: {
      clientName: "",
      amount: "",
      status: "pending", // 'unbilled' | 'pending' | 'paid'
      paymentTerms: "immediate", // 'immediate' | '30_days' | '60_days' | 'custom'
      dueDate: "",
      currency: "PEN", // 'PEN' | 'USD'
    },
    onSubmit: async ({ value }) => {
      // Validate inputs
      if (!value.clientName.trim()) {
        toast.error("El nombre del cliente o trabajo es obligatorio");
        return;
      }
      if (!value.amount || isNaN(parseFloat(value.amount)) || parseFloat(value.amount) <= 0) {
        toast.error("Por favor ingresa un monto facturado positivo");
        return;
      }
      if (value.paymentTerms === "custom" && !value.dueDate) {
        toast.error("Por favor selecciona una fecha de vencimiento");
        return;
      }

      const toastId = toast.loading("Guardando factura...");
      try {
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...value,
            dueDate: value.paymentTerms === "custom" ? value.dueDate : null,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || "¡Factura guardada con éxito!", { id: toastId });
          form.reset();
          onSubmitSuccess();
          onClose();
        } else {
          toast.error(data.error || "Error al registrar la factura", { id: toastId });
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#a8b5b0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-white text-2xl font-bold tracking-tight mb-6">
          Registrar Factura / Trabajo
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          {/* Client / Project Name */}
          <form.Field
            name="clientName"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Cliente o Descripción del Trabajo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Alpha Tech, Factura #205"
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

          {/* Amount */}
          <form.Field
            name="amount"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Monto
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

          {/* Status of Billing */}
          <form.Field
            name="status"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Estado Operativo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "unbilled", label: "Por Facturar" },
                    { value: "pending", label: "Por Cobrar" },
                    { value: "paid", label: "Cobrada" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => field.handleChange(s.value as any)}
                      className={`py-3 px-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                        field.state.value === s.value
                          ? "bg-[#57cc99] text-[#0b241c] shadow-lg shadow-[#57cc99]/20"
                          : "bg-[#081a14] border border-[#1d4034] text-[#a8b5b0] hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          {/* Payment Terms Credit dropdown */}
          <form.Field
            name="paymentTerms"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Plazo de Crédito
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                >
                  <option value="immediate">Inmediato / Contado</option>
                  <option value="30_days">Crédito a 30 días</option>
                  <option value="60_days">Crédito a 60 días</option>
                  <option value="custom">Personalizado / Otra fecha</option>
                </select>
              </div>
            )}
          />

          {/* Conditional Due Date */}
          {form.state.values.paymentTerms === "custom" && (
            <form.Field
              name="dueDate"
              children={(field) => (
                <div>
                  <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                    Fecha de Vencimiento
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
          )}

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
              Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
