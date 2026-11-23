const CATALOG_URL = '../../literature/catalog.json';
const MIN_FONT_SIZE = 17;
const MAX_FONT_SIZE = 26;
const DEFAULT_FONT_SIZE = 20;
const mobileToc = window.matchMedia('(max-width: 860px)');
let readerReady = false;
let layoutFrame = 0;

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isFictionDocument(item) {
  return ['短篇小说', '中篇小说', '长篇小说'].includes(item.kind);
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
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
  const button = document.getElementById('theme-toggle');
  button.textContent = value === 'dark' ? '深色' : '浅色';
  button.setAttribute('aria-pressed', String(value === 'dark'));
  button.setAttribute('aria-label', value === 'dark' ? '当前深色，切换为浅色' : '当前浅色，切换为深色');
  try { localStorage.setItem('literature-theme', value); } catch (error) {}
}

function getFontSize() {
  const value = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--reading-size'), 10);
  return Number.isFinite(value) ? value : DEFAULT_FONT_SIZE;
}

function setFontSize(value) {
  const size = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Number.isFinite(value) ? Math.round(value) : DEFAULT_FONT_SIZE));
  document.documentElement.style.setProperty('--reading-size', `${size}px`);
  document.getElementById('font-size').textContent = `${size} px`;
  document.getElementById('font-smaller').disabled = size === MIN_FONT_SIZE;
  document.getElementById('font-larger').disabled = size === MAX_FONT_SIZE;
  try { localStorage.setItem('literature-font-size', String(size)); } catch (error) {}
  scheduleLayoutUpdate();
}

function setFontFamily(value) {
  const family = value === 'sans' ? 'sans' : 'serif';
  document.documentElement.dataset.readingFont = family;
  document.getElementById('font-family').value = family;
  try { localStorage.setItem('literature-font-family', family); } catch (error) {}
  scheduleLayoutUpdate();
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
    window.marked.setOptions({ gfm: true, breaks: false });
    return window.DOMPurify.sanitize(window.marked.parse(markdown), {
      USE_PROFILES: { html: true }
    });
  }
  return `<pre class="raw-markdown">${escapeHtml(markdown)}</pre>`;
}

function resolveMarkdownLinks(catalog, current) {
  const siteRoot = new URL('../../', window.location.href);
  const sourceUrl = new URL(current.source, siteRoot);
  const registered = new Map((catalog.items || [])
    .filter(item => isAllowedSource(item.source))
    .map(item => [new URL(item.source, siteRoot).pathname, item.id]));

  document.querySelectorAll('#markdown-body a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    let target;
    try { target = new URL(href, sourceUrl); } catch (error) { return; }
    if (target.origin !== siteRoot.origin || !target.pathname.toLowerCase().endsWith('.md')) return;
    const id = registered.get(target.pathname);
    if (id) {
      link.setAttribute('href', `reader.html?id=${encodeURIComponent(id)}${target.hash}`);
    } else {
      const path = `${target.pathname}${target.search}${target.hash}`;
      link.setAttribute('href', path.startsWith('//') ? target.href : path);
    }
  });
}

function prepareTables() {
  document.querySelectorAll('#markdown-body table').forEach((table, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    const caption = table.querySelector('caption');
    wrapper.setAttribute('aria-label', `${caption ? caption.textContent : `表格 ${index + 1}`}，可横向滚动`);
    table.before(wrapper);
    wrapper.append(table);
  });
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
  document.querySelector('.toc').hidden = headings.length === 0;
  document.querySelector('.reader-layout').classList.toggle('no-toc', headings.length === 0);
  document.getElementById('toc-disclosure').open = !mobileToc.matches;
  const used = new Set();

  headings.forEach((heading, index) => {
    const base = slugHeading(heading.textContent, index);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    heading.id = id;
    heading.tabIndex = -1;
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
      links.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      const active = links.get(visible.target.id);
      if (active) {
        active.classList.add('active');
        active.setAttribute('aria-current', 'location');
      }
    }, { rootMargin: '-15% 0px -70% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
}

function scrollToCurrentHeading() {
  if (!window.location.hash) return;
  let id;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (error) { return; }
  const target = document.getElementById(id);
  if (target && document.getElementById('markdown-body').contains(target)) {
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
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
  readerReady = false;
  const sourceLink = document.getElementById('source-link');
  sourceLink.hidden = true;
  sourceLink.removeAttribute('href');
  document.getElementById('article-masthead').hidden = true;
  document.getElementById('markdown-body').innerHTML = `<div class="reader-error"><p>${escapeHtml(message)}</p><a href="index.html">返回作品目录</a></div>`;
  document.getElementById('markdown-body').setAttribute('aria-busy', 'false');
  document.getElementById('reader-current').textContent = '无法打开';
  document.getElementById('reader-status').textContent = '无法打开正文，请检查网络后重试，或返回目录选择作品。';
  document.querySelector('.toc').hidden = true;
  document.querySelector('.reader-layout').classList.add('no-toc');
  document.getElementById('reader-end').hidden = true;
  updateProgress();
}

function updateProgress() {
  let progress = 0;
  if (readerReady) {
    const body = document.getElementById('markdown-body').getBoundingClientRect();
    const barHeight = document.querySelector('.reader-bar').getBoundingClientRect().height;
    const start = Math.max(0, body.top + window.scrollY - barHeight);
    const end = body.bottom + window.scrollY - window.innerHeight;
    progress = end > start ? (window.scrollY - start) / (end - start) : (body.bottom <= window.innerHeight ? 1 : 0);
  }
  document.getElementById('reading-progress').style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;
}

function updateLayout() {
  const height = Math.ceil(document.querySelector('.reader-bar').getBoundingClientRect().height);
  document.documentElement.style.setProperty('--reader-bar-height', `${height}px`);
  updateProgress();
}

function scheduleLayoutUpdate() {
  if (layoutFrame) return;
  layoutFrame = requestAnimationFrame(() => {
    layoutFrame = 0;
    updateLayout();
  });
}

async function boot() {
  try {
    const catalogResponse = await fetch(CATALOG_URL);
    if (!catalogResponse.ok) throw new Error(`目录加载失败：HTTP ${catalogResponse.status}`);
    const catalog = await catalogResponse.json();
    const current = (catalog.items || []).find(item => item.id === getDocumentId());
    if (!current) throw new Error('没有找到这份作品或创作记录。');
    if (!isAllowedSource(current.source)) throw new Error('创作源路径不符合安全规则。');

    const sourceUrl = `../../${current.source}`;
    const markdownResponse = await fetch(sourceUrl);
    if (!markdownResponse.ok) throw new Error(`正文加载失败：HTTP ${markdownResponse.status}`);
    const markdown = await markdownResponse.text();
    const isFiction = isFictionDocument(current);

    document.title = `${current.title} · 文学与创作`;
    document.querySelector('.reader-layout').classList.toggle('fiction', isFiction);
    document.getElementById('reader-current').textContent = current.title;
    document.getElementById('article-label').textContent = `${current.kind} · ${current.status}`;
    document.getElementById('article-title').textContent = current.title;
    const subtitle = document.getElementById('article-subtitle');
    subtitle.textContent = isFiction ? '' : (current.subtitle || '');
    subtitle.hidden = isFiction || !current.subtitle;
    document.getElementById('article-info').innerHTML = `
      ${current.date ? `<time datetime="${escapeHtml(current.date)}">${escapeHtml(current.date)}</time>` : ''}
      <span>约 ${estimateReadingTime(markdown)} 分钟</span>
    `;
    const sourceLink = document.getElementById('source-link');
    sourceLink.href = sourceUrl;
    sourceLink.hidden = false;
    document.getElementById('markdown-body').innerHTML = renderMarkdown(markdown);
    document.getElementById('markdown-body').setAttribute('aria-busy', 'false');
    const richText = Boolean(window.marked && window.DOMPurify);
    document.getElementById('reader-status').textContent = richText ? '' : '阅读排版组件未能加载，下面显示未排版原文；也可使用上方的 Markdown 链接。';

    resolveMarkdownLinks(catalog, current);
    prepareTables();
    buildToc();
    renderRelated(catalog, current);
    readerReady = true;
    updateLayout();
    scrollToCurrentHeading();
    scheduleLayoutUpdate();
  } catch (error) {
    console.error(error);
    showError(error.message || '阅读页面加载失败，请稍后重试。');
  }
}

setTheme(document.documentElement.dataset.theme);
setFontSize(getFontSize());
setFontFamily(document.documentElement.dataset.readingFont);

document.getElementById('font-smaller').addEventListener('click', () => setFontSize(getFontSize() - 1));
document.getElementById('font-larger').addEventListener('click', () => setFontSize(getFontSize() + 1));
document.getElementById('font-family').addEventListener('change', event => setFontFamily(event.target.value));
document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
document.getElementById('toc-list').addEventListener('click', event => {
  if (mobileToc.matches && event.target.closest('a')) {
    document.getElementById('toc-disclosure').open = false;
    updateLayout();
  }
});
document.getElementById('toc-disclosure').addEventListener('toggle', scheduleLayoutUpdate);
mobileToc.addEventListener('change', () => {
  document.getElementById('toc-disclosure').open = !mobileToc.matches;
  scheduleLayoutUpdate();
});
window.addEventListener('scroll', scheduleLayoutUpdate, { passive: true });
window.addEventListener('resize', scheduleLayoutUpdate);
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(scheduleLayoutUpdate);
  observer.observe(document.querySelector('.reader-bar'));
  observer.observe(document.getElementById('markdown-body'));
}
if (document.fonts) document.fonts.ready.then(scheduleLayoutUpdate);
boot();
