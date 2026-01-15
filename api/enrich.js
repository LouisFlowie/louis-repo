/**
 * Vercel Serverless Function - FullEnrich API Proxy
 * Proxies requests from Salesforce to FullEnrich API
 * to bypass User-Agent blocking
 */

export const config = {
  api: {
    bodyParser: true,
  },
};

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
      // Handle body whether it's already parsed or raw string
      let bodyToSend;
      if (typeof req.body === 'string') {
        bodyToSend = req.body;
      } else if (req.body && typeof req.body === 'object') {
        bodyToSend = JSON.stringify(req.body);
      } else {
        bodyToSend = '';
      }
      fetchOptions.body = bodyToSend;

      // Debug log
      console.log('Proxying to:', targetUrl);
      console.log('Body:', bodyToSend);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    // Debug log
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
