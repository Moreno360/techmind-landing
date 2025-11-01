// api/techmind.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Verificar token
  const token = process.env.HF_TOKEN;
  if (!token) {
    console.error('❌ HF_TOKEN not configured in Vercel');
    return res.status(500).json({ 
      error: 'Server configuration error',
      hint: 'HF_TOKEN not set in environment variables'
    });
  }

  console.log('✅ Token found:', token.substring(0, 10) + '...');
  console.log('📝 Prompt:', prompt);

  try {
    // Llamada directa a HuggingFace API
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Eres TechMind Pro, experto en Cisco. Responde paso a paso: ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    console.log('📡 HuggingFace status:', hfResponse.status);

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('❌ HuggingFace error:', errorText);
      
      // Errores específicos
      if (hfResponse.status === 503) {
        return res.status(503).json({ 
          error: 'Model is loading, please wait 30-60 seconds and try again' 
        });
      }
      
      if (hfResponse.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid HuggingFace token' 
        });
      }

      return res.status(hfResponse.status).json({ 
        error: 'HuggingFace API error',
        details: errorText 
      });
    }

    const data = await hfResponse.json();
    console.log('✅ Response received');

    // Extraer texto generado
    let generatedText = '';
    
    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || '';
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      console.error('❌ Unexpected response format:', data);
      return res.status(500).json({ 
        error: 'Unexpected response format from model' 
      });
    }

    return res.status(200).json({ 
      generated_text: generatedText 
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}