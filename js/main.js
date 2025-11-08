// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 MAIN - TechMind Pro
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ═════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL
// ═════════════════════════════════════════════════════

const MAX_FREE_DEMOS = 5;
let selectedLanguage = localStorage.getItem('techmind_language') || null;

// ═════════════════════════════════════════════════════
// UTILIDADES
// ═════════════════════════════════════════════════════

/**
 * Obtener elemento de forma segura
 */
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element not found: ${id}`);
    }
    return element;
}

/**
 * Actualizar texto de elemento de forma segura
 */
function safeSetText(id, text) {
    const element = safeGetElement(id);
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
}

/**
 * Actualizar HTML de elemento de forma segura
 */
function safeSetHTML(id, html) {
    const element = safeGetElement(id);
    if (element) {
        element.innerHTML = html;
        return true;
    }
    return false;
}

/**
 * Obtener traducciones actuales
 */
function getTranslations() {
    if (!selectedLanguage || !translations[selectedLanguage]) {
        console.warn('⚠️ Invalid language, defaulting to English');
        return translations['en'];
    }
    return translations[selectedLanguage];
}

// ═════════════════════════════════════════════════════
// LANGUAGE SELECTOR
// ═════════════════════════════════════════════════════

function initLanguageSelector() {
    // Botones de idioma
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedLanguage = this.dataset.lang;
            
            const continueBtn = safeGetElement('continueBtn');
            if (continueBtn) {
                continueBtn.classList.add('active');
            }
        });
    });

    // Botón continuar
    const continueBtn = safeGetElement('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (selectedLanguage) {
                localStorage.setItem('techmind_language', selectedLanguage);
                const langSelector = safeGetElement('languageSelector');
                if (langSelector) {
                    langSelector.classList.add('hidden');
                }
                updateUI();
            }
        });
    }

    // Language switcher en nav
    const langSwitcher = safeGetElement('langSwitcher');
    if (langSwitcher) {
        langSwitcher.addEventListener('click', function() {
            const langSelector = safeGetElement('languageSelector');
            if (langSelector) {
                langSelector.classList.remove('hidden');
            }
        });
    }
}

// ═════════════════════════════════════════════════════
// UI UPDATE
// ═════════════════════════════════════════════════════

function updateUI() {
    console.log('🎨 Updating UI for language:', selectedLanguage);
    
    const t = getTranslations();
    
    // Nav
    safeSetText('navFeatures', t.nav.features);
    safeSetText('navPricing', t.nav.pricing);
    safeSetText('navDemo', t.nav.demo);
    safeSetText('langSwitcherText', t.nav.changeLang);
    safeSetText('currentFlag', flags[selectedLanguage] || flags['en']);
    
    // Hero
    safeSetText('heroTitle', t.hero.title);
    safeSetText('heroSubtitle', t.hero.subtitle);
    safeSetText('demoBoxTitle', t.demo.title);
    
    const demoInput = safeGetElement('demoInput');
    if (demoInput) {
        demoInput.placeholder = t.demo.placeholder;
    }
    
    const demoButton = safeGetElement('demoButton');
    if (demoButton) {
        demoButton.textContent = t.demo.button;
    }
    
    // Example buttons
    const exampleButtons = safeGetElement('exampleButtons');
    if (exampleButtons && t.examples) {
        exampleButtons.innerHTML = '';
        t.examples.forEach((example, i) => {
            const btn = document.createElement('button');
            btn.className = 'example-btn';
            btn.textContent = example;
            btn.onclick = () => setExample(i);
            exampleButtons.appendChild(btn);
        });
    }
    
    // Features
    safeSetText('feature1Title', t.features.f1t);
    safeSetText('feature1Desc', t.features.f1d);
    safeSetText('feature2Title', t.features.f2t);
    safeSetText('feature2Desc', t.features.f2d);
    safeSetText('feature3Title', t.features.f3t);
    safeSetText('feature3Desc', t.features.f3d);
    safeSetText('feature4Title', t.features.f4t);
    safeSetText('feature4Desc', t.features.f4d);
    
    // Pricing
    safeSetText('pricingSubtitle', t.pricing.subtitle);
    safeSetText('freePlanTitle', t.pricing.free);
    safeSetText('recommendedBadge', t.pricing.recommended);
    safeSetText('currentPlanBtn', t.pricing.currentPlan);
    safeSetText('paypalBtn', t.pricing.paypalBtn);
    safeSetHTML('paymentInfo', t.pricing.paymentInfo);
    safeSetText('pricingFooter', t.pricing.footer);
    
    // Plans
    for(let i = 0; i < 5; i++) {
        safeSetText(`freePlan${i+1}`, t.freePlan[i]);
        safeSetText(`premiumPlan${i+1}`, t.premiumPlan[i]);
    }
    
    console.log('✅ UI updated successfully');
}

function setExample(i) {
    const t = getTranslations();
    const demoInput = safeGetElement('demoInput');
    if (demoInput && t.exampleTexts && t.exampleTexts[i]) {
        demoInput.value = t.exampleTexts[i];
    }
}

// ═════════════════════════════════════════════════════
// DEMO LIMIT MANAGEMENT
// ═════════════════════════════════════════════════════

function updateDemoLimit() {
    // Validar que selectedLanguage existe
    if (!selectedLanguage) {
        console.warn('⚠️ Language not selected yet, skipping demo limit update');
        return;
    }

    const used = parseInt(localStorage.getItem('techmind_demos_used') || '0');
    const remaining = Math.max(0, MAX_FREE_DEMOS - used);
    
    const warningEl = safeGetElement('limitWarning');
    const remainingEl = safeGetElement('remainingDemos');
    const limitWarningText = safeGetElement('limitWarningText');
    
    // Validar que elementos existen
    if (!warningEl || !remainingEl || !limitWarningText) {
        console.warn('⚠️ Demo limit elements not found in DOM');
        return;
    }

    const t = getTranslations();
    
    // Validar que traducciones existen
    if (!t || !t.demo) {
        console.warn('⚠️ Translations not loaded for:', selectedLanguage);
        return;
    }
    
    if (remaining <= MAX_FREE_DEMOS && remaining > 0) {
        warningEl.style.display = 'block';
        remainingEl.textContent = remaining;
        limitWarningText.innerHTML = `⚠️ ${remaining} ${t.demo.limitWarning}`;
    } else if (remaining === 0) {
        warningEl.style.display = 'none';
    }
}

function checkDemoLimit() {
    const used = parseInt(localStorage.getItem('techmind_demos_used') || '0');
    return used < MAX_FREE_DEMOS;
}

// ═════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════

function trackDemo(success) {
    const stats = JSON.parse(localStorage.getItem('techmind_stats') || '{"total":0,"success":0}');
    stats.total++;
    if (success) stats.success++;
    localStorage.setItem('techmind_stats', JSON.stringify(stats));
    
    // Actualizar contador de forma segura
    const demoCountEl = safeGetElement('demo-count');
    if (demoCountEl) {
        demoCountEl.textContent = stats.total;
    }
    
    console.log('📊 Demo tracked:', stats);
}

function updateDemoCount() {
    const stats = JSON.parse(localStorage.getItem('techmind_stats') || '{"total":0}');
    safeSetText('demo-count', stats.total);
}

// ═════════════================================================================
// MAIN FUNCTION - ASK TECHMIND
// ═════════================================================================

async function askTechMind() {
    console.log('🚀 askTechMind() called');
    
    // Check demo limit
    if (!checkDemoLimit()) {
        showUpgradePrompt();
        return;
    }
    
    const input = safeGetElement('demoInput');
    const button = safeGetElement('demoButton');
    const result = safeGetElement('demoResult');
    
    if (!input || !button || !result) {
        console.error('❌ Required DOM elements not found');
        return;
    }
    
    const question = input.value.trim();
    const t = getTranslations();
    
    if (!question) {
        alert(t.errors.noQuestion);
        return;
    }
    
    // UI feedback - loading state
    button.disabled = true;
    button.innerHTML = `⏳ ${t.demo.thinking}`;
    input.disabled = true;
    result.style.display = 'block';
    result.innerHTML = `
        <div style="text-align:center; padding:40px; background:#f0f7ff; border-radius:15px;">
            <div class="loading-spinner"></div>
            <p style="margin-top:20px; color:#667eea; font-weight:600;">
                ${t.demo.thinking}
            </p>
        </div>
    `;
    
    try {
        console.log('📡 Calling API...');
        
        // Llamar a API
        const response = await fetch('/api/techmind', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: question, 
                language: selectedLanguage 
            })
        });
        
        console.log('📡 API response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Server error (${response.status})`;
            }
            throw new Error(errorMessage);
        }
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Invalid response from server. Please try again.');
        }
        
        let answer = data.generated_text || 'No response';
        
        // Limpiar tokens de modelo
        if (answer.includes('[/INST]')) {
            answer = answer.split('[/INST]')[1].trim();
        }
        
        console.log('✅ Response received, processing...');
        
        // ✨ Procesar con TechMind Enhanced
        if (typeof techMindEnhanced !== 'undefined') {
            const processed = await techMindEnhanced.processResponse(answer, selectedLanguage);
            result.innerHTML = '';
            result.appendChild(processed.html);
        } else {
            // Fallback si TechMindEnhanced no está cargado
            console.warn('⚠️ TechMindEnhanced not loaded, using basic display');
            result.innerHTML = `
                <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9); padding:30px; border-radius:15px; border-left:5px solid #4caf50;">
                    <h4 style="color:#2e7d32;">✅ ${t.demo.title}</h4>
                    <div style="background:white; padding:20px; border-radius:10px; margin:15px 0;">
                        <pre style="white-space:pre-wrap; font-family:Consolas,monospace; line-height:1.8; margin:0;">${answer}</pre>
                    </div>
                    <button onclick="askAnother()" style="padding:10px 20px; background:white; border:2px solid #4caf50; border-radius:8px; cursor:pointer; color:#4caf50; font-weight:600;">
                        🔄 ${t.demo.button}
                    </button>
                </div>
            `;
        }
        
        // Analytics
        const used = parseInt(localStorage.getItem('techmind_demos_used') || '0');
        localStorage.setItem('techmind_demos_used', (used + 1).toString());
        trackDemo(true);
        updateDemoLimit();
        
        // Smooth scroll
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        console.log('✅ Request completed successfully');
        
    } catch (error) {
        console.error('❌ Error in askTechMind:', error);
        
        const t = getTranslations();
        const errorMsg = error.message.includes('loading') ? t.errors.loading : t.errors.generic;
        
        result.innerHTML = `
            <div style="background:#fff3cd; padding:30px; border-radius:15px;">
                <h4 style="color:#856404;">⏳ ${error.message}</h4>
                <p style="color:#856404;">${errorMsg}</p>
                <button onclick="askTechMind()" style="margin-top:20px; padding:12px 24px; background:#ffc107; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
                    🔄 ${t.demo.retry}
                </button>
            </div>
        `;
        
        trackDemo(false);
        
    } finally {
        button.disabled = false;
        button.innerHTML = getTranslations().demo.button;
        input.disabled = false;
    }
}

// ═════════════════════════════════════════════════════
// UPGRADE PROMPT
// ═════════════════════════════════════════════════════

function showUpgradePrompt() {
    const result = safeGetElement('demoResult');
    if (!result) return;
    
    const t = getTranslations();
    
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
            <div style="background: white; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                <p style="font-size: 1.1rem; margin: 0.5rem 0;">${t.premiumPlan[0]}</p>
                <p style="font-size: 1.1rem; margin: 0.5rem 0;">${t.premiumPlan[1]}</p>
                <p style="font-size: 1.1rem; margin: 0.5rem 0;">${t.premiumPlan[2]}</p>
            </div>
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

// ═════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════

function askAnother() {
    const input = safeGetElement('demoInput');
    const result = safeGetElement('demoResult');
    
    if (input) {
        input.value = '';
        input.focus();
    }
    
    if (result) {
        result.style.display = 'none';
    }
}

// ═════════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TechMind Pro initializing...');
    
    // Inicializar language selector
    initLanguageSelector();
    
    // Si ya hay idioma seleccionado, ocultar selector y actualizar UI
    if (selectedLanguage) {
        const langSelector = safeGetElement('languageSelector');
        if (langSelector) {
            langSelector.classList.add('hidden');
        }
        updateUI();
    }
    
    // Actualizar límite de demos
    updateDemoLimit();
    
    // Actualizar contador de demos
    updateDemoCount();
    
    // Enter key para enviar
    const demoInput = safeGetElement('demoInput');
    if (demoInput) {
        demoInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askTechMind();
            }
        });
    }
    
    console.log('✅ TechMind Pro Ready - Multilingual + Enhanced Visualization');
});
