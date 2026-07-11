(function () {
  var STORAGE_KEY = 'hyrule-trove-theme';

  window.wireThemeToggle = function () {
    var btn = document.getElementById('themeToggle');
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  };

  window.wireMobileMenu = function () {
    var btn = document.getElementById('menuToggle');
    var nav = document.getElementById('mobileNav');
    if (!btn || !nav || btn.dataset.wired) return;
    btn.dataset.wired = '1';

    function closeMenu() {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', toggleMenu);
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 780) closeMenu();
    });
  };
})();
