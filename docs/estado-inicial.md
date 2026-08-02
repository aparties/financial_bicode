# Estado Inicial del Dashboard Financiero — Bicode Control Premium

> **Versión:** 1.0  
> **Fecha de referencia:** Agosto 2026  
> **Moneda principal:** Soles (PEN)  
> **Tipo de cambio de referencia:** `1 USD = S/ 3.4` (configurable en el setup del cabezal)  
> **Modo:** Demo / Estado Inicial (datos precargados en `src/app/api/dashboard/route.ts`)

---

## 1. Cuentas Bancarias

| ID | Nombre | Saldo | Tipo | Moneda |
|----|--------|-------|------|--------|
| `acc-1` | BBVA Negocios Soles | S/ 42,450.00 | Corriente | PEN |
| `acc-2` | Santander USD Reserva | $ 15,500.00 | Ahorros | USD |
| `acc-3` | Caja Chica Soles | S/ 1,850.00 | Corriente | PEN |

**Saldo bancario total consolidado en Soles:** `S/ 97,050.00`  
_(Santander USD: $15,500 × 3.4 = S/ 52,700 + S/ 42,450 + S/ 1,850)_

---

## 2. Facturas y Trabajos (Invoices)

| ID | Cliente / Descripción | Monto | Estado | Vencimiento | Moneda |
|----|----------------------|-------|--------|-------------|--------|
| `inv-1` | Factura #201 — Tech Corp (Desarrollo) | $ 4,800.00 | Pagada | 27-Jul-2026 | USD |
| `inv-2` | Factura #202 — Alpha Inc (DevOps) | $ 2,500.00 | Pendiente | 30-Ago-2026 | USD |
| `inv-3` | Factura #203 — Beta LLC (Consultoría) | S/ 12,000.00 | Pendiente | 01-Oct-2026 | PEN |
| `inv-4` | Factura #199 — Gamma Group (Auditoría) | S/ 6,500.00 | Vencida | 28-Jul-2026 | PEN |
| `inv-5` | Trabajo — Delta Co (Desarrollo Web) | S/ 5,400.00 | Sin facturar | — | PEN |
| `inv-6` | Servicio Cloud — Epsilon LLC (Migración) | S/ 3,100.00 | Sin facturar | — | PEN |
| `inv-7` | Factura #105 — Sigma Inc (Histórica) | S/ 5,200.00 | Pagada | 25-Ago-2025 | PEN |

**Estados de facturación:**
- `paid` — Cobrada y liquidada
- `pending` — Por cobrar (en plazo)
- `overdue` — Vencida sin cobrar
- `unbilled` — Trabajo entregado, aún no facturado

---

## 3. Activos Físicos y TI

### Infraestructura y Oficinas
| ID | Nombre | Valor | Tipo | Moneda |
|----|--------|-------|------|--------|
| `ast-1` | Cluster Servidores Cloud locales | S/ 75,000.00 | Servidores | PEN |
| `ast-2` | Oficina Miraflores (Sede Central) | S/ 320,000.00 | Inmueble | PEN |
| `ast-3` | Laptops de Desarrollo Pro (Equipos) | S/ 18,000.00 | Hardware | PEN |

### Licencias y Software (Stock)
| ID | Nombre | Valor | Tipo | Moneda |
|----|--------|-------|------|--------|
| `ast-4` | Stock Licencias SaaS Factura-E | S/ 3,450.00 | Licencias | PEN |
| `ast-5` | Stock Licencias API Integración | S/ 4,800.00 | Licencias | PEN |

---

## 4. Pasivos / Deudas

| ID | Nombre | Monto | Tasa | Tipo | Cuota | Cuotas Pend. | Vencimiento | Moneda |
|----|--------|-------|------|------|-------|-------------|-------------|--------|
| `lia-1` | Préstamo Comercial BBVA | S/ 25,000.00 | 5.50% | Financiero | S/ 1,500 | 18 | 18-Dic-2026 | PEN |
| `lia-2` | Tarjeta Visa Corporate USD | $ 1,200.00 | 18.90% | Financiero | $ 1,200 | 1 | 10-Ago-2026 | USD |
| `lia-3` | Leasing Servidores Dell | S/ 8,900.00 | 4.20% | Financiero | S/ 450 | 20 | 22-Oct-2026 | PEN |
| `lia-4` | Préstamo Personal — Dr. Juan Gómez | S/ 7,500.00 | 0.00% | Personal | S/ 500 | 15 | 01-Nov-2026 | PEN |
| `lia-5` | Fraccionamiento Deuda SUNAT | S/ 12,000.00 | 1.20% | Tributario | S/ 1,000 | 12 | 10-Ago-2027 | PEN |

> **Nota:** La deuda con mayor tasa de interés es la **Tarjeta Visa Corporate USD (18.90%)**. El algoritmo de pago inteligente recomienda amortizarla prioritariamente.

---

## 5. Transacciones Registradas

### Julio — Agosto 2026
| ID | Cuenta | Tipo | Monto | Descripción | Categoría | Moneda | Fecha |
|----|--------|------|-------|-------------|-----------|--------|-------|
| `tx-1` | Santander USD | Ingreso | $ 4,800.00 | Cobro Factura #201 (Tech Corp) | Ingreso Empresa | USD | 27-Jul-2026 |
| `tx-2` | BBVA Soles | Alquiler | S/ 4,500.00 | Renta Oficina Miraflores | Alquiler | PEN | 28-Jul-2026 |
| `tx-3` | BBVA Soles | Gasto | S/ 15,700.00 | Pago Planilla Trabajadores (Quincena) | Planilla Trabajadores | PEN | 01-Ago-2026 |
| `tx-4` | BBVA Soles | Gasto | S/ 2,500.00 | Mensualidad Colegio de los Niños | Educación | PEN | 27-Jul-2026 |
| `tx-5` | BBVA Soles | Gasto | S/ 1,800.00 | Supermercado y Alimentación Familiar | Alimentación | PEN | 30-Jul-2026 |
| `tx-6` | Santander USD | Gasto | $ 450.00 | Servidores Cloud AWS / Azure | Servicios Básicos | USD | 26-Jul-2026 |
| `tx-7` | BBVA Soles | Gasto | S/ 450.00 | Ocio y Salida Familiar Fin de Semana | Ocio | PEN | 25-Jul-2026 |
| `tx-8` | BBVA Soles | Gasto | S/ 800.00 | Pasajes, Combustible y Movilidad | Transporte | PEN | 27-Jul-2026 |
| `tx-9` | BBVA Soles | Ingreso | S/ 9,800.00 | Consultoría TI Local | Ingreso Empresa | PEN | 24-Jul-2026 |

### Agosto 2025 (Histórico)
| ID | Tipo | Monto | Descripción | Categoría | Moneda | Fecha |
|----|------|-------|-------------|-----------|--------|-------|
| `tx-10` | Ingreso | S/ 5,200.00 | Cobro Factura #105 (Sigma Inc) | Ingreso Empresa | PEN | 25-Ago-2025 |
| `tx-11` | Gasto | S/ 3,100.00 | Pago Planilla Trabajadores 2025 | Planilla Trabajadores | PEN | 15-Ago-2025 |
| `tx-12` | Gasto | S/ 750.00 | Mensualidad Colegio Niños 2025 | Educación | PEN | 05-Ago-2025 |

---

## 6. Proyecciones de Proyectos TI

| ID | Proyecto | Ingreso Estimado | Costo Estimado | Margen | Estado | Moneda |
|----|----------|-----------------|----------------|--------|--------|--------|
| `prj-1` | SaaS Facturación Electrónica Q4 | S/ 85,000.00 | S/ 32,000.00 | S/ 53,000.00 | Activo | PEN |
| `prj-2` | Desarrollo ERP Corporativo 2027 | $ 45,000.00 | $ 15,000.00 | $ 30,000.00 | Planificado | USD |
| `prj-3` | App Móvil Clave Fase B | S/ 60,000.00 | S/ 25,000.00 | S/ 35,000.00 | Planificado | PEN |

---

## 7. Categorías de Gastos Disponibles

Las categorías de transacciones disponibles para clasificar egresos en el modal de registro son:

| Categoría | Descripción |
|-----------|-------------|
| `Ingreso Empresa` | Cobros de facturas, consultoría, proyectos TI |
| `Planilla Trabajadores` | Sueldos y nómina de colaboradores |
| `Educación` | Colegio de los niños |
| `Alimentación` | Supermercado y alimentación familiar |
| `Servicios Básicos` | Luz, gas, internet, teléfono, servidores cloud |
| `Ocio` | Entretenimiento y salidas familiares |
| `Transporte` | Pasajes, combustible, movilidad |
| `Alquiler` | Renta de oficinas o locales |
| `Gastos Empresa` | Gastos operativos generales de la empresa |
| `Otros` | Cualquier otro egreso no clasificado |

---

## 8. Métricas del Resumen Consolidado (Agosto 2026 — Estado Inicial)

| Métrica | Valor (S/) | Notas |
|---------|-----------|-------|
| **Activos Totales** | S/ 497,950–555,550 | Variable según tipo de cambio configurado |
| **Pasivos Totales** | S/ 57,480–57,600 | Incluye deuda en USD convertida |
| **Consolidado Neto (Patrimonio)** | S/ 440,000–498,000 | Activos − Pasivos |
| **Flujo Caja Neto** | S/ 0 (demo) | Se activa al registrar transacciones del mes |
| **Meta de Crecimiento** | +20% anual | Alerta si crecimiento proyectado < 20% |
| **Tasa de Deuda Ponderada** | ~6.2% | Promedio ponderado de tasas de interés |
| **Prueba Ácida (Liquidez)** | >100% | Bancos / Total Pasivos |

> Los valores exactos varían según el tipo de cambio USD/PEN configurado (por defecto `3.4`).

---

## 9. Configuración del Sistema

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Tipo de cambio base | `1 USD = S/ 3.4` | Editable en el cabezal del dashboard |
| Moneda principal | Soles (PEN) | Todos los consolidados se muestran en S/ |
| Moneda secundaria | Dólares (USD) | Facturas, cuentas y deudas pueden ser en $ |
| Meta de crecimiento | 20% anual | Benchmark mínimo para no caer en déficit patrimonial |
| Período de análisis | Configurable | Selector de mes en el cabezal (desde Ago 2025) |
| Modo base de datos | Demo (mock) / Supabase | Auto-detectado según `DATABASE_URL` en `.env` |

---

## 10. Arquitectura de Datos (Esquema)

Todas las entidades financieras soportan la columna `currency` con valores `"PEN"` o `"USD"`:

```
accounts          → id, name, balance, type, currency, createdAt
transactions      → id, accountId, type, amount, description, category, currency, date
liabilities       → id, name, amount, interestRate, type, installmentAmount, pendingInstallments, dueDate, currency
invoices          → id, clientName, amount, status, paymentTerms, dueDate, currency
propertiesAssets  → id, name, value, type, currency, createdAt
projections       → id, name, estimatedRevenue, estimatedCost, status, currency, createdAt
```

La API de dashboard convierte automáticamente todo a Soles usando el tipo de cambio dinámico:
```typescript
const toPEN = (amount: number, currency: string) =>
  currency === "USD" ? amount * EXCHANGE_RATE : amount;
```
