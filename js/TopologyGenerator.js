// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗺️ TECHMIND ENHANCED - TOPOLOGY GENERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * TopologyGenerator
 * Genera diagramas SVG automáticos de topologías de red
 */
class TopologyGenerator {
  constructor() {
    this.SVG_WIDTH = 800;
    this.SVG_HEIGHT = 400;
    this.DEVICE_RADIUS = 30;
    this.MARGIN = 60;
    
    // Iconos SVG para cada tipo de dispositivo
    this.DEVICE_ICONS = {
      router: this.createRouterIcon(),
      switch: this.createSwitchIcon(),
      pc: this.createPCIcon(),
      server: this.createServerIcon(),
      firewall: this.createFirewallIcon(),
      cloud: this.createCloudIcon()
    };
  }

  /**
   * Genera SVG completo de la topología
   */
  generate(topology) {
    console.log('🎨 Generating topology SVG...', topology);

    if (!topology.nodes || topology.nodes.length === 0) {
      return this.createEmptyTopology();
    }

    // Calcular posiciones de dispositivos
    const positions = this.calculatePositions(
      topology.nodes,
      topology.layout || 'auto'
    );

    // Crear elemento SVG
    const svg = this.createSVGElement('svg', {
      width: '100%',
      height: this.SVG_HEIGHT,
      viewBox: `0 0 ${this.SVG_WIDTH} ${this.SVG_HEIGHT}`,
      class: 'topology-diagram'
    });

    // Agregar definiciones (gradientes, filtros, etc)
    svg.appendChild(this.createDefs());

    // Dibujar fondo con grid
    svg.appendChild(this.createBackground());

    // Dibujar conexiones primero (layer inferior)
    topology.links.forEach(link => {
      const fromPos = positions[link.from];
      const toPos = positions[link.to];
      if (fromPos && toPos) {
        svg.appendChild(this.createConnection(fromPos, toPos, link));
      }
    });

    // Dibujar protocolos/redes (labels)
    if (topology.protocols.length > 0) {
      svg.appendChild(this.createProtocolLabel(topology.protocols));
    }

    if (topology.networks.length > 0) {
      svg.appendChild(this.createNetworkLabel(topology.networks));
    }

    // Dibujar dispositivos encima
    topology.nodes.forEach(nodeName => {
      const pos = positions[nodeName];
      if (pos) {
        const device = this.findDeviceByName(nodeName, topology);
        svg.appendChild(this.createDevice(pos, device));
      }
    });

    console.log('✅ Topology SVG generated');
    return svg;
  }

  /**
   * Calcula posiciones para cada dispositivo
   */
  calculatePositions(nodes, layout) {
    const positions = {};
    const count = nodes.length;

    switch (layout) {
      case 'single':
        positions[nodes[0]] = {
          x: this.SVG_WIDTH / 2,
          y: this.SVG_HEIGHT / 2
        };
        break;

      case 'linear':
        this.calculateLinearLayout(nodes, positions);
        break;

      case 'star':
        this.calculateStarLayout(nodes, positions);
        break;

      case 'hierarchical':
        this.calculateHierarchicalLayout(nodes, positions);
        break;

      case 'mesh':
        this.calculateMeshLayout(nodes, positions);
        break;

      case 'grid':
      default:
        this.calculateGridLayout(nodes, positions);
        break;
    }

    return positions;
  }

  /**
   * Layout lineal (2 dispositivos)
   */
  calculateLinearLayout(nodes, positions) {
    const spacing = this.SVG_WIDTH / 3;
    const centerY = this.SVG_HEIGHT / 2;

    nodes.forEach((node, i) => {
      positions[node] = {
        x: spacing * (i + 1),
        y: centerY
      };
    });
  }

  /**
   * Layout estrella (switch/router central)
   */
  calculateStarLayout(nodes, positions) {
    const centerX = this.SVG_WIDTH / 2;
    const centerY = this.SVG_HEIGHT / 2;
    const radius = Math.min(this.SVG_WIDTH, this.SVG_HEIGHT) / 3;

    // Primer nodo al centro (asumimos es el switch/router)
    positions[nodes[0]] = { x: centerX, y: centerY };

    // Resto en círculo alrededor
    const angleStep = (2 * Math.PI) / (nodes.length - 1);
    for (let i = 1; i < nodes.length; i++) {
      const angle = angleStep * (i - 1) - Math.PI / 2; // Empezar arriba
      positions[nodes[i]] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }
  }

  /**
   * Layout jerárquico (top-down)
   */
  calculateHierarchicalLayout(nodes, positions) {
    const levels = Math.ceil(Math.sqrt(nodes.length));
    const spacing = this.SVG_WIDTH / (levels + 1);
    const verticalSpacing = this.SVG_HEIGHT / (levels + 1);

    nodes.forEach((node, i) => {
      const level = Math.floor(i / levels);
      const posInLevel = i % levels;
      
      positions[node] = {
        x: spacing * (posInLevel + 1),
        y: verticalSpacing * (level + 1)
      };
    });
  }

  /**
   * Layout mesh (múltiples conexiones)
   */
  calculateMeshLayout(nodes, positions) {
    const centerX = this.SVG_WIDTH / 2;
    const centerY = this.SVG_HEIGHT / 2;
    const radiusX = (this.SVG_WIDTH - this.MARGIN * 2) / 2;
    const radiusY = (this.SVG_HEIGHT - this.MARGIN * 2) / 2;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      positions[node] = {
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle)
      };
    });
  }

  /**
   * Layout grid
   */
  calculateGridLayout(nodes, positions) {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const cellWidth = (this.SVG_WIDTH - this.MARGIN * 2) / cols;
    const cellHeight = (this.SVG_HEIGHT - this.MARGIN * 2) / rows;

    nodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      positions[node] = {
        x: this.MARGIN + cellWidth * col + cellWidth / 2,
        y: this.MARGIN + cellHeight * row + cellHeight / 2
      };
    });
  }

  /**
   * Crea conexión entre dos dispositivos
   */
  createConnection(fromPos, toPos, link) {
    const g = this.createSVGElement('g', {
      class: 'topology-link',
      'data-from': link.from,
      'data-to': link.to
    });

    // Línea de conexión
    const line = this.createSVGElement('line', {
      x1: fromPos.x,
      y1: fromPos.y,
      x2: toPos.x,
      y2: toPos.y,
      stroke: '#94a3b8',
      'stroke-width': '3',
      'stroke-dasharray': link.type === 'vpn' ? '10,5' : 'none'
    });
    g.appendChild(line);

    // Label del link (opcional)
    if (link.label) {
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      
      const label = this.createSVGElement('text', {
        x: midX,
        y: midY - 5,
        'text-anchor': 'middle',
        'font-size': '12',
        'font-weight': '600',
        fill: '#475569',
        class: 'link-label'
      });
      label.textContent = link.label;
      g.appendChild(label);
    }

    return g;
  }

  /**
   * Crea dispositivo en la posición dada
   */
  createDevice(position, device) {
    const g = this.createSVGElement('g', {
      class: `device-node device-${device.type}`,
      'data-device': device.name,
      transform: `translate(${position.x}, ${position.y})`,
      style: 'cursor: pointer;'
    });

    // Círculo de fondo
    const circle = this.createSVGElement('circle', {
      r: this.DEVICE_RADIUS,
      fill: 'white',
      stroke: this.getDeviceColor(device.type),
      'stroke-width': '3',
      filter: 'url(#shadow)'
    });
    g.appendChild(circle);

    // Icono del dispositivo
    const icon = this.DEVICE_ICONS[device.type] || this.DEVICE_ICONS.router;
    const iconClone = icon.cloneNode(true);
    g.appendChild(iconClone);

    // Label con nombre
    const label = this.createSVGElement('text', {
      y: this.DEVICE_RADIUS + 20,
      'text-anchor': 'middle',
      'font-size': '14',
      'font-weight': '600',
      fill: '#1e293b',
      class: 'device-label'
    });
    label.textContent = device.name;
    g.appendChild(label);

    // Hover effect
    g.addEventListener('mouseenter', () => {
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('filter', 'url(#shadowHover)');
    });
    g.addEventListener('mouseleave', () => {
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('filter', 'url(#shadow)');
    });

    return g;
  }

  /**
   * Crear definiciones SVG (filtros, gradientes)
   */
  createDefs() {
    const defs = this.createSVGElement('defs');

    // Sombra normal
    const shadow = this.createSVGElement('filter', {
      id: 'shadow',
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%'
    });
    const feGaussianBlur = this.createSVGElement('feGaussianBlur', {
      in: 'SourceAlpha',
      stdDeviation: '3'
    });
    const feOffset = this.createSVGElement('feOffset', {
      dx: '0',
      dy: '2',
      result: 'offsetblur'
    });
    const feMerge = this.createSVGElement('feMerge');
    feMerge.innerHTML = '<feMergeNode/><feMergeNode in="SourceGraphic"/>';
    shadow.appendChild(feGaussianBlur);
    shadow.appendChild(feOffset);
    shadow.appendChild(feMerge);
    defs.appendChild(shadow);

    // Sombra hover
    const shadowHover = shadow.cloneNode(true);
    shadowHover.setAttribute('id', 'shadowHover');
    shadowHover.querySelector('feGaussianBlur').setAttribute('stdDeviation', '5');
    defs.appendChild(shadowHover);

    return defs;
  }

  /**
   * Crear fondo con grid opcional
   */
  createBackground() {
    const bg = this.createSVGElement('rect', {
      width: this.SVG_WIDTH,
      height: this.SVG_HEIGHT,
      fill: '#f8fafc',
      rx: '10'
    });
    return bg;
  }

  /**
   * Label de protocolos
   */
  createProtocolLabel(protocols) {
    const g = this.createSVGElement('g', { class: 'protocol-labels' });
    
    const bg = this.createSVGElement('rect', {
      x: 10,
      y: 10,
      width: 150,
      height: 30,
      fill: 'white',
      rx: '5',
      stroke: '#667eea',
      'stroke-width': '2'
    });
    g.appendChild(bg);

    const text = this.createSVGElement('text', {
      x: 20,
      y: 30,
      'font-size': '13',
      'font-weight': '600',
      fill: '#667eea'
    });
    text.textContent = `📡 ${protocols.join(', ')}`;
    g.appendChild(text);

    return g;
  }

  /**
   * Label de redes
   */
  createNetworkLabel(networks) {
    const g = this.createSVGElement('g', { class: 'network-labels' });
    
    const firstNetwork = networks[0];
    const width = 180;
    
    const bg = this.createSVGElement('rect', {
      x: this.SVG_WIDTH - width - 10,
      y: 10,
      width: width,
      height: 30,
      fill: 'white',
      rx: '5',
      stroke: '#10b981',
      'stroke-width': '2'
    });
    g.appendChild(bg);

    const text = this.createSVGElement('text', {
      x: this.SVG_WIDTH - width,
      y: 30,
      'font-size': '13',
      'font-weight': '600',
      fill: '#10b981'
    });
    text.textContent = `🌐 ${firstNetwork}`;
    g.appendChild(text);

    return g;
  }

  /**
   * Topología vacía (placeholder)
   */
  createEmptyTopology() {
    const svg = this.createSVGElement('svg', {
      width: '100%',
      height: '200',
      viewBox: '0 0 800 200',
      class: 'topology-diagram empty'
    });

    const rect = this.createSVGElement('rect', {
      width: '800',
      height: '200',
      fill: '#f1f5f9',
      rx: '10'
    });
    svg.appendChild(rect);

    const text = this.createSVGElement('text', {
      x: '400',
      y: '100',
      'text-anchor': 'middle',
      'font-size': '16',
      fill: '#94a3b8'
    });
    text.textContent = '🗺️ No se detectó topología específica';
    svg.appendChild(text);

    return svg;
  }

  /**
   * Encuentra dispositivo por nombre
   */
  findDeviceByName(name, topology) {
    // Si topology tiene array de devices completo
    if (topology.devices) {
      return topology.devices.find(d => d.name === name) || 
             { name, type: 'router', implicit: true };
    }
    
    // Inferir tipo por nombre
    const lowerName = name.toLowerCase();
    let type = 'router';
    if (lowerName.includes('sw')) type = 'switch';
    else if (lowerName.includes('pc')) type = 'pc';
    else if (lowerName.includes('server')) type = 'server';
    
    return { name, type, implicit: true };
  }

  /**
   * Color según tipo de dispositivo
   */
  getDeviceColor(type) {
    const colors = {
      router: '#4dabf7',
      switch: '#51cf66',
      pc: '#868e96',
      server: '#ff6b6b',
      firewall: '#ff922b',
      cloud: '#94d82d'
    };
    return colors[type] || '#667eea';
  }

  /**
   * Helper: crear elemento SVG
   */
  createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ICONOS SVG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  createRouterIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-router' });
    g.innerHTML = `
      <rect x="-15" y="-10" width="30" height="20" fill="#1971c2" rx="3"/>
      <circle cx="-8" cy="0" r="2.5" fill="#51cf66"/>
      <circle cx="0" cy="0" r="2.5" fill="#51cf66"/>
      <circle cx="8" cy="0" r="2.5" fill="#ffd43b"/>
    `;
    return g;
  }

  createSwitchIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-switch' });
    g.innerHTML = `
      <rect x="-15" y="-10" width="30" height="20" fill="#2f9e44" rx="3"/>
      <line x1="-10" y1="-5" x2="10" y2="-5" stroke="white" stroke-width="2"/>
      <line x1="-10" y1="0" x2="10" y2="0" stroke="white" stroke-width="2"/>
      <line x1="-10" y1="5" x2="10" y2="5" stroke="white" stroke-width="2"/>
    `;
    return g;
  }

  createPCIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-pc' });
    g.innerHTML = `
      <rect x="-14" y="-10" width="28" height="18" fill="#495057" rx="2"/>
      <rect x="-10" y="-7" width="20" height="12" fill="#339af0"/>
      <rect x="-6" y="10" width="12" height="2" fill="#495057" rx="1"/>
    `;
    return g;
  }

  createServerIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-server' });
    g.innerHTML = `
      <rect x="-12" y="-12" width="24" height="8" fill="#e03131" rx="2"/>
      <rect x="-12" y="-2" width="24" height="8" fill="#e03131" rx="2"/>
      <rect x="-12" y="8" width="24" height="8" fill="#e03131" rx="2"/>
      <circle cx="-8" cy="-8" r="1.5" fill="#51cf66"/>
      <circle cx="-8" cy="2" r="1.5" fill="#51cf66"/>
      <circle cx="-8" cy="12" r="1.5" fill="#51cf66"/>
    `;
    return g;
  }

  createFirewallIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-firewall' });
    g.innerHTML = `
      <path d="M0,-15 L12,-8 L12,8 L0,15 L-12,8 L-12,-8 Z" 
            fill="#fd7e14" stroke="#e8590c" stroke-width="2"/>
      <text y="5" text-anchor="middle" font-size="12" 
            font-weight="bold" fill="white">FW</text>
    `;
    return g;
  }

  createCloudIcon() {
    const g = this.createSVGElement('g', { class: 'icon icon-cloud' });
    g.innerHTML = `
      <ellipse cx="0" cy="0" rx="20" ry="12" fill="#74c0fc"/>
      <ellipse cx="-8" cy="-3" rx="12" ry="8" fill="#a5d8ff"/>
      <ellipse cx="8" cy="-3" rx="12" ry="8" fill="#a5d8ff"/>
    `;
    return g;
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopologyGenerator;
}
