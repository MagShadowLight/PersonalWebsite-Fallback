const AI_BOTS = /ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|GPTBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User|CCBot|Bytespider|Amazonbot|meta-externalagent|cohere-ai|Diffbot/i;

async function serveFallback(request, env, servedBy) {
	const url = new URL(request.url);

	if (url.pathname.startsWith('/api/')) {
		return new Response('{"error": "unavailable"}', {
		status: 503,
		headers: { 'content-type': 'application/json' },
		});
	}
	if (request.method != 'GET' && request.method != 'HEAD') {
		return new Response('Temporarily unavailable', { status: 503, headers: { 'x-served-by': servedBy  } });
	}

	const asset = await env.ASSETS.fetch(request);
	const out = new Response(asset.body, asset);
	out.headers.set('x-served-by', servedBy);
	return out
}

export default {
	async fetch(request, env) {
		const isBot = AI_BOTS.test(request.headers.get('user-agent') || '');
		

		if (isBot) {
			return serveFallback(request, env, 'fallback-ai-bot');
		}

		try {
			const res = await fetch(request, { signal: AbortSignal.timeout(4000) });
			res.headers.set('x-served-by', 'origin');
			const down = [502, 503, 504].includes(res.status) || res.status >= 520;
			if (down) {
				return serveFallback(request, env, 'fallback')
			}
			else {
				const out = new Response(res.body, res);
				out.headers.set('x-served-by', 'origin');
				return out;
			}
		} catch (e) {}
		return serveFallback(request, env, 'fallback')

	}
}


