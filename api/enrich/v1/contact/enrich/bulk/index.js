/**
 * POST /api/enrich/v1/contact/enrich/bulk
 * Simple proxy with bodyParser
 */

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  // Log what we receive
  console.log('Received body type:', typeof body);
  console.log('Received body:', JSON.stringify(body));

  if (!body || !body.contacts) {
    return res.status(400).json({
      code: 'error.proxy.invalid_body',
      message: 'Missing contacts in body'
    });
  }

  try {
    // Re-stringify the parsed body
    const jsonBody = JSON.stringify(body);
    console.log('Sending to FullEnrich:', jsonBody);

    const response = await fetch('https://app.fullenrich.com/api/v1/contact/enrich/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body: jsonBody,
    });

    const responseText = await response.text();
    console.log('FullEnrich response:', response.status, responseText);

    try {
      const data = JSON.parse(responseText);
      return res.status(response.status).json(data);
    } catch {
      return res.status(response.status).send(responseText);
    }

  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
