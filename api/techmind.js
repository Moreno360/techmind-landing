// api/techmind.js - Endpoint para TechMind Pro
import { HfInference } from '@huggingface/inference';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get prompt from body
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  // Verify token exists
  if (!process.env.HF_TOKEN) {
    console.error('HF_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error: HF_TOKEN not set' });
  }

  try {
    // Initialize HuggingFace client
    const hf = new HfInference(process.env.HF_TOKEN);

    console.log('Calling HuggingFace API...');
    
    // Call your model
    const response = await hf.textGeneration({
      model: 'Delta0723/techmind-pro-v9',
      inputs: `<s>[INST] Eres TechMind Pro, experto en Cisco. Responde paso a paso: ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    console.log('HuggingFace API response received');

    return res.status(200).json({ 
      generated_text: response.generated_text 
    });

  } catch (error) {
    console.error('HF Inference Error:', error);
    
    // Better error messages
    let errorMessage = 'Error generating response';
    
    if (error.message?.includes('loading')) {
      errorMessage = 'Model is loading, please wait 30-60 seconds';
    } else if (error.message?.includes('unauthorized')) {
      errorMessage = 'Invalid API token';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}