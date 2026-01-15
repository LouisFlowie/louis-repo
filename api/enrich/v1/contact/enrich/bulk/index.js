/**
 * POST /api/enrich/v1/contact/enrich/bulk
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

  const rawBody = await getRawBody(req);

  // Debug mode - return as error so Salesforce displays it
  if (req.query.debug === 'true') {
    return res.status(400).json({
      code: 'debug.info',
      message: `DEBUG - Body length: ${rawBody.length} | Body: ${rawBody.substring(0, 300)}`
    });
  }

  const targetUrl = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';

  try {
    if (!rawBody || rawBody.length === 0) {
      return res.status(400).json({
        code: 'error.proxy.empty_body',
        message: 'Proxy received empty body from Salesforce'
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
    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
