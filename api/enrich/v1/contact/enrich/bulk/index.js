/**
 * POST /api/enrich/v1/contact/enrich/bulk
 * Start a bulk enrichment - with raw body forwarding
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';

  try {
    // Read raw body
    const rawBody = await getRawBody(req);

    console.log('=== PROXY DEBUG ===');
    console.log('Raw body received:', rawBody);
    console.log('Body length:', rawBody.length);

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: rawBody,
    };

    if (req.headers.authorization) {
      fetchOptions.headers['Authorization'] = req.headers.authorization;
    }

    console.log('Sending to FullEnrich...');
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    console.log('Response:', response.status, JSON.stringify(data));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
