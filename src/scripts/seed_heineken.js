const { Pool } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const items = [
  // 1. Facturas Emitidas (FF01)
  {
    clientName: "FF01-692 / Heineken — ORD-00008565 (falta ticket)",
    amount: "5900.00",
    status: "pending",
    paymentTerms: "60_days",
    dueDate: new Date("2026-11-02T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-09-02T12:00:00Z")
  },
  {
    clientName: "FF01-701 / Heineken — ORD-00008857",
    amount: "10443.00",
    status: "paid",
    paymentTerms: "60_days",
    dueDate: new Date("2026-11-30T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-01T12:00:00Z")
  },
  {
    clientName: "FF01-702 / Heineken — Bien",
    amount: "487.81",
    status: "pending",
    paymentTerms: "60_days",
    dueDate: new Date("2026-11-30T12:00:00Z"),
    currency: "USD",
    createdAt: new Date("2026-10-01T12:00:00Z")
  },
  {
    clientName: "FF01-703 / Heineken — Servicio",
    amount: "805.35",
    status: "paid",
    paymentTerms: "immediate",
    dueDate: new Date("2026-10-04T12:00:00Z"),
    currency: "USD",
    createdAt: new Date("2026-10-03T12:00:00Z")
  },
  {
    clientName: "FF01-704 / Heineken — ORD-00009056",
    amount: "4130.00",
    status: "paid",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-07T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-07T12:00:00Z")
  },
  {
    clientName: "FF01-709 / Heineken — ORD-00008995",
    amount: "2408.62",
    status: "pending",
    paymentTerms: "custom",
    dueDate: new Date("2026-10-31T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "FF01-710 / Heineken — ORD-00008936",
    amount: "3894.00",
    status: "pending",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },

  // 2. Solo Orden de Compra (OC) — Por Facturar (unbilled)
  {
    clientName: "OC ORD-00008839 / Heineken — Servicio",
    amount: "1593.00",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00008996 / Heineken — Bien",
    amount: "487.81",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "USD",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009084 / Heineken — Servicio",
    amount: "3032.60",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009300 / Heineken — Servicio",
    amount: "8850.00",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009367 / Heineken — Servicio",
    amount: "1650.00",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009323 / Heineken — Servicio",
    amount: "849.60",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009374 / Heineken — Bien",
    amount: "7186.20",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009415 / Heineken — Servicio",
    amount: "4956.00",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "PEN",
    createdAt: new Date("2026-10-19T12:00:00Z")
  },
  {
    clientName: "OC ORD-00009421 / Heineken — Bien",
    amount: "1214.22",
    status: "unbilled",
    paymentTerms: "60_days",
    dueDate: new Date("2026-12-19T12:00:00Z"),
    currency: "USD",
    createdAt: new Date("2026-10-19T12:00:00Z")
  }
];

async function seed() {
  console.log(`Iniciando inserción de ${items.length} pendientes de Heineken...`);
  for (const item of items) {
    const res = await pool.query(
      `INSERT INTO invoices (client_name, amount, status, payment_terms, due_date, currency, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, client_name, amount, status, currency;`,
      [item.clientName, item.amount, item.status, item.paymentTerms, item.dueDate, item.currency, item.createdAt]
    );
    console.log(`[OK] Insertado: ${res.rows[0].client_name} -> ${res.rows[0].currency} ${res.rows[0].amount} (${res.rows[0].status})`);
  }
  const total = await pool.query("SELECT count(*) FROM invoices;");
  console.log(`\nTotal actual de facturas y OCs en la base de datos Neon: ${total.rows[0].count}`);
  await pool.end();
}

seed().catch(err => {
  console.error("Error al insertar:", err);
  process.exit(1);
});
