(function () {
  const cardGrid = document.getElementById('cardGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const resultsCount = document.getElementById('resultsCount');
  const chips = document.querySelectorAll('.chip');
  const gameButtons = document.querySelectorAll('.game-btn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCard = document.getElementById('modalCard');
  const resetBtn = document.getElementById('resetFilters');

  const state = {
    game: window.PAGE_GAME || 'all',
    cat: 'all',
    query: '',
    sort: 'default',
  };

  const CAT_LABELS = { coeur: 'Quart de cœur', bouteille: 'Bouteille', fee: 'Grande Fée' };
  const GAME_LABELS = { oot: 'Ocarina of Time', ww: 'The Wind Waker' };
  const CAT_IMAGES = { coeur: 'images/coeur.png', bouteille: 'images/bouteille.png', fee: 'images/fee.png' };

  function updateCounts(data) {
    const counts = { all: data.length, coeur: 0, bouteille: 0, fee: 0 };
    data.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-coeur').textContent = counts.coeur;
    document.getElementById('count-bouteille').textContent = counts.bouteille;
    document.getElementById('count-fee').textContent = counts.fee;
  }

  function matchesQuery(record, q) {
    if (!q) return true;
    const haystack = [
      record.name, record.location, record.requirement, record.description, record.era,
      GAME_LABELS[record.game], CAT_LABELS[record.category],
    ].join(' ').toLowerCase();
    return haystack.includes(q.toLowerCase());
  }

  function getFiltered() {
    let data = ZELDA_DATA.filter((r) => {
      if (state.game !== 'all' && r.game !== state.game) return false;
      if (state.cat !== 'all' && r.category !== state.cat) return false;
      if (!matchesQuery(r, state.query)) return false;
      return true;
    });

    if (state.sort === 'game') {
      data = data.slice().sort((a, b) => a.game.localeCompare(b.game) || a.category.localeCompare(b.category) || a.number - b.number);
    } else if (state.sort === 'name') {
      data = data.slice().sort((a, b) => a.location.localeCompare(b.location, 'fr'));
    }
    return data;
  }

  
  function cardHTML(r) {
    return `
      <article class="card cat-${r.category} game-${r.game}" data-id="${r.id}" tabindex="0">
        <div class="card-top">
          <div class="card-badge"><img src="${CAT_IMAGES[r.category]}" alt="${CAT_LABELS[r.category]}" class="card-badge-img"></div>
          <span class="card-game-tag">${GAME_LABELS[r.game]}</span>
        </div>
        <div class="card-name">${r.name}</div>
        <div class="card-location">📍 ${r.location}</div>
        <p class="card-desc">${r.description}</p>
        <div class="card-tags">
          ${r.requirement && r.requirement !== 'Aucune' && r.requirement !== 'N/A' ? `<span class="tag">🔑 ${r.requirement}</span>` : ''}
          ${r.era && r.era !== 'N/A' ? `<span class="tag">${r.era}</span>` : ''}
        </div>
      </article>`;
  }

  function render() {
    const data = getFiltered();
    cardGrid.innerHTML = data.map(cardHTML).join('');
    emptyState.hidden = data.length !== 0;
    cardGrid.style.display = data.length === 0 ? 'none' : 'grid';
    resultsCount.textContent = data.length + (data.length > 1 ? ' résultats' : ' résultat');

    cardGrid.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('click', () => openModal(el.dataset.id));
      el.addEventListener('keypress', (e) => { if (e.key === 'Enter') openModal(el.dataset.id); });
    });
  }

  function openModal(id) {
    const r = ZELDA_DATA.find((x) => x.id === id);
    if (!r) return;
    modalCard.innerHTML = `
      <button class="modal-close" id="modalCloseBtn" aria-label="Fermer">×</button>
      <div class="card-top">
        <div class="card-badge cat-${r.category}"><img src="${CAT_IMAGES[r.category]}" alt="${CAT_LABELS[r.category]}" class="card-badge-img"></div>
        <span class="card-game-tag">${GAME_LABELS[r.game]} · ${CAT_LABELS[r.category]}</span>
      </div>
      <div class="card-name">${r.name}</div>
      <div class="card-location">📍 ${r.location}</div>
      <p class="card-desc">${r.description}</p>
      <div class="card-tags">
        ${r.requirement && r.requirement !== 'Aucune' && r.requirement !== 'N/A' ? `<span class="tag">🔑 Condition : ${r.requirement}</span>` : ''}
        ${r.era && r.era !== 'N/A' ? `<span class="tag">${r.era}</span>` : ''}
      </div>
    `;
    modalBackdrop.classList.add('open');
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
  }

  modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.cat = chip.dataset.cat;
      render();
    });
  });

  gameButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      gameButtons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.game = btn.dataset.game;
      render();
    });
  });

  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });

  sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    state.game = window.PAGE_GAME || 'all'; state.cat = 'all'; state.query = ''; state.sort = 'default';
    searchInput.value = '';
    sortSelect.value = 'default';
    chips.forEach((c) => c.classList.remove('active'));
    document.querySelector('.chip-all').classList.add('active');
    if (!window.PAGE_GAME) {
      gameButtons.forEach((b) => b.classList.remove('active'));
      const allBtn = document.querySelector('.game-btn[data-game="all"]');
      if (allBtn) allBtn.classList.add('active');
    }
    render();
  });

  updateCounts(ZELDA_DATA);
  render();
})();
