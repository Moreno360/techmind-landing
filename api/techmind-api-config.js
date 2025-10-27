export default function handler(req, res) {
  // Permitir CORS para que el frontend pueda acceder
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder con el token desde variables de entorno
  res.status(200).json({ 
    token: process.env.HF_TOKEN,
    modelUrl: 'https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9'
  });
}