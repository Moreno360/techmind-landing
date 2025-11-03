export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  console.log('Calling RunPod API...');

  try {
    const response = await fetch(
      'http://194.68.245.204:22197/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        }),
      }
    );

    console.log('RunPod status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RunPod error:', errorText);

      return res.status(response.status).json({
        error: 'RunPod API error',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Response received');

    const generatedText = data.generated_text || 'Sin respuesta';

    return res.status(200).json({ 
      generated_text: generatedText 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}