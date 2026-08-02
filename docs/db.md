# db.md — Referencia de Base de Datos: Bicode Control Premium

> Guía técnica completa de la capa de base de datos: conexión, ORM, migraciones, modo demo y referencia de endpoints API.

---

## 1. Motor de Base de Datos

| Parámetro | Valor |
|-----------|-------|
| Motor | **PostgreSQL** |
| Proveedor | **Neon** (serverless Postgres, compatible con Supabase) |
| ORM | **Drizzle ORM** |
| Driver | `@neondatabase/serverless` + `drizzle-orm/neon-http` |
| Schema | [`src/db/schema.ts`](../src/db/schema.ts) |
| Conexión | [`src/db/connection.ts`](../src/db/connection.ts) |

---

## 2. Modos de Operación

El sistema detecta automáticamente si existe una base de datos real o debe correr en modo demo:

```typescript
// src/db/connection.ts
const databaseUrl = process.env.DATABASE_URL;

export const isDemo = !databaseUrl;          // true si no hay DB configurada
export const sql    = databaseUrl ? neon(databaseUrl) : null;
export const db     = sql ? drizzle({ client: sql, schema }) : null;
```

| Modo | Condición | Fuente de datos |
|------|-----------|-----------------|
| **Demo** | `DATABASE_URL` no definida | Arrays `MOCK_*` en `src/app/api/dashboard/route.ts` |
| **Producción** | `DATABASE_URL` definida | PostgreSQL via Neon |

En modo Demo, **ningún dato se persiste** — todos los cambios (registros, adiciones) son solo visuales hasta que la DB esté conectada.

---

## 3. Configuración de Entorno

```env
# .env.local
DATABASE_URL=postgresql://<usuario>:<password>@<host>.neon.tech/<base_datos>?sslmode=require
```

> Si usas **Supabase**, usa la cadena de conexión en modo **Transaction Mode** (puerto `6543`) para compatibilidad con entornos serverless.

---

## 4. Tablas y Columnas

### `accounts` — Cuentas Bancarias

```sql
CREATE TABLE accounts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    balance     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    type        VARCHAR(50)  NOT NULL DEFAULT 'checking',
    currency    VARCHAR(10)  NOT NULL DEFAULT 'PEN',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

**Valores de `type`:** `checking` | `savings` | `credit`  
**Valores de `currency`:** `PEN` | `USD`

---

### `transactions` — Transacciones

```sql
CREATE TABLE transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID REFERENCES accounts(id) ON DELETE CASCADE,
    type        VARCHAR(20)  NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    currency    VARCHAR(10)  NOT NULL DEFAULT 'PEN',
    date        TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

**Valores de `type`:** `income` | `expense` | `rent`  
**`account_id` es nullable** — una transacción puede existir sin cuenta bancaria asociada.

---

### `liabilities` — Pasivos / Deudas

```sql
CREATE TABLE liabilities (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(255)   NOT NULL,
    amount               NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    interest_rate        NUMERIC(4, 2)  NOT NULL DEFAULT 0.00,
    type                 VARCHAR(50)    NOT NULL DEFAULT 'financial',
    due_date             TIMESTAMP,
    installment_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_installments INTEGER        NOT NULL DEFAULT 0,
    currency             VARCHAR(10)    NOT NULL DEFAULT 'PEN',
    created_at           TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

**Valores de `type`:** `financial` | `personal` | `tax`

---

### `invoices` — Facturas

```sql
CREATE TABLE invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name    VARCHAR(255)   NOT NULL,
    amount         NUMERIC(12, 2) NOT NULL,
    status         VARCHAR(50)    NOT NULL DEFAULT 'pending',
    payment_terms  VARCHAR(50)    NOT NULL DEFAULT 'immediate',
    due_date       TIMESTAMP,
    currency       VARCHAR(10)    NOT NULL DEFAULT 'PEN',
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

**Valores de `status`:** `paid` | `pending` | `overdue` | `unbilled`  
**Valores de `payment_terms`:** `immediate` | `30_days` | `60_days` | `custom`

---

### `properties_assets` — Activos Físicos y TI

```sql
CREATE TABLE properties_assets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)   NOT NULL,
    value       NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    type        VARCHAR(50)    NOT NULL DEFAULT 'property',
    currency    VARCHAR(10)    NOT NULL DEFAULT 'PEN',
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

**Valores de `type`:** `property` | `servers` | `hardware` | `software_licenses`

---

### `projections` — Proyecciones de Proyectos

```sql
CREATE TABLE projections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255)   NOT NULL,
    estimated_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estimated_cost    NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status            VARCHAR(50)    NOT NULL DEFAULT 'planned',
    currency          VARCHAR(10)    NOT NULL DEFAULT 'PEN',
    created_at        TIMESTAMP      NOT NULL DEFAULT NOW()
);
```

**Valores de `status`:** `planned` | `active` | `completed`

---

## 5. Migraciones con Drizzle

```bash
# Ver el estado actual del schema vs la DB
yarn drizzle-kit check

# Generar SQL de migración sin aplicarlo
yarn drizzle-kit generate

# Aplicar cambios directamente a la DB (push sin migrations)
yarn drizzle-kit push

# Abrir Drizzle Studio (interfaz visual de la DB)
yarn drizzle-kit studio
```

> **En este proyecto se usa `drizzle-kit push`** (sin archivos de migración), adecuado para desarrollo ágil. Para producción se recomienda migrar a `drizzle-kit generate` + `drizzle-kit migrate`.

Configuración en [`drizzle.config.ts`](../drizzle.config.ts):

```typescript
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
```

---

## 6. Referencia de Endpoints API

Todos los endpoints están en `src/app/api/` y siguen el patrón **GET + POST** de Next.js App Router.

### `GET /api/dashboard`

Retorna todas las métricas consolidadas del panel.

**Query params:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `month` | `string` | mes actual | Período en formato `YYYY-MM` |
| `exchangeRate` | `number` | `3.4` | Tipo de cambio USD → PEN |

**Respuesta (resumen):**
```json
{
  "summary": {
    "totalAssets": 555550,
    "totalLiabilities": 57600,
    "consolidated": 497950,
    "monthlyIncome": 0,
    "netCashFlow": 0,
    "liquidityRatio": 1.68,
    "weightedInterestRate": 6.21,
    "growthTarget20": 597540,
    "totalFinancialLiabilities": 50100,
    "totalPersonalLiabilities": 7500
  },
  "accounts": [...],
  "transactions": [...],
  "liabilities": [...],
  "invoices": [...],
  "assets": [...],
  "projections": [...],
  "monthlyHistory": [...],
  "categoryBreakdown": [...]
}
```

---

### `GET /api/accounts` — `POST /api/accounts`

**POST body:**
```json
{
  "name": "BCP Soles Principal",
  "balance": "15000.00",
  "type": "checking",
  "currency": "PEN"
}
```

---

### `GET /api/transactions` — `POST /api/transactions`

**POST body:**
```json
{
  "type": "expense",
  "amount": "2500.00",
  "description": "Mensualidad Colegio de los Niños",
  "category": "Educación",
  "accountId": "uuid-de-la-cuenta",
  "currency": "PEN",
  "date": "2026-08-01"
}
```

---

### `GET /api/liabilities` — `POST /api/liabilities`

**POST body:**
```json
{
  "name": "Préstamo Comercial BBVA",
  "amount": "25000.00",
  "interestRate": "5.50",
  "type": "financial",
  "dueDate": "2026-12-18",
  "installmentAmount": "1500.00",
  "pendingInstallments": 18,
  "currency": "PEN"
}
```

---

### `GET /api/invoices` — `POST /api/invoices`

**POST body:**
```json
{
  "clientName": "Tech Corp — Desarrollo Web",
  "amount": "4800.00",
  "status": "pending",
  "paymentTerms": "30_days",
  "dueDate": "2026-09-01",
  "currency": "USD"
}
```

---

### `GET /api/assets` — `POST /api/assets`

**POST body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "value": "8500.00",
  "type": "hardware",
  "currency": "PEN"
}
```

---

### `GET /api/projections` — `POST /api/projections`

**POST body:**
```json
{
  "name": "SaaS Facturación Electrónica Q4",
  "estimatedRevenue": "85000.00",
  "estimatedCost": "32000.00",
  "status": "active",
  "currency": "PEN"
}
```

---

## 7. Lógica de Consolidación Multidivisa

La API del dashboard convierte todos los valores a Soles antes de sumarlos:

```typescript
const EXCHANGE_RATE = parseFloat(searchParams.get("exchangeRate") ?? "3.4");

const toPEN = (amount: number, currency: string): number =>
  currency === "USD" ? amount * EXCHANGE_RATE : amount;
```

**Fórmulas de agregación:**

```
Activos Totales =
    Σ toPEN(accounts.balance)
  + Σ toPEN(invoices.amount) WHERE status IN ('pending','overdue')      -- Por cobrar
  + Σ toPEN(invoices.amount) WHERE status = 'unbilled'                  -- Sin facturar
  + Σ toPEN(properties_assets.value) WHERE type != 'software_licenses'  -- Infraestructura
  + Σ toPEN(properties_assets.value) WHERE type = 'software_licenses'   -- Stock

Pasivos Totales =
    Σ toPEN(liabilities.amount) WHERE type IN ('financial','tax')
  + Σ toPEN(liabilities.amount) WHERE type = 'personal'

Patrimonio Neto (Consolidado) = Activos Totales − Pasivos Totales

Flujo Caja Neto (mes) =
    Σ toPEN(transactions.amount) WHERE type = 'income'
  − Σ toPEN(transactions.amount) WHERE type IN ('expense','rent')
```

---

## 8. Datos Demo (Mock)

Cuando no hay `DATABASE_URL`, el sistema usa datos hardcodeados en:

```
src/app/api/dashboard/route.ts
  ├── MOCK_ACCOUNTS      → 3 cuentas (2 PEN + 1 USD)
  ├── MOCK_TRANSACTIONS  → 12 movimientos (Jul/Ago 2026 + Ago 2025)
  ├── MOCK_LIABILITIES   → 5 deudas (financieras, personal, SUNAT)
  ├── MOCK_INVOICES      → 7 facturas (PEN + USD, distintos estados)
  ├── MOCK_ASSETS        → 5 activos TI (servidores, oficina, hardware, licencias)
  └── MOCK_PROJECTIONS   → 3 proyectos (PEN + USD)
```

Ver valores exactos en [`docs/estado-inicial.md`](./estado-inicial.md).
