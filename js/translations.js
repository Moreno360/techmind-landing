// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌍 TRANSLATIONS - TechMind Pro
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const translations = {
    es: {
        nav: { features: "Características", pricing: "Precios", demo: "Demo", changeLang: "Cambiar idioma" },
        hero: { title: "Asistente IA Experto en Redes Cisco", subtitle: "93% de precisión | 1,191 casos entrenados | Packet Tracer incluido" },
        demo: { title: "🧪 Prueba TechMind Ahora", placeholder: "Escribe tu pregunta...", button: "🚀 Preguntar a TechMind Pro", limitWarning: "demos gratis restantes", demoCount: "demos realizados", thinking: "🤔 TechMind está pensando...", retry: "Reintentar" },
        examples: ["IP en interfaz", "VLAN en PT", "OSPF área 0", "ACL HTTP/HTTPS"],
        exampleTexts: ["¿Cómo configuro IP 192.168.1.1 en GigabitEthernet0/0?", "En Packet Tracer, configura VLAN 10", "Configura OSPF área 0 con red 10.0.0.0/8", "Crea ACL que permita HTTP/HTTPS"],
        features: { f1t: "Configuraciones Cisco", f1d: "Genera configuraciones completas paso a paso", f2t: "Troubleshooting", f2d: "Diagnostica problemas con guías detalladas", f3t: "Packet Tracer", f3d: "Instrucciones específicas para simulaciones", f4t: "Respuestas Instantáneas", f4d: "Respuestas en segundos, no horas" },
        pricing: { subtitle: "Elige el plan perfecto para ti", free: "Gratis", premium: "Premium", recommended: "⭐ RECOMENDADO", currentPlan: "Plan Actual", paypalBtn: "💳 Pagar con PayPal", paymentInfo: "Pago seguro con PayPal<br>Después del pago, envía captura a:<br><strong>hola.angelmoreno@gmail.com</strong><br><small>Activo tu cuenta en 24h</small>", footer: "💳 Pago seguro | 🔄 Cancela cuando quieras | ✉️ Soporte 24/7" },
        freePlan: ["✅ 5 consultas de prueba", "✅ Acceso al demo público", "❌ Respuestas ilimitadas", "❌ Soporte prioritario", "❌ Sin publicidad"],
        premiumPlan: ["✅ Consultas ilimitadas", "✅ Respuestas más rápidas", "✅ Soporte técnico directo", "✅ Acceso anticipado a features", "✅ Sin anuncios"],
        errors: {
            noQuestion: "Por favor escribe una pregunta",
            generic: "Hubo un error. Intenta de nuevo.",
            loading: "El modelo está iniciando. Espera 60 segundos e intenta de nuevo."
        }
    },
    en: {
        nav: { features: "Features", pricing: "Pricing", demo: "Demo", changeLang: "Change language" },
        hero: { title: "AI Expert Assistant for Cisco Networks", subtitle: "93% accuracy | 1,191 trained cases | Packet Tracer included" },
        demo: { title: "🧪 Try TechMind Now", placeholder: "Type your question...", button: "🚀 Ask TechMind Pro", limitWarning: "free demos remaining", demoCount: "demos completed", thinking: "🤔 TechMind is thinking...", retry: "Retry" },
        examples: ["Interface IP", "VLAN in PT", "OSPF area 0", "ACL HTTP/HTTPS"],
        exampleTexts: ["How do I configure IP 192.168.1.1 on GigabitEthernet0/0?", "In Packet Tracer, configure VLAN 10", "Configure OSPF area 0 with network 10.0.0.0/8", "Create ACL allowing HTTP/HTTPS"],
        features: { f1t: "Cisco Configurations", f1d: "Generate complete configurations step by step", f2t: "Troubleshooting", f2d: "Diagnose problems with detailed guides", f3t: "Packet Tracer", f3d: "Specific instructions for simulations", f4t: "Instant Responses", f4d: "Answers in seconds, not hours" },
        pricing: { subtitle: "Choose the perfect plan for you", free: "Free", premium: "Premium", recommended: "⭐ RECOMMENDED", currentPlan: "Current Plan", paypalBtn: "💳 Pay with PayPal", paymentInfo: "Secure payment with PayPal<br>After payment, send screenshot to:<br><strong>hola.angelmoreno@gmail.com</strong><br><small>Activate your account in 24h</small>", footer: "💳 Secure payment | 🔄 Cancel anytime | ✉️ 24/7 support" },
        freePlan: ["✅ 5 trial queries", "✅ Public demo access", "❌ Unlimited responses", "❌ Priority support", "❌ Ad-free"],
        premiumPlan: ["✅ Unlimited queries", "✅ Faster responses", "✅ Direct technical support", "✅ Early access to features", "✅ Ad-free"],
        errors: {
            noQuestion: "Please type a question",
            generic: "There was an error. Try again.",
            loading: "The model is starting. Wait 60 seconds and try again."
        }
    },
    fr: {
        nav: { features: "Caractéristiques", pricing: "Tarifs", demo: "Démo", changeLang: "Changer de langue" },
        hero: { title: "Assistant IA Expert pour Réseaux Cisco", subtitle: "93% de précision | 1,191 cas formés | Packet Tracer inclus" },
        demo: { title: "🧪 Essayez TechMind Maintenant", placeholder: "Tapez votre question...", button: "🚀 Demander à TechMind Pro", limitWarning: "démos gratuits restants", demoCount: "démos réalisés", thinking: "🤔 TechMind réfléchit...", retry: "Réessayer" },
        examples: ["IP interface", "VLAN dans PT", "OSPF zone 0", "ACL HTTP/HTTPS"],
        exampleTexts: ["Comment configurer l'IP 192.168.1.1 sur GigabitEthernet0/0?", "Dans Packet Tracer, configurez VLAN 10", "Configurez OSPF zone 0 avec réseau 10.0.0.0/8", "Créez ACL permettant HTTP/HTTPS"],
        features: { f1t: "Configurations Cisco", f1d: "Générez des configurations complètes étape par étape", f2t: "Dépannage", f2d: "Diagnostiquez les problèmes avec des guides détaillés", f3t: "Packet Tracer", f3d: "Instructions spécifiques pour les simulations", f4t: "Réponses Instantanées", f4d: "Réponses en secondes, pas en heures" },
        pricing: { subtitle: "Choisissez le plan parfait pour vous", free: "Gratuit", premium: "Premium", recommended: "⭐ RECOMMANDÉ", currentPlan: "Plan Actuel", paypalBtn: "💳 Payer avec PayPal", paymentInfo: "Paiement sécurisé avec PayPal<br>Après le paiement, envoyez une capture d'écran à:<br><strong>hola.angelmoreno@gmail.com</strong><br><small>Activez votre compte en 24h</small>", footer: "💳 Paiement sécurisé | 🔄 Annuler à tout moment | ✉️ Support 24/7" },
        freePlan: ["✅ 5 requêtes d'essai", "✅ Accès démo public", "❌ Réponses illimitées", "❌ Support prioritaire", "❌ Sans publicité"],
        premiumPlan: ["✅ Requêtes illimitées", "✅ Réponses plus rapides", "✅ Support technique direct", "✅ Accès anticipé aux fonctionnalités", "✅ Sans publicité"],
        errors: {
            noQuestion: "Veuillez taper une question",
            generic: "Il y a eu une erreur. Réessayez.",
            loading: "Le modèle démarre. Attendez 60 secondes et réessayez."
        }
    },
    de: {
        nav: { features: "Funktionen", pricing: "Preise", demo: "Demo", changeLang: "Sprache ändern" },
        hero: { title: "KI-Experte für Cisco-Netzwerke", subtitle: "93% Genauigkeit | 1,191 trainierte Fälle | Packet Tracer enthalten" },
        demo: { title: "🧪 Probieren Sie TechMind Jetzt", placeholder: "Geben Sie Ihre Frage ein...", button: "🚀 Fragen Sie TechMind Pro", limitWarning: "kostenlose Demos übrig", demoCount: "Demos abgeschlossen", thinking: "🤔 TechMind denkt nach...", retry: "Erneut versuchen" },
        examples: ["Interface IP", "VLAN in PT", "OSPF Bereich 0", "ACL HTTP/HTTPS"],
        exampleTexts: ["Wie konfiguriere ich IP 192.168.1.1 auf GigabitEthernet0/0?", "Konfigurieren Sie in Packet Tracer VLAN 10", "Konfigurieren Sie OSPF Bereich 0 mit Netzwerk 10.0.0.0/8", "Erstellen Sie ACL, die HTTP/HTTPS erlaubt"],
        features: { f1t: "Cisco-Konfigurationen", f1d: "Erstellen Sie vollständige Konfigurationen Schritt für Schritt", f2t: "Fehlerbehebung", f2d: "Diagnostizieren Sie Probleme mit detaillierten Anleitungen", f3t: "Packet Tracer", f3d: "Spezifische Anweisungen für Simulationen", f4t: "Sofortige Antworten", f4d: "Antworten in Sekunden, nicht Stunden" },
        pricing: { subtitle: "Wählen Sie den perfekten Plan für Sie", free: "Kostenlos", premium: "Premium", recommended: "⭐ EMPFOHLEN", currentPlan: "Aktueller Plan", paypalBtn: "💳 Mit PayPal bezahlen", paymentInfo: "Sichere Zahlung mit PayPal<br>Nach der Zahlung senden Sie einen Screenshot an:<br><strong>hola.angelmoreno@gmail.com</strong><br><small>Aktivieren Sie Ihr Konto in 24h</small>", footer: "💳 Sichere Zahlung | 🔄 Jederzeit kündbar | ✉️ 24/7 Support" },
        freePlan: ["✅ 5 Test-Anfragen", "✅ Öffentlicher Demo-Zugang", "❌ Unbegrenzte Antworten", "❌ Prioritätssupport", "❌ Werbefrei"],
        premiumPlan: ["✅ Unbegrenzte Anfragen", "✅ Schnellere Antworten", "✅ Direkter technischer Support", "✅ Frühzeitiger Zugang zu Funktionen", "✅ Werbefrei"],
        errors: {
            noQuestion: "Bitte geben Sie eine Frage ein",
            generic: "Es gab einen Fehler. Versuchen Sie es erneut.",
            loading: "Das Modell startet. Warten Sie 60 Sekunden und versuchen Sie es erneut."
        }
    },
    pt: {
        nav: { features: "Características", pricing: "Preços", demo: "Demo", changeLang: "Mudar idioma" },
        hero: { title: "Assistente IA Especialista em Redes Cisco", subtitle: "93% de precisão | 1,191 casos treinados | Packet Tracer incluído" },
        demo: { title: "🧪 Experimente TechMind Agora", placeholder: "Digite sua pergunta...", button: "🚀 Perguntar ao TechMind Pro", limitWarning: "demos grátis restantes", demoCount: "demos realizadas", thinking: "🤔 TechMind está pensando...", retry: "Tentar novamente" },
        examples: ["IP em interface", "VLAN no PT", "OSPF área 0", "ACL HTTP/HTTPS"],
        exampleTexts: ["Como configuro IP 192.168.1.1 em GigabitEthernet0/0?", "No Packet Tracer, configure VLAN 10", "Configure OSPF área 0 com rede 10.0.0.0/8", "Crie ACL que permita HTTP/HTTPS"],
        features: { f1t: "Configurações Cisco", f1d: "Gere configurações completas passo a passo", f2t: "Solução de problemas", f2d: "Diagnostique problemas com guias detalhados", f3t: "Packet Tracer", f3d: "Instruções específicas para simulações", f4t: "Respostas Instantâneas", f4d: "Respostas em segundos, não horas" },
        pricing: { subtitle: "Escolha o plano perfeito para você", free: "Grátis", premium: "Premium", recommended: "⭐ RECOMENDADO", currentPlan: "Plano Atual", paypalBtn: "💳 Pagar com PayPal", paymentInfo: "Pagamento seguro com PayPal<br>Após o pagamento, envie captura de tela para:<br><strong>hola.angelmoreno@gmail.com</strong><br><small>Ative sua conta em 24h</small>", footer: "💳 Pagamento seguro | 🔄 Cancele quando quiser | ✉️ Suporte 24/7" },
        freePlan: ["✅ 5 consultas de teste", "✅ Acesso ao demo público", "❌ Respostas ilimitadas", "❌ Suporte prioritário", "❌ Sem anúncios"],
        premiumPlan: ["✅ Consultas ilimitadas", "✅ Respostas mais rápidas", "✅ Suporte técnico direto", "✅ Acesso antecipado a recursos", "✅ Sem anúncios"],
        errors: {
            noQuestion: "Por favor digite uma pergunta",
            generic: "Houve um erro. Tente novamente.",
            loading: "O modelo está iniciando. Aguarde 60 segundos e tente novamente."
        }
    }
};

const flags = { en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', pt: '🇵🇹' };
