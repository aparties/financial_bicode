import React from "react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type Account = {
  id: string;
  name: string;
  currency?: string;
};

type AddTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSubmitSuccess: () => void;
};

export function AddTransactionModal({ isOpen, onClose, accounts, onSubmitSuccess }: AddTransactionModalProps) {
  const form = useForm({
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      category: "",
      accountId: "",
      currency: "PEN", // Only used if no account is selected
    },
    onSubmit: async ({ value }) => {
      // Validate inputs
      if (!value.amount || isNaN(parseFloat(value.amount)) || parseFloat(value.amount) <= 0) {
        toast.error("Por favor ingresa un monto válido mayor a 0");
        return;
      }
      if (!value.description.trim()) {
        toast.error("La descripción es obligatoria");
        return;
      }
      if (!value.category.trim()) {
        toast.error("La categoría es obligatoria");
        return;
      }

      // Inherit account currency if linked
      const linkedAcc = accounts.find(a => a.id === value.accountId);
      const finalValue = {
        ...value,
        currency: linkedAcc ? linkedAcc.currency || "PEN" : value.currency,
      };

      const toastId = toast.loading("Guardando transacción...");
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalValue),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || "¡Transacción registrada!", { id: toastId });
          form.reset();
          onSubmitSuccess();
          onClose();
        } else {
          toast.error(data.error || "Error al registrar la transacción", { id: toastId });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error de red al intentar guardar", { id: toastId });
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
          Registrar Transacción
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          {/* Transaction Type */}
          <form.Field
            name="type"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "income", label: "Ingreso" },
                    { value: "expense", label: "Gasto" },
                    { value: "rent", label: "Alquiler" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => field.handleChange(t.value as any)}
                      className={`py-3 px-4 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
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

          {/* Account selector */}
          <form.Field
            name="accountId"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Cuenta Bancaria
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                >
                  <option value="">Ninguna (Afecta solo balance global)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency || "PEN"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          {/* Currency selection - only visible if no accountId selected */}
          <form.Subscribe
            selector={(state) => state.values.accountId}
            children={(accountId) => {
              if (accountId) {
                const linked = accounts.find(a => a.id === accountId);
                return (
                  <div className="text-xs text-[#a8b5b0] italic bg-[#081a14]/60 p-3.5 rounded-xl border border-[#1d4034]/40">
                    La divisa se heredará automáticamente de la cuenta seleccionada:{" "}
                    <strong className="text-white">{linked?.currency || "PEN"}</strong>.
                  </div>
                );
              }

              return (
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
              );
            }}
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
                  min="0.01"
                  placeholder="0.00"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-emerald-100/10 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
              </div>
            )}
          />

          {/* Description */}
          <form.Field
            name="description"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pago de servidor AWS"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white placeholder-emerald-100/10 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                />
              </div>
            )}
          />

          {/* Category */}
          <form.Field
            name="category"
            children={(field) => (
              <div>
                <label className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase block mb-2">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-[#081a14] border border-[#1d4034] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99] transition-all text-sm"
                >
                  <option value="">Selecciona una categoría...</option>
                  <option value="Ingreso Empresa">Ingreso Empresa</option>
                  <option value="Planilla Trabajadores">Planilla Trabajadores (Nómina)</option>
                  <option value="Educación">Educación (Colegio Niños)</option>
                  <option value="Alimentación">Alimentación / Supermercado</option>
                  <option value="Servicios Básicos">Servicios Básicos (Luz/Internet/Gas/Tel.)</option>
                  <option value="Ocio">Ocio y Entretenimiento</option>
                  <option value="Transporte">Transporte y Movilidad</option>
                  <option value="Alquiler">Alquiler / Rentas</option>
                  <option value="Gastos Empresa">Gastos Generales de Empresa</option>
                  <option value="Otros">Otros Egresos</option>
                </select>
              </div>
            )}
          />

          {/* Action Buttons */}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
