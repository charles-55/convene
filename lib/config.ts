import { Pool } from "pg"

// Initialize database connection
export const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  // ssl: {
  //   require: true,
  //   rejectUnauthorized: false,
  // },
});
