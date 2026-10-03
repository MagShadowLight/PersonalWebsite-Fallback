export default {
	async fetch(request, env) {
		try {
			const res = await fetch(request);
			const down = [502, 503, 504].includes(res.status) || res.status >= 520;
			if (!down) return res;
		} catch (e) {}

		const url = new URL(request.url);
		if (url.pathname.startsWith('/api/')) {
			return new Response('{"error": "unavailable"}', {
			status: 503,
			headers: { 'content-type': 'application/json' },
			});
		}
		if (request.method != 'GET' && request.method != 'HEAD') {
			return new Response('Temporarily unavailable', { status: 503 })
		}
		return env.ASSETS.fetch(request)
	}
}


