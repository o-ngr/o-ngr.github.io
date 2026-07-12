/* ═══════════════════════════════════════════════════
   LINK DATA
   フィールド：
     id       : 連番※重複不可
     title    : 表示名
     desc     : 説明文
     url      : リンク先URL
     category : 'tools' | 'extra' | 'design' | 'game'
   ═══════════════════════════════════════════════════ */
const LINKS = [
  { id:1, title:'Latest News',         desc:'最新情報を確認できます',         url:'/page/news.html',        category:'extra' },
  { id:2, title:'Game List',           desc:'公開中のゲーム一覧',             url:'/page/gamelist.html',    category:'tools' },
  { id:3, title:'Tool List',           desc:'公開中のツール一覧',             url:'/page/toollist.html',    category:'tools' },
  { id:4, title:'Article List',        desc:'公開中の記事一覧',               url:'/page/articlelist.html', category:'tools' },
  { id:5, title:'Notepad app',         desc:'高機能なメモ帳',                 url:'/tools/notepad.html',    category:'tools' },
  { id:6, title:'Source code viewer',  desc:'ソースコードを確認',             url:'/tools/sauceview.html',  category:'tools' },
  { id:7, title:'Proxy tool',          desc:'プロキシ通信が可能',             url:'/tools/proxy.html',      category:'tools' },
  { id:8, title:'Link collection',     desc:'ショートカット一覧 (外部)',       url:'https://a-b-c.3do1.jp/', category:'tools' },
  { id:9, title:'Link collection 2',   desc:'ショートカット一覧',             url:'/page/links.html',       category:'tools' },
];

/* カテゴリの表示名マップ */
const CAT_LABELS = {
  all:'すべて', tools:'ツール', extra:'その他', design:'デザイン', game:'ゲーム'
};

/* ===STATE=== */
const state = {
  favorites: JSON.parse(localStorage.getItem('o-ngr-favs') || '[]'),
  tab: 'all',
  query: '',
  sort: 'default'
};

/* ===HELPERS=== */
function getFiltered() {
  let f = LINKS;
  if (state.tab !== 'all') f = f.filter(l => l.category === state.tab);
  if (state.query) {
    const q = state.query.toLowerCase();
    f = f.filter(l => l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q));
  }
  if (state.sort === 'name')   f = [...f].sort((a,b) => a.title.localeCompare(b.title,'ja'));
  if (state.sort === 'recent') f = [...f].sort((a,b) => b.id - a.id);
  return f;
}

function countByTab(tab) {
  return tab === 'all' ? LINKS.length : LINKS.filter(l => l.category === tab).length;
}

function dispUrl(url) {
  try { return new URL(url).hostname || url; } catch { return url; }
}

/* ===RENDER GRID=== */
function renderGrid() {
  const f = getFiltered();
  const grid = document.getElementById('grid');
  document.getElementById('mainTitle').textContent = CAT_LABELS[state.tab] || state.tab;
  document.getElementById('resultCount').textContent = `${f.length} 件`;

  if (!f.length) {
    grid.innerHTML = `<div class="empty">リンクが見つかりません</div>`;
    return;
  }
  grid.innerHTML = f.map(l => {
    const fav = state.favorites.includes(l.id);
    return `<div class="card" data-url="${l.url}" data-id="${l.id}">
      <div class="card-top">
        <h3 class="card-title">${l.title}</h3>
        <span class="card-cat">${CAT_LABELS[l.category] || l.category}</span>
      </div>
      <p class="card-desc">${l.desc}</p>
      <div class="card-foot">
        <span class="card-url">${dispUrl(l.url)}</span>
        <button class="fav-btn ${fav?'active':''}" data-id="${l.id}" aria-label="お気に入り">&#x2605;</button>
      </div>
    </div>`;
  }).join('');
}

/* ===RENDER FAV PANEL=== */
function favItemHTML(l) {
  return `<div class="fav-item">
    <a href="${l.url}" class="fav-link" target="_blank" rel="noopener">${l.title}</a>
    <button class="fav-rm" data-remove-id="${l.id}" aria-label="削除">&#x00D7;</button>
  </div>`;
}

function renderFavPanels() {
  const favs = LINKS.filter(l => state.favorites.includes(l.id));
  const total = LINKS.length;
  const count = favs.length;
  const html = favs.length
    ? favs.map(favItemHTML).join('')
    : `<p class="fav-empty">&#x2605; マークをクリックして<br>お気に入りを追加できます</p>`;

  // Desktop
  document.getElementById('rpCount').textContent = count;
  document.getElementById('rpTotal').textContent = total;
  document.getElementById('rpFavList').innerHTML = html;
  // Mobile
  document.getElementById('mpCount').textContent = count;
  document.getElementById('mpFavList').innerHTML = html;
}

/* ===RENDER NAV COUNTS=== */
function renderNavCounts() {
  document.querySelectorAll('[data-count]').forEach(el => {
    el.textContent = countByTab(el.dataset.count);
  });
}

function renderAll() { renderGrid(); renderFavPanels(); }

/* ===FAVORITES=== */
function toggleFav(id) {
  const i = state.favorites.indexOf(id);
  i > -1 ? state.favorites.splice(i,1) : state.favorites.push(id);
  localStorage.setItem('o-ngr-favs', JSON.stringify(state.favorites));
  renderAll();
}

/* ===TAB SWITCH=== */
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.mob-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderGrid();
}

/* ===MOBILE PANEL=== */
function openMpanel() {
  document.getElementById('mpanel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMpanel() {
  document.getElementById('mpanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
}

/* ===EVENTS=== */
document.addEventListener('click', e => {
  // fav button
  const fb = e.target.closest('.fav-btn');
  if (fb) { e.stopPropagation(); toggleFav(parseInt(fb.dataset.id)); return; }
  // fav remove
  const rm = e.target.closest('.fav-rm');
  if (rm) { e.stopPropagation(); toggleFav(parseInt(rm.dataset.removeId)); return; }
  // card open
  const card = e.target.closest('.card');
  if (card && !e.target.closest('.fav-btn')) window.open(card.dataset.url, '_blank');
});

document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
document.querySelectorAll('.mob-tab').forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

let debTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  state.query = e.target.value;
  clearTimeout(debTimer);
  debTimer = setTimeout(renderAll, 160);
});
document.getElementById('sortSel').addEventListener('change', e => {
  state.sort = e.target.value; renderAll();
});

document.getElementById('favPanelBtn').addEventListener('click', openMpanel);
document.getElementById('mpCloseBtn').addEventListener('click', closeMpanel);
document.getElementById('overlay').addEventListener('click', closeMpanel);
document.getElementById('logoBtn').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* Theme */
const mql = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(isLight) {
  document.body.classList.toggle('light', isLight);
}

function getOverride() {
  return localStorage.getItem('o-ngr-theme'); // 'light' | 'dark' | null(システムに追従)
}

// 初期表示：手動上書きがあればそれを優先、なければシステム設定に従う
applyTheme(getOverride() ? getOverride() === 'light' : !mql.matches);

// システムのダーク/ライト設定が変わったらリアルタイムで反映(手動上書き中は除く)
mql.addEventListener('change', e => {
  if (!getOverride()) applyTheme(!e.matches);
});

document.getElementById('themeBtn').addEventListener('click', () => {
  const nowLight = !document.body.classList.contains('light');
  applyTheme(nowLight);
  localStorage.setItem('o-ngr-theme', nowLight ? 'light' : 'dark');
});

/* Keyboard */
document.addEventListener('keydown', e => {
  if (e.key === '/' && e.target.tagName !== 'INPUT') { e.preventDefault(); document.getElementById('searchInput').focus(); }
  if (e.key === 'Escape') closeMpanel();
});

/* Init */
renderNavCounts();
renderAll();
