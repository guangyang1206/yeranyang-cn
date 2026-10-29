const fallbackCatalog = {
  updatedAt: '2026-10-29',
  items: [
    {
      id: 'creative-charter',
      title: '创作总纲',
      subtitle: '让人物自己活起来，让思想从命运中生长出来',
      kind: '创作总纲',
      status: '持续维护',
      date: '2026-10-29',
      featured: true,
      order: 1
    },
    {
      id: 'huanqiu-hotel-concept',
      title: '《环球饭店》：内核与故事梗概',
      subtitle: '一个跨世纪县城孩子，在流量、尊严与现实之间重新理解理想',
      kind: '短篇构思',
      status: '构思中',
      date: '2026-10-29',
      featured: true,
      order: 2
    },
    {
      id: 'huanqiu-hotel-characters',
      title: '《环球饭店》人物档案',
      subtitle: '周启明、杜海生、方老师与小禾的第一版人物关系',
      kind: '人物档案',
      status: '第一版',
      date: '2026-10-29',
      featured: false,
      order: 3
    },
    {
      id: 'huanqiu-hotel-outline',
      title: '《环球饭店》情节大纲',
      subtitle: '县城里的一夜，以及隐藏其下的三十年',
      kind: '情节大纲',
      status: '第一版',
      date: '2026-10-29',
      featured: false,
      order: 4
    }
  ]
};

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function readerUrl(id) {
  return `reader.html?id=${encodeURIComponent(id)}`;
}

function renderCatalog(catalog) {
  const items = [...(catalog.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const featured = items.filter(item => item.featured);
  const archive = items.filter(item => !item.featured);

  document.getElementById('featured-count').textContent = `${featured.length} 个入口`;
  document.getElementById('archive-count').textContent = `${archive.length} 份记录`;
  document.getElementById('updated-at').textContent = `烨然漫笔 · 文学与创作 · 更新于 ${catalog.updatedAt || '—'}`;

  document.getElementById('featured-grid').innerHTML = featured.map(item => `
    <a class="work-card" href="${readerUrl(item.id)}">
      <div class="work-meta">
        <span class="work-kind">${escapeHtml(item.kind)}</span>
        <span>${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.subtitle)}</p>
      <span class="work-open">开始阅读 →</span>
    </a>
  `).join('');

  document.getElementById('archive-list').innerHTML = archive.map(item => `
    <a class="archive-item" href="${readerUrl(item.id)}">
      <span class="archive-kind">${escapeHtml(item.kind)}</span>
      <span class="archive-title">${escapeHtml(item.title)}</span>
      <span class="archive-status">${escapeHtml(item.status)}</span>
    </a>
  `).join('') || '<div class="load-state">更多创作记录会在这里慢慢生长。</div>';
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '浅色' : '深色';
  try { localStorage.setItem('literature-theme', theme); } catch (error) {}
}

async function boot() {
  let catalog = fallbackCatalog;
  try {
    const response = await fetch('../../literature/catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalog = await response.json();
  } catch (error) {
    console.warn('使用内置文学目录快照：', error);
  }
  renderCatalog(catalog);
}

const initialTheme = document.documentElement.dataset.theme || 'light';
setTheme(initialTheme);
document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
boot();
