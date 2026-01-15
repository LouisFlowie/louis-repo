/**
 * Vercel Serverless Function - FullEnrich API Proxy
 * Catch-all route to proxy requests to FullEnrich API
 */

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get path from catch-all parameter
  const pathSegments = req.query.path || [];
  const path = '/' + pathSegments.join('/');
  const targetUrl = `https://app.fullenrich.com/api${path}`;

  console.log('=== PROXY REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path segments:', pathSegments);
  console.log('Target URL:', targetUrl);
  console.log('Body type:', typeof req.body);
  console.log('Body:', JSON.stringify(req.body));

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      if (typeof req.body === 'string') {
        fetchOptions.body = req.body;
      } else if (req.body && typeof req.body === 'object') {
        fetchOptions.body = JSON.stringify(req.body);
      }
    }

    console.log('Sending body:', fetchOptions.body);

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
