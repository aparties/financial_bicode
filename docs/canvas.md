# canvas.md — Bicode Control Premium: Dashboard Financiero

> Documento estratégico del producto. Define el propósito, alcance, módulos, stack tecnológico y convenciones del proyecto.

---

## 1. Visión del Producto

**Bicode Control Premium** es un dashboard financiero privado diseñado para gestionar las finanzas personales y empresariales de un negocio de tecnología (TI) en Perú. Permite controlar activos, pasivos, flujo de caja, deudas, facturación a clientes y proyecciones de proyectos futuros — todo en un solo lugar, con soporte multidivisa (Soles y Dólares).

### Problema que resuelve
- Dispersión de información financiera entre bancos, deudas, clientes y proyectos.
- Falta de visibilidad del patrimonio neto real mes a mes.
- Dificultad para detectar si la empresa crece al ritmo mínimo del 20% anual necesario para no caer en déficit patrimonial.
- Gestión manual sin alertas de vencimientos de cuotas, facturas o deudas tributarias.

### Usuario principal
Empresario TI con negocios en Perú, con ingresos y gastos mixtos en **Soles (PEN)** y **Dólares (USD)**, con clientes locales e internacionales.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | **Next.js 16** (App Router) | Turbopack en desarrollo |
| Lenguaje | **TypeScript** | Strict mode |
| Estilos | **Tailwind CSS v4** | Paleta personalizada `pch-*` |
| Estado del servidor | **TanStack Query v5** | `useQuery` para todas las llamadas API |
| Formularios | **TanStack Form** | `@tanstack/react-form` |
| Base de datos | **Supabase** (PostgreSQL) | Opcional — auto-detectado por `DATABASE_URL` |
| ORM | **Drizzle ORM** | Schema en `src/db/schema.ts` |
| Íconos | **Lucide React** | Única librería de íconos permitida |
| Notificaciones | **react-hot-toast** | Para errores y confirmaciones |
| Gestor de paquetes | **Yarn** | No usar npm |
| Gráficas | **Recharts** | Para el gráfico de Punto de Equilibrio |

---

## 3. Módulos del Dashboard

### 3.1 Cabecera de Configuración (Setup)
- Selector de **Período de análisis** (mes/año) para análisis histórico
- Input editable de **Tipo de Cambio USD/PEN** (default: `3.4`, configurable en tiempo real)
- Botón de acceso rápido: **Registrar Transacción**

### 3.2 Tarjetas de Métricas (KPIs)
Cinco tarjetas consolidadas en Soles:

| Tarjeta | Qué mide |
|---------|----------|
| **Activos Totales** | Bancos + Facturas por cobrar + Infraestructura TI |
| **Pasivos Totales** | Deudas financieras + personales + SUNAT |
| **Consolidado Neto** | Activos − Pasivos = Patrimonio Real |
| **Ingresos del Mes** | Facturación cobrada en el período seleccionado |
| **Flujo Caja Neto** | Ingresos efectivos − Egresos efectivos |

### 3.3 Reporte Patrimonial Consolidado
- Desglose visual de activos (Bancos, Facturas, Infraestructura, Licencias)
- Desglose de pasivos (Financieros, Personales)
- Nota del tipo de cambio aplicado
- Ecuación: `Patrimonio = Activos Totales − Pasivos Totales`

### 3.4 Gráfica de Punto de Equilibrio
- Gráfica de líneas (6 meses) con curvas de **Ingresos**, **Egresos** y **Costos Fijos**
- Identifica visualmente los meses en déficit vs superávit
- Datos reales al registrar transacciones; datos simulados en modo demo

### 3.5 Salud de Liquidez y Deuda
- **Prueba Ácida**: Liquidez bancaria / Total pasivos (%)
- **Costo de Deuda Ponderado**: Tasa promedio ponderada de interés de todas las deudas
- **Algoritmo de Pago Inteligente**: Señala la deuda con mayor tasa para priorizar su amortización

### 3.6 Cronograma de Vencimientos (30 días)
- Lista de facturas por cobrar que vencen en los próximos 30 días
- Lista de cuotas de deudas y préstamos próximas a vencer
- Muestra `S/` o `$` según la moneda nativa de cada registro

### 3.7 Calendario Financiero
- Vista mensual interactiva de cobros y pagos programados
- Puntos de colores en cada día con eventos (verde = cobro, rojo = pago)
- Panel de detalle al seleccionar un día

### 3.8 Simulador de Estrés de Proyectos
- Sliders para simular cambios en ingresos (±%) y costos (±%)
- Recalcula en tiempo real el patrimonio proyectado y el progreso hacia la meta del 20%

### 3.9 Tracker de Meta de Crecimiento (+20%)
- Barra de progreso visual del crecimiento patrimonial proyectado
- Alerta si el crecimiento estimado es inferior al 20% anual requerido

### 3.10 Distribución de Egresos
- Barras de porcentaje por categoría de gasto
- Categorías: Planilla, Educación, Alimentación, Servicios Básicos, Ocio, Transporte, Alquiler, Gastos Empresa

### 3.11 Proyecciones de Proyectos TI
- Lista de proyectos futuros con ingreso estimado, costo estimado y margen proyectado
- Soporte de moneda por proyecto (PEN o USD)
- Ajustados dinámicamente por los sliders de estrés

### 3.12 Facturas e Invoices
- Lista de todas las facturas: por cobrar, cobradas, vencidas, sin facturar
- Permite registrar nuevas facturas con cliente, monto, fecha y moneda
- Integrada con el Cronograma de Vencimientos

### 3.13 Transacciones Recientes
- Registro histórico de ingresos, gastos y alquileres
- Clasificación por categoría y fecha
- Soporte multidivisa (símbolo `S/` o `$` según cuenta origen)

### 3.14 Mis Cuentas Bancarias
- Lista de cuentas con saldo actual y tipo (corriente / ahorros)
- Soporte de cuentas en Soles y Dólares
- Balance reconstruido históricamente al cambiar el período de análisis

### 3.15 Activos Físicos y TI
- Infraestructura (servidores, oficinas, hardware)
- Stock de licencias y software

### 3.16 Pasivos y Préstamos
- Deudas financieras, personales y tributarias (SUNAT)
- Cuotas, tasa de interés, cuotas pendientes y vencimiento
- Soporte de deudas en PEN y USD

---

## 4. Estructura de Archivos

```
src/
├── app/
│   ├── page.tsx               # Página principal (Client Component)
│   ├── layout.tsx             # Layout raíz con Providers
│   ├── globals.css            # Variables de diseño y reset global
│   └── api/
│       ├── dashboard/route.ts # GET: métricas consolidadas + mock data
│       ├── accounts/route.ts  # GET + POST: cuentas bancarias
│       ├── transactions/route.ts
│       ├── liabilities/route.ts
│       ├── invoices/route.ts
│       ├── assets/route.ts
│       └── projections/route.ts
├── components/
│   ├── MetricCard.tsx
│   ├── ConsolidatedReport.tsx
│   ├── BreakEvenChart.tsx
│   ├── LiquidityWeightedDebt.tsx
│   ├── UpcomingDeadlines.tsx
│   ├── FinancialCalendar.tsx
│   ├── ProjectStressTest.tsx
│   ├── GrowthTargetTracker.tsx
│   ├── ExpenseBreakdown.tsx
│   ├── ProjectionList.tsx
│   ├── InvoiceList.tsx
│   ├── TransactionList.tsx
│   ├── AccountList.tsx
│   ├── AssetList.tsx
│   ├── LiabilityList.tsx
│   ├── AddTransactionModal.tsx
│   ├── AddAccountModal.tsx
│   ├── AddInvoiceModal.tsx
│   ├── AddLiabilityModal.tsx
│   ├── AddAssetModal.tsx
│   └── AddProjectModal.tsx
└── db/
    ├── schema.ts              # Drizzle schema (todas las tablas)
    └── connection.ts          # Conexión Supabase / modo demo
docs/
├── canvas.md                  # Este documento
├── standard.md                # Estándares de código del proyecto
├── ui.md                      # Sistema de diseño y paleta de colores
└── estado-inicial.md          # Datos demo del estado base del dashboard
```

---

## 5. Variables de Entorno

```env
# .env.local
DATABASE_URL=postgresql://...   # Supabase connection string
                                # Si está vacía, el dashboard corre en modo Demo
```

> En **modo Demo** (sin `DATABASE_URL`), todos los datos provienen de los arrays `MOCK_*` definidos en `src/app/api/dashboard/route.ts`. Ver [`docs/estado-inicial.md`](./estado-inicial.md) para los valores exactos.

---

## 6. Lógica Multidivisa

- **Moneda principal de consolidación:** Soles (PEN)
- **Moneda secundaria:** Dólares (USD)
- **Tipo de cambio:** Configurable en el cabezal del dashboard (default: `1 USD = S/ 3.4`)
- **Conversión:** Se aplica en la API al consolidar métricas. Las listas muestran la moneda nativa del registro (`$` o `S/`)
- **Herencia de divisa:** Las transacciones vinculadas a una cuenta bancaria heredan la moneda de esa cuenta automáticamente

```typescript
// En src/app/api/dashboard/route.ts
const EXCHANGE_RATE = searchParams.get("exchangeRate") 
  ? parseFloat(searchParams.get("exchangeRate")!) 
  : 3.4;

const toPEN = (amount: number, currency: string) =>
  currency === "USD" ? amount * EXCHANGE_RATE : amount;
```

---

## 7. Categorías de Gastos

| Categoría | Tipo de gasto |
|-----------|---------------|
| `Ingreso Empresa` | Cobros de proyectos TI y consultoría |
| `Planilla Trabajadores` | Nómina mensual / quincenal |
| `Educación` | Colegio de los niños |
| `Alimentación` | Supermercado y alimentación familiar |
| `Servicios Básicos` | Luz, gas, internet, teléfono, servidores cloud |
| `Ocio` | Entretenimiento y salidas familiares |
| `Transporte` | Pasajes, combustible, movilidad |
| `Alquiler` | Renta de oficina o locales |
| `Gastos Empresa` | Gastos operativos generales |
| `Otros` | Cualquier egreso no clasificado |

---

## 8. Meta de Crecimiento Mínima

Según papers de gestión financiera, un negocio debe crecer al menos **20% anual** en patrimonio neto para no caer en déficit real (inflación + costo de oportunidad). El dashboard incluye:

- Un **Tracker visual** que muestra el progreso del crecimiento proyectado vs la meta del 20%
- El simulador de estrés ajusta en tiempo real si los escenarios de riesgo superan o no la meta

---

## 9. Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn dev

# Compilar para producción y verificar tipos
yarn build

# Aplicar migraciones de base de datos (requiere DATABASE_URL)
yarn drizzle-kit push
```

---

## 10. Convenciones del Proyecto

- Seguir **`docs/standard.md`** para estándares de código TypeScript/Next.js
- Seguir **`docs/ui.md`** para el sistema de diseño (paleta, formas, tipografía)
- **Íconos:** Solo `lucide-react`
- **Formularios:** Solo `@tanstack/react-form`
- **Datos del servidor:** Solo `TanStack Query` (`useQuery`)
- **Gestor de paquetes:** Solo `yarn`
- **Notificaciones:** Solo `react-hot-toast`
