# Development and Administration Tools

This directory contains standalone administration, migration, testing, and security scripts for the Golden Parc Cepsa codebase.

## Directory Structure

* **`devtools/`**
  * `check-rls.js` — Script to check Row Level Security (RLS) policies on database tables.
  * `SECURE_RLS_POLICIES_FIXED.sql` — SQL migration file containing strict RLS policies.
  * **`devtools/scripts/`**
    * `fix_rls.js` — Utility script to check/adjust RLS states.
    * `get_users.js` — Retrieve administrative users securely.
    * `init_db.js` — Initialize database tables and columns.
    * `run_migration_direct.js` — Execute custom migration commands.
    * `add_is_paid_col.js` — Migration script for payment attributes.
    * `db_setup.js` — Database setup script.
    * `fix_db_constraints.js` — Alter database primary/foreign constraints.
    * `migrate.js` — Migrate tables.
    * `run_migrations_local.js` — Local runner for SQL migrations.
    * `test_regions.js` — Multi-region connection performance test script.
    * `test_all_poolers.js` — Connection pooler validation script.
    * `test_ports.js` — Network port accessibility check script.

## Running the scripts

Ensure you have a `.env.local` file configured in the root directory containing:
```env
DATABASE_URL="postgres://..."
```

Run any script using Node.js:
```bash
node devtools/check-rls.js
node devtools/scripts/test_ports.js
```
