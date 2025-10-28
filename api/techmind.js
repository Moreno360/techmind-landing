export const config = {
  runtime: 'edge',  // Para mejor rendimiento
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt required' }), { status: 400 });
  }

  const token = process.env.HF_TOKEN;

  if (!token) {
    console.error('Falta la variable de entorno HF_TOKEN');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured. Missing HF token.' }),
      { status: 500 }
    );
  }

  try {
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
      cache: 'no-store',
    });

    if (!hfResponse.ok) {
      const errorPayload = await hfResponse.json().catch(() => ({}));
      const message = errorPayload.error || `HF request failed with status ${hfResponse.status}`;
      throw new Error(message);
    }

    const result = await hfResponse.json();
    const generatedText = Array.isArray(result)
      ? result[0]?.generated_text
      : result?.generated_text;

    return new Response(JSON.stringify({ generated_text: generatedText || '' }), { status: 200 });
  } catch (error) {
    console.error('HF Inference Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Inference failed' }), { status: 500 });
  }
}