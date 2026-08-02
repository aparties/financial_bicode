import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Export a flag to know if we are running in simulated/demo mode
export const isDemo = !databaseUrl;

// Initialize Neon HTTP connection if URL is available
export const sql = databaseUrl ? neon(databaseUrl) : null;

// Initialize Drizzle ORM
export const db = sql ? drizzle({ client: sql, schema }) : null;
