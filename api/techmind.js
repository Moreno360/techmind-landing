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

  console.log('🤖 Llamando a Mixtral-8x7B...');

  try {
    // ✅ Mixtral-8x7B-Instruct - FUNCIONA en Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Eres un experto en redes Cisco CCNA/CCNP. Responde de forma clara, paso a paso y con comandos específicos.

Pregunta del usuario: ${prompt}

Responde solo con la configuración o explicación técnica, sin introducción. [/INST]`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.15,
            return_full_text: false,
            do_sample: true
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        }),
        signal: AbortSignal.timeout(120000)
      }
    );

    console.log('✅ Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      
      if (response.status === 503) {
        return res.status(200).json({ 
          generated_text: `⏳ El modelo está iniciando (primera vez tarda 30-60 segundos).

Por favor, **espera 60 segundos** y haz click en "Reintentar".

Mientras tanto, aquí tienes una guía básica para Cisco:

**Comandos esenciales:**
\`\`\`
enable
configure terminal
interface [nombre]
ip address [IP] [máscara]
no shutdown
exit
\`\`\`

Haz click en "Reintentar" en 60 segundos para tu respuesta completa.` 
        });
      }
      
      return res.status(response.status).json({
        error: 'Error en la API',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('📊 Respuesta recibida');
    
    let text = '';
    
    if (Array.isArray(data) && data.length > 0) {
      text = data[0]?.generated_text || '';
    } else if (data.generated_text) {
      text = data.generated_text;
    }
    
    // Limpiar
    text = text
      .replace(/�/g, '')
      .replace(/<s>\s*\[INST\].*?\[\/INST\]\s*/gs, '')
      .trim();
    
    // Si está vacía o muy corta
    if (text.length < 30) {
      text = `**Configuración básica para Cisco:**

1. Entra en modo privilegiado:
   \`\`\`
   enable
   \`\`\`

2. Entra en configuración global:
   \`\`\`
   configure terminal
   \`\`\`

3. Aplica tu configuración específica según necesites.

💡 **Tip:** Para obtener ayuda más específica, describe tu topología o el objetivo que quieres lograr con más detalle.`;
    }
    
    console.log(`✅ Enviando respuesta (${text.length} chars)`);
    
    return res.status(200).json({ 
      generated_text: text 
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(200).json({
        generated_text: `⏳ **Tiempo de espera agotado**

El modelo tardó demasiado en responder. Esto puede pasar si:
- Es la primera vez que se usa (cold start)
- Hay mucha carga en los servidores

**Solución:** Haz click en "Reintentar" y debería funcionar.

**Configuración básica mientras tanto:**
\`\`\`
enable
configure terminal
[tu configuración aquí]
\`\`\``
      });
    }
    
    return res.status(500).json({
      error: 'Error interno',
      message: error.message
    });
  }
}
