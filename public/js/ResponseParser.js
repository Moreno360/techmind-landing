// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 TECHMIND ENHANCED - RESPONSE PARSER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ResponseParser
 * Analiza respuestas de OpenAI y extrae metadatos estructurados
 */
class ResponseParser {
  constructor() {
    // Patrones de detección de dispositivos
    this.DEVICE_PATTERNS = {
      router: /\b(router|R\d+|R-\d+)\b/gi,
      switch: /\b(switch|SW\d+|SW-\d+)\b/gi,
      pc: /\b(PC\d+|host\d*|computer)\b/gi,
      server: /\b(server\d*|srv\d+)\b/gi,
      firewall: /\b(firewall|FW\d*)\b/gi,
      cloud: /\b(internet|cloud|ISP)\b/gi
    };

    // Patrones de detección de protocolos/configuraciones
    this.CONFIG_PATTERNS = {
      ospf: {
        keywords: ['ospf', 'area'],
        weight: 2,
        commands: ['router ospf', 'network', 'area']
      },
      eigrp: {
        keywords: ['eigrp'],
        weight: 2,
        commands: ['router eigrp', 'network']
      },
      bgp: {
        keywords: ['bgp', 'autonomous'],
        weight: 2,
        commands: ['router bgp', 'neighbor']
      },
      vlan: {
        keywords: ['vlan', 'switchport'],
        weight: 2,
        commands: ['vlan', 'switchport mode', 'switchport access']
      },
      acl: {
        keywords: ['access-list', 'acl', 'permit', 'deny'],
        weight: 2,
        commands: ['access-list', 'ip access-group']
      },
      nat: {
        keywords: ['nat', 'overload', 'pool'],
        weight: 2,
        commands: ['ip nat', 'access-list']
      },
      dhcp: {
        keywords: ['dhcp', 'pool', 'lease'],
        weight: 2,
        commands: ['ip dhcp pool', 'network', 'default-router']
      },
      static_routing: {
        keywords: ['ip route', 'static'],
        weight: 1,
        commands: ['ip route']
      },
      interface: {
        keywords: ['interface', 'ip address'],
        weight: 1,
        commands: ['interface', 'ip address']
      }
    };

    // Patrones de comandos Cisco IOS
    this.COMMAND_PATTERN = /^[a-z][a-z0-9\s\-\/\.\:]+$/gmi;

    // Patrones de direcciones IP
    this.IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/g;

    // Patrones de steps
    this.STEP_PATTERNS = [
      /^step\s+\d+[:\.]?\s*(.*?)$/gmi,
      /^paso\s+\d+[:\.]?\s*(.*?)$/gmi,
      /^\d+[\.)\-]\s+(.*?)$/gm,
      /^[•▪▫]\s+(.*?)$/gm
    ];
  }

  /**
   * Método principal: parsea la respuesta completa
   */
  parse(rawText) {
    console.log('🔍 Parsing response...', {length: rawText.length});

    const cleaned = this.cleanText(rawText);
    const type = this.detectConfigType(cleaned);
    const devices = this.extractDevices(cleaned);
    const commands = this.extractCommands(cleaned);
    const steps = this.detectSteps(cleaned, commands);
    const topology = this.buildTopology(devices, type, cleaned);
    const explanation = this.extractExplanation(cleaned, commands);

    const result = {
      type,
      devices,
      topology,
      steps,
      commands,
      explanation,
      rawText: cleaned
    };

    console.log('✅ Parsing complete:', result);
    return result;
  }

  /**
   * Limpia el texto de formato markdown/especial
   */
  cleanText(text) {
    return text
      .replace(/```[\s\S]*?```/g, match => {
        // Extraer contenido de bloques de código
        return match.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
      })
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/\[\/INST\]/g, '')      // Mistral tokens
      .trim();
  }

  /**
   * Detecta el tipo de configuración predominante
   */
  detectConfigType(text) {
    const scores = {};
    const lowerText = text.toLowerCase();

    // Calcular score para cada tipo
    for (const [type, config] of Object.entries(this.CONFIG_PATTERNS)) {
      let score = 0;

      // Score por keywords
      config.keywords.forEach(keyword => {
        const matches = (lowerText.match(new RegExp(keyword, 'gi')) || []).length;
        score += matches * config.weight;
      });

      // Score por comandos
      config.commands.forEach(cmd => {
        if (lowerText.includes(cmd.toLowerCase())) {
          score += 3;
        }
      });

      scores[type] = score;
    }

    // Retornar el tipo con mayor score
    const sortedTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    console.log('📊 Config type scores:', scores);

    if (sortedTypes.length === 0) {
      return 'general';
    }

    // Si hay múltiples tipos con score alto, es configuración múltiple
    if (sortedTypes.length > 1 && sortedTypes[1][1] >= sortedTypes[0][1] * 0.5) {
      return 'multi_config';
    }

    return sortedTypes[0][0];
  }

  /**
   * Extrae dispositivos mencionados en el texto
   */
  extractDevices(text) {
    const devices = [];
    const foundNames = new Set();

    for (const [type, pattern] of Object.entries(this.DEVICE_PATTERNS)) {
      const matches = text.matchAll(pattern);
      
      for (const match of matches) {
        const name = match[0].trim();
        
        // Evitar duplicados
        if (!foundNames.has(name.toLowerCase())) {
          devices.push({
            type,
            name,
            implicit: false
          });
          foundNames.add(name.toLowerCase());
        }
      }
    }

    // Si no se encontraron dispositivos explícitos, inferir
    if (devices.length === 0) {
      const inferredType = this.inferDeviceType(text);
      if (inferredType) {
        devices.push({
          type: inferredType,
          name: this.getDefaultName(inferredType),
          implicit: true
        });
      }
    }

    console.log('🖥️ Devices found:', devices);
    return devices;
  }

  /**
   * Infiere tipo de dispositivo basado en comandos
   */
  inferDeviceType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('router ospf') || 
        lowerText.includes('router eigrp') ||
        lowerText.includes('router bgp')) {
      return 'router';
    }
    
    if (lowerText.includes('vlan') || 
        lowerText.includes('switchport')) {
      return 'switch';
    }
    
    if (lowerText.includes('interface')) {
      return 'router'; // Por defecto
    }
    
    return null;
  }

  /**
   * Nombre por defecto para dispositivos implícitos
   */
  getDefaultName(type) {
    const defaults = {
      router: 'R1',
      switch: 'SW1',
      pc: 'PC1',
      server: 'Server0',
      firewall: 'FW1',
      cloud: 'Internet'
    };
    return defaults[type] || 'Device1';
  }

  /**
   * Extrae comandos Cisco IOS del texto
   */
  extractCommands(text) {
    const commands = [];
    const lines = text.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip líneas vacías o comentarios
      if (!line || line.startsWith('#') || line.startsWith('//')) {
        continue;
      }
      
      // Detectar si es un comando Cisco
      if (this.isCiscoCommand(line)) {
        commands.push(line);
      }
    }

    console.log('💻 Commands extracted:', commands.length);
    return commands;
  }

  /**
   * Verifica si una línea es un comando Cisco
   */
  isCiscoCommand(line) {
    // Lista de comandos comunes de Cisco IOS
    const ciscoKeywords = [
      'enable', 'configure', 'terminal', 'interface', 'ip', 'router',
      'network', 'area', 'hostname', 'vlan', 'switchport', 'access-list',
      'permit', 'deny', 'shutdown', 'no shutdown', 'exit', 'end',
      'show', 'debug', 'copy', 'write', 'erase', 'reload'
    ];

    const lowerLine = line.toLowerCase();
    
    // Verificar si empieza con un keyword conocido
    return ciscoKeywords.some(keyword => lowerLine.startsWith(keyword));
  }

  /**
   * Detecta y agrupa comandos en steps
   */
  detectSteps(text, commands) {
    const steps = [];
    let currentStep = null;
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Intentar detectar marcador de step
      const stepMatch = this.matchStepPattern(line);
      
      if (stepMatch) {
        // Guardar step anterior si existe
        if (currentStep && currentStep.commands.length > 0) {
          steps.push(currentStep);
        }
        
        // Crear nuevo step
        currentStep = {
          title: stepMatch.title || `Paso ${steps.length + 1}`,
          commands: [],
          description: ''
        };
      } 
      // Si estamos dentro de un step, agregar comandos
      else if (currentStep && this.isCiscoCommand(line)) {
        currentStep.commands.push(line);
      }
      // Descripción del step
      else if (currentStep && line && !this.isCiscoCommand(line)) {
        currentStep.description += line + ' ';
      }
    }
    
    // Guardar último step
    if (currentStep && currentStep.commands.length > 0) {
      steps.push(currentStep);
    }

    // Si no se detectaron steps explícitos, agrupar inteligentemente
    if (steps.length === 0 && commands.length > 0) {
      return this.groupCommandsIntoSteps(commands);
    }

    console.log('📝 Steps detected:', steps.length);
    return steps;
  }

  /**
   * Intenta matchear patrones de step
   */
  matchStepPattern(line) {
    for (const pattern of this.STEP_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        return {
          title: match[1] ? match[1].trim() : null,
          match: match[0]
        };
      }
    }
    return null;
  }

  /**
   * Agrupa comandos en steps lógicos
   */
  groupCommandsIntoSteps(commands) {
    const steps = [];
    let currentGroup = [];
    let groupTitle = '';

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const lowerCmd = cmd.toLowerCase();

      // Detectar inicio de nuevo grupo
      if (lowerCmd === 'enable') {
        if (currentGroup.length > 0) {
          steps.push({
            title: groupTitle || `Configuración ${steps.length + 1}`,
            commands: currentGroup,
            description: ''
          });
        }
        currentGroup = [cmd];
        groupTitle = 'Acceso privilegiado';
      }
      else if (lowerCmd === 'configure terminal') {
        if (currentGroup.length > 0 && currentGroup[0].toLowerCase() !== 'enable') {
          steps.push({
            title: groupTitle || `Configuración ${steps.length + 1}`,
            commands: currentGroup,
            description: ''
          });
          currentGroup = [];
        }
        currentGroup.push(cmd);
        groupTitle = 'Modo de configuración';
      }
      else if (lowerCmd.startsWith('router ')) {
        if (currentGroup.length > 0) {
          steps.push({
            title: groupTitle || `Configuración ${steps.length + 1}`,
            commands: currentGroup,
            description: ''
          });
        }
        currentGroup = [cmd];
        groupTitle = 'Configuración de routing';
      }
      else if (lowerCmd.startsWith('interface ')) {
        if (currentGroup.length > 0) {
          steps.push({
            title: groupTitle || `Configuración ${steps.length + 1}`,
            commands: currentGroup,
            description: ''
          });
        }
        currentGroup = [cmd];
        groupTitle = 'Configuración de interfaz';
      }
      else if (lowerCmd.startsWith('vlan ')) {
        if (currentGroup.length > 0) {
          steps.push({
            title: groupTitle || `Configuración ${steps.length + 1}`,
            commands: currentGroup,
            description: ''
          });
        }
        currentGroup = [cmd];
        groupTitle = 'Configuración de VLAN';
      }
      else {
        currentGroup.push(cmd);
      }
    }

    // Agregar último grupo
    if (currentGroup.length > 0) {
      steps.push({
        title: groupTitle || `Configuración ${steps.length + 1}`,
        commands: currentGroup,
        description: ''
      });
    }

    return steps;
  }

  /**
   * Construye objeto de topología
   */
  buildTopology(devices, type, text) {
    const topology = {
      nodes: devices.map(d => d.name),
      links: [],
      protocols: this.extractProtocols(text),
      networks: this.extractNetworks(text),
      layout: this.determineLayout(devices, type)
    };

    // Inferir conexiones básicas
    if (devices.length === 2) {
      topology.links.push({
        from: devices[0].name,
        to: devices[1].name,
        type: 'direct'
      });
    } else if (devices.length > 2) {
      // Topología con dispositivo central (switch/router)
      const centralDevice = devices.find(d => 
        d.type === 'switch' || d.type === 'router'
      );
      
      if (centralDevice) {
        devices.forEach(device => {
          if (device.name !== centralDevice.name) {
            topology.links.push({
              from: centralDevice.name,
              to: device.name,
              type: 'direct'
            });
          }
        });
      }
    }

    console.log('🗺️ Topology built:', topology);
    return topology;
  }

  /**
   * Extrae protocolos mencionados
   */
  extractProtocols(text) {
    const protocols = [];
    const lowerText = text.toLowerCase();

    const protocolKeywords = {
      'OSPF': ['ospf'],
      'EIGRP': ['eigrp'],
      'BGP': ['bgp'],
      'RIP': ['rip'],
      'VLAN': ['vlan'],
      'STP': ['spanning-tree', 'stp'],
      'VPN': ['vpn', 'ipsec', 'gre'],
      'NAT': ['nat'],
      'DHCP': ['dhcp']
    };

    for (const [protocol, keywords] of Object.entries(protocolKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        protocols.push(protocol);
      }
    }

    return [...new Set(protocols)]; // Eliminar duplicados
  }

  /**
   * Extrae redes/subredes mencionadas
   */
  extractNetworks(text) {
    const networks = [];
    const matches = text.matchAll(this.IP_PATTERN);
    
    for (const match of matches) {
      networks.push(match[0]);
    }
    
    return [...new Set(networks)];
  }

  /**
   * Determina el layout apropiado para la topología
   */
  determineLayout(devices, type) {
    const count = devices.length;
    
    if (count === 0) return 'none';
    if (count === 1) return 'single';
    if (count === 2) return 'linear';
    
    // Basado en tipos de dispositivos
    const hasSwitch = devices.some(d => d.type === 'switch');
    const hasRouter = devices.some(d => d.type === 'router');
    const pcsCount = devices.filter(d => d.type === 'pc').length;
    
    if (hasSwitch && pcsCount > 2) return 'star';
    if (hasRouter && hasSwitch) return 'hierarchical';
    if (count > 4) return 'mesh';
    
    return 'grid';
  }

  /**
   * Extrae texto explicativo (no comandos)
   */
  extractExplanation(text, commands) {
    let explanation = text;
    
    // Remover bloques de comandos
    commands.forEach(cmd => {
      explanation = explanation.replace(cmd, '');
    });
    
    // Limpiar y retornar
    return explanation
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ')
      .substring(0, 500); // Máximo 500 caracteres
  }
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseParser;
}
