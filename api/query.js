export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const HF_TOKEN = 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; // lo pondrás en Vercel
  const MODEL_URL = "https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9";

  try {
    const hfResponse = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await hfResponse.json();
    res.status(hfResponse.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
