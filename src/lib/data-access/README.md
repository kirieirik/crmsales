# Data access

Supabase clients, repositories, and server-side queries will live here. Route components should not scatter raw database queries through presentational code.

The first implementation will separate browser-safe clients from server-only access and enforce authorization in the database with RLS.