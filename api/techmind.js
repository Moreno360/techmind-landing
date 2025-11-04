// api/techmindPro.js - USA TU MODELO PROPIO DESPLEGADO EN RUNPOD

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST permitido' });

  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt vacío' });
  }

  try {
    const response = await fetch(
      'https://53bb4e6a56a5.ngrok-free.app/generate', // <-- Sustituye esto por tu dominio ngrok actual
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: AbortSignal.timeout(120000) // 2 minutos
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Error del servidor: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    let text = data.generated_text || '';

    // Limpiar y sanitizar respuesta
    if (text.includes('[/INST]')) {
      text = text.split('[/INST]').pop().trim();
    }

    // Quitar eco del prompt
    if (text.toLowerCase().startsWith(prompt.toLowerCase().substring(0, 30))) {
      text = text.substring(prompt.length).trim();
    }

    text = text.replace(/\s+/g, ' ').trim();

    if (text.length < 20) {
      text = `Para tu consulta sobre "${prompt.substring(0, 50)}...":\n\n` +
             `1. Ingresa en modo configuración (enable)\n` +
             `2. Escribe: configure terminal\n` +
             `3. Luego aplica los comandos necesarios\n\n` +
             `💡 Intenta escribir una consulta más específica.`;
    }

    return res.status(200).json({
      generated_text: text,
      prompt: prompt
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error interno',
      details: error.message
    });
  }
}
