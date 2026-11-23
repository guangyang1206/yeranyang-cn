const fallbackCatalog = {
  updatedAt: '2026-11-23',
  items: [
    {
      id: 'huanqiu-hotel-draft',
      title: '环球饭店',
      subtitle: '告别结束以后，人们还在门口站了一会儿。',
      kind: '短篇小说',
      status: '定稿',
      date: '2026-11-23',
      featured: true,
      order: 0
    },
    {
      id: 'creative-charter',
      title: '创作总纲',
      subtitle: '让人物自己活起来，让思想从命运中生长出来',
      kind: '创作总纲',
      status: '持续维护',
      date: '2026-11-23',
      featured: true,
      order: 1
    },
    {
      id: 'huanqiu-hotel-concept',
      title: '《环球饭店》：内核与故事梗概',
      subtitle: '一个跨世纪县城孩子，在流量、尊严与现实之间重新理解理想',
      kind: '短篇构思',
      status: '第三版',
      date: '2026-11-23',
      featured: false,
      order: 2
    },
    {
      id: 'huanqiu-hotel-characters',
      title: '《环球饭店》人物档案',
      subtitle: '人物各有未完成的生活，不只为另一个人的成长而存在',
      kind: '人物档案',
      status: '第三版',
      date: '2026-11-23',
      featured: false,
      order: 3
    },
    {
      id: 'huanqiu-hotel-outline',
      title: '《环球饭店》情节大纲',
      subtitle: '从老师的告别仪式，到清晨在医院外翻阅材料',
      kind: '情节大纲',
      status: '第三版',
      date: '2026-11-23',
      featured: false,
      order: 4
    },
    {
      id: 'huanqiu-hotel-geography-ritual',
      title: '《环球饭店》地理原型与仪式设计',
      subtitle: '无名的太行山南麓县城，以及葬礼在故事中的六层意义',
      kind: '创作设计',
      status: '已补现实参照',
      date: '2026-11-23',
      featured: false,
      order: 5
    },
    {
      id: 'huanqiu-hotel-first-draft-notes',
      title: '《环球饭店》第一稿侧记',
      subtitle: '建议先读小说：未采用的情节、人物的余地与尚待核实的现实细节',
      kind: '创作侧记',
      status: '修订记录',
      date: '2026-11-23',
      featured: false,
      order: 6
    }
  ]
};

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function readerUrl(id) {
  return `reader.html?id=${encodeURIComponent(id)}`;
}

function renderCatalog(catalog) {
  const items = [...(catalog.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const isFiction = item => ['短篇小说', '中篇小说', '长篇小说'].includes(item.kind);
  const featured = items.filter(isFiction);
  const archive = items.filter(item => !isFiction(item));

  document.getElementById('featured-count').textContent = `${featured.length} 篇作品`;
  document.getElementById('archive-count').textContent = `${archive.length} 份创作记录`;
  document.getElementById('updated-at').textContent = `烨然漫笔 · 文学与创作 · 更新于 ${catalog.updatedAt || '—'}`;

  document.getElementById('featured-grid').innerHTML = featured.map(item => `
    <a class="work-card" href="${readerUrl(item.id)}">
      <div class="work-meta">
        <span class="work-kind">${escapeHtml(item.kind)}</span>
        <span>${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.subtitle)}</p>
      <span class="work-open">读这篇小说 →</span>
    </a>
  `).join('') || '<div class="load-state">作品尚在书写，可以先翻阅下面的创作记录。</div>';

  document.getElementById('archive-list').innerHTML = archive.map(item => `
    <a class="archive-item" href="${readerUrl(item.id)}">
      <span class="archive-kind">${escapeHtml(item.kind)}</span>
      <span class="archive-title">${escapeHtml(item.title)}</span>
      <span class="archive-status">${escapeHtml(item.status)}</span>
    </a>
  `).join('') || '<div class="load-state">更多创作记录会在这里慢慢生长。</div>';
  document.getElementById('featured-grid').setAttribute('aria-busy', 'false');
  document.getElementById('archive-list').setAttribute('aria-busy', 'false');
}

function setTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
  const button = document.getElementById('theme-toggle');
  button.textContent = value === 'dark' ? '深色' : '浅色';
  button.setAttribute('aria-pressed', String(value === 'dark'));
  button.setAttribute('aria-label', value === 'dark' ? '当前深色，切换为浅色' : '当前浅色，切换为深色');
  try { localStorage.setItem('literature-theme', value); } catch (error) {}
}

async function boot() {
  let catalog = fallbackCatalog;
  const status = document.getElementById('catalog-status');
  try {
    const response = await fetch('../../literature/catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const loaded = await response.json();
    if (!Array.isArray(loaded.items)) throw new Error('Invalid catalog');
    catalog = loaded;
    status.textContent = '';
  } catch (error) {
    console.warn('Using the built-in literature catalog snapshot:', error);
    status.textContent = '暂时无法更新作品目录，下面显示已保存的目录；打开正文仍需网络连接。';
  }
  renderCatalog(catalog);
}

setTheme(document.documentElement.dataset.theme);
document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
boot();
