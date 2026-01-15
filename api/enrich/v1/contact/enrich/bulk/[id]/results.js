/**
 * GET /api/enrich/v1/contact/enrich/bulk/[id]/results
 * Using axios
 */

import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || id === 'null') {
    return res.status(400).json({
      code: 'error.invalid_id',
      message: 'Invalid enrichment ID'
    });
  }

  try {
    const response = await axios.get(
      `https://app.fullenrich.com/api/v1/contact/enrich/bulk/${id}/results`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': req.headers.authorization || '',
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      code: 'error.proxy',
      message: error.message
    });
  }
}
