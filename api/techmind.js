export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const token = process.env.HF_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token not configured' });

  console.log('🤖 Llamando a Mistral...');

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
          inputs: `[INST] Eres un experto en redes Cisco CCNA/CCNP. Responde de forma clara, paso a paso y detallada.

Pregunta: ${prompt}

Proporciona una respuesta completa con comandos específicos cuando sea relevante. [/INST]`,
          parameters: {
            max_new_tokens: 700,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false
          }
        }),
        signal: AbortSignal.timeout(60000) // 60 seg timeout
      }
    );

    console.log('✅ Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error HF:', errorText);
      
      if (response.status === 503) {
        return res.status(503).json({ 
          error: 'El modelo está cargando. Espera 30 segundos e intenta de nuevo.' 
        });
      }
      
      return res.status(response.status).json({
        error: 'Error en la API de HuggingFace',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('📊 Respuesta recibida');
    
    let text = '';
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
      text = data[0]?.generated_text || '';
    } else if (data.generated_text) {
      text = data.generated_text;
    } else if (data[0]?.generated_text) {
      text = data[0].generated_text;
    }
    
    // Limpiar respuesta
    text = text
      .replace(/�/g, '')  // Quitar caracteres raros
      .replace(/\[INST\].*?\[\/INST\]/g, '')  // Quitar prompt
      .trim();
    
    // Si está muy corta o vacía
    if (text.length < 30) {
      text = `Para configurar esto en Cisco:

1. Entra en modo privilegiado: \`enable\`
2. Entra en modo configuración: \`configure terminal\`
3. Aplica la configuración específica según tu necesidad

Si necesitas ayuda más específica, reformula la pregunta con más detalles.`;
    }
    
    console.log(`✅ Respuesta generada: ${text.substring(0, 100)}...`);
    
    return res.status(200).json({ 
      generated_text: text 
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout - La respuesta tardó demasiado'
      });
    }
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}