/**
 * Vercel Serverless Function — AviationStack proxy
 *
 * Why this exists:
 *   The AviationStack free tier only supports HTTP (not HTTPS).
 *   Browsers block HTTP requests made from HTTPS pages (Mixed Content policy).
 *   Running server-side here means the fetch is Node-to-Node — no browser,
 *   no CORS, no Mixed Content restrictions.
 *
 * Route: GET /api/flights
 */
export default async function handler(req: any, res: any) {
    // Allow the browser to call this from any origin (needed for Expo Web)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        const upstream = await fetch(
            'http://api.aviationstack.com/v1/flights?access_key=a85fd752a9b9aa6f638b8f99c9a47a8d&dep_iata=LGW'
        );
        const data = await upstream.json();
        res.status(200).json(data);
    } catch (err: any) {
        res.status(502).json({ error: { info: err?.message ?? 'Upstream fetch failed.' } });
    }
}
