export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const token = process.env.HF_TOKEN;
  if (!token) return res.status(500).json({ error: 'No token' });

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `[INST] Eres un experto en redes Cisco. Responde paso a paso y de forma detallada: ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 700,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        })
      }
    );