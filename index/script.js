"use strict";
/* ═══════════════════════════════════════════════════
   LINK DATA
   フィールド：
     id       : 連番※重複不可
     title    : 表示名
     desc     : 説明文
     url      : リンク先URL
     category : 'tools' | 'extra' | 'design' | 'game'
   ═══════════════════════════════════════════════════ */
// あとは今までのコード（stateやrenderGridなど）をそのまま残しておくだけでOK！
/* カテゴリの表示名マップ */
const CAT_LABELS = {
    all: 'すべて', tools: 'ツール', extra: 'その他', design: 'デザイン', game: 'ゲーム'
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
    if (state.tab !== 'all')
        f = f.filter(l => l.category === state.tab);
    if (state.query) {
        const q = state.query.toLowerCase();
        f = f.filter(l => l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q));
    }
    if (state.sort === 'name')
        f = [...f].sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    if (state.sort === 'recent')
        f = [...f].sort((a, b) => b.id - a.id);
    return f;
}
function countByTab(tab) {
    return tab === 'all' ? LINKS.length : LINKS.filter(l => l.category === tab).length;
}
function dispUrl(url) {
    try {
        return new URL(url).hostname || url;
    }
    catch {
        return url;
    }
}
/* ===RENDER GRID=== */
function renderGrid() {
    const f = getFiltered();
    const grid = document.getElementById('grid');
    const mainTitle = document.getElementById('mainTitle');
    const resultCount = document.getElementById('resultCount');
    if (mainTitle)
        mainTitle.textContent = CAT_LABELS[state.tab] || state.tab;
    if (resultCount)
        resultCount.textContent = `${f.length} 件`;
    if (!grid)
        return;
    if (!f.length) {
        grid.innerHTML = `<div class="empty">リンクが見つかりません</div>`;
        return;
    }
    grid.innerHTML = f.map((l) => {
        const fav = state.favorites.includes(l.id);
        return `<div class="card" data-url="${l.url}" data-id="${l.id}">
      <div class="card-top">
        <h3 class="card-title">${l.title}</h3>
        <span class="card-cat">${CAT_LABELS[l.category] || l.category}</span>
      </div>
      <p class="card-desc">${l.desc}</p>
      <div class="card-foot">
        <span class="card-url">${dispUrl(l.url)}</span>
        <button class="fav-btn ${fav ? 'active' : ''}" data-id="${l.id}" aria-label="お気に入り">&#x2605;</button>
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
    const rpCount = document.getElementById('rpCount');
    const rpTotal = document.getElementById('rpTotal');
    const rpFavList = document.getElementById('rpFavList');
    if (rpCount)
        rpCount.textContent = String(count);
    if (rpTotal)
        rpTotal.textContent = String(total);
    if (rpFavList)
        rpFavList.innerHTML = html;
    // Mobile
    const mpCount = document.getElementById('mpCount');
    const mpFavList = document.getElementById('mpFavList');
    if (mpCount)
        mpCount.textContent = String(count);
    if (mpFavList)
        mpFavList.innerHTML = html;
}
/* ===RENDER NAV COUNTS=== */
function renderNavCounts() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const element = el;
        if (element.dataset.count) {
            element.textContent = String(countByTab(element.dataset.count));
        }
    });
}
function renderAll() { renderGrid(); renderFavPanels(); }
/* ===FAVORITES=== */
function toggleFav(id) {
    const i = state.favorites.indexOf(id);
    i > -1 ? state.favorites.splice(i, 1) : state.favorites.push(id);
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
    const mpanel = document.getElementById('mpanel');
    const overlay = document.getElementById('overlay');
    if (mpanel && overlay) {
        mpanel.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}
function closeMpanel() {
    const mpanel = document.getElementById('mpanel');
    const overlay = document.getElementById('overlay');
    if (mpanel && overlay) {
        mpanel.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}
/* ===EVENTS=== */
document.addEventListener('click', e => {
    const target = e.target;
    // fav button
    const fb = target.closest('.fav-btn');
    if (fb && fb.dataset.id) {
        e.stopPropagation();
        toggleFav(parseInt(fb.dataset.id));
        return;
    }
    // fav remove
    const rm = target.closest('.fav-rm');
    if (rm && rm.dataset.removeId) {
        e.stopPropagation();
        toggleFav(parseInt(rm.dataset.removeId));
        return;
    }
    // card open
    const card = target.closest('.card');
    if (card && !target.closest('.fav-btn') && card.dataset.url)
        window.open(card.dataset.url, '_blank');
});
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab)
            switchTab(tab);
    });
});
document.querySelectorAll('.mob-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab)
            switchTab(tab);
    });
});
let debTimer;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', e => {
        state.query = e.target.value;
        clearTimeout(debTimer);
        debTimer = window.setTimeout(renderAll, 160);
    });
}
const sortSel = document.getElementById('sortSel');
if (sortSel) {
    sortSel.addEventListener('change', e => {
        state.sort = e.target.value;
        renderAll();
    });
}
const favPanelBtn = document.getElementById('favPanelBtn');
const mpCloseBtn = document.getElementById('mpCloseBtn');
const overlay = document.getElementById('overlay');
const logoBtn = document.getElementById('logoBtn');
if (favPanelBtn)
    favPanelBtn.addEventListener('click', openMpanel);
if (mpCloseBtn)
    mpCloseBtn.addEventListener('click', closeMpanel);
if (overlay)
    overlay.addEventListener('click', closeMpanel);
if (logoBtn)
    logoBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
/* Theme */
const mql = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
}
function getOverride() {
    return localStorage.getItem('o-ngr-theme'); // 'light' | 'dark' | null
}
// 初期表示
applyTheme(getOverride() ? getOverride() === 'light' : !mql.matches);
mql.addEventListener('change', e => {
    if (!getOverride())
        applyTheme(!e.matches);
});
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const nowLight = !document.body.classList.contains('light');
        applyTheme(nowLight);
        localStorage.setItem('o-ngr-theme', nowLight ? 'light' : 'dark');
    });
}
/* Keyboard */
document.addEventListener('keydown', e => {
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const input = document.getElementById('searchInput');
        if (input)
            input.focus();
    }
    if (e.key === 'Escape')
        closeMpanel();
});
/* Init */
renderNavCounts();
renderAll();
