/**
 * POST /api/enrich/v1/contact/enrich/bulk
 * With proper User-Agent to avoid blocking
 */

import https from 'https';

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

function makeRequest(options, body) {
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
    req.write(body);
    req.end();
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

  if (!rawBody || rawBody.length === 0) {
    return res.status(400).json({
      code: 'error.proxy.empty_body',
      message: 'Proxy received empty body'
    });
  }

  try {
    const bodyBuffer = Buffer.from(rawBody, 'utf-8');

    const options = {
      hostname: 'app.fullenrich.com',
      port: 443,
      path: '/api/v1/contact/enrich/bulk',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bodyBuffer.length,
        'Accept': 'application/json',
        'Authorization': req.headers.authorization || '',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    };

    const response = await makeRequest(options, bodyBuffer);
    const data = JSON.parse(response.data);

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
