(function () {
  if (!window.SUPABASE_URL || window.SUPABASE_URL.indexOf('TON-PROJET') !== -1) {
    console.warn('Supabase n\u2019est pas configuré : remplis supabase-config.js.');
  }

  var supabase = window.NELE_SUPABASE || window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.NELE_SUPABASE = supabase;

  var loginCard = document.getElementById('loginCard');
  var userCard = document.getElementById('userCard');
  var authSection = document.getElementById('authSection');
  var userAvatar = document.getElementById('userAvatar');
  var userName = document.getElementById('userName');
  var loginBtn = document.getElementById('loginBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  var checklistSection = document.getElementById('checklistSection');
  var gameButtons = document.querySelectorAll('.game-btn');
  var chips = document.querySelectorAll('.chip');
  var searchInput = document.getElementById('searchInput');
  var listWrap = document.getElementById('checklistWrap');
  var progressText = document.getElementById('progressText');
  var progressBarFill = document.getElementById('progressBarFill');
  var resetProgressBtn = document.getElementById('resetProgressBtn');
  var resetBtn = document.getElementById('resetFilters');

  var CAT_LABELS = { coeur: 'Quart de cœur', bouteille: 'Bouteille', fee: 'Grande Fée' };
  var GAME_LABELS = { oot: 'Ocarina of Time', ww: 'The Wind Waker' };
  var CAT_IMAGES = { coeur: 'images/coeur.png', bouteille: 'images/bouteille.png', fee: 'images/fee.png' };

  var state = { game: 'all', cat: 'all', query: '' };
  var checkedIds = new Set();
  var currentUser = null;

  function matchesQuery(record, q) {
    if (!q) return true;
    var haystack = [record.name, record.location, record.requirement, record.description, record.era]
      .join(' ').toLowerCase();
    return haystack.indexOf(q.toLowerCase()) !== -1;
  }

  function getFiltered() {
    return ZELDA_DATA.filter(function (r) {
      if (state.game !== 'all' && r.game !== state.game) return false;
      if (state.cat !== 'all' && r.category !== state.cat) return false;
      if (!matchesQuery(r, state.query)) return false;
      return true;
    });
  }

  function itemsForGame(game) {
    return game === 'all' ? ZELDA_DATA : ZELDA_DATA.filter(function (r) { return r.game === game; });
  }

  function updateProgress() {
    var items = itemsForGame(state.game);
    var total = items.length;
    var done = items.filter(function (r) { return checkedIds.has(r.id); }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    progressText.textContent = done + ' / ' + total + ' obtenus (' + pct + '%)';
    progressBarFill.style.width = pct + '%';

    if (resetProgressBtn) {
      resetProgressBtn.textContent = state.game === 'all'
        ? 'Tout réinitialiser'
        : 'Réinitialiser ' + GAME_LABELS[state.game];
    }
  }

  function resetProgress() {
    var items = itemsForGame(state.game);
    var label = state.game === 'all' ? 'toute ta progression' : ('ta progression sur ' + GAME_LABELS[state.game]);
    if (!confirm('Réinitialiser ' + label + ' ? Cette action est irréversible.')) return;

    var ids = items.map(function (r) { return r.id; });
    ids.forEach(function (id) { checkedIds.delete(id); });
    render();
    updateProgress();

    if (currentUser && ids.length) {
      supabase.from('progress').delete()
        .eq('user_id', currentUser.id)
        .in('item_id', ids)
        .then(function (res) {
          if (res.error) console.error('Erreur de réinitialisation :', res.error);
        });
    }
  }

  function rowHTML(r) {
    var checked = checkedIds.has(r.id) ? 'checked' : '';
    return (
      '<label class="check-row' + (checked ? ' is-checked' : '') + '" data-id="' + r.id + '">' +
        '<input type="checkbox" class="check-input" data-id="' + r.id + '" ' + checked + '>' +
        '<span class="check-box" aria-hidden="true"></span>' +
        '<img src="' + CAT_IMAGES[r.category] + '" class="check-icon" alt="">' +
        '<span class="check-info">' +
          '<span class="check-name">' + r.name + '</span>' +
          '<span class="check-location">' + GAME_LABELS[r.game] + ' · ' + r.location + '</span>' +
        '</span>' +
      '</label>'
    );
  }

  function render() {
    var data = getFiltered();
    listWrap.innerHTML = data.length
      ? data.map(rowHTML).join('')
      : '<p class="empty-state">Aucun résultat pour cette recherche.</p>';

    listWrap.querySelectorAll('.check-input').forEach(function (input) {
      input.addEventListener('change', onToggle);
    });
  }

  function onToggle(e) {
    var id = e.target.getAttribute('data-id');
    var row = e.target.closest('.check-row');
    var isChecked = e.target.checked;
    row.classList.toggle('is-checked', isChecked);

    if (isChecked) {
      checkedIds.add(id);
    } else {
      checkedIds.delete(id);
    }
    updateProgress();
    persist(id, isChecked);
  }

  function persist(itemId, checked) {
    if (!currentUser) return;
    if (checked) {
      supabase.from('progress').upsert(
        { user_id: currentUser.id, item_id: itemId, checked: true },
        { onConflict: 'user_id,item_id' }
      ).then(function (res) {
        if (res.error) console.error('Erreur de sauvegarde :', res.error);
      });
    } else {
      supabase.from('progress').delete()
        .eq('user_id', currentUser.id)
        .eq('item_id', itemId)
        .then(function (res) {
          if (res.error) console.error('Erreur de suppression :', res.error);
        });
    }
  }

  function loadProgress() {
    if (!currentUser) return Promise.resolve();
    return supabase.from('progress').select('item_id').eq('user_id', currentUser.id)
      .then(function (res) {
        if (res.error) {
          console.error('Erreur de chargement :', res.error);
          return;
        }
        checkedIds = new Set(res.data.map(function (row) { return row.item_id; }));
      });
  }

  function showLoggedIn(user) {
    currentUser = user;
    var meta = user.user_metadata || {};
    userName.textContent = meta.full_name || meta.name || meta.user_name || 'Compte Discord';
    if (meta.avatar_url) userAvatar.src = meta.avatar_url;
    loginCard.hidden = true;
    userCard.hidden = false;
    authSection.hidden = true;
    checklistSection.hidden = false;
    loadProgress().then(function () {
      render();
      updateProgress();
    });
  }

  function showLoggedOut() {
    currentUser = null;
    checkedIds = new Set();
    loginCard.hidden = false;
    userCard.hidden = true;
    authSection.hidden = false;
    checklistSection.hidden = true;
  }

  loginBtn.addEventListener('click', function () {
    supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.href }
    });
  });

  logoutBtn.addEventListener('click', function () {
    supabase.auth.signOut().then(function () { showLoggedOut(); });
  });

  if (resetProgressBtn) resetProgressBtn.addEventListener('click', resetProgress);

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.cat = chip.dataset.cat;
      render();
    });
  });

  gameButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      gameButtons.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.game = btn.dataset.game;
      render();
      updateProgress();
    });
  });

  searchInput.addEventListener('input', function (e) {
    state.query = e.target.value;
    render();
  });

  resetBtn && resetBtn.addEventListener('click', function () {
    state.game = 'all'; state.cat = 'all'; state.query = '';
    searchInput.value = '';
    chips.forEach(function (c) { c.classList.remove('active'); });
    document.querySelector('.chip-all').classList.add('active');
    gameButtons.forEach(function (b) { b.classList.remove('active'); });
    var allBtn = document.querySelector('.game-btn[data-game="all"]');
    if (allBtn) allBtn.classList.add('active');
    render();
  });

  supabase.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (session && session.user) {
      showLoggedIn(session.user);
    } else {
      showLoggedOut();
    }
  });

  supabase.auth.onAuthStateChange(function (event, session) {
    if (session && session.user) {
      showLoggedIn(session.user);
    } else {
      showLoggedOut();
    }
  });
})();
