(() => {
  const root = document.querySelector('[data-fb]');
  if (!root) return;
  const app = window.FLYBOT_APP || {};
  const scenarios = app.scenarios || {};
  const bots = app.bots || {};
  const zh = app.lang === 'zh';
  const t = (en, cn) => (zh ? cn : en);
  let scenario = Object.keys(scenarios)[0] || 'bug';
  let phase = 0;
  let selected = 'Chief';
  let active = '';
  let messages = [];
  const $ = (sel) => root.querySelector(sel);
  const order = [['Chief', 0], ['Lead', 1], ['Dev-1', 2], ['Dev-2', 2], ['Test', 2], ['Reviewer', 2]];
  const columns = ['queued', 'doing', 'review', 'done'];
  const columnLabel = { queued: t('Queued', '排队'), doing: t('In progress', '进行中'), review: t('Review', '审查'), done: t('Done', '完成') };
  const statusLabel = [t('idle', '空闲'), t('team working', '团队处理中'), t('reviewing', '审查中'), t('done', '完成')];
  const renderTree = () => {
    const rows = order.map(([name, depth]) => `<button class="fb-node ${selected === name ? 'on' : ''} ${active === name ? 'active' : ''}" style="--d:${depth}" data-bot="${name}">${name}</button>`).join('');
    $('[data-fb-tree]').innerHTML = rows;
    for (const b of root.querySelectorAll('[data-bot]')) b.addEventListener('click', () => { selected = b.dataset.bot; render(); });
  };
  const renderProfile = () => {
    const b = bots[selected] || {};
    $('[data-fb-profile]').innerHTML = `<div class="fb-profile-name">${selected}</div><div class="fb-profile-role">${b.role || ''}</div><dl><dt>${t('Memory', '记忆')}</dt><dd>${b.memory || ''}</dd><dt>${t('Schedule', '计划')}</dt><dd>${b.schedule || ''}</dd></dl>`;
  };
  const renderChat = () => {
    $('[data-fb-chat]').innerHTML = messages.length
      ? messages.map((m) => `<div class="fb-msg ${m.role === 'You' ? 'user' : ''}" data-role="${m.role}"><span>${m.role}</span><p>${m.text}</p></div>`).join('')
      : `<div class="fb-empty">${t('Choose a scenario, then send it to the Chief. The team will split it and report back.', '选择一个场景，发给 Chief。团队会拆分并回报。')}</div>`;
  };
  const taskStates = (task) => task.states[Math.min(phase, 3)];
  const renderBoard = () => {
    const data = scenarios[scenario];
    const tasks = data && phase > 0 ? data.tasks : [];
    $('[data-fb-board]').innerHTML = columns.map((col) => `<div class="fb-col"><h4>${columnLabel[col]}</h4>${tasks.map((task, i) => taskStates(task) === col ? `<div class="fb-card"><b>${task.title}</b><span>${task.role}</span><small>${taskStates(task) === 'done' ? t('done', '完成') : taskStates(task)}</small></div>` : '').join('')}</div>`).join('');
  };
  const renderCompose = () => {
    $('[data-fb-status]').textContent = statusLabel[Math.min(phase, 3)];
    const send = $('[data-fb-send]');
    if (send) send.textContent = phase === 0 ? t('Send to Chief', '发给 Chief') : phase >= 3 ? t('New task', '新任务') : t('Advance team', '推进团队');
    const select = $('[data-fb-scenario]');
    if (select) {
      select.innerHTML = Object.entries(scenarios).map(([key, value]) => `<option value="${key}" ${key === scenario ? 'selected' : ''}>${value.label}</option>`).join('');
      select.disabled = phase !== 0;
    }
  };
  const render = () => { renderTree(); renderProfile(); renderChat(); renderBoard(); renderCompose(); };
  const send = () => {
    if (phase === 0) {
      const data = scenarios[scenario];
      messages = [{ role: 'You', text: data.request }, { role: 'Chief', text: data.messages[0].text }, { role: 'Lead', text: data.messages[1].text }];
      phase = 1; active = 'Lead'; render();
    } else if (phase === 1) {
      const data = scenarios[scenario];
      messages = [...messages, data.messages[2], data.messages[3]]; phase = 2; active = 'Test'; render();
    } else if (phase === 2) {
      const data = scenarios[scenario];
      messages = [...messages, data.messages[4], data.messages[5]]; phase = 3; active = 'Merge queue'; render();
    } else {
      phase = 0; messages = []; active = ''; render();
    }
  };
  const nudge = () => {
    if (phase === 0) return;
    const data = scenarios[scenario];
    messages = [...messages, { role: 'Chief', text: data.nudge }]; active = 'Chief'; render();
  };
  const reset = () => { phase = 0; messages = []; active = ''; render(); };
  for (const el of root.querySelectorAll('[data-fb-send]')) el.addEventListener('click', send);
  for (const el of root.querySelectorAll('[data-fb-nudge]')) el.addEventListener('click', nudge);
  for (const el of root.querySelectorAll('[data-fb-reset]')) el.addEventListener('click', reset);
  const select = $('[data-fb-scenario]');
  if (select) select.addEventListener('change', () => { scenario = select.value; phase = 0; messages = []; active = ''; render(); });
  render();
})();
