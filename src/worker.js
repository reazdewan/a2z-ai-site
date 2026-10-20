// A2Z AI Worker: serves the website from /public and handles the two API routes.
import { handleSubscribe } from './subscribe.js';
import { handleExport } from './export.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/api/export') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET' } });
      return handleExport(request, env);
    }

    // Everything else is the static website in /public.
    return env.ASSETS.fetch(request);
  }
};
