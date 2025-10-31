// api/techmind.js - Proxy para Hugging Face con tu LoRA
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

// --- BLOQUE 'config' ELIMINADO ---
// Al eliminar 'export const config', Vercel usará el runtime
// estándar de Node.js, que tiene timeouts más largos
// y es ideal para interactuar con APIs de IA.

export default async function handler(req, res) {
  // Nota: Cambiamos 'req' a 'req, res' para el runtime de Node.js
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // En Node.js, el body ya está parseado o se accede con req.body
  // Vercel maneja esto automáticamente en la mayoría de los casos.
  const { prompt } = req.body; 

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    // Llama a tu modelo LoRA directamente (HF lo maneja con base Mistral)
    const response = await hf.textGeneration({
      model: 'Delta0723/techmind-pro-v9', // ¡TU MODELO EXACTO!
      inputs: `<s>[INST] Eres TechMind Pro, experto en Cisco. Responde paso a paso: ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    return res.status(200).json({ generated_text: response.generated_text });

  } catch (error) {
    console.error('HF Inference Error:', error);
    // Aseguramos que 'error.message' exista
    const errorMessage = error instanceof Error ? error.message : 'Inference failed';
    return res.status(500).json({ error: errorMessage });
  }
}