import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import type { Plugin, ViteDevServer } from 'vite';

const SIDECAR_DIRNAME = 'format-overrides';
export const FORMAT_OVERRIDES_MODULE_ID = 'virtual:format-overrides';
const RESOLVED_FORMAT_OVERRIDES_MODULE_ID = `\0${FORMAT_OVERRIDES_MODULE_ID}`;
const EMPTY_SIDECAR = { version: 1, overrides: {} };
const EMPTY_BUNDLE = { version: 1, scopes: {} };

function warnInvalidSidecar(scope: string, filePath: string, reason: string): void {
  console.warn(
    JSON.stringify({
      event: 'format-overrides.sidecar.invalid',
      scope,
      file: filePath,
      reason,
    }),
  );
}

function readSidecarFile(filePath: string, scope: string): unknown {
  let parsed: { version?: unknown; overrides?: unknown } | null;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    warnInvalidSidecar(scope, filePath, 'invalid-json');
    return EMPTY_SIDECAR;
  }
  if (
    !parsed ||
    parsed.version !== 1 ||
    !parsed.overrides ||
    typeof parsed.overrides !== 'object' ||
    Array.isArray(parsed.overrides)
  ) {
    warnInvalidSidecar(scope, filePath, 'unsupported-shape-or-version');
    return EMPTY_SIDECAR;
  }
  return parsed;
}

function collectSidecarFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) return collectSidecarFiles(fullPath);
    return entry.endsWith('.json') ? [fullPath] : [];
  });
}

function scopeFromFile(sidecarRoot: string, filePath: string): string {
  const relative = path.relative(sidecarRoot, filePath).replace(/\\/g, '/');
  return relative.replace(/\.json$/, '');
}

function readSidecarBundle(root: string): unknown {
  const sidecarRoot = path.join(root, SIDECAR_DIRNAME);
  if (!existsSync(sidecarRoot)) return EMPTY_BUNDLE;

  const scopes = Object.fromEntries(
    collectSidecarFiles(sidecarRoot)
      .sort()
      .map((filePath) => {
        const scope = scopeFromFile(sidecarRoot, filePath);
        return [scope, readSidecarFile(filePath, scope)];
      }),
  );

  return { version: 1, scopes };
}

function buildModule(root: string): string {
  return `export default ${JSON.stringify(readSidecarBundle(root))};`;
}

const HMR_EVENT = 'format-overrides:update';

/** Dev-only sidecar watcher: pushes sidecar edits over HMR without a full reload. */
function watchSidecars(root: string, server: ViteDevServer): void {
  const sidecarRoot = path.resolve(root, SIDECAR_DIRNAME);
  server.watcher.add(sidecarRoot);

  const onChange = (filePath: string) => {
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(sidecarRoot + path.sep) || !resolved.endsWith('.json')) return;

    const moduleNode = server.moduleGraph.getModuleById(RESOLVED_FORMAT_OVERRIDES_MODULE_ID);
    if (moduleNode) server.moduleGraph.invalidateModule(moduleNode);
    server.ws.send(HMR_EVENT, readSidecarBundle(root));
  };

  server.watcher.on('change', onChange);
  server.watcher.on('add', onChange);
  server.watcher.on('unlink', onChange);
}

/** Standalone build shim for exported projects (dev HMR when run under the Vite dev server). */
export function formatOverridesPlugin(root: string = process.cwd()): Plugin {
  return {
    name: 'format-overrides',
    resolveId(id) {
      return id === FORMAT_OVERRIDES_MODULE_ID ? RESOLVED_FORMAT_OVERRIDES_MODULE_ID : null;
    },
    load(id) {
      return id === RESOLVED_FORMAT_OVERRIDES_MODULE_ID ? buildModule(root) : null;
    },
    configureServer(server) {
      watchSidecars(root, server);
    },
  };
}
