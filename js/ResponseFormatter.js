// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✨ TECHMIND ENHANCED - RESPONSE FORMATTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ResponseFormatter
 * Formatea respuestas parseadas en HTML visualmente atractivo
 */
class ResponseFormatter {
  constructor(language = 'en') {
    this.language = language;
    this.translations = this.getTranslations();
  }

  /**
   * Formatea respuesta completa
   */
  format(parsedData, topologySVG) {
    const container = document.createElement('div');
    container.className = 'techmind-response';
    container.innerHTML = '';

    // Header
    container.appendChild(this.createHeader(parsedData));

    // Topología (si existe)
    if (topologySVG && parsedData.topology.nodes.length > 0) {
      container.appendChild(this.createTopologySection(topologySVG, parsedData));
    }

    // Explicación (si existe)
    if (parsedData.explanation && parsedData.explanation.length > 20) {
      container.appendChild(this.createExplanationSection(parsedData.explanation));
    }

    // Steps de configuración
    if (parsedData.steps && parsedData.steps.length > 0) {
      container.appendChild(this.createStepsSection(parsedData.steps));
    }

    // Acciones (download, etc)
    container.appendChild(this.createActionsSection(parsedData));

    return container;
  }

  /**
   * Crear header de respuesta
   */
  createHeader(parsedData) {
    const header = document.createElement('div');
    header.className = 'response-header';

    const title = document.createElement('h4');
    title.className = 'response-title';
    title.innerHTML = `✅ ${this.translations.responseTitle}`;
    
    const configType = document.createElement('span');
    configType.className = 'config-type-badge';
    configType.textContent = this.getConfigTypeName(parsedData.type);
    configType.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
    `;
    
    header.appendChild(title);
    header.appendChild(configType);

    return header;
  }

  /**
   * Crear sección de topología
   */
  createTopologySection(topologySVG, parsedData) {
    const section = document.createElement('div');
    section.className = 'topology-section';

    const title = document.createElement('h4');
    title.innerHTML = `🗺️ ${this.translations.topologyTitle}`;
    section.appendChild(title);

    // Info rápida
    if (parsedData.topology.protocols.length > 0 || 
        parsedData.topology.networks.length > 0) {
      const info = document.createElement('div');
      info.className = 'topology-info';
      info.style.cssText = `
        display: flex;
        gap: 15px;
        margin: 10px 0;
        font-size: 0.9em;
      `;

      if (parsedData.topology.protocols.length > 0) {
        const protocols = document.createElement('span');
        protocols.innerHTML = `📡 <strong>Protocolos:</strong> ${parsedData.topology.protocols.join(', ')}`;
        info.appendChild(protocols);
      }

      if (parsedData.topology.networks.length > 0) {
        const networks = document.createElement('span');
        networks.innerHTML = `🌐 <strong>Redes:</strong> ${parsedData.topology.networks.slice(0, 2).join(', ')}`;
        info.appendChild(networks);
      }

      section.appendChild(info);
    }

    // SVG diagram
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'topology-diagram-container';
    diagramContainer.appendChild(topologySVG);
    section.appendChild(diagramContainer);

    return section;
  }

  /**
   * Crear sección de explicación
   */
  createExplanationSection(explanation) {
    const section = document.createElement('div');
    section.className = 'explanation-section';

    const icon = document.createElement('span');
    icon.textContent = '💡';
    icon.style.marginRight = '8px';

    const text = document.createElement('p');
    text.className = 'explanation-text';
    text.textContent = explanation;

    section.appendChild(icon);
    section.appendChild(text);

    return section;
  }

  /**
   * Crear sección de steps
   */
  createStepsSection(steps) {
    const section = document.createElement('div');
    section.className = 'steps-section';

    const title = document.createElement('h4');
    title.innerHTML = `📋 ${this.translations.stepsTitle}`;
    section.appendChild(title);

    steps.forEach((step, index) => {
      section.appendChild(this.createStepItem(step, index));
    });

    return section;
  }

  /**
   * Crear item de step individual
   */
  createStepItem(step, index) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.dataset.step = index + 1;

    // Header del step (clickeable para expandir/colapsar)
    const header = document.createElement('div');
    header.className = 'step-header';

    const number = document.createElement('span');
    number.className = 'step-number';
    number.textContent = index + 1;

    const title = document.createElement('span');
    title.className = 'step-title';
    title.textContent = step.title;

    const toggle = document.createElement('button');
    toggle.className = 'step-toggle';
    toggle.textContent = '▼';
    toggle.setAttribute('aria-label', 'Toggle step');

    header.appendChild(number);
    header.appendChild(title);
    header.appendChild(toggle);

    // Content del step (comandos)
    const content = document.createElement('div');
    content.className = 'step-content';
    
    // Inicialmente expandido el primer step
    if (index === 0) {
      content.classList.add('expanded');
      toggle.classList.add('expanded');
    }

    // Descripción (si existe)
    if (step.description && step.description.trim()) {
      const desc = document.createElement('p');
      desc.className = 'step-description';
      desc.textContent = step.description.trim();
      content.appendChild(desc);
    }

    // Comandos
    if (step.commands && step.commands.length > 0) {
      const commandBlock = this.createCommandBlock(step.commands);
      content.appendChild(commandBlock);
    }

    // Event listener para toggle
    header.addEventListener('click', () => {
      content.classList.toggle('expanded');
      toggle.classList.toggle('expanded');
    });

    stepDiv.appendChild(header);
    stepDiv.appendChild(content);

    return stepDiv;
  }

  /**
   * Crear bloque de comandos con syntax highlighting
   */
  createCommandBlock(commands) {
    const block = document.createElement('div');
    block.className = 'command-block';

    // Header del command block
    const header = document.createElement('div');
    header.className = 'command-header';

    const terminal = document.createElement('span');
    terminal.textContent = 'Terminal';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.addEventListener('click', () => this.copyCommands(commands, copyBtn));

    header.appendChild(terminal);
    header.appendChild(copyBtn);

    // Código
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.innerHTML = this.applySyntaxHighlighting(commands.join('\n'));
    pre.appendChild(code);

    block.appendChild(header);
    block.appendChild(pre);

    return block;
  }

  /**
   * Aplica syntax highlighting a comandos Cisco
   */
  applySyntaxHighlighting(text) {
    // Keywords principales
    const keywords = [
      'enable', 'configure', 'terminal', 'router', 'interface',
      'network', 'area', 'ip', 'no', 'shutdown', 'exit', 'end'
    ];

    // Números (IPs, máscaras, etc)
    text = text.replace(/\b(\d+\.\d+\.\d+\.\d+)\b/g, '<span class="ip-address">$1</span>');
    text = text.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

    // Keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      text = text.replace(regex, '<span class="keyword">$1</span>');
    });

    // Comandos principales (primera palabra de línea)
    text = text.replace(/^([a-z]+)/gim, '<span class="command-name">$1</span>');

    return text;
  }

  /**
   * Copiar comandos al clipboard
   */
  async copyCommands(commands, button) {
    const text = commands.join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Feedback visual
      const originalHTML = button.innerHTML;
      button.innerHTML = '✅ Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      button.innerHTML = '❌ Failed';
      setTimeout(() => {
        button.innerHTML = '📋 Copy';
      }, 2000);
    }
  }

  /**
   * Crear sección de acciones
   */
  createActionsSection(parsedData) {
    const section = document.createElement('div');
    section.className = 'actions-section';

    // Download .txt button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-txt';
    downloadBtn.innerHTML = `💾 ${this.translations.downloadBtn}`;
    downloadBtn.addEventListener('click', () => this.exportAsText(parsedData));

    // PT Ready button (para Fase 2)
    const ptBtn = document.createElement('button');
    ptBtn.className = 'pt-ready';
    ptBtn.innerHTML = `📦 ${this.translations.ptBtn}`;
    ptBtn.addEventListener('click', () => this.exportForPacketTracer(parsedData));

    // Ask more button
    const askMoreBtn = document.createElement('button');
    askMoreBtn.className = 'ask-more';
    askMoreBtn.innerHTML = `🔄 ${this.translations.askMoreBtn}`;
    askMoreBtn.addEventListener('click', () => {
      document.getElementById('demoInput').value = '';
      document.getElementById('demoInput').focus();
      section.parentElement.style.display = 'none';
    });

    section.appendChild(downloadBtn);
    section.appendChild(ptBtn);
    section.appendChild(askMoreBtn);

    return section;
  }

  /**
   * Exportar como texto
   */
  exportAsText(parsedData) {
    const date = new Date().toLocaleDateString();
    let output = '';
    
    output += '━'.repeat(50) + '\n';
    output += 'TechMind Pro - Configuration Export\n';
    output += `Generated: ${date}\n`;
    output += `Type: ${this.getConfigTypeName(parsedData.type)}\n`;
    output += '━'.repeat(50) + '\n\n';
    
    if (parsedData.topology.protocols.length > 0) {
      output += `PROTOCOLS: ${parsedData.topology.protocols.join(', ')}\n`;
    }
    
    if (parsedData.topology.nodes.length > 0) {
      output += `DEVICES: ${parsedData.topology.nodes.join(', ')}\n`;
    }
    
    if (parsedData.topology.networks.length > 0) {
      output += `NETWORKS: ${parsedData.topology.networks.join(', ')}\n`;
    }
    
    output += '\n';
    
    parsedData.steps.forEach((step, i) => {
      output += `STEP ${i+1}: ${step.title}\n`;
      output += '─'.repeat(40) + '\n';
      step.commands.forEach(cmd => {
        output += cmd + '\n';
      });
      output += '\n';
    });
    
    output += '━'.repeat(50) + '\n';
    output += 'Generated by TechMind Pro\n';
    output += 'https://techmind-landing.vercel.app\n';
    output += '━'.repeat(50);
    
    // Crear y descargar
    const blob = new Blob([output], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techmind-config-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Configuration exported as .txt');
  }

  /**
   * Exportar para Packet Tracer (Fase 2 - placeholder)
   */
  exportForPacketTracer(parsedData) {
    alert(this.translations.ptComingSoon);
    // TODO: Implementar en Fase 2
    // Generará instrucciones o archivo .pkt
  }

  /**
   * Obtener nombre legible del tipo de configuración
   */
  getConfigTypeName(type) {
    const names = {
      ospf: 'OSPF Routing',
      eigrp: 'EIGRP Routing',
      bgp: 'BGP Routing',
      vlan: 'VLAN Configuration',
      acl: 'Access Control List',
      nat: 'NAT Configuration',
      dhcp: 'DHCP Server',
      static_routing: 'Static Routing',
      interface: 'Interface Configuration',
      multi_config: 'Multiple Configurations',
      general: 'General Configuration'
    };
    return names[type] || 'Configuration';
  }

  /**
   * Traducciones por idioma
   */
  getTranslations() {
    const translations = {
      en: {
        responseTitle: 'TechMind Pro Response',
        topologyTitle: 'Network Topology',
        stepsTitle: 'Configuration Steps',
        downloadBtn: 'Download .txt',
        ptBtn: 'Packet Tracer',
        askMoreBtn: 'Another question',
        ptComingSoon: '📦 Packet Tracer export coming in Phase 2!\n\nFor now, you can download the .txt file and copy-paste into PT.'
      },
      es: {
        responseTitle: 'Respuesta de TechMind Pro',
        topologyTitle: 'Topología de Red',
        stepsTitle: 'Pasos de Configuración',
        downloadBtn: 'Descargar .txt',
        ptBtn: 'Packet Tracer',
        askMoreBtn: 'Otra pregunta',
        ptComingSoon: '📦 ¡Export a Packet Tracer viene en Fase 2!\n\nPor ahora, puedes descargar el .txt y copiarlo en PT.'
      },
      fr: {
        responseTitle: 'Réponse de TechMind Pro',
        topologyTitle: 'Topologie Réseau',
        stepsTitle: 'Étapes de Configuration',
        downloadBtn: 'Télécharger .txt',
        ptBtn: 'Packet Tracer',
        askMoreBtn: 'Autre question',
        ptComingSoon: '📦 Export vers Packet Tracer arrive en Phase 2!\n\nPour l\'instant, téléchargez le .txt et copiez dans PT.'
      },
      de: {
        responseTitle: 'TechMind Pro Antwort',
        topologyTitle: 'Netzwerktopologie',
        stepsTitle: 'Konfigurationsschritte',
        downloadBtn: '.txt herunterladen',
        ptBtn: 'Packet Tracer',
        askMoreBtn: 'Andere Frage',
        ptComingSoon: '📦 Packet Tracer Export kommt in Phase 2!\n\nFür jetzt, laden Sie die .txt herunter und kopieren Sie in PT.'
      },
      pt: {
        responseTitle: 'Resposta do TechMind Pro',
        topologyTitle: 'Topologia de Rede',
        stepsTitle: 'Passos de Configuração',
        downloadBtn: 'Baixar .txt',
        ptBtn: 'Packet Tracer',
        askMoreBtn: 'Outra pergunta',
        ptComingSoon: '📦 Export para Packet Tracer vem na Fase 2!\n\nPor enquanto, baixe o .txt e copie no PT.'
      }
    };

    return translations[this.language] || translations['en'];
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseFormatter;
}
