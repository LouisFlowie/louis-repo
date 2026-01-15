/**
 * Vercel Serverless Function - FullEnrich API Proxy
 * Proxies requests from Salesforce to FullEnrich API
 * to bypass User-Agent blocking
 */

export default async function handler(req, res) {
  // Enable CORS for Salesforce
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the path after /api/enrich
  // e.g., /api/enrich/v1/contact/enrich/bulk -> /v1/contact/enrich/bulk
  const path = req.url.replace('/api/enrich', '') || '';
  const targetUrl = `https://app.fullenrich.com/api${path}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // Forward Authorization header
    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    // Forward body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
