// ══════════════════════════════════════════
//  ImmoConform — Chatbot Devis Ludique 🤖
// ══════════════════════════════════════════

(function () {
  const STEPS = [
    {
      key: 'situation',
      msg: "Bonjour ! 👋 Je suis l'assistant ImmoConform.\nPour quel projet avez-vous besoin de diagnostics ?",
      choices: ['🏷️ Vendre mon bien', '🔑 Mettre en location', '🔧 Faire des travaux', '📋 Copropriété', '❓ Je ne sais pas encore'],
    },
    {
      key: 'type_bien',
      msg: "Super ! Quel type de bien est concerné ?",
      choices: ['🏠 Maison', '🏢 Appartement', '🏬 Local commercial', '🏗️ Immeuble', '🛏️ Studio / T1'],
    },
    {
      key: 'surface',
      msg: "Quelle est la surface approximative du bien (en m²) ?",
      input: true,
      placeholder: 'Ex : 75',
      inputType: 'number',
    },
    {
      key: 'commune',
      msg: "Dans quelle commune se situe le bien ?",
      choices: ['Lyon (1-9e)', 'Villeurbanne', 'Vénissieux', 'Caluire-et-Cuire', 'Écully', 'Tassin', 'Bron / St-Priest', 'Autre'],
    },
    {
      key: 'date',
      msg: "Quand souhaiteriez-vous l'intervention ?",
      choices: ['⚡ Urgence (24-48h)', '📅 Cette semaine', '🗓️ Dans 2 semaines', '🕐 Pas encore décidé'],
    },
    {
      key: 'nom',
      msg: "Presque terminé ! 😊\nComment vous appelez-vous ?",
      input: true,
      placeholder: 'Prénom et nom',
      inputType: 'text',
    },
    {
      key: 'tel',
      msg: "Et votre numéro de téléphone pour vous rappeler ?",
      input: true,
      placeholder: '06 XX XX XX XX',
      inputType: 'tel',
    },
  ];

  let currentStep = 0;
  let answers = {};
  let launched = false;

  function createChatbot() {
    // Launcher button
    const launcher = document.createElement('button');
    launcher.className = 'chatbot-launcher';
    launcher.setAttribute('aria-label', 'Ouvrir le chatbot devis');
    launcher.innerHTML = `💬 <span class="notif">1</span>`;
    document.body.appendChild(launcher);

    // Window
    const win = document.createElement('div');
    win.className = 'chatbot-window';
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-avatar">🏠</div>
        <div class="chat-header-info">
          <div class="chat-header-name">Assistant ImmoConform</div>
          <div class="chat-header-status">En ligne — réponse immédiate</div>
        </div>
        <button class="chat-close" aria-label="Fermer">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-choices" id="chatChoices"></div>
      <div class="chat-input-row" id="chatInputRow" style="display:none">
        <input class="chat-input" id="chatInput" type="text" placeholder="Votre réponse..." />
        <button class="chat-send" id="chatSend" aria-label="Envoyer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(win);

    // Events
    launcher.addEventListener('click', () => toggleChat(true));
    win.querySelector('.chat-close').addEventListener('click', () => toggleChat(false));
    win.querySelector('#chatSend').addEventListener('click', submitInput);
    win.querySelector('#chatInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') submitInput();
    });

    // Auto-open after 8s with a lure message (only once)
    setTimeout(() => {
      if (!launched) showPulse();
    }, 8000);

    return win;
  }

  let chatWin;

  function toggleChat(open) {
    if (!chatWin) chatWin = document.querySelector('.chatbot-window');
    const launcher = document.querySelector('.chatbot-launcher');
    if (open) {
      chatWin.classList.add('open');
      launcher.innerHTML = `✕`;
      if (!launched) {
        launched = true;
        const notif = launcher.querySelector('.notif');
        if (notif) notif.remove();
        setTimeout(() => botSay(STEPS[0].msg, STEPS[0]), 400);
      }
    } else {
      chatWin.classList.remove('open');
      launcher.innerHTML = `💬`;
    }
  }

  function showPulse() {
    const launcher = document.querySelector('.chatbot-launcher');
    launcher.style.animation = 'chatPulse 1s ease 3';
    if (!document.getElementById('chatPulseStyle')) {
      const s = document.createElement('style');
      s.id = 'chatPulseStyle';
      s.textContent = `@keyframes chatPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`;
      document.head.appendChild(s);
    }
  }

  function addMsg(type, text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    if (type === 'bot') {
      div.innerHTML = `<div class="msg-avatar">🏠</div><div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
    } else {
      div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'msg bot'; div.id = 'typingIndicator';
    div.innerHTML = `<div class="msg-avatar">🏠</div><div class="msg-bubble" style="padding:12px 16px">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function botSay(text, step) {
    clearChoices();
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMsg('bot', text);
      if (step) renderStep(step);
    }, 700 + Math.random() * 400);
  }

  function renderStep(step) {
    clearChoices();
    const choicesEl = document.getElementById('chatChoices');
    const inputRow = document.getElementById('chatInputRow');

    if (step.choices) {
      inputRow.style.display = 'none';
      step.choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = c;
        btn.addEventListener('click', () => handleChoice(c));
        choicesEl.appendChild(btn);
      });
    } else if (step.input) {
      inputRow.style.display = 'flex';
      const input = document.getElementById('chatInput');
      input.type = step.inputType || 'text';
      input.placeholder = step.placeholder || '...';
      setTimeout(() => input.focus(), 100);
    }
  }

  function clearChoices() {
    document.getElementById('chatChoices').innerHTML = '';
  }

  function handleChoice(choice) {
    addMsg('user', choice);
    answers[STEPS[currentStep].key] = choice;
    nextStep();
  }

  function submitInput() {
    const input = document.getElementById('chatInput');
    const val = input.value.trim();
    if (!val) return;
    addMsg('user', val);
    answers[STEPS[currentStep].key] = val;
    input.value = '';
    document.getElementById('chatInputRow').style.display = 'none';
    nextStep();
  }

  function nextStep() {
    currentStep++;
    if (currentStep < STEPS.length) {
      setTimeout(() => botSay(STEPS[currentStep].msg, STEPS[currentStep]), 500);
    } else {
      showSummary();
    }
  }

  function showSummary() {
    clearChoices();
    document.getElementById('chatInputRow').style.display = 'none';
    const summaryLines = [
      answers.situation ? `📋 ${answers.situation}` : '',
      answers.type_bien ? `🏠 ${answers.type_bien}` : '',
      answers.surface ? `📐 ${answers.surface} m²` : '',
      answers.commune ? `📍 ${answers.commune}` : '',
      answers.date ? `🗓️ ${answers.date}` : '',
    ].filter(Boolean).join('\n');

    setTimeout(() => {
      botSay(`Parfait ${answers.nom || ''} ! 🎉\n\nVoici un récapitulatif de votre demande :\n${summaryLines}\n\nNous vous rappelons au <strong>${answers.tel || 'numéro indiqué'}</strong> dans les <strong>2 heures</strong> (lun-sam 8h-19h).`, null);
      setTimeout(() => {
        const msgs = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = 'msg bot';
        div.innerHTML = `<div class="msg-avatar">🏠</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding:0">
            <button onclick="document.querySelector('.chatbot-launcher').click()" class="choice-btn" style="background:var(--ic-700);color:white;border-color:var(--ic-700)">✓ Fermer</button>
            <button onclick="resetChat()" class="choice-btn">↺ Nouvelle demande</button>
          </div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      }, 1200);
    }, 600);
  }

  window.resetChat = function() {
    currentStep = 0;
    answers = {};
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatChoices').innerHTML = '';
    document.getElementById('chatInputRow').style.display = 'none';
    setTimeout(() => botSay(STEPS[0].msg, STEPS[0]), 300);
  };

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    createChatbot();
  });

  // Expose toggle for external use (e.g. CTA buttons)
  window.openChatbot = () => toggleChat(true);

})();
