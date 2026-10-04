const AI_BOTS = /ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|GPTBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User|CCBot|Bytespider|Amazonbot|meta-externalagent|cohere-ai|Diffbot/i;

export default {
	async fetch(request, env) {
		const isBot = AI_BOTS.test(request.headers.get('user-agent') || '');

		if (isBot) {
			try {
				const res = await fetch(request, { signal: AbortSignal.timeout(4000) });
				res.headers.set('x-served-by', 'origin');
				const down = [502,503,504].Includes(res.status) || res.status >= 520;
				if (!down) return res;
			} catch (e) {}
		}

		try {
			const res = await fetch(request);
			res.headers.set('x-served-by', 'origin');
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


