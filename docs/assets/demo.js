(() => {
  const root = document.querySelector('[data-demo]');
  if (!root) return;
  const copy = window.FLYBOT_DEMO || {};
  const chat = root.querySelector('[data-demo-chat]');
  const actions = root.querySelector('[data-demo-actions]');
  const start = root.querySelector('[data-demo-start]');
  const reset = root.querySelector('[data-demo-reset]');
  const tabs = [...root.querySelectorAll('[data-scenario]')];
  const nodes = [...root.querySelectorAll('[data-role]')];
  if (!chat || !actions || !start || !reset) return;
  const zh = root.dataset.lang === 'zh';
  let scenario = 'bug';
  let timers = [];
  let running = false;

  const clearTimers = () => { for (const id of timers) clearTimeout(id); timers = []; };
  const empty = () => {
    chat.replaceChildren();
    const p = document.createElement('div');
    p.className = 'demo-empty';
    p.textContent = zh ? '选择一个场景，然后让团队接手。' : 'Choose a scenario, then let the team take it.';
    chat.append(p);
  };
  const highlight = (role) => {
    for (const node of nodes) node.classList.toggle('active', node.dataset.role === role);
  };
  const add = (role, text, kind = '') => {
    chat.querySelector('.demo-empty')?.remove();
    const row = document.createElement('div');
    row.className = `team-msg ${kind}`;
    if (role !== 'You') row.dataset.role = role;
    const who = document.createElement('span');
    who.className = 'team-who';
    who.dataset.role = role;
    who.textContent = role;
    const body = document.createElement('p');
    body.textContent = text;
    row.append(who, body);
    chat.append(row);
    chat.scrollTop = chat.scrollHeight;
    if (role !== 'You') highlight(role);
  };
  const nudge = () => {
    const data = copy[scenario];
    if (!data) return;
    add('Chief', data.nudge, 'nudge');
  };
  const showNudge = () => {
    actions.replaceChildren();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'demo-action';
    button.textContent = zh ? '催一下团队 ↗' : 'Nudge the team ↗';
    button.addEventListener('click', nudge);
    actions.append(button);
  };
  const run = () => {
    if (running) return;
    const data = copy[scenario];
    if (!data) return;
    running = true;
    start.disabled = true;
    clearTimers();
    chat.replaceChildren();
    actions.replaceChildren();
    add('You', data.request, 'user');
    showNudge();
    data.messages.forEach((message, index) => {
      timers.push(setTimeout(() => add(message.role, message.text), 700 + index * 900));
    });
    timers.push(setTimeout(() => { running = false; start.disabled = false; }, 700 + data.messages.length * 900));
  };
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      if (running) return;
      scenario = tab.dataset.scenario;
      for (const item of tabs) {
        item.classList.toggle('on', item === tab);
        item.setAttribute('aria-selected', String(item === tab));
      }
      clearTimers();
      chat.replaceChildren();
      actions.replaceChildren();
      highlight('');
      empty();
    });
  }
  start.addEventListener('click', run);
  reset.addEventListener('click', () => {
    running = false;
    start.disabled = false;
    clearTimers();
    chat.replaceChildren();
    actions.replaceChildren();
    highlight('');
    empty();
  });
  empty();
})();
