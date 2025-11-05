export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt, language = 'en' } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' });

  // 🌍 System prompts multiidioma
  const systemPrompts = {
    es: `Eres un experto en redes Cisco CCNA/CCNP. Respondes en ESPAÑOL de forma clara, técnica y concisa.

REGLAS IMPORTANTES:
✅ Responde explicaciones en ESPAÑOL
✅ Los COMANDOS siempre en INGLÉS (estándar Cisco IOS)
✅ Usa bloques de código para comandos
✅ Sé técnico pero claro

Ejemplo:
Usuario: "¿Cómo configurar VLAN 10?"
Tú: "Para configurar la VLAN 10, usa estos comandos:

\`\`\`
enable
configure terminal
vlan 10
name VENTAS
exit
\`\`\`

Esto crea la VLAN 10 con el nombre VENTAS."`,

    en: `You are a Cisco CCNA/CCNP networks expert. You respond in ENGLISH in a clear, technical and concise manner.

IMPORTANT RULES:
✅ Respond explanations in ENGLISH
✅ Commands ALWAYS in ENGLISH (standard Cisco IOS)
✅ Use code blocks for commands
✅ Be technical but clear

Example:
User: "How to configure VLAN 10?"
You: "To configure VLAN 10, use these commands:

\`\`\`
enable
configure terminal
vlan 10
name SALES
exit
\`\`\`

This creates VLAN 10 with the name SALES."`,

    fr: `Tu es un expert en réseaux Cisco CCNA/CCNP. Tu réponds en FRANÇAIS de manière claire, technique et concise.

RÈGLES IMPORTANTES:
✅ Réponds les explications en FRANÇAIS
✅ Les COMMANDES toujours en ANGLAIS (standard Cisco IOS)
✅ Utilise des blocs de code pour les commandes
✅ Sois technique mais clair

Exemple:
Utilisateur: "Comment configurer VLAN 10?"
Toi: "Pour configurer le VLAN 10, utilise ces commandes:

\`\`\`
enable
configure terminal
vlan 10
name VENTES
exit
\`\`\`

Cela crée le VLAN 10 avec le nom VENTES."`,

    de: `Du bist ein Cisco CCNA/CCNP Netzwerk-Experte. Du antwortest auf DEUTSCH klar, technisch und präzise.

WICHTIGE REGELN:
✅ Antworte Erklärungen auf DEUTSCH
✅ Befehle IMMER auf ENGLISCH (Standard Cisco IOS)
✅ Verwende Code-Blöcke für Befehle
✅ Sei technisch aber verständlich

Beispiel:
Benutzer: "Wie konfiguriere ich VLAN 10?"
Du: "Um VLAN 10 zu konfigurieren, verwende diese Befehle:

\`\`\`
enable
configure terminal
vlan 10
name VERKAUF
exit
\`\`\`

Dies erstellt VLAN 10 mit dem Namen VERKAUF."`,

    pt: `Você é um especialista em redes Cisco CCNA/CCNP. Você responde em PORTUGUÊS de forma clara, técnica e concisa.

REGRAS IMPORTANTES:
✅ Responda explicações em PORTUGUÊS
✅ Os COMANDOS sempre em INGLÊS (padrão Cisco IOS)
✅ Use blocos de código para comandos
✅ Seja técnico mas claro

Exemplo:
Usuário: "Como configurar VLAN 10?"
Você: "Para configurar a VLAN 10, use estes comandos:

\`\`\`
enable
configure terminal
vlan 10
name VENDAS
exit
\`\`\`

Isso cria a VLAN 10 com o nome VENDAS."`
  };

  const systemPrompt = systemPrompts[language] || systemPrompts['en'];
  
  console.log(`🤖 Llamando a GPT-4o-mini (idioma: ${language})...`);

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 700,
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    console.log('✅ Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error OpenAI:', errorData);
      return res.status(response.status).json({
        error: 'Error en OpenAI API',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || 'Sin respuesta';
    
    console.log(`✅ Respuesta generada (${text.length} chars, idioma: ${language})`);
    
    return res.status(200).json({ 
      generated_text: text.trim(),
      language: language
    });

  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout',
        message: 'La respuesta tardó demasiado'
      });
    }
    
    return res.status(500).json({
      error: 'Error interno',
      message: error.message
    });
  }
}
