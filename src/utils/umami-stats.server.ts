interface UmamiStatsConfig {
	enabled: boolean;
	scripts: string;
	apiKey?: string;
	baseUrl?: string;
}

interface UmamiStats {
	pageviews: number;
	visitors: number;
	visits: number;
}

// Only call from Astro frontmatter. Never serialize the configuration into HTML.
export async function getUmamiStats(
	config: UmamiStatsConfig,
	pagePath?: string,
): Promise<UmamiStats | null> {
	const websiteId = config.scripts.match(/data-website-id="([^"]+)"/)?.[1];
	if (!config.enabled || !config.apiKey || !config.baseUrl || !websiteId) {
		return null;
	}
	try {
		const endpoint = new URL(
			`${config.baseUrl.replace(/\/$/, "")}/v1/websites/${encodeURIComponent(websiteId)}/stats`,
		);
		endpoint.searchParams.set("startAt", "0");
		endpoint.searchParams.set("endAt", String(Date.now()));
		if (pagePath) endpoint.searchParams.set("url", pagePath);
		const response = await fetch(endpoint, {
			headers: { "x-umami-api-key": config.apiKey },
			signal: AbortSignal.timeout(10000),
		});
		if (!response.ok) throw new Error("Umami request failed");
		const stats = await response.json();
		const { pageviews, visitors, visits } = stats;
		if (
			![pageviews, visitors, visits].every(
				(value) =>
					typeof value === "number" && Number.isFinite(value) && value >= 0,
			)
		)
			throw new Error("Invalid Umami statistics");
		return { pageviews, visitors, visits };
	} catch {
		console.warn("Umami statistics unavailable during build.");
		return null;
	}
}
