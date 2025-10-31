export const config = {
  runtime: 'edge', // Para mejor rendimiento
};

const TOKEN_ENV_VARS = [
  'HF_TOKEN',
  'HUGGING_FACE_HUB_TOKEN',
  'HUGGINGFACEHUB_API_TOKEN',
  'HUGGINGFACEHUB_TOKEN',
  'HUGGINGFACE_API_TOKEN',
  'HUGGINGFACE_TOKEN',
];

const DEFAULT_MODEL_ID = 'Delta0723/techmind-pro-v9';
const DEFAULT_HF_BASE_URL = 'https://api-inference.huggingface.co/models';

const sanitizeEnvValue = (value) =>
  typeof value === 'string' ? value.trim().replace(/^['"]+|['"]+$/g, '') : undefined;

const resolveToken = () => {
  for (const name of TOKEN_ENV_VARS) {
    const value = sanitizeEnvValue(process.env[name]);
    if (value) {
      return value;
    }
  }
  return undefined;
};

const resolveModelId = () => sanitizeEnvValue(process.env.HF_MODEL_ID) || DEFAULT_MODEL_ID;

const resolveInferenceUrl = (modelId) => {
  const explicitUrl = sanitizeEnvValue(process.env.HF_INFERENCE_URL);
  if (explicitUrl) {
    return explicitUrl;
  }

  const baseUrl = sanitizeEnvValue(process.env.HF_API_URL) || DEFAULT_HF_BASE_URL;
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const trimmedModel = modelId.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedModel}`;
};

const extractGeneratedText = (payload) => {
  if (Array.isArray(payload)) {
    const candidate = payload[0] || {};
    return (
      candidate.generated_text ||
      candidate.output_text ||
      (Array.isArray(candidate.generated_texts) ? candidate.generated_texts[0] : undefined)
    );
  }

  if (payload && typeof payload === 'object') {
    return payload.generated_text || payload.output_text || payload.text;
  }

  return undefined;
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt required' }), { status: 400 });
  }

  const token = resolveToken();

  if (!token) {
    console.error('Falta la variable de entorno con el token de Hugging Face.');
    return new Response(JSON.stringify({ error: 'Server misconfigured. Missing HF token.' }), {
      status: 500,
    });
  }

  const modelId = resolveModelId();
  const inferenceUrl = resolveInferenceUrl(modelId);

  try {
    const hfResponse = await fetch(inferenceUrl, {
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
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
      cache: 'no-store',
    });

    if (!hfResponse.ok) {
      const rawBody = await hfResponse.text();
      let parsedBody = {};

      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        parsedBody = { error: rawBody };
      }

      const defaultMessage = `HF request failed with status ${hfResponse.status}`;
      let message = parsedBody.error || parsedBody.message || defaultMessage;

      if ([401, 403, 404].includes(hfResponse.status)) {
        message =
          `Autenticación fallida contra Hugging Face para el modelo "${modelId}". ` +
          'Verifica que el token tenga acceso y que el ID del modelo sea correcto.';
      }

      const error = new Error(message);
      error.details = { status: hfResponse.status, body: parsedBody, inferenceUrl };
      throw error;
    }

    const result = await hfResponse.json();
    const generatedText = extractGeneratedText(result) || '';

    return new Response(JSON.stringify({ generated_text: generatedText }), { status: 200 });
  } catch (error) {
    console.error('HF Inference Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Inference failed', details: error.details || null }),
      { status: 500 }
    );
  }
}
