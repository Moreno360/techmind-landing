// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 TECHMIND ENHANCED - MAIN CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * TechMindEnhanced
 * Controlador principal que orquesta todos los módulos
 */
class TechMindEnhanced {
  constructor(language = 'en') {
    this.language = language;
    this.parser = new ResponseParser();
    this.topologyGenerator = new TopologyGenerator();
    this.formatter = new ResponseFormatter(language);
    
    console.log('🚀 TechMind Enhanced initialized');
  }

  /**
   * Método principal: procesa respuesta de API
   */
  async processResponse(apiResponse, language = null) {
    try {
      console.log('⚙️ Processing API response...');
      
      // Actualizar idioma si se proporciona
      if (language && language !== this.language) {
        this.language = language;
        this.formatter = new ResponseFormatter(language);
      }

      // 1. Parsear respuesta
      const parsedData = this.parser.parse(apiResponse);
      
      // 2. Generar topología SVG
      let topologySVG = null;
      if (parsedData.topology && parsedData.topology.nodes.length > 0) {
        // Agregar devices al topology si no están
        if (!parsedData.topology.devices) {
          parsedData.topology.devices = parsedData.devices;
        }
        topologySVG = this.topologyGenerator.generate(parsedData.topology);
      }
      
      // 3. Formatear HTML
      const formattedHTML = this.formatter.format(parsedData, topologySVG);
      
      console.log('✅ Response processed successfully');
      
      return {
        html: formattedHTML,
        data: parsedData
      };
      
    } catch (error) {
      console.error('❌ Error processing response:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * Crear respuesta de error
   */
  createErrorResponse(error) {
    const container = document.createElement('div');
    container.className = 'techmind-response error';
    container.innerHTML = `
      <div class="error-content">
        <h4>⚠️ Error Processing Response</h4>
        <p>${error.message || 'An unexpected error occurred'}</p>
        <button onclick="askAnother()">Try Again</button>
      </div>
    `;
    return { html: container, data: null };
  }

  /**
   * Update language
   */
  setLanguage(language) {
    this.language = language;
    this.formatter = new ResponseFormatter(language);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔌 INTEGRACIÓN CON INDEX.HTML
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Instancia global
let techMindEnhanced = null;

/**
 * Inicializar TechMind Enhanced
 */
function initTechMindEnhanced() {
  const language = localStorage.getItem('techmind_language') || 'en';
  techMindEnhanced = new TechMindEnhanced(language);
  console.log('✅ TechMind Enhanced ready');
}

/**
 * REEMPLAZA la función askTechMind() existente
 * Esta es la versión mejorada con visualización
 */
async function askTechMind() {
  const used = parseInt(localStorage.getItem('techmind_demos_used') || '0');
  const t = translations[selectedLanguage];
  
  // Check demo limit
  if (used >= MAX_FREE_DEMOS) {
    showUpgradePrompt();
    return;
  }
  
  const input = document.getElementById('demoInput');
  const button = document.getElementById('demoButton');
  const result = document.getElementById('demoResult');
  const question = input.value.trim();
  
  if (!question) { 
    alert(selectedLanguage === 'es' ? 'Por favor escribe una pregunta' : 
          selectedLanguage === 'en' ? 'Please type a question' : 
          selectedLanguage === 'fr' ? 'Veuillez taper une question' : 
          selectedLanguage === 'de' ? 'Bitte geben Sie eine Frage ein' : 
          'Por favor digite uma pergunta'); 
    return; 
  }
  
  // UI feedback
  button.disabled = true;
  button.innerHTML = selectedLanguage === 'es' ? '⏳ Pensando...' : 
                     selectedLanguage === 'en' ? '⏳ Thinking...' : 
                     selectedLanguage === 'fr' ? '⏳ En réflexion...' : 
                     selectedLanguage === 'de' ? '⏳ Denke nach...' : 
                     '⏳ Pensando...';
  input.disabled = true;
  result.style.display = 'block';
  result.innerHTML = `
    <div style="text-align:center; padding:40px; background:#f0f7ff; border-radius:15px;">
      <div class="loading-spinner"></div>
      <p style="margin-top:20px; color:#667eea; font-weight:600;">
        ${selectedLanguage === 'es' ? '🤔 TechMind está pensando...' : 
          selectedLanguage === 'en' ? '🤔 TechMind is thinking...' : 
          selectedLanguage === 'fr' ? '🤔 TechMind réfléchit...' : 
          selectedLanguage === 'de' ? '🤔 TechMind denkt nach...' : 
          '🤔 TechMind está pensando...'}
      </p>
    </div>
  `;
  
  try {
    // Llamar a API
    const response = await fetch('/api/techmind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: question, 
        language: selectedLanguage 
      })
    });
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si no puede parsear JSON, es un error de servidor
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Invalid response from server. Please try again.');
    let answer = data.generated_text || 'No response';
    
    // Limpiar tokens de modelo
    if (answer.includes('[/INST]')) {
      answer = answer.split('[/INST]')[1].trim();
    }
    
    // ✨ AQUÍ ESTÁ LA MAGIA - Procesar con TechMind Enhanced
    const processed = await techMindEnhanced.processResponse(answer, selectedLanguage);
    
    // Inyectar HTML mejorado
    result.innerHTML = '';
    result.appendChild(processed.html);
    
    // Analytics
    localStorage.setItem('techmind_demos_used', (used + 1).toString());
    trackDemo(true);
    updateDemoLimit();
    
    // Smooth scroll
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
  } catch (error) {
    console.error('TechMind Error:', error);
    
    result.innerHTML = `
      <div style="background:#fff3cd; padding:30px; border-radius:15px;">
        <h4 style="color:#856404;">⏳ ${error.message}</h4>
        <p style="color:#856404;">
          ${error.message.includes('loading') 
            ? (selectedLanguage === 'es' ? 'El modelo está iniciando. Espera 60 segundos e intenta de nuevo.' : 
               selectedLanguage === 'en' ? 'The model is starting. Wait 60 seconds and try again.' : 
               selectedLanguage === 'fr' ? 'Le modèle démarre. Attendez 60 secondes et réessayez.' : 
               selectedLanguage === 'de' ? 'Das Modell startet. Warten Sie 60 Sekunden und versuchen Sie es erneut.' : 
               'O modelo está iniciando. Aguarde 60 segundos e tente novamente.')
            : (selectedLanguage === 'es' ? 'Hubo un error. Intenta de nuevo.' : 
               selectedLanguage === 'en' ? 'There was an error. Try again.' : 
               selectedLanguage === 'fr' ? 'Il y a eu une erreur. Réessayez.' : 
               selectedLanguage === 'de' ? 'Es gab einen Fehler. Versuchen Sie es erneut.' : 
               'Houve um erro. Tente novamente.')}
        </p>
        <button onclick="askTechMind()" style="margin-top:20px; padding:12px 24px; background:#ffc107; border:none; border-radius:8px; cursor:pointer;">
          🔄 ${selectedLanguage === 'es' ? 'Reintentar' : 
               selectedLanguage === 'en' ? 'Retry' : 
               selectedLanguage === 'fr' ? 'Réessayer' : 
               selectedLanguage === 'de' ? 'Erneut versuchen' : 
               'Tentar novamente'}
        </button>
      </div>
    `;
    
    trackDemo(false);
    
  } finally { 
    button.disabled = false; 
    button.innerHTML = t.demo.button; 
    input.disabled = false; 
  }
}

/**
 * Show upgrade prompt cuando se acaban demos
 */
function showUpgradePrompt() {
  const result = document.getElementById('demoResult');
  result.style.display = 'block';
  result.innerHTML = `
    <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 2.5rem; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <h3 style="font-size: 2rem; margin-bottom: 1rem;">🎯 ${
        selectedLanguage === 'es' ? '¡Has usado tus 5 demos gratis!' : 
        selectedLanguage === 'en' ? 'You\'ve used your 5 free demos!' : 
        selectedLanguage === 'fr' ? 'Vous avez utilisé vos 5 démos gratuits!' : 
        selectedLanguage === 'de' ? 'Sie haben Ihre 5 kostenlosen Demos verwendet!' : 
        'Você usou suas 5 demos grátis!'
      }</h3>
      <p style="font-size: 1.2rem; margin-bottom: 2rem;">
        ${selectedLanguage === 'es' ? 'Desbloquea acceso ilimitado con' : 
          selectedLanguage === 'en' ? 'Unlock unlimited access with' : 
          selectedLanguage === 'fr' ? 'Débloquez l\'accès illimité avec' : 
          selectedLanguage === 'de' ? 'Schalten Sie unbegrenzten Zugriff frei mit' : 
          'Desbloqueie acesso ilimitado com'} 
        <strong>TechMind Pro Premium</strong>
      </p>
      <button onclick="window.location.href='#pricing'" style="padding: 1.2rem 3rem; background: #4caf50; color: white; border: none; border-radius: 10px; font-size: 1.3rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
        💎 ${selectedLanguage === 'es' ? 'Ver Planes Premium' : 
             selectedLanguage === 'en' ? 'View Premium Plans' : 
             selectedLanguage === 'fr' ? 'Voir les Plans Premium' : 
             selectedLanguage === 'de' ? 'Premium-Pläne ansehen' : 
             'Ver Planos Premium'}
      </button>
    </div>
  `;
}

/**
 * Helper: askAnother (ya existente, mantener)
 */
function askAnother() {
  document.getElementById('demoInput').value = '';
  document.getElementById('demoResult').style.display = 'none';
  document.getElementById('demoInput').focus();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 AUTO-INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Inicializar cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTechMindEnhanced);
} else {
  initTechMindEnhanced();
}

console.log('✅ TechMind Enhanced Module Loaded');
