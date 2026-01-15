/**
 * POST /api/enrich/v1/contact/enrich/bulk
 * Start a bulk enrichment - with debug mode
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

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

  // Debug mode - return what we receive
  if (req.query.debug === 'true') {
    const rawBody = await getRawBody(req);
    return res.status(200).json({
      debug: true,
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'authorization': req.headers.authorization ? 'Bearer ***' : 'missing',
      },
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 500),
      bodyFull: rawBody,
    });
  }

  const targetUrl = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';

  try {
    const rawBody = await getRawBody(req);

    // If body is empty, return error with debug info
    if (!rawBody || rawBody.length === 0) {
      return res.status(400).json({
        error: 'Empty body received by proxy',
        debug: {
          method: req.method,
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
        }
      });
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body: rawBody,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
