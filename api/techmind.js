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

  const token = process.env.HF_TOKEN;

  if (!token) {
    console.error('HF_TOKEN not configured');
    return res.status(500).json({ error: 'Token not configured' });
  }

  console.log('Token found, calling API...');

  try {
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    console.log('HuggingFace status:', hfResponse.status);

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('HuggingFace error:', errorText);

      if (hfResponse.status === 503) {
        return res.status(503).json({ 
          error: 'Model is loading, wait 60 seconds' 
        });
      }

      if (hfResponse.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid token' 
        });
      }

      return res.status(hfResponse.status).json({
        error: 'HuggingFace API error',
        details: errorText
      });
    }

    const data = await hfResponse.json();
    console.log('Response received');

    let generatedText = '';

    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || '';
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      console.error('Unexpected format:', data);
      return res.status(500).json({ 
        error: 'Unexpected response format' 
      });
    }

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