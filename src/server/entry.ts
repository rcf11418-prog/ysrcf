import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFileSync } from "node:fs";

// <api-imports>
import auth__action__get from "./api/auth/[action]/GET";
import auth__action__post from "./api/auth/[action]/POST";
import auth__action__detail__get from "./api/auth/[action]/[detail]/GET";
import auth__action__detail__post from "./api/auth/[action]/[detail]/POST";
import health__get from "./api/health/GET";
import applications__post from "./api/applications/POST";
import applications__status__post from "./api/applications/status/POST";
import dashboard__me__get from "./api/dashboard/me/GET";
import dashboard__payments__get from "./api/dashboard/payments/GET";
import dashboard__invoices__get from "./api/dashboard/invoices/GET";
import dashboard__documents__get from "./api/dashboard/documents/GET";
import dashboard__notifications__get from "./api/dashboard/notifications/GET";
import dashboard__notifications__read__patch from "./api/dashboard/notifications/read/PATCH";
import dashboard__support__get from "./api/dashboard/support/GET";
import dashboard__support__post from "./api/dashboard/support/POST";
import dashboard__profile__patch from "./api/dashboard/profile/PATCH";
import dashboard__progress__get from "./api/dashboard/progress/GET";
import dashboard__stock__get from "./api/dashboard/stock/GET";
import dashboard__deliveries__get from "./api/dashboard/deliveries/GET";
import dashboard__orders__post from "./api/dashboard/orders/POST";
import franchise__settings__get from "./api/franchise-settings/GET";
import admin__me__get from "./api/admin/me/GET";
import admin__overview__get from "./api/admin/overview/GET";
import admin__applications__get from "./api/admin/applications/GET";
import admin__applications__patch from "./api/admin/applications/PATCH";
import admin__progress__post from "./api/admin/progress/POST";
import admin__payments__post from "./api/admin/payments/POST";
import admin__payments__get from "./api/admin/payments/GET";
import admin__payments__patch from "./api/admin/payments/PATCH";
import admin__payment__categories__get from "./api/admin/payment-categories/GET";
import admin__inventory__get from "./api/admin/inventory/GET";
import admin__inventory__post from "./api/admin/inventory/POST";
import admin__products__post from "./api/admin/products/POST";
import admin__reports__get from "./api/admin/reports/GET";
import admin__franchisees__get from "./api/admin/franchisees/GET";
import admin__tickets__get from "./api/admin/tickets/GET";
import admin__tickets__patch from "./api/admin/tickets/PATCH";
import admin__audit__get from "./api/admin/audit/GET";
import admin__deliveries__get from "./api/admin/deliveries/GET";
import admin__deliveries__post from "./api/admin/deliveries/POST";
import admin__deliveries__patch from "./api/admin/deliveries/PATCH";
import admin__staff__get from "./api/admin/staff/GET";
import admin__staff__post from "./api/admin/staff/POST";
import admin__staff__delete from "./api/admin/staff/DELETE";
import admin__settings__get from "./api/admin/settings/GET";
import admin__settings__patch from "./api/admin/settings/PATCH";
import admin__payment__settings__get from "./api/admin/payment-settings/GET";
import admin__payment__settings__patch from "./api/admin/payment-settings/PATCH";
// </api-imports>
import { seoRoutes } from "../lib/seo-routes";
import {
	loadAdSenseRuntimeConfig,
	resolveAdSenseTextFile,
	type AdSenseRuntimeConfig,
} from "./adsense-manifest";
import { loadIndexNowKey } from "./indexnow-key";
import { isSystemHost } from "./seo-host";
import { llmsTxtHandler } from "./llms-txt";

export interface SsrRenderResult {
	html: string;
	head: string;
	status: number;
	redirect?: string;
}

export function registerAdSenseTextRoutes(app: Express, config: AdSenseRuntimeConfig): void {
	app.get("/ads.txt", (_req, res) => {
		const content = resolveAdSenseTextFile(config, "adsTxt");
		if (content === null) {
			res
				.status(404)
				.type("text/plain")
				.set("Cache-Control", "no-cache")
				.send("Not found\n");
			return;
		}
		res.type("text/plain").set("Cache-Control", "no-cache").send(content);
	});

	app.get("/app-ads.txt", (_req, res) => {
		const content = resolveAdSenseTextFile(config, "appAdsTxt");
		if (content === null) {
			res
				.status(404)
				.type("text/plain")
				.set("Cache-Control", "no-cache")
				.send("Not found\n");
			return;
		}
		res.type("text/plain").set("Cache-Control", "no-cache").send(content);
	});
}

export function renderSsrDocument(
	template: string,
	result: Pick<SsrRenderResult, "head" | "html">,
	adSenseConfig: Pick<AdSenseRuntimeConfig, "scriptHtml">,
): string {
	const head = [result.head, adSenseConfig.scriptHtml].filter(Boolean).join("\n");
	return template
		.replace("<!--app-head-->", () => head)
		.replace("<!--app-html-->", () => result.html);
}

function normalizeCommerceApiBaseUrlEnv() {
	if (process.env.GODADDY_API_BASE_URL) return;
	const hostOnly = process.env.VITE_GODADDY_API_HOST;
	if (!hostOnly) return;
	const normalizedHost = hostOnly.replace(/^https?:\/\//, "").trim();
	if (!normalizedHost) return;
	process.env.GODADDY_API_BASE_URL = `https://${normalizedHost}`;
}

normalizeCommerceApiBaseUrlEnv();

const app = express();

// Honour x-forwarded-* from the load balancer so req.protocol/req.hostname
// reflect the public-facing values. Express-maintained parsing respects the
// existing trust-proxy config; direct header reads would let a client spoof
// the sitemap origin in robots.txt.
app.set("trust proxy", true);

const jsonParser = express.json();
const applicationJsonParser = express.json({ limit: "16mb" });
app.use((req, res, next) => {
	if (req.path === "/api/applications" && req.method === "POST") return next();
	return jsonParser(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Diagnostics for deployment-time misconfiguration.
// If the server boots without a database or auth secret, these logs make the
// missing piece obvious before the first request hits.
if (!process.env.DB_HOST && !process.env.DB_PORT && !process.env.DB_USER && !process.env.DB_PASS && !process.env.DB_NAME) {
  console.warn(
    'db.config.env_missing',
    'No explicit DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME found.',
    'The server will fall back to $NOMAD_TASK_DIR/config.json if that path exists.'
  );
}

if (!process.env.BETTER_AUTH_SECRET) {
  console.warn(
    'auth.config_secret_missing',
    'BETTER_AUTH_SECRET is not set in process env.',
    'Admin login and session cookies require this secret before the server can start serving auth requests.'
  );
}

// <api-registrations>
app.get("/api/auth/:action", auth__action__get);
app.post("/api/auth/:action", auth__action__post);
app.get("/api/auth/:action/:detail", auth__action__detail__get);
app.post("/api/auth/:action/:detail", auth__action__detail__post);
app.get("/api/health", health__get);
app.post("/api/applications", applicationJsonParser, applications__post);
app.post("/api/application-status", applications__status__post);
app.get("/api/dashboard/me", dashboard__me__get);
app.get("/api/dashboard/payments", dashboard__payments__get);
app.get("/api/dashboard/invoices", dashboard__invoices__get);
app.get("/api/dashboard/documents", dashboard__documents__get);
app.get("/api/dashboard/notifications", dashboard__notifications__get);
app.patch("/api/dashboard/notifications/read", dashboard__notifications__read__patch);
app.get("/api/dashboard/support", dashboard__support__get);
app.post("/api/dashboard/support", dashboard__support__post);
app.patch("/api/dashboard/profile", dashboard__profile__patch);
app.get("/api/dashboard/progress", dashboard__progress__get);
app.get("/api/dashboard/stock", dashboard__stock__get);
app.get("/api/dashboard/deliveries", dashboard__deliveries__get);
app.post("/api/dashboard/orders", dashboard__orders__post);
app.get("/api/franchise-settings", franchise__settings__get);
app.get("/api/admin/me", admin__me__get);
app.get("/api/admin/overview", admin__overview__get);
app.get("/api/admin/applications", admin__applications__get);
app.patch("/api/admin/applications", admin__applications__patch);
app.post("/api/admin/progress", admin__progress__post);
app.post("/api/admin/payments", admin__payments__post);
app.get("/api/admin/payments", admin__payments__get);
app.patch("/api/admin/payments", admin__payments__patch);
app.get("/api/admin/payment-categories", admin__payment__categories__get);
app.get("/api/admin/inventory", admin__inventory__get);
app.post("/api/admin/inventory", admin__inventory__post);
app.post("/api/admin/products", admin__products__post);
app.get("/api/admin/reports", admin__reports__get);
app.get("/api/admin/franchisees", admin__franchisees__get);
app.get("/api/admin/tickets", admin__tickets__get);
app.patch("/api/admin/tickets", admin__tickets__patch);
app.get("/api/admin/audit", admin__audit__get);
app.get("/api/admin/deliveries", admin__deliveries__get);
app.post("/api/admin/deliveries", admin__deliveries__post);
app.patch("/api/admin/deliveries", admin__deliveries__patch);
app.get("/api/admin/staff", admin__staff__get);
app.post("/api/admin/staff", admin__staff__post);
app.delete("/api/admin/staff", admin__staff__delete);
app.get("/api/admin/settings", admin__settings__get);
app.patch("/api/admin/settings", admin__settings__patch);
app.get("/api/admin/payment-settings", admin__payment__settings__get);
app.patch("/api/admin/payment-settings", admin__payment__settings__patch);
// </api-registrations>

// Error middleware must be registered AFTER the routes it protects; Express
// only passes errors to middleware defined later in the stack.
app.use("/api", (err: unknown, req: Request, res: Response, _next: NextFunction) => {
	// Always respond JSON on /api so clients parsing response.json() don't
	// receive Express's default HTML error page for non-Error throws.
	console.error("ssr.api.error", {
		url: req.url,
		error: err instanceof Error ? err.stack : String(err),
	});
	const status = typeof err === "object" && err !== null && "status" in err
		&& Number.isInteger(err.status) && Number(err.status) >= 400 && Number(err.status) < 500
		? Number(err.status)
		: 500;
	res.status(status).json({
		error: status === 413 ? "Request exceeds the allowed size" : status < 500 ? "Invalid request" : "Internal server error",
	});
});

function baseUrl(req: Request): string {
	return `${req.protocol}://${req.hostname}`;
}

function escapeXml(s: string): string {
	return s.replace(/[&<>"']/g, (c) =>
		({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
	);
}

app.get("/robots.txt", (req, res) => {
	if (isSystemHost(req)) {
		res
			.type("text/plain")
			.set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host")
			.send("User-agent: *\nDisallow: /\n");
		return;
	}
	const base = baseUrl(req);
	const body = [
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${base}/sitemap.xml`,
		"",
	].join("\n");
	res.type("text/plain").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(body);
});

app.get("/sitemap.xml", (req, res) => {
	if (isSystemHost(req)) {
		const empty = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>\n`;
		res.type("application/xml").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(empty);
		return;
	}
	const base = baseUrl(req);
	const urls = seoRoutes
		.filter((r) => typeof r.path === "string" && r.path.startsWith("/"))
		.map((r) => {
			const loc = `${base}${r.path}`;
			const parts = [`    <loc>${escapeXml(loc)}</loc>`];
			if (r.lastmod) parts.push(`    <lastmod>${escapeXml(r.lastmod)}</lastmod>`);
			if (r.changefreq) parts.push(`    <changefreq>${r.changefreq}</changefreq>`);
			if (r.priority !== undefined)
				parts.push(`    <priority>${r.priority.toFixed(1)}</priority>`);
			return `  <url>\n${parts.join("\n")}\n  </url>`;
		})
		.join("\n");
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	res.type("application/xml").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(body);
});

app.get("/llms.txt", llmsTxtHandler);

if (import.meta.env.PROD) {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const clientDir = join(__dirname, "client");
	const adSenseRuntimeConfig = loadAdSenseRuntimeConfig(__dirname);
	const indexNowKey = loadIndexNowKey(__dirname);

	registerAdSenseTextRoutes(app, adSenseRuntimeConfig);

	if (indexNowKey !== null) {
		app.get(`/${indexNowKey}.txt`, (_req, res) => {
			res.type("text/plain").set("Cache-Control", "public, max-age=86400").send(indexNowKey);
		});
	}

	app.use(
		express.static(clientDir, {
			index: false,
			setHeaders(res, filePath) {
				res.set(
					"Cache-Control",
					filePath.includes("/assets/")
						? "public, max-age=31536000, immutable"
						: "no-cache",
				);
			},
		}),
	);

	app.use((_req, res, next) => {
		res.set("Cache-Control", "no-cache");
		next();
	});

	let template: string;
	try {
		template = readFileSync(join(clientDir, "index.html"), "utf-8");
	} catch (err) {
		console.error("ssr.template.load-failed", {
			path: join(clientDir, "index.html"),
			error: err instanceof Error ? err.message : String(err),
		});
		process.exit(1);
	}
	if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
		// Fail fast at boot, same as a template load failure above: without
		// markers, every .replace() call on the render path is a no-op and we
		// would serve a shell with no <head> content and no rendered body on
		// every request. Preferring process.exit over a degraded mode ensures
		// an operator notices and fixes the build rather than serving broken
		// SEO-invisible pages indefinitely.
		console.error("ssr.template.markers-missing", {
			hasHead: template.includes("<!--app-head-->"),
			hasHtml: template.includes("<!--app-html-->"),
		});
		process.exit(1);
	}
	const fallbackShell = template
		.replace("<!--app-head-->", "")
		.replace("<!--app-html-->", "");

	// Resolve the SSR module once into a stable render function. A failed
	// load is unrecoverable at runtime - exiting lets the container
	// scheduler restart with a clean slate rather than leaving the server
	// to serve silent 503s indefinitely against a single startup log.
	let renderFn: ((url: string, siteOrigin?: string) => Promise<SsrRenderResult>) | null = null;
	const SSR_MODULE_LOAD_TIMEOUT_MS = 30_000;
	const loadTimeout = setTimeout(() => {
		if (renderFn !== null) return;
		console.error("ssr.module.load-timeout", {
			timeoutMs: SSR_MODULE_LOAD_TIMEOUT_MS,
		});
		process.exit(1);
	}, SSR_MODULE_LOAD_TIMEOUT_MS);
	loadTimeout.unref();
	import("../entry-server").then(
		(mod) => {
			clearTimeout(loadTimeout);
			renderFn = mod.render;
		},
		(err) => {
			clearTimeout(loadTimeout);
			console.error("ssr.module.load-failed", {
				error: err instanceof Error ? err.stack : String(err),
			});
			process.exit(1);
		},
	);

	app.get(/.*/, async (req, res, next) => {
		if (req.method !== "GET") return next();
		if (req.path.startsWith("/api")) return next();
		if (extname(req.path)) return next();
		const sendFallback = () =>
			res
				.status(503)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-store")
				.send(fallbackShell);
		if (renderFn === null) {
			// Module not yet resolved; fall back without logging to avoid startup
			// noise before the first render is even possible. A terminal load
			// failure (import reject or 30s timeout) process.exit(1)s from the
			// loader above, so this branch is only the brief warmup window.
			return sendFallback();
		}
		try {
			const result = await renderFn(
				req.url,
				`${req.protocol}://${req.hostname}`,
			);
			if (result.redirect) {
				// Redirect thrown from a loader/action surfaces as a Response.
				// Forward it so the browser actually navigates to the new URL
				// instead of seeing an empty shell with a stale status.
				res.redirect(result.status, result.redirect);
				return;
			}
			if (!result.html) {
				// A non-redirect Response was thrown from a loader (e.g.
				// `throw new Response(null, { status: 404 })`). renderToString
				// produced no markup, so we have a real status but no body.
				// Log so the case is observable in ops dashboards, and mark
				// no-store so CDNs don't cache an empty page as a valid hit.
				// User-visible 404 / error pages should come from a route
				// errorElement, not from this fallback path.
				console.error("ssr.render.error-response", {
					url: req.url,
					status: result.status,
				});
				res
					.status(result.status)
					.set("Content-Type", "text/html; charset=utf-8")
					.set("Cache-Control", "no-store")
					.send(fallbackShell);
				return;
			}
			// Per-host SEO injection. System URLs get a noindex meta so
			// crawlers drop them from the index over time; customer-attached
			// hosts get a self-canonical link so search engines treat them
			// as authoritative for the rendered content.
			const seoHead = isSystemHost(req)
				? `<meta name="robots" content="noindex,nofollow">`
				: `<link rel="canonical" href="${escapeXml(`${req.protocol}://${req.hostname}${req.path}`)}">`;
			// Function replacements disable String.replace's $-special sequences
			// ($&, $', $`, $$) so user-authored titles / JSON-LD like
			// "Save $& today" insert literally instead of being interpolated.
			const out = renderSsrDocument(
				template,
				{ ...result, head: seoHead + result.head },
				adSenseRuntimeConfig,
			);
			res
				.status(result.status)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-cache")
				.send(out);
		} catch (err) {
			// 503 surfaces the failure in CDN/monitoring without caching a broken
			// page as success. console.error (not warn) puts it at the right log
			// level for the observability pipeline to alert on.
			console.error("ssr.render.failed", {
				url: req.url,
				// Log the full stack — React's renderToString annotates it with
				// the failing component's call tree, which the message alone
				// discards.
				error: err instanceof Error ? err.stack : String(err),
			});
			sendFallback();
		}
	});

	const shutdown = async (signal: string) => {
		console.log(`Got ${signal}, shutting down gracefully...`);
		// Scope the ERR_MODULE_NOT_FOUND suppression to the import() only.
		// A closeConnection() failure that happens to carry the same code
		// (unlikely but possible for wrapped errors) must not be silently
		// swallowed - it indicates a real db-close failure worth logging.
		let mod: { closeConnection?: () => Promise<void> | void } | null = null;
		try {
			const dbClient = "./db/client" + ".js";
			// Source-literal optional module path; no request, environment, or user input reaches import().
			// eslint-disable-next-line no-unsanitized/method
			mod = await import(/* @vite-ignore */ dbClient);
		} catch (error: unknown) {
			const code = (error as { code?: string } | null)?.code;
			if (code !== "ERR_MODULE_NOT_FOUND") {
				console.error("ssr.shutdown.db-import-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		if (mod && typeof mod.closeConnection === "function") {
			try {
				await mod.closeConnection();
				console.log("Database connections closed");
			} catch (error: unknown) {
				console.error("ssr.shutdown.db-close-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		process.exit(0);
	};

	(["SIGTERM", "SIGINT"] as const).forEach((signal) => {
		process.once(signal, () => {
			void shutdown(signal);
		});
	});

	const rawPort = process.env.PORT || "3000";
	const port = parseInt(rawPort, 10);
	if (!Number.isInteger(port) || port <= 0 || port > 65535) {
		// parseInt("abc") returns NaN; passing that to app.listen throws
		// synchronously before the server.on("error") handler below can catch
		// it. Fail fast with an actionable log rather than a cryptic crash.
		console.error("ssr.server.invalid-port", { rawPort });
		process.exit(1);
	}
	const host = process.env.HOST || "0.0.0.0";
	const server = app.listen(port, host, () => {
		console.log(`Server listening on http://${host}:${port}`);
	});
	server.on("error", (err: NodeJS.ErrnoException) => {
		console.error("ssr.server.listen-failed", {
			port,
			host,
			code: err.code,
			error: err.message,
		});
		process.exit(1);
	});
}

export default app;
