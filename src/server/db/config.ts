/** TREAT AS IMMUTABLE - This file is protected by the file-edit tool
 *
 * Database configuration loader
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';

/**
 * Database credentials interface
 */
export interface DatabaseCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Load database configuration.
 *
 * Priority:
 * 1. Explicit GoDaddy-style env vars: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
 * 2. Task-local config.json under $NOMAD_TASK_DIR (existing system path)
 *
 * This keeps the existing container config path working while letting a
 * standalone or GoDaddy-hosted deployment configure the MySQL connection
 * directly via environment variables.
 */
export function getDatabaseCredentials(): DatabaseCredentials {
  const host = env.DB_HOST;
  const port = env.DB_PORT;
  const user = env.DB_USER;
  const password = env.DB_PASS;
  const database = env.DB_NAME;

  if (host && port && user && password && database) {
    const parsedPort = parseInt(String(port), 10);
    if (Number.isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      throw new Error(
        `Database port must be a valid port number, got: ${port}`
      );
    }

    return {
      host: host,
      port: parsedPort,
      user: user,
      password: password,
      database: database,
    };
  }

  // Fall back to the existing task-local config path.
  const configPath = join(env.NOMAD_TASK_DIR || '/local', 'config.json');

  if (!existsSync(configPath)) {
    throw new Error(
      `Database configuration file not found at ${configPath}.\n` +
      `Set DB_HOST, DB_PORT, DB_USER, DB_PASS, and DB_NAME to use explicit env config.`
    );
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    if (!config.DATABASE?.VALUE) {
      throw new Error('Invalid config.json structure: DATABASE.VALUE not found');
    }

    const db = config.DATABASE.VALUE;

    if (!db.HOST || !db.PORT || !db.USERNAME || !db.PASSWORD || !db.NAME) {
      throw new Error('Invalid config.json: Missing required database credentials');
    }

    return {
      host: db.HOST,
      port: parseInt(String(db.PORT), 10),
      user: db.USERNAME,
      password: db.PASSWORD,
      database: db.NAME,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${configPath}: Invalid JSON format`);
    }
    throw error;
  }
}
