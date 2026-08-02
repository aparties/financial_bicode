# db-canvas.md — Canvas del Modelo de Datos: Bicode Control Premium

> Vista panorámica del modelo de base de datos. Referencia rápida de todas las tablas, sus campos clave, valores permitidos y relaciones.

---

## Mapa de Tablas

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         BICODE CONTROL PREMIUM — BASE DE DATOS                         │
│                         PostgreSQL via Neon  ·  ORM: Drizzle                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐          ┌──────────────────────────────────────┐
  │      accounts        │ 1 ──── * │             transactions              │
  │─────────────────────│          │──────────────────────────────────────│
  │ 🔑 id (uuid)        │◄─────────│ 🔑 id (uuid)                         │
  │    name             │          │ 🔗 account_id (uuid, nullable, CASCADE)│
  │    balance (12,2)   │          │    type: income|expense|rent         │
  │    type             │          │    amount (12,2)                     │
  │    currency PEN|USD │          │    description                       │
  │    created_at       │          │    category                          │
  └─────────────────────┘          │    currency PEN|USD                  │
                                   │    date                              │
                                   │    created_at                        │
                                   └──────────────────────────────────────┘

  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐
  │          liabilities          │  │               invoices                │
  │──────────────────────────────│  │──────────────────────────────────────│
  │ 🔑 id (uuid)                 │  │ 🔑 id (uuid)                         │
  │    name                      │  │    client_name                       │
  │    amount (12,2)             │  │    amount (12,2)                     │
  │    interest_rate (4,2)  %    │  │    status                            │
  │    type                      │  │    payment_terms                     │
  │    due_date (nullable)       │  │    due_date (nullable)               │
  │    installment_amount (12,2) │  │    currency PEN|USD                  │
  │    pending_installments (int)│  │    created_at                        │
  │    currency PEN|USD          │  └──────────────────────────────────────┘
  │    created_at                │
  └──────────────────────────────┘

  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐
  │       properties_assets      │  │             projections               │
  │──────────────────────────────│  │──────────────────────────────────────│
  │ 🔑 id (uuid)                 │  │ 🔑 id (uuid)                         │
  │    name                      │  │    name                              │
  │    value (12,2)              │  │    estimated_revenue (12,2)          │
  │    type                      │  │    estimated_cost (12,2)             │
  │    currency PEN|USD          │  │    status                            │
  │    created_at                │  │    currency PEN|USD                  │
  └──────────────────────────────┘  │    created_at                        │
                                    └──────────────────────────────────────┘
```

---

## Enumeraciones y Valores Permitidos

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  CAMPO            │ TABLA               │ VALORES PERMITIDOS                            │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  currency         │ TODAS               │ "PEN"  ·  "USD"                               │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  accounts.type    │ accounts            │ "checking"  ·  "savings"  ·  "credit"         │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  transactions.type│ transactions        │ "income"  ·  "expense"  ·  "rent"             │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  transactions     │ transactions        │ "Ingreso Empresa"  ·  "Planilla Trabajadores" │
│    .category      │                     │ "Educación"  ·  "Alimentación"                │
│                   │                     │ "Servicios Básicos"  ·  "Ocio"                │
│                   │                     │ "Transporte"  ·  "Alquiler"                   │
│                   │                     │ "Gastos Empresa"  ·  "Otros"                  │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  liabilities.type │ liabilities         │ "financial"  ·  "personal"  ·  "tax"         │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  invoices.status  │ invoices            │ "paid"  ·  "pending"  ·  "overdue"           │
│                   │                     │ "unbilled"                                    │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  invoices         │ invoices            │ "immediate"  ·  "30_days"                    │
│    .payment_terms │                     │ "60_days"  ·  "custom"                        │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  assets.type      │ properties_assets   │ "property"  ·  "servers"                     │
│                   │                     │ "hardware"  ·  "software_licenses"            │
├───────────────────┼─────────────────────┼───────────────────────────────────────────────┤
│  projections      │ projections         │ "planned"  ·  "active"  ·  "completed"       │
│    .status        │                     │                                               │
└───────────────────┴─────────────────────┴───────────────────────────────────────────────┘
```

---

## Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DESDE           │ HACIA         │ TIPO            │ COMPORTAMIENTO                     │
├──────────────────┼───────────────┼─────────────────┼────────────────────────────────────┤
│  transactions    │ accounts      │ N:1 (opcional)  │ ON DELETE CASCADE                  │
│  .account_id     │ .id           │ nullable FK     │ Si se borra la cuenta, se borran   │
│                  │               │                 │ todas sus transacciones             │
├──────────────────┼───────────────┼─────────────────┼────────────────────────────────────┤
│  liabilities     │ —             │ Independiente   │ Sin FK. Relación lógica en API     │
│  invoices        │ —             │ Independiente   │ Sin FK. Relación lógica en API     │
│  properties_     │ —             │ Independiente   │ Sin FK. Relación lógica en API     │
│    assets        │               │                 │                                    │
│  projections     │ —             │ Independiente   │ Sin FK. Relación lógica en API     │
└──────────────────┴───────────────┴─────────────────┴────────────────────────────────────┘
```

---

## Fórmulas de Consolidación (API)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          LÓGICA DE CONSOLIDACIÓN EN SOLES                               │
│                     src/app/api/dashboard/route.ts                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  toPEN(monto, moneda) = monto * EXCHANGE_RATE  si moneda = "USD"                       │
│                       = monto                  si moneda = "PEN"                       │
│                                                                                         │
│  EXCHANGE_RATE = query param ?exchangeRate=X  ·  default: 3.4                          │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Activos Totales  =  Σ toPEN(accounts.balance)                                         │
│                   +  Σ toPEN(invoices.amount)  WHERE status IN ('pending','overdue')   │
│                   +  Σ toPEN(invoices.amount)  WHERE status = 'unbilled'               │
│                   +  Σ toPEN(assets.value)     WHERE type != 'software_licenses'       │
│                   +  Σ toPEN(assets.value)     WHERE type = 'software_licenses'        │
│                                                                                         │
│  Pasivos Totales  =  Σ toPEN(liabilities.amount) WHERE type IN ('financial','tax')     │
│                   +  Σ toPEN(liabilities.amount) WHERE type = 'personal'               │
│                                                                                         │
│  Patrimonio Neto  =  Activos Totales  −  Pasivos Totales                               │
│                                                                                         │
│  Flujo Caja Neto  =  Σ toPEN(transactions.amount) WHERE type = 'income'  (mes actual) │
│                   −  Σ toPEN(transactions.amount) WHERE type IN ('expense','rent')     │
│                                                                                         │
│  Meta Crecimiento =  Patrimonio Neto  ×  1.20   (objetivo +20% anual)                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Modo Demo vs Producción

```
┌───────────────────────────────┬────────────────────────────────────────────────────────┐
│  DATABASE_URL definida        │  DATABASE_URL vacía / no definida                      │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│  PRODUCCIÓN                   │  DEMO                                                  │
│  · Drizzle + Neon PostgreSQL  │  · Arrays MOCK_* en route.ts                          │
│  · Datos persisten            │  · Sin persistencia                                    │
│  · isDemo = false             │  · isDemo = true                                       │
│  · db = drizzle(sql, schema)  │  · db = null                                           │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| [`src/db/schema.ts`](../src/db/schema.ts) | Definición de tablas con Drizzle ORM |
| [`src/db/connection.ts`](../src/db/connection.ts) | Inicialización de Neon + Drizzle + flag `isDemo` |
| [`src/app/api/dashboard/route.ts`](../src/app/api/dashboard/route.ts) | GET principal — consolidación, mock data, tipo de cambio |
| [`src/app/api/accounts/route.ts`](../src/app/api/accounts/route.ts) | GET + POST cuentas |
| [`src/app/api/transactions/route.ts`](../src/app/api/transactions/route.ts) | GET + POST transacciones |
| [`src/app/api/liabilities/route.ts`](../src/app/api/liabilities/route.ts) | GET + POST pasivos |
| [`src/app/api/invoices/route.ts`](../src/app/api/invoices/route.ts) | GET + POST facturas |
| [`src/app/api/assets/route.ts`](../src/app/api/assets/route.ts) | GET + POST activos |
| [`src/app/api/projections/route.ts`](../src/app/api/projections/route.ts) | GET + POST proyecciones |
| [`drizzle.config.ts`](../drizzle.config.ts) | Configuración de Drizzle Kit |
| [`docs/ER.md`](./ER.md) | Diagrama ER detallado con columnas |
| [`docs/db.md`](./db.md) | Referencia técnica completa (DDL + endpoints) |
| [`docs/estado-inicial.md`](./estado-inicial.md) | Datos demo del estado base |
