// TechMind Pro - HuggingFace Integration
const HF_TOKEN = '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';
const MODEL_URL = 'https://api-inference.huggingface.co/models/Delta0723/techmind-pro-v9';

const EXAMPLES = [
    "¿Cómo configuro IP 192.168.1.1 en GigabitEthernet0/0?",
    "En Packet Tracer, configura VLAN 10 llamada Administracion",
    "Configura OSPF área 0 en router con red 10.0.0.0/8",
    "Crea ACL que permita HTTP/HTTPS y bloquee Telnet"
];

async function askTechMind() {
    const input = document.getElementById('question-input');
    const button = document.getElementById('ask-button');
    const responseDiv = document.getElementById('response-container');
    const question = input.value.trim();
    
    if (!question) {
        alert('Por favor escribe una pregunta');
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '⏳ Pensando...';
    input.disabled = true;
    
    responseDiv.style.display = 'block';
    responseDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #f0f7ff; border-radius: 15px;">
            <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 20px; color: #667eea; font-weight: 600;">🤔 TechMind está pensando...</p>
            <p style="color: #666; font-size: 0.9em;"><small>Esto puede tomar 15-30 segundos</small></p>
        </div>
    `;
    
    try {
        const response = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: `<s>[INST] ${question} [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        let answer = Array.isArray(data) ? data[0].generated_text : data.generated_text;
        
        if (answer.includes('[/INST]')) {
            answer = answer.split('[/INST]')[1].trim();
        }
        
        responseDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 30px; border-radius: 15px; border-left: 5px solid #4caf50;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div>
                        <h4 style="color: #2e7d32; margin: 0;">✅ Respuesta de TechMind Pro</h4>
                        <p style="color: #558b2f; margin: 5px 0 0 0; font-size: 0.9em;">🤖 v9 ULTIMATE | 🎯 93% accuracy</p>
                    </div>
                    <button onclick="copyResponse('${answer.replace(/'/g, "\\'")}', this)" 
                        style="padding: 8px 16px; background: white; border: 2px solid #4caf50; border-radius: 8px; cursor: pointer; color: #4caf50; font-weight: 600;">
                        📋 Copiar
                    </button>
                </div>
                <div style="background: white; padding: 25px; border-radius: 10px;">
                    <pre style="white-space: pre-wrap; font-family: 'Consolas', monospace; line-height: 1.8; margin: 0; color: #333;">${answer}</pre>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button onclick="askAnother()" style="padding: 10px 20px; background: white; border: 2px solid #4caf50; border-radius: 8px; cursor: pointer; color: #4caf50; font-weight: 600;">
                        🔄 Otra pregunta
                    </button>
                    <button onclick="shareDemo('${question.substring(0, 80).replace(/'/g, "\\'")}...')" style="padding: 10px 20px; background: #4caf50; border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: 600;">
                        🔗 Compartir
                    </button>
                </div>
            </div>
        `;
        
        trackDemo(question, true);
        
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = error.message;
        
        if (errorMsg.includes('loading') || errorMsg.includes('currently loading')) {
            responseDiv.innerHTML = `
                <div style="background: #fff3cd; padding: 30px; border-radius: 15px; border-left: 5px solid #ffc107;">
                    <h4 style="color: #856404; margin-bottom: 15px;">⏳ Modelo Iniciando...</h4>
                    <p style="color: #856404;">El modelo está arrancando (primera vez). Toma 1-2 minutos.</p>
                    <button onclick="askTechMind()" style="margin-top: 20px; padding: 12px 24px; background: #ffc107; border: none; border-radius: 8px; cursor: pointer; color: #000; font-weight: 600;">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        } else {
            responseDiv.innerHTML = `
                <div style="background: #ffebee; padding: 30px; border-radius: 15px; border-left: 5px solid #f44336;">
                    <h4 style="color: #c62828;">⚠️ Error: ${errorMsg}</h4>
                    <button onclick="askAnother()" style="margin-top: 20px; padding: 12px 24px; background: #f44336; border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: 600;">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
        
        trackDemo(question, false);
    } finally {
        button.disabled = false;
        button.innerHTML = '🚀 Preguntar a TechMind Pro';
        input.disabled = false;
    }
}

function copyResponse(text, button) {
    navigator.clipboard.writeText(text)
        .then(() => {
            button.innerHTML = '✅ Copiado';
            setTimeout(() => button.innerHTML = '📋 Copiar', 2000);
        })
        .catch(() => alert('Error al copiar'));
}

function askAnother() {
    document.getElementById('question-input').value = '';
    document.getElementById('question-input').focus();
    document.getElementById('response-container').style.display = 'none';
}

function shareDemo(question) {
    const url = 'https://techmind-landing.vercel.app/#demo';
    if (navigator.share) {
        navigator.share({title: 'TechMind Pro', text: `Probé: "${question}"`, url: url});
    } else {
        prompt('Comparte:', url);
    }
}

function setExample(index) {
    document.getElementById('question-input').value = EXAMPLES[index];
}

function trackDemo(q, success) {
    const stats = JSON.parse(localStorage.getItem('techmind_stats') || '{"total":0,"success":0}');
    stats.total++;
    if (success) stats.success++;
    localStorage.setItem('techmind_stats', JSON.stringify(stats));
    const display = document.getElementById('demo-count');
    if (display) display.textContent = stats.total;
}

// CSS
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
#question-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}
`;
document.head.appendChild(style);

// Init
document.addEventListener('DOMContentLoaded', () => {
    const stats = JSON.parse(localStorage.getItem('techmind_stats') || '{"total":0}');
    const display = document.getElementById('demo-count');
    if (display) display.textContent = stats.total;
    
    const input = document.getElementById('question-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askTechMind();
            }
        });
    }
});

console.log('✅ TechMind Pro API Ready | Model: Delta0723/techmind-pro-v9');
