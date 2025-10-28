// api/techmind.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { prompt } = await req.json();
  const url = process.env.RUNPOD_URL;
  const key = process.env.RUNPOD_KEY;

  if (!url || !key) return new Response('Missing RunPod config', { status: 500 });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `<s>[INST] ${prompt} [/INST]` }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(`RunPod Error: ${err}`, { status: res.status });
    }

    const data = await res.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ generated_text: answer }), { status: 200 });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}