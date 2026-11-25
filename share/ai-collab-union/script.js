/* =============================================================
   AI时代下的人机协同 — Deck runtime
   单一数据源：每页 <section class="slide"> 的 data-ch / data-title /
   data-min / data-src。目录、分段进度、来源面板均由此生成。
   ============================================================= */
(function () {
  'use strict';

  /* ---------- 公开来源清单（与 SPEC E01—E15 一致） ---------- */
  const SOURCES = [
    { id: 'E01', name: 'Why language models hallucinate', org: 'OpenAI · 2025-09-05', note: '生成貌似可信但不真实的陈述；训练与评估奖励猜测是提出的机制。', url: 'https://openai.com/index/why-language-models-hallucinate/' },
    { id: 'E02', name: 'Training language models to follow instructions with human feedback', org: 'Ouyang et al. · 2022', note: '预训练基础上的示范与偏好反馈，帮助模型遵循指令。', url: 'https://arxiv.org/abs/2203.02155' },
    { id: 'E03', name: 'HBS Working Paper 24-013', org: 'Harvard Business School · 2023 年实验', note: 'GPT-4 辅助咨询任务的收益因任务而异；本 deck 仅用定性结论。', url: 'https://www.hbs.edu/faculty/Pages/item.aspx?num=64700' },
    { id: 'E04', name: '郭毅可：人类正迈入人机共生的时代', org: '张一鸣 · 中国经济新闻网 · 2026-07-30', note: '据报道强调机器承担事务性工作、人参与目标、价值判断与责任。仅为归属明确的转述。', url: 'https://www.cet.com.cn/wzsy/zkgc/10472869.shtml' },
    { id: 'E05', name: 'Generative AI and Jobs: A Refined Global Index of Occupational Exposure', org: 'ILO—NASK · 2025', note: '岗位由任务组成；潜在暴露不等于实际岗位流失。页面援引 WP140。', url: 'https://www.ilo.org/resource/article/how-might-generative-ai-impact-different-occupations' },
    { id: 'E06', name: 'WorkBuddy 官方简介', org: 'WorkBuddy 文档', note: '自然语言提出任务、自主规划执行、授权后处理文件、交付可验收成果。', url: 'https://www.workbuddy.cn/docs/workbuddy/Overview' },
    { id: 'E07', name: '记忆', org: 'WorkBuddy 功能说明', note: '作为背景上下文；可更正删除关闭，也可能有概括偏差和时效问题。', url: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Memory' },
    { id: 'E08', name: '技能', org: 'WorkBuddy 功能说明', note: '封装工作流与能力；需检查来源、权限与可能的第三方数据流向。', url: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market' },
    { id: 'E09', name: '资料库', org: 'WorkBuddy 功能说明', note: '保存材料与成果、添加到任务；个人与团队权限、发布与保存的区别。', url: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Library' },
    { id: 'E10', name: '更新日志', org: 'WorkBuddy 文档 · 2026-11-24 所查快照', note: '顶部列 5.11.3（11-15）；发布记录不等于所有账号已可用。', url: 'https://www.workbuddy.cn/docs/workbuddy/Changelog' },
    { id: 'E11', name: '创建任务', org: 'WorkBuddy 文档', note: '提供目标、输入、输出、约束；添加材料和工作目录。', url: 'https://www.workbuddy.cn/docs/workbuddy/Create-Task' },
    { id: 'E12', name: '左侧导航栏', org: 'WorkBuddy 功能说明 · 2026-11-24 读取', note: '文档用「更多」，用户截图用「发现」；命名差异单独记录，未实测点击。', url: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Sidebar' },
    { id: 'E13', name: '新建任务栏', org: 'WorkBuddy 功能说明 · 2026-11-24 读取', note: '工作模式、材料输入、模型入口、工作空间、权限；文档说明不等于已点击验证。', url: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Task-Bar' },
    { id: 'E14', name: '结果查看', org: 'WorkBuddy 文档 · 2026-11-24 读取', note: '产物、网页、工作空间文件、变更；不保证纯文字任务必定生成文件。', url: 'https://www.workbuddy.cn/docs/workbuddy/Results' },
    { id: 'E15', name: '任务管理', org: 'WorkBuddy 文档 · 2026-11-24 读取', note: '查找并继续任务；文档「任务／空间」与截图「最近／分组」分开记录。', url: 'https://www.workbuddy.cn/docs/workbuddy/Task-Management' }
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const pad2 = n => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slides = $$('.slide');
  const total = slides.length;
  const data = slides.map((s, i) => ({
    el: s,
    index: i,
    id: s.id,
    ch: s.dataset.ch || '',
    title: s.dataset.title || s.id,
    min: parseInt(s.dataset.min, 10) || 0,
    src: (s.dataset.src || '').split(',').filter(Boolean)
  }));

  /* 章节（按出现顺序聚合），时长由逐页分钟求和 */
  const chapters = [];
  data.forEach(d => {
    let c = chapters.find(x => x.name === d.ch);
    if (!c) { c = { name: d.ch, pages: [], min: 0 }; chapters.push(c); }
    c.pages.push(d.index);
    c.min += d.min;
  });
  const totalMin = data.reduce((a, d) => a + d.min, 0);
  if (totalMin !== 70 || total !== 24) {
    console.warn('[deck] 规格校验：页数/分钟与 SPEC 不符', { total, totalMin, chapters });
  }

  /* 逐项揭示的错峰参数 + SVG 描线长度 */
  $$('[data-r]').forEach(el => el.style.setProperty('--r', el.dataset.r || 0));
  $$('.draw path, path.draw').forEach(p => {
    try {
      const len = Math.max(40, Math.ceil(p.getTotalLength()));
      p.style.setProperty('--len', len);
    } catch (e) { p.style.setProperty('--len', 180); }
  });

  /* ---------- 元素 ---------- */
  const barPage = $('#barPage');
  const btnPrev = $('#btnPrev');
  const btnNext = $('#btnNext');
  const btnIndex = $('#btnIndex');
  const btnSources = $('#btnSources');
  const btnHome = $('#btnHome');
  const progressFill = $('#progressFill');
  const topmarkCh = $('#topmarkCh');
  const timeline = $('#timeline');
  const indexList = $('#indexList');
  const sourceList = $('#sourceList');
  const indexPanel = $('#indexPanel');
  const sourcesPanel = $('#sourcesPanel');
  const backdrop = $('#drawerBackdrop');

  /* ---------- 目录 ---------- */
  chapters.forEach(c => {
    const g = document.createElement('div');
    g.className = 'index-group';
    const label = document.createElement('div');
    label.className = 'ig-label';
    label.innerHTML = `<span>${c.name}</span><span>${c.min} min · ${c.pages.length} 页</span>`;
    g.appendChild(label);
    c.pages.forEach(i => {
      const d = data[i];
      const b = document.createElement('button');
      b.className = 'index-item';
      b.dataset.target = i;
      b.innerHTML = `<span class="index-item-num">${pad2(i + 1)}</span><span>${d.title}</span><span class="index-item-min">${d.min}′</span>`;
      b.addEventListener('click', () => { goTo(i); closeDrawers(); });
      g.appendChild(b);
    });
    indexList.appendChild(g);
  });

  /* ---------- 来源面板 ---------- */
  SOURCES.forEach(s => {
    const row = document.createElement('div');
    row.className = 'source-row';
    row.innerHTML = `<span class="sr-n">${s.id}</span><div><b>${s.name}</b><span>${s.org}</span><span>${s.note}</span><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a></div>`;
    sourceList.appendChild(row);
  });
  const known = new Set(SOURCES.map(s => s.id));
  data.forEach(d => d.src.forEach(id => {
    if (!known.has(id)) console.warn('[deck] 未定义的来源编号', d.id, id);
  }));

  /* ---------- 分段进度 ---------- */
  chapters.forEach((c, i) => {
    const seg = document.createElement('span');
    seg.className = 'btm-seg';
    seg.style.flex = String(c.min);
    seg.dataset.label = `${c.name} · ${c.min}′`;
    seg.dataset.chapter = i;
    seg.title = `${c.name} · P${pad2(c.pages[0] + 1)}—P${pad2(c.pages[c.pages.length - 1] + 1)} · ${c.min} 分钟`;
    timeline.appendChild(seg);
  });
  const segs = $$('.btm-seg');
  const chapterOf = i => chapters.findIndex(c => c.pages.indexOf(i) !== -1);

  /* ---------- 抽屉 ---------- */
  function openDrawer(panel) {
    closeDrawers(true);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    if (panel === indexPanel) initAgendaChart();
  }
  function closeDrawers(skipBackdrop) {
    [indexPanel, sourcesPanel].forEach(p => { p.classList.remove('open'); p.setAttribute('aria-hidden', 'true'); });
    if (!skipBackdrop) backdrop.classList.remove('open');
  }
  btnIndex.addEventListener('click', () => openDrawer(indexPanel));
  btnSources.addEventListener('click', () => openDrawer(sourcesPanel));
  $('#btnIndexClose').addEventListener('click', () => closeDrawers());
  $('#btnSourcesClose').addEventListener('click', () => closeDrawers());
  backdrop.addEventListener('click', () => closeDrawers());

  /* ---------- 导航 ---------- */
  let current = 0;
  function updateUI() {
    const d = data[current];
    barPage.textContent = `${pad2(current + 1)} / ${pad2(total)}`;
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;
    progressFill.style.width = ((current + 1) / total * 100) + '%';
    topmarkCh.textContent = d.ch;
    const ci = chapterOf(current);
    segs.forEach((s, i) => {
      s.classList.toggle('visited', i < ci);
      s.classList.toggle('active', i === ci);
    });
    $$('.index-item').forEach(b => b.classList.toggle('active', +b.dataset.target === current));
  }

  function goTo(index, silent) {
    if (index < 0 || index >= total) return;
    slides.forEach(s => s.classList.remove('active'));
    current = index;
    const target = slides[current];
    void target.offsetWidth;               // 强制重排，重放逐项揭示与描线动画
    target.classList.add('active');
    target.scrollTop = 0;
    updateUI();
    if (!silent) {
      try { history.replaceState(null, '', '#' + target.id); } catch (e) { /* file:// 下忽略 */ }
    }
    if (target.id === 'p02') initTallyChart();
    onSlideEnter(target.id);
  }
  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));
  btnHome.addEventListener('click', () => goTo(0));

  /* 键盘：输入框/可编辑区聚焦时不误翻页 */
  function typing(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' ||
      el.isContentEditable || (el.closest && el.closest('[contenteditable="true"]'));
  }
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typing(e.target)) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); goTo(current + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); goTo(current - 1); }
    else if (k === 'Home') { e.preventDefault(); goTo(0); }
    else if (k === 'End') { e.preventDefault(); goTo(total - 1); }
    else if (k === 'Escape') { closeDrawers(); }
    else if (k === 'i' || k === 'I') { indexPanel.classList.contains('open') ? closeDrawers() : openDrawer(indexPanel); }
    else if (k === 's' || k === 'S') { sourcesPanel.classList.contains('open') ? closeDrawers() : openDrawer(sourcesPanel); }
  });

  /* 触屏横向滑动 */
  let tx = 0, ty = 0;
  const deck = $('#deck');
  deck.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* hash 恢复位置 */
  const fromHash = () => {
    const m = /^#p(\d{2})$/.exec(location.hash || '');
    if (!m) return 0;
    const i = parseInt(m[1], 10) - 1;
    return (i >= 0 && i < total) ? i : 0;
  };
  window.addEventListener('hashchange', () => { const i = fromHash(); if (i !== current) goTo(i, true); });

  /* ---------- 复制按钮 ---------- */
  function copyText(text, btn) {
    const done = () => { const old = btn.textContent; btn.textContent = '已复制 ✓'; setTimeout(() => { btn.textContent = old; }, 1600); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = '请手动选择复制'; }
      ta.remove();
    }
  }
  $$('.copy-btn').forEach(b => b.addEventListener('click', () => {
    const el = document.getElementById(b.dataset.copy);
    if (el) copyText(el.textContent.trim(), b);
  }));

  /* ---------- Chart.js：现场举手计数（默认全 0，不伪造数据） ---------- */
  let tallyChart = null;
  const tallyLabels = ['通知 / 消息', '会议记录', '表格 / 资料'];
  const tallyCounts = [0, 0, 0];
  const tallyEmpty = $('#tallyEmpty');

  function initTallyChart() {
    if (tallyChart || typeof Chart === 'undefined') return;
    const cv = $('#tallyChart');
    if (!cv) return;
    tallyChart = new Chart(cv, {
      type: 'bar',
      data: {
        labels: tallyLabels,
        datasets: [{
          label: '举手人数', data: tallyCounts.slice(),
          backgroundColor: ['rgba(20,110,245,.85)', 'rgba(20,110,245,.55)', 'rgba(20,110,245,.3)'],
          borderColor: '#146ef5', borderWidth: 1, borderRadius: 4, barThickness: 22
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        animation: { duration: reduceMotion ? 0 : 480 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x} 人` } } },
        scales: {
          x: { beginAtZero: true, suggestedMax: 10, grid: { color: 'rgba(8,8,8,.07)' }, border: { display: false }, ticks: { color: '#8d8d8d', font: { size: 11 }, precision: 0 } },
          y: { grid: { display: false }, border: { display: false }, ticks: { color: '#5a5a5a', font: { size: 12 } } }
        }
      }
    });
  }
  $$('.tally-btn').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.tally;
    tallyCounts[i] += 1;
    if (tallyChart) tallyChart.data.datasets[0].data = tallyCounts.slice(), tallyChart.update();
    tallyEmpty.classList.toggle('hide', tallyCounts.some(v => v > 0));
    b.animate && !reduceMotion && b.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.985)' }, { transform: 'scale(1)' }],
      { duration: 220, easing: 'ease-out' }
    );
  }));
  $('#tallyReset').addEventListener('click', () => {
    tallyCounts.fill(0);
    if (tallyChart) tallyChart.data.datasets[0].data = tallyCounts.slice(), tallyChart.update();
    tallyEmpty.classList.remove('hide');
  });

  /* ---------- Chart.js：目录里的主讲时间分配（真实规格数据） ---------- */
  let agendaChart = null;
  function initAgendaChart() {
    if (agendaChart || typeof Chart === 'undefined') return;
    const cv = $('#agendaChart');
    if (!cv) return;
    agendaChart = new Chart(cv, {
      type: 'bar',
      data: {
        labels: chapters.map(c => c.name),
        datasets: [{
          label: '分钟', data: chapters.map(c => c.min),
          backgroundColor: chapters.map((c, i) => i === 3 ? '#146ef5' : 'rgba(20,110,245,.28)'),
          borderRadius: 3, barThickness: 14
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: reduceMotion ? 0 : 600 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y} 分钟` } } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(8,8,8,.06)' }, border: { display: false }, ticks: { color: '#8d8d8d', font: { size: 10 }, stepSize: 10 } },
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#5a5a5a', font: { size: 10 }, maxRotation: 0, autoSkip: false } }
        }
      }
    });
  }

  /* ---------- three.js：封面线框动效 ---------- */
  let hero = null;
  function onSlideEnter(id) {
    if (hero) hero.setActive(id === 'p01');
  }
  function initHero() {
    const holder = $('#hero3d');
    if (!holder) return;
    if (typeof THREE === 'undefined') { holder.classList.add('is-fallback'); return; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) { holder.classList.add('is-fallback'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    holder.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    const group = new THREE.Group();
    scene.add(group);

    const blue = 0x146ef5;
    const outer = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.45, 1)),
      new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.58 })
    );
    group.add(outer);

    const inner = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.55, 0)),
      new THREE.LineBasicMaterial({ color: 0x080808, transparent: true, opacity: 0.22 })
    );
    group.add(inner);

    const ringPts = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * 3.35, Math.sin(a) * 3.35, 0));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.32 })
    );
    ring.rotation.set(Math.PI / 2.6, 0.25, 0);
    group.add(ring);

    const ring2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts.map(p => p.clone().multiplyScalar(0.86))),
      new THREE.LineBasicMaterial({ color: 0x080808, transparent: true, opacity: 0.1 })
    );
    ring2.rotation.set(Math.PI / 2.1, -0.3, 0.5);
    group.add(ring2);

    /* 稀疏点云：确定性分布，避免每次刷新跳动 */
    const pos = [];
    for (let i = 0; i < 110; i++) {
      const a = i * 2.399963;                       // 黄金角
      const y = 1 - (i / 109) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const rad = 2.75 + (i % 7) * 0.09;
      pos.push(Math.cos(a) * r * rad, y * rad, Math.sin(a) * r * rad);
    }
    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const cloud = new THREE.Points(cloudGeo,
      new THREE.PointsMaterial({ color: blue, size: 0.062, transparent: true, opacity: 0.82, sizeAttenuation: true }));
    group.add(cloud);

    /* 少量更亮节点，给线框一个视觉重心 */
    const accentPts = [];
    for (let i = 0; i < pos.length; i += 3) {
      if ((i / 3) % 11 === 0) accentPts.push(pos[i], pos[i + 1], pos[i + 2]);
    }
    const accents = new THREE.BufferGeometry();
    accents.setAttribute('position', new THREE.Float32BufferAttribute(accentPts, 3));
    group.add(new THREE.Points(accents,
      new THREE.PointsMaterial({ color: blue, size: 0.15, transparent: true, opacity: 0.95, sizeAttenuation: true })));

    let active = true, raf = 0, px = 0, py = 0, cx = 0, cy = 0;
    function resize() {
      const w = holder.clientWidth || 480, h = holder.clientHeight || 480;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    function frame(t) {
      if (!active) return;
      outer.rotation.y = t * 0.00013;
      outer.rotation.x = Math.sin(t * 0.00017) * 0.18;
      inner.rotation.y = -t * 0.0002;
      inner.rotation.z = t * 0.00009;
      ring.rotation.z = t * 0.00012;
      ring2.rotation.z = -t * 0.00008;
      cloud.rotation.y = -t * 0.00007;
      cx += (px - cx) * 0.045; cy += (py - cy) * 0.045;
      group.rotation.x = cy * 0.16;
      group.rotation.y += (px * 0.18 - group.rotation.y) * 0.01 + 0.0006;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener('pointermove', e => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(holder);
    resize();
    if (!reduceMotion) raf = requestAnimationFrame(frame);

    hero = {
      setActive(v) {
        active = v;
        if (v && !reduceMotion && !raf) raf = requestAnimationFrame(frame);
        if (v) resize();
      }
    };
  }

  /* ---------- 启动 ---------- */
  initHero();
  goTo(fromHash(), true);
  console.info('[deck] 就绪：', total, '页 /', totalMin, '分钟 /', chapters.length, '段；离线依赖已本地化。');
})();
