/**
 * GET /api/enrich/v1/contact/enrich/bulk/[id]/results
 * Get enrichment results
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const targetUrl = `https://app.fullenrich.com/api/v1/contact/enrich/bulk/${id}/results`;

  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
