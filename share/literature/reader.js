const CATALOG_URL = '../../literature/catalog.json';
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 19;

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function getDocumentId() {
  return new URLSearchParams(window.location.search).get('id') || 'creative-charter';
}

function isAllowedSource(source) {
  return typeof source === 'string' &&
    source.startsWith('literature/') &&
    source.endsWith('.md') &&
    !source.includes('..') &&
    /^[A-Za-z0-9._\/-]+$/.test(source);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('literature-theme', theme); } catch (error) {}
}

function getFontSize() {
  const value = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--reading-size'), 10);
  return Number.isFinite(value) ? value : DEFAULT_FONT_SIZE;
}

function setFontSize(value) {
  const size = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
  document.documentElement.style.setProperty('--reading-size', `${size}px`);
  try { localStorage.setItem('literature-font-size', String(size)); } catch (error) {}
}

function estimateReadingTime(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/[#>*_\[\]()|~-]/g, ' ');
  const cjk = (plain.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (plain.match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil((cjk + latinWords * 2) / 500));
}

function renderMarkdown(markdown) {
  if (window.marked && window.DOMPurify) {
    marked.setOptions({ gfm: true, breaks: false });
    return DOMPurify.sanitize(marked.parse(markdown), {
      USE_PROFILES: { html: true }
    });
  }
  return `<pre class="raw-markdown">${escapeHtml(markdown)}</pre>`;
}

function slugHeading(text, index) {
  const base = text.trim()
    .toLowerCase()
    .replace(/[^\u3400-\u9fff\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `section-${index + 1}`;
}

function buildToc() {
  const headings = [...document.querySelectorAll('#markdown-body h2, #markdown-body h3')];
  const toc = document.getElementById('toc-list');
  const used = new Map();

  headings.forEach((heading, index) => {
    let id = slugHeading(heading.textContent, index);
    const count = used.get(id) || 0;
    used.set(id, count + 1);
    if (count) id = `${id}-${count + 1}`;
    heading.id = id;
  });

  toc.innerHTML = headings.map(heading => `
    <a class="level-${heading.tagName === 'H3' ? '3' : '2'}" href="#${encodeURIComponent(heading.id)}" data-target="${escapeHtml(heading.id)}">
      ${escapeHtml(heading.textContent)}
    </a>
  `).join('');

  if ('IntersectionObserver' in window) {
    const links = new Map([...toc.querySelectorAll('a')].map(link => [link.dataset.target, link]));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (!visible) return;
      links.forEach(link => link.classList.remove('active'));
      const active = links.get(visible.target.id);
      if (active) active.classList.add('active');
    }, { rootMargin: '-15% 0px -70% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
}

function renderRelated(catalog, current) {
  const related = (catalog.items || [])
    .filter(item => item.workId === current.workId && item.id !== current.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!related.length) return;

  document.getElementById('related-list').innerHTML = related.map(item => `
    <a href="reader.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.title)} →</a>
  `).join('');
  document.getElementById('reader-end').hidden = false;
}

function showError(message) {
  document.getElementById('article-masthead').hidden = true;
  document.getElementById('markdown-body').innerHTML = `<div class="reader-error">${escapeHtml(message)}</div>`;
  document.getElementById('reader-current').textContent = '无法打开';
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.getElementById('reading-progress').style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

async function boot() {
  try {
    const catalogResponse = await fetch(CATALOG_URL);
    if (!catalogResponse.ok) throw new Error(`目录加载失败：HTTP ${catalogResponse.status}`);
    const catalog = await catalogResponse.json();
    const current = (catalog.items || []).find(item => item.id === getDocumentId());
    if (!current) throw new Error('没有找到这份创作档案。');
    if (!isAllowedSource(current.source)) throw new Error('创作源路径不符合安全规则。');

    const sourceUrl = `../../${current.source}`;
    const markdownResponse = await fetch(sourceUrl);
    if (!markdownResponse.ok) throw new Error(`正文加载失败：HTTP ${markdownResponse.status}`);
    const markdown = await markdownResponse.text();

    document.title = `${current.title} · 文学与创作`;
    document.getElementById('reader-current').textContent = current.title;
    document.getElementById('article-label').textContent = `${current.kind} · ${current.status}`;
    document.getElementById('article-title').textContent = current.title;
    document.getElementById('article-subtitle').textContent = current.subtitle || '';
    document.getElementById('article-info').innerHTML = `
      <span>${escapeHtml(current.date || '')}</span>
      <span>约 ${estimateReadingTime(markdown)} 分钟</span>
      <span>源文件：Markdown</span>
    `;
    document.getElementById('source-link').href = sourceUrl;
    document.getElementById('markdown-body').innerHTML = renderMarkdown(markdown);

    buildToc();
    renderRelated(catalog, current);
    updateProgress();
  } catch (error) {
    console.error(error);
    showError(error.message || '阅读页面加载失败，请稍后重试。');
  }
}

const initialTheme = document.documentElement.dataset.theme || 'light';
setTheme(initialTheme);
setFontSize(getFontSize());

document.getElementById('font-smaller').addEventListener('click', () => setFontSize(getFontSize() - 1));
document.getElementById('font-larger').addEventListener('click', () => setFontSize(getFontSize() + 1));
document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
boot();
