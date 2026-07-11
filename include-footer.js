(function () {
    var mount = document.getElementById('footer-placeholder');
    if (!mount) return;
  
    fetch('footer.html')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
      })
      .catch(function (err) {
        console.error('Impossible de charger footer.html :', err);
        mount.innerHTML = '<p style="text-align:center;padding:14px;color:#888;">'
          + 'Le footer n\'a pas pu se charger (ouvrez ce site via un serveur local plutôt qu\'en double-cliquant sur le fichier).'
          + '</p>';
      });
  })();