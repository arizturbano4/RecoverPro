/* ============================================
   RECOVERPRO - SCRIPT PRINCIPAL
   ============================================ */

// ============ UTILIDADES ============

const utils = {
  // Elementos del DOM
  getElement: (selector) => document.querySelector(selector),
  getElements: (selector) => document.querySelectorAll(selector),
  getElementById: (id) => document.getElementById(id),
  
  // Storage
  setLocalStorage: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  getLocalStorage: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  removeLocalStorage: (key) => localStorage.removeItem(key),
  
  // Classes
  addClass: (element, className) => element?.classList.add(className),
  removeClass: (element, className) => element?.classList.remove(className),
  toggleClass: (element, className) => element?.classList.toggle(className),
  hasClass: (element, className) => element?.classList.contains(className),
  
  // Scroll
  scrollToElement: (element) => {
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
};

// ============ NAVEGACIÓN ============

class Navigation {
  constructor() {
    this.navLinks = utils.getElements('.nav-links a');
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  init() {
    this.updateActiveLink();
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleLinkClick(e));
    });
  }

  getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  updateActiveLink() {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === this.currentPage || (this.currentPage === '' && href === 'index.html')) {
        utils.addClass(link, 'active');
      } else {
        utils.removeClass(link, 'active');
      }
    });
  }

  handleLinkClick(e) {
    // Se permite la navegación normal
    this.updateActiveLink();
  }
}

// ============ SELECTOR DE LESIONES ============

class InjurySelector {
  constructor() {
    this.bodyParts = utils.getElements('.body-part');
    this.injuries = {
      head: ['Conmoción', 'Migraña del deportista'],
      neck: ['Contractura cervical', 'Latigazo cervical'],
      shoulder: ['Tendinitis del hombro', 'Síndrome de pinzamiento', 'Dislocación'],
      elbow: ['Codo de tenista', 'Codo de golfista', 'Bursitis'],
      wrist: ['Esguince de muñeca', 'Síndrome del túnel carpiano'],
      hand: ['Fractura de dedos', 'Lesión de ligamentos'],
      back: ['Contractura lumbar', 'Lumbalgia', 'Hernia discal'],
      hip: ['Bursitis de cadera', 'Síndrome piriforme'],
      knee: ['Rodilla del corredor', 'Esguince de rodilla', 'Menisco'],
      ankle: ['Esguince de tobillo', 'Fascitis plantar'],
      foot: ['Espolón calcáneo', 'Fascitis plantar'],
    };
    this.init();
  }

  init() {
    if (this.bodyParts.length > 0) {
      this.bodyParts.forEach(part => {
        part.addEventListener('click', (e) => this.handlePartClick(e));
      });
    }
  }

  handlePartClick(e) {
    const partName = e.target.getAttribute('data-part');
    if (partName && this.injuries[partName]) {
      this.displayInjuries(partName);
    }
  }

  displayInjuries(partName) {
    const container = utils.getElement('.injury-list');
    if (!container) return;

    const injuries = this.injuries[partName];
    let html = `<h3>Lesiones comunes en: <strong>${this.capitalizePartName(partName)}</strong></h3>`;

    injuries.forEach(injury => {
      const severity = this.getRandomSeverity();
      html += `
        <div class="injury-item" onclick="injuryModal.openModal('${injury}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${injury}</strong>
            <div class="injury-severity">
              ${this.getSeverityDots(severity)}
            </div>
          </div>
          <small style="color: var(--text-secondary);">Haz clic para más detalles</small>
        </div>
      `;
    });

    container.innerHTML = html;
    container.style.display = 'block';
  }

  capitalizePartName(name) {
    const names = {
      head: 'Cabeza',
      neck: 'Cuello',
      shoulder: 'Hombro',
      elbow: 'Codo',
      wrist: 'Muñeca',
      hand: 'Mano',
      back: 'Espalda',
      hip: 'Cadera',
      knee: 'Rodilla',
      ankle: 'Tobillo',
      foot: 'Pie',
    };
    return names[name] || name;
  }

  getRandomSeverity() {
    const severities = ['mild', 'moderate', 'severe'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  getSeverityDots(severity) {
    if (severity === 'mild') {
      return '<div class="severity-dot mild"></div>';
    } else if (severity === 'moderate') {
      return `
        <div class="severity-dot moderate"></div>
        <div class="severity-dot moderate"></div>
      `;
    } else {
      return `
        <div class="severity-dot severe"></div>
        <div class="severity-dot severe"></div>
        <div class="severity-dot severe"></div>
      `;
    }
  }
}

// ============ CALCULADORA DE RECUPERACIÓN ============

class RecoveryCalculator {
  constructor() {
    this.form = utils.getElement('.calculator-form');
    this.resultContainer = utils.getElement('.calculator-result');
    this.submitBtn = utils.getElement('.calculator-form + .btn');
    
    this.injuryData = {
      tension: { baseDays: 7, ageMultiplier: 0.5, severityMultiplier: 2 },
      sprain: { baseDays: 14, ageMultiplier: 0.8, severityMultiplier: 3 },
      tendinitis: { baseDays: 21, ageMultiplier: 1, severityMultiplier: 2.5 },
      fracture: { baseDays: 42, ageMultiplier: 1.5, severityMultiplier: 2 },
      muscular: { baseDays: 10, ageMultiplier: 0.6, severityMultiplier: 2.2 },
    };

    this.init();
  }

  init() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', (e) => this.calculate(e));
    }
    
    // Enter en los inputs también calcula
    const inputs = utils.getElements('.calculator-form input, .calculator-form select');
    inputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.calculate(e);
      });
    });
  }

  calculate(e) {
    e.preventDefault();

    const injuryType = utils.getElement('[name="injury-type"]')?.value;
    const severity = parseInt(utils.getElement('[name="severity"]')?.value) || 3;
    const age = parseInt(utils.getElement('[name="age"]')?.value) || 30;
    const level = utils.getElement('[name="level"]')?.value || 'amateur';
    const weeksWithInjury = parseInt(utils.getElement('[name="weeks"]')?.value) || 0;

    if (!injuryType) {
      alert('Por favor selecciona un tipo de lesión');
      return;
    }

    const data = this.injuryData[injuryType];
    if (!data) return;

    // Fórmula: baseDays + (edad * ageMultiplier) + (severidad * severityMultiplier)
    let recoveryDays = data.baseDays + 
                       ((age - 25) * data.ageMultiplier) + 
                       ((severity - 1) * data.severityMultiplier);

    // Ajuste por nivel deportivo
    if (level === 'semipro' || level === 'pro') {
      recoveryDays *= 1.2; // Recuperación más lenta (más intensidad de entrenamiento)
    }

    // Ajuste si ya lleva semanas
    if (weeksWithInjury > 2) {
      recoveryDays += weeksWithInjury * 7 * 0.3; // Agrega tiempo si ya está crónica
    }

    recoveryDays = Math.round(recoveryDays);

    this.displayResult(recoveryDays, injuryType, severity, age, level);
  }

  displayResult(days, injuryType, severity, age, level) {
    const weeks = Math.ceil(days / 7);
    const protocol = this.getProtocolRecommendation(injuryType);
    const warnings = this.getWarnings(severity, age, level);

    let html = `
      <h3 style="color: var(--dark-blue); margin-bottom: var(--spacing-lg);">📊 Tu Prognosis</h3>
      
      <div class="result-item">
        <div class="result-label">Tiempo estimado de recuperación</div>
        <div class="result-value">${weeks} semana${weeks > 1 ? 's' : ''}</div>
        <small style="color: var(--text-secondary);">${days} días aproximadamente</small>
      </div>

      <div class="result-item">
        <div class="result-label">Protocolo recomendado</div>
        <div style="margin-top: var(--spacing-md);">${protocol}</div>
      </div>

      <div class="result-item">
        <div class="result-label">Nivel de seguimiento</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${severity * 20}%; --progress-value: ${severity * 20}%"></div>
        </div>
        <small style="color: var(--text-secondary);">Severidad: ${severity}/5</small>
      </div>
    `;

    if (warnings.length > 0) {
      html += `<div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background-color: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md); border-left: 4px solid var(--alert-red);">
        <strong style="color: var(--alert-red);">⚠️ Señales de alerta:</strong>
        <ul style="margin: var(--spacing-sm) 0 0 var(--spacing-lg); color: var(--text-primary);">
          ${warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>`;
    }

    html += `<div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background-color: rgba(37, 99, 235, 0.05); border-radius: var(--radius-md); border-left: 4px solid var(--electric-blue);">
      <small style="color: var(--text-secondary);"><strong>Aviso legal:</strong> Esta es una estimación. Si experimentas dolor intenso, inflamación o síntomas que empeoran, consulta a un profesional médico.</small>
    </div>`;

    this.resultContainer.innerHTML = html;
    utils.addClass(this.resultContainer, 'show');
  }

  getProtocolRecommendation(injuryType) {
    const protocols = {
      tension: '👉 RICER: Reposo, Hielo, Compresión, Elevación, Rehabilitación progresiva',
      sprain: '👉 Protocolo RICER + Fisioterapia especializada + Ejercicios de propriocepción',
      tendinitis: '👉 Reposo relativo + Ejercicios excéntricos + Antiinflamatorios tópicos',
      fracture: '👉 Inmovilización + Seguimiento médico + Rehabilitación progresiva (IMPORTANTE: consulta médico)',
      muscular: '👉 RICER + Estiramientos suaves + Masaje terapéutico + Recuperación gradual',
    };
    return protocols[injuryType] || 'Consulta con un profesional médico para un protocolo personalizado';
  }

  getWarnings(severity, age, level) {
    const warnings = [];

    if (severity >= 4) {
      warnings.push('Esta lesión es severa. Consulta médico inmediatamente.');
    }

    if (age > 40) {
      warnings.push('Recuperación más lenta por edad. Sé más conservador.');
    }

    if (level === 'pro') {
      warnings.push('Como deportista profesional, requieres supervisión médica específica.');
    }

    if (age < 18) {
      warnings.push('Edad joven. Sigue protocolos conservadores para no cronificar.');
    }

    return warnings;
  }
}

// ============ FLIP CARDS (EJERCICIOS) ============

class FlipCards {
  constructor() {
    this.cards = utils.getElements('.flip-card');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('click', () => {
        utils.toggleClass(card, 'flipped');
      });
    });
  }
}

// ============ GUARDAR PROTOCOLOS ============

class SaveProtocol {
  static save(protocolName) {
    let saved = utils.getLocalStorage('saved-protocols') || [];
    
    if (!saved.includes(protocolName)) {
      saved.push(protocolName);
      utils.setLocalStorage('saved-protocols', saved);
      
      this.showNotification(`✅ "${protocolName}" guardado en tu biblioteca`);
    } else {
      this.showNotification(`ℹ️ "${protocolName}" ya está guardado`);
    }
  }

  static remove(protocolName) {
    let saved = utils.getLocalStorage('saved-protocols') || [];
    saved = saved.filter(p => p !== protocolName);
    utils.setLocalStorage('saved-protocols', saved);
    this.showNotification(`Protocolo eliminado`);
  }

  static getSaved() {
    return utils.getLocalStorage('saved-protocols') || [];
  }

  static showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--recovery-green);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      animation: slide-in-left 0.3s ease;
      z-index: 1000;
      max-width: 300px;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.animation = 'fade-out 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }
}

// ============ MODAL DE LESIONES ============

class InjuryModal {
  constructor() {
    this.injuries = {
      'Conmoción': {
        technical: 'Traumatismo craneoencefálico',
        symptoms: ['Dolor de cabeza', 'Mareos', 'Confusión', 'Pérdida breve de conciencia'],
        causes: ['Golpe directo en la cabeza', 'Colisiones en deporte de contacto'],
        recovery: '2-3 semanas',
        whenToSee: 'INMEDIATAMENTE - Es emergencia médica',
        donts: ['No volver a jugar el mismo día', 'No entrenar intenso hasta evaluación', 'No ignorar síntomas'],
      },
      'Tendinitis del hombro': {
        technical: 'Inflamación del tendón rotador',
        symptoms: ['Dolor en reposo y al mover', 'Inflamación', 'Debilidad', 'Limitación de movimiento'],
        causes: ['Movimientos repetitivos', 'Sobrecarga', 'Mala técnica'],
        recovery: '4-8 semanas',
        whenToSee: 'Después de 1 semana si no mejora',
        donts: ['No lanzar pesos sobre los hombros', 'No hacer movimientos amplios', 'No ignorar el dolor'],
      },
      'Esguince de tobillo': {
        technical: 'Rotura parcial o total de ligamentos',
        symptoms: ['Dolor intenso', 'Inflamación', 'Moratones', 'Dificultad para caminar'],
        causes: ['Torsión del pie', 'Caída', 'Movimiento brusco'],
        recovery: '1-3 semanas (leve), 4-8 semanas (severo)',
        whenToSee: 'Si hay imposibilidad de caminar o deformidad',
        donts: ['No apoyar peso completo si es severo', 'No quitarte la compresión prematuramente', 'No volver a deportes sin recuperación'],
      },
      'Rodilla del corredor': {
        technical: 'Síndrome de dolor patelofemoral',
        symptoms: ['Dolor en la rodilla', 'Dolor al bajar escaleras', 'Clic o chasquido', 'Inflamación leve'],
        causes: ['Debilidad muscular', 'Desalineación', 'Aumento brusco de volumen'],
        recovery: '3-6 semanas',
        whenToSee: 'Si el dolor persiste más de 2 semanas',
        donts: ['No aumentar el volumen de entrenamiento de golpe', 'No entrenar si hay dolor intenso', 'No ignorar la debilidad muscular'],
      },
      'Contractura lumbar': {
        technical: 'Contracción involuntaria del músculo lumbar',
        symptoms: ['Rigidez', 'Dolor al movimiento', 'Limitación de flexión', 'Espasmos'],
        causes: ['Mala postura', 'Levantamiento incorrecto', 'Falta de calentamiento'],
        recovery: '3-10 días',
        whenToSee: 'Si persiste más de 1 semana o hay irradiación de dolor',
        donts: ['No hacer levantamientos de peso', 'No ignorar la flexibilidad', 'No pasar mucho tiempo en posición sedente'],
      },
      'Fascitis plantar': {
        technical: 'Inflamación de la fascia plantar',
        symptoms: ['Dolor talón', 'Dolor al primer paso del día', 'Rigidez', 'Dolor después del ejercicio'],
        causes: ['Sobrecarga', 'Calzado inadecuado', 'Tightness de pantorrilla'],
        recovery: '4-8 semanas',
        whenToSee: 'Si el dolor es muy intenso o impide caminar',
        donts: ['No andar descalzo', 'No ignorar estiramientos', 'No cambiar abruptamente de calzado'],
      },
    };
    this.init();
  }

  init() {
    // El modal se abre mediante onclick en JavaScript
  }

  openModal(injuryName) {
    const injury = this.injuries[injuryName];
    if (!injury) {
      alert('Información no disponible para esta lesión');
      return;
    }

    let html = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="event.target === this && this.remove()">
        <div style="background-color: white; padding: 2rem; border-radius: 1rem; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative;">
          <button onclick="this.closest('[style*=fixed]').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--text-secondary);">×</button>
          
          <h2 style="color: var(--dark-blue); margin-bottom: 0.5rem;">${injuryName}</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-style: italic;">Término técnico: ${injury.technical}</p>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--dark-blue); margin-bottom: 0.5rem;">🔴 Síntomas:</h4>
            <ul style="padding-left: 1.5rem;">
              ${injury.symptoms.map(s => `<li style="color: var(--text-secondary); margin-bottom: 0.5rem;">${s}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--dark-blue); margin-bottom: 0.5rem;">🔍 Causas:</h4>
            <ul style="padding-left: 1.5rem;">
              ${injury.causes.map(c => `<li style="color: var(--text-secondary); margin-bottom: 0.5rem;">${c}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--recovery-green); margin-bottom: 0.5rem;">⏱️ Recuperación estimada:</h4>
            <p style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${injury.recovery}</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--electric-blue); margin-bottom: 0.5rem;">👨⚕️ Cuándo ver al médico:</h4>
            <p style="color: var(--text-primary); background-color: rgba(37, 99, 235, 0.05); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--electric-blue);">${injury.whenToSee}</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--alert-red); margin-bottom: 0.5rem;">❌ QUÉ NO HACER:</h4>
            <ul style="padding-left: 1.5rem;">
              ${injury.donts.map(d => `<li style="color: #991b1b; margin-bottom: 0.5rem;"><strong>→</strong> ${d}</li>`).join('')}
            </ul>
          </div>

          <div style="background-color: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--alert-red); margin-top: 1.5rem;">
            <strong style="color: var(--alert-red);">⚠️ Aviso legal:</strong>
            <p style="margin: 0.5rem 0 0 0; color: #991b1b; font-size: 0.9rem;">Esta información es educativa. No sustituye la evaluación de un profesional médico. Consulta siempre con un médico para un diagnóstico y tratamiento adecuados.</p>
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = html;
    document.body.appendChild(modal.firstElementChild);
  }
}

// ============ NEWSLETTER ============

class Newsletter {
  constructor() {
    this.form = utils.getElement('.newsletter-form');
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.form.querySelector('input[type="email"]');
    
    if (email && email.value) {
      SaveProtocol.showNotification(`✅ ¡Suscrito! Revisa tu email en: ${email.value}`);
      this.form.reset();
    }
  }
}

// ============ TABLA DE CONTENIDOS STICKY ============

class TableOfContents {
  constructor() {
    this.headings = utils.getElements('.article-content h2, .article-content h3');
    this.tocContainer = utils.getElement('.toc-list');
    this.init();
  }

  init() {
    if (this.headings.length > 0 && this.tocContainer) {
      this.generateTOC();
      window.addEventListener('scroll', () => this.updateActiveLink());
    }
  }

  generateTOC() {
    let html = '';
    this.headings.forEach((heading, index) => {
      const level = heading.tagName === 'H2' ? 'h2' : 'h3';
      const id = heading.id || `heading-${index}`;
      heading.id = id;

      const indent = level === 'h3' ? 'margin-left: 1rem;' : '';
      html += `<li style="${indent}"><a href="#${id}">${heading.textContent}</a></li>`;
    });

    this.tocContainer.innerHTML = html;
    this.attachTOCListeners();
  }

  attachTOCListeners() {
    const links = this.tocContainer.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = utils.getElement(link.getAttribute('href'));
        if (target) {
          utils.scrollToElement(target);
        }
      });
    });
  }

  updateActiveLink() {
    let activeHeading = null;

    this.headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 150) {
        activeHeading = heading;
      }
    });

    if (activeHeading) {
      const tocLinks = this.tocContainer.querySelectorAll('a');
      tocLinks.forEach(link => utils.removeClass(link, 'active'));
      const activeLink = this.tocContainer.querySelector(`a[href="#${activeHeading.id}"]`);
      if (activeLink) utils.addClass(activeLink, 'active');
    }
  }
}

// ============ INICIALIZACIÓN GLOBAL ============

document.addEventListener('DOMContentLoaded', () => {
  // Instanciar componentes
  new Navigation();
  new InjurySelector();
  new RecoveryCalculator();
  new FlipCards();
  new Newsletter();
  new TableOfContents();
  
  // Instanciar modal globalmente para acceso desde HTML
  window.injuryModal = new InjuryModal();
  window.saveProtocol = SaveProtocol;

  console.log('✅ RecoverPro cargado correctamente');
});
