/* A2Z AI store: product data, cards, popup and email signup. */
(function () {
  'use strict';

  // ---------- Products ----------
  // `download`: file name or link for each free product, for when the delivery email is set up.
  var FREE = [
    { id: 'f1', cat: 'Prompt pack', title: '1500+ AI Prompts', desc: 'Ready-to-use prompts for 20 work categories.', big: '1500+', coverTitle: 'AI Prompts', coverSub: 'Become a ChatGPT power user', bg: '#111111', ink: '#FFFFFF', accent: '#FF5A1F', download: '/downloads/1500-ai-prompts.pdf' },
    { id: 'f8', cat: 'Income guide', title: '150+ Ways to Make Money with AI', desc: 'Practical ways to earn with AI tools.', big: '150+', coverTitle: 'Ways to Make\nMoney with AI', coverSub: 'Daily income opportunities', bg: '#0F766E', ink: '#FFFFFF', accent: '#A7F3D0', download: '/downloads/150-ways-to-make-money-with-ai.pdf' },
    { id: 'f3', cat: 'AI agents', title: 'ChatGPT AI Agents', desc: '22 marketing agents you can launch fast.', big: '22', coverTitle: 'ChatGPT\nAI Agents', coverSub: 'Marketing agents you can launch in 5 minutes', bg: '#2563EB', ink: '#FFFFFF', accent: '#FFD9C7', download: '/downloads/chatgpt-ai-agents.pdf' },
    { id: 'f4', cat: 'Prompt pack', title: 'The Claude Playbook for Marketers', desc: '150+ Claude prompts for marketing work.', big: '150+', coverTitle: 'Claude\nPlaybook', coverSub: 'Prompts for marketers', bg: '#FFD9C7', ink: '#111111', accent: '#FF5A1F', download: '/downloads/claude-playbook-for-marketers.pdf' },
    { id: 'f5', cat: 'Playbook', title: 'Agentic Engineering Playbook', desc: '29 lessons on building agentic systems.', big: '29', coverTitle: 'Agentic\nEngineering', coverSub: 'Lessons on Claude Code, subagents and MCP', bg: '#FACC15', ink: '#111111', accent: '#111111', download: '/downloads/agentic-engineering-playbook.pdf' },
    { id: 'f6', cat: 'Cheat sheet', title: 'ChatGPT Cheat Sheet', desc: 'ChatGPT modes and 8 prompt frameworks.', big: '8', coverTitle: 'ChatGPT\nCheat Sheet', coverSub: 'Prompt frameworks, modes and tools', bg: '#FFFFFF', ink: '#111111', accent: '#FF5A1F', download: '/downloads/chatgpt-cheat-sheet.pdf' },
  ];

  var PAID = [
    { id: 'p1', cat: 'Prompt pack', title: 'ChatGPT Business Prompt Vault', desc: 'Prompts for sales, ops, hiring and support.', price: '$49', coverTitle: 'Business\nPrompt Vault', coverSub: 'Prompts for every team', bg: '#FBF6EA', ink: '#111111', accent: '#FF5A1F' },
    { id: 'p2', cat: 'Guide', title: 'Newsletter Growth Playbook', desc: 'A step-by-step plan to grow a newsletter.', price: '$47', coverTitle: 'Newsletter\nGrowth\nPlaybook', coverSub: 'Launch and grow your list', bg: '#FACC15', ink: '#111111', accent: '#FFFFFF' },
    { id: 'p3', cat: 'Template', title: 'Notion AI Content System', desc: 'Plan and schedule a month of content.', price: '$54', coverTitle: 'Notion AI\nContent\nSystem', coverSub: 'Plan a month of content', bg: '#111111', ink: '#FFFFFF', accent: '#FF5A1F' },
    { id: 'p4', cat: 'Template', title: 'AI Freelancer Toolkit', desc: 'Proposals, client prompts and pricing.', price: '$59', coverTitle: 'AI\nFreelancer\nToolkit', coverSub: 'Win and serve clients', bg: '#86EFAC', ink: '#111111', accent: '#FBF6EA' }
  ];

  var ENDPOINT = '/api/subscribe';

  // ---------- Helpers ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function byId(id) { return document.getElementById(id); }
  function findProduct(id) {
    var all = FREE.concat(PAID);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function bookCover(p, opts) {
    opts = opts || {};
    var premium = !!p.price;
    var b = el('div', 'book' + (premium ? ' premium' : '') + (opts.large ? ' lg' : ''));
    b.setAttribute('aria-hidden', 'true');
    b.style.background = p.bg;
    b.style.color = p.ink;
    b.style.setProperty('--b-accent', p.accent);
    b.appendChild(el('span', premium ? 'dot' : 'ring'));
    b.appendChild(el('span', 'bar'));
    b.appendChild(el('span', 'brand', premium ? 'A2Z AI · PREMIUM' : 'A2Z AI'));
    if (!premium && p.big) b.appendChild(el('span', 'big', p.big));
    b.appendChild(el('span', 'ttl', p.coverTitle));
    b.appendChild(el('span', 'sub', p.coverSub));
    return b;
  }

  function card(p) {
    var premium = !!p.price;
    var c = el('article', 'box card');
    var media = el('div', 'card-media' + (premium ? ' peach' : ''));
    media.appendChild(el('span', 'sticker ' + (premium ? 'dark' : 'orange'), premium ? 'Early access' : 'Free'));
    media.appendChild(bookCover(p));
    c.appendChild(media);

    var body = el('div', 'card-body');
    body.appendChild(el('span', 'chip', p.cat));
    body.appendChild(el('h3', null, p.title));
    body.appendChild(el('p', null, p.desc));
    var foot = el('div', 'card-foot');
    foot.appendChild(el('span', 'price-tag', premium ? p.price : '$0'));
    var btn = el('button', 'btn btn-sm' + (premium ? ' btn-dark' : ''));
    btn.type = 'button';
    btn.appendChild(document.createTextNode(premium ? 'Early access ' : 'Get it free '));
    btn.appendChild(el('span', 'arr', '›'));
    btn.addEventListener('click', function () { openModal(p.id, btn); });
    foot.appendChild(btn);
    body.appendChild(foot);
    c.appendChild(body);
    return c;
  }

  // ---------- Render cards ----------
  var freeGrid = byId('free-grid');
  var paidGrid = byId('paid-grid');
  FREE.forEach(function (p) { freeGrid.appendChild(card(p)); });
  PAID.forEach(function (p) { paidGrid.appendChild(card(p)); });

  // ---------- Modal ----------
  var modal = byId('modal');
  var mForm = byId('m-form');
  var mDone = byId('m-done');
  var lastTrigger = null;
  var current = null;

  function openModal(id, trigger) {
    var p = findProduct(id);
    if (!p) return;
    current = p;
    lastTrigger = trigger || null;
    var premium = !!p.price;

    var cover = byId('m-cover');
    cover.innerHTML = '';
    cover.appendChild(bookCover(p, { large: true }));

    byId('m-tag').textContent = premium ? 'Early access' : 'Free download';
    byId('m-title').textContent = p.title;
    byId('m-intro').textContent = premium
      ? 'This product is launching soon. Add your email and we will let you know the moment ' + p.title + ' launches. You will also get the free A2Z AI daily newsletter.'
      : 'Tell us your name and email and we will send it to your inbox. You will also get the free A2Z AI daily newsletter.';
    byId('m-cta').textContent = premium ? 'Get early access' : 'Send it to my inbox';

    mForm.setAttribute('data-form', premium ? 'early-access' : 'free-download');
    mForm.setAttribute('data-product', p.title);
    mForm.hidden = false;
    mDone.hidden = true;
    resetError(mForm);

    modal.hidden = false;
    document.body.classList.add('modal-open');
    var first = mForm.querySelector('input[name="first_name"]');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus();
  }

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  function showModalDone(firstName) {
    var p = current;
    var premium = !!p.price;
    byId('m-done-title').textContent = premium
      ? 'You are on the list, ' + firstName + '.'
      : "You're in, " + firstName + '.';
    byId('m-done-text').textContent = premium
      ? 'We will email you as soon as ' + p.title + ' launches.'
      : 'Check your email inbox. ' + p.title + ' is on the way, along with the free A2Z AI daily newsletter.';
    mForm.hidden = true;
    mDone.hidden = false;
  }

  // ---------- Signup ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function resetError(form) {
    var err = form.querySelector('.form-error');
    err.hidden = true;
    err.textContent = '';
    form.querySelectorAll('input').forEach(function (i) { i.removeAttribute('aria-invalid'); });
  }
  function showError(form, msg, input) {
    var err = form.querySelector('.form-error');
    err.textContent = msg;
    err.hidden = false;
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  }

  document.querySelectorAll('.js-signup').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      resetError(form);

      var first = form.elements.first_name;
      var last = form.elements.last_name;
      var email = form.elements.email;
      var data = {
        first_name: first.value.trim(),
        last_name: last.value.trim(),
        email: email.value.trim().toLowerCase(),
        form: form.getAttribute('data-form'),
        product: form.getAttribute('data-product'),
        company: form.elements.company ? form.elements.company.value : '',
        page: location.pathname
      };

      if (!data.first_name) return showError(form, 'Please enter your first name.', first);
      if (!data.last_name) return showError(form, 'Please enter your last name.', last);
      if (!EMAIL_RE.test(data.email)) return showError(form, 'Please enter a valid email address.', email);

      var btn = form.querySelector('button[type="submit"]');
      var label = btn.querySelector('.btn-label');
      var oldLabel = label.textContent;
      btn.disabled = true;
      label.textContent = 'Sending...';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || !body.ok) throw new Error(body.error || 'Request failed');
          });
        })
        .then(function () {
          form.reset();
          if (form === mForm) {
            showModalDone(data.first_name);
          } else {
            var box = form.parentElement;
            form.hidden = true;
            var done = box.querySelector('.done');
            done.querySelector('.done-title').textContent = "You're in, " + data.first_name + '.';
            done.hidden = false;
          }
        })
        .catch(function () {
          showError(form, 'Something went wrong. Please check your connection and try again.');
        })
        .then(function () {
          btn.disabled = false;
          label.textContent = oldLabel;
        });
    });
  });
})();
