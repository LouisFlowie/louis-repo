/**
 * POST /api/enrich/v1/contact/enrich/bulk
 * Using axios for reliable HTTP requests
 */

import axios from 'axios';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        code: 'error.proxy.empty_body',
        message: 'Empty body received'
      });
    }

    console.log('Sending to FullEnrich:', JSON.stringify(body));

    const response = await axios.post(
      'https://app.fullenrich.com/api/v1/contact/enrich/bulk',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': req.headers.authorization || '',
        },
        timeout: 30000,
      }
    );

    console.log('FullEnrich response:', response.status, JSON.stringify(response.data));

    return res.status(response.status).json(response.data);

  } catch (error) {
    if (error.response) {
      // FullEnrich returned an error
      console.log('FullEnrich error:', error.response.status, JSON.stringify(error.response.data));
      return res.status(error.response.status).json(error.response.data);
    }

    console.error('Proxy error:', error.message);
    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
