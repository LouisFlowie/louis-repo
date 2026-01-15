/**
 * GET /api/enrich/v1/contact/enrich/bulk/[id]/results
 * With proper User-Agent
 */

import https from 'https';

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    const options = {
      hostname: 'app.fullenrich.com',
      port: 443,
      path: `/api/v1/contact/enrich/bulk/${id}/results`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': req.headers.authorization || '',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    };

    const response = await makeRequest(options);
    const data = JSON.parse(response.data);

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
