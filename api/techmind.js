// api/techmind.js - Proxy para Hugging Face con tu LoRA
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

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

  try {
    // Llama a tu modelo LoRA directamente (HF lo maneja con base Mistral)
    const response = await hf.textGeneration({
      model: 'Delta0723/techmind-pro-v9',  // ¡TU MODELO EXACTO!
      inputs: `<s>[INST] Eres TechMind Pro, experto en Cisco. Responde paso a paso: ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    return new Response(JSON.stringify({ generated_text: response.generated_text }), { status: 200 });
  } catch (error) {
    console.error('HF Inference Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Inference failed' }), { status: 500 });
  }
}