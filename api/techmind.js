export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  try {
    const response = await fetch(
      'https://9bae2fd4d197.ngrok-free.app/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ prompt: prompt }),
        signal: AbortSignal.timeout(120000)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    let text = data.generated_text || '';
    
    // LIMPIAR RESPUESTA
    // Quitar el prompt original
    if (text.includes('[/INST]')) {
      text = text.split('[/INST]')[1];
    }
    
    // Quitar repeticiones
    text = text.split('\n')[0]; // Solo primera línea
    
    // Si está muy corta, dar respuesta básica
    if (text.length < 20) {
      text = `Para configurar esto en Cisco:\n\n1. Entra en modo de configuración: enable\n2. configure terminal\n3. Aplica la configuración específica según tu caso`;
    }
    
    return res.status(200).json({ generated_text: text.trim() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}