import { prisma } from '../lib/prisma.js';

async function main() {
  const password = process.env.REAPER_DB_PASSWORD;
  if (!password || password.length < 32)
    throw new Error('REAPER_DB_PASSWORD must be 32+ characters');

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cyberforce_reaper') THEN
        CREATE ROLE cyberforce_reaper LOGIN;
      END IF;
    END $$;
  `);
  const [{ literal }] = await prisma.$queryRaw<{ literal: string }[]>`
    SELECT quote_literal(${password}) AS literal
  `;
  await prisma.$executeRawUnsafe(`ALTER ROLE cyberforce_reaper WITH LOGIN PASSWORD ${literal}`);
  await prisma.$executeRawUnsafe(
    'ALTER ROLE cyberforce_reaper NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT',
  );
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      EXECUTE format('GRANT CONNECT ON DATABASE %I TO cyberforce_reaper', current_database());
    END $$;
  `);
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO cyberforce_reaper');
  await prisma.$executeRawUnsafe(
    'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM cyberforce_reaper',
  );
  await prisma.$executeRawUnsafe(`
    GRANT SELECT (id, status, expires_at, created_at), UPDATE (status)
    ON TABLE public.lab_instances TO cyberforce_reaper
  `);
}

main()
  .then(() => console.info('Reaper DB role is ready'))
  .catch((error) => {
    console.error('Reaper DB role setup failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
