export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  // ✅ Usar OpenAI API Key desde variables de entorno
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' });

  console.log('🤖 Llamando a GPT-4o-mini...');

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en redes Cisco CCNA/CCNP. Respondes de forma clara, técnica y concisa con comandos específicos cuando sea relevante. Usas bloques de código para comandos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 700,
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    console.log('✅ Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error OpenAI:', errorData);
      return res.status(response.status).json({
        error: 'Error en OpenAI API',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || 'Sin respuesta';
    
    console.log(`✅ Respuesta generada (${text.length} chars)`);
    
    return res.status(200).json({ 
      generated_text: text.trim()
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout',
        message: 'La respuesta tardó demasiado'
      });
    }
    
    return res.status(500).json({
      error: 'Error interno',
      message: error.message
    });
  }
}
