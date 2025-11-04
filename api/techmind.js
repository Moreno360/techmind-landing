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

  console.log('🤖 Llamando a Meta Llama 3.2...');

  try {
    // ✅ Meta-Llama-3.2-3B-Instruct - FUNCIONA en Inference API actual
    const response = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `You are a Cisco networking expert specializing in CCNA/CCNP. Provide clear, step-by-step configurations with specific commands.

User question: ${prompt}

Provide only the technical configuration or explanation. Use code blocks for commands.`,
          parameters: {
            max_new_tokens: 700,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1,
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
      
      // Si el modelo está cargando, dar respuesta útil mientras tanto
      if (response.status === 503) {
        return res.status(200).json({ 
          generated_text: `⏳ **El modelo está iniciando...**

Primera vez tarda 30-60 segundos. **Haz click en "Reintentar" en 1 minuto.**

**Mientras tanto, aquí tienes comandos básicos:**

\`\`\`cisco
! Entrar a modo privilegiado
enable

! Entrar a configuración global
configure terminal

! Configurar IP en interfaz
interface GigabitEthernet0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit

! Guardar configuración
write memory
\`\`\`

**Vuelve a intentar en 60 segundos para tu respuesta personalizada.** 🚀` 
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
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data) && data.length > 0) {
      text = data[0]?.generated_text || '';
    } else if (data.generated_text) {
      text = data.generated_text;
    } else if (data[0]?.generated_text) {
      text = data[0].generated_text;
    }
    
    // Limpiar respuesta
    text = text
      .replace(/�/g, '')
      .replace(/You are a Cisco networking expert.*?User question:.*?\n\n/gs, '')
      .trim();
    
    // Si está vacía o muy corta, dar respuesta básica útil
    if (text.length < 30) {
      text = `**Configuración Cisco básica:**

\`\`\`cisco
! Modo privilegiado
enable

! Configuración global
configure terminal

! Configurar interfaz
interface [tipo/número]
ip address [IP] [máscara]
no shutdown
exit

! Guardar
write memory
\`\`\`

💡 **Tip:** Describe tu topología con más detalle para ayuda específica.`;
    }
    
    console.log(`✅ Enviando respuesta (${text.length} caracteres)`);
    
    return res.status(200).json({ 
      generated_text: text 
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(200).json({
        generated_text: `⏳ **Tiempo de espera agotado**

El servidor tardó demasiado. **Haz click en "Reintentar".**

**Configuración básica:**
\`\`\`cisco
enable
configure terminal
! Tu configuración aquí
write memory
\`\`\``
      });
    }
    
    return res.status(500).json({
      error: 'Error interno',
      message: error.message
    });
  }
}
