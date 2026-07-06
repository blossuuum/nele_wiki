(function () {
  var mount = document.getElementById('header-placeholder');
  if (!mount) return;

  fetch('header.html')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function (html) {
      mount.innerHTML = html;
      var page = document.body.getAttribute('data-page');
      if (page) {
        mount.querySelectorAll('a[data-page="' + page + '"]').forEach(function (link) {
          link.classList.add('active');
        });
      }
      if (window.wireThemeToggle) window.wireThemeToggle();
      if (window.wireMobileMenu) window.wireMobileMenu();
    })
    .catch(function (err) {
      console.error('Impossible de charger header.html :', err);
      mount.innerHTML = '<p style="text-align:center;padding:14px;color:#888;">'
        + 'Le header n\'a pas pu se charger (ouvrez ce site via un serveur local plutôt qu\'en double-cliquant sur le fichier).'
        + '</p>';
    });
})();
