(function () {
  if (!window.supabase || !window.SUPABASE_URL) {
    console.warn('Supabase n\u2019est pas configuré : remplis supabase-config.js.');
    return;
  }

  // Client + écoute de session créés tout de suite, pour ne jamais rater
  // l'événement SIGNED_IN au retour de la redirection Discord, même si le
  // header n'est pas encore injecté dans le DOM à ce moment-là.
  var sb = window.NELE_SUPABASE || window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.NELE_SUPABASE = sb;

  var latestUser = null;
  var haveSession = false;

  function applyToHeader() {
    var loginBtn = document.getElementById('headerLoginBtn');
    var userLink = document.getElementById('headerUserLink');
    var avatar = document.getElementById('headerAvatar');
    var username = document.getElementById('headerUsername');

    if (!loginBtn || !userLink) return false; // header pas encore injecté

    if (!loginBtn.dataset.wired) {
      loginBtn.addEventListener('click', function () {
        sb.auth.signInWithOAuth({
          provider: 'discord',
          options: { redirectTo: window.location.href }
        });
      });
      loginBtn.dataset.wired = '1';
    }

    if (!haveSession) {
      loginBtn.hidden = false;
      userLink.hidden = true;
      return true;
    }

    var meta = latestUser.user_metadata || {};
    username.textContent = meta.full_name || meta.name || meta.user_name || 'Mon compte';
    if (meta.avatar_url) avatar.src = meta.avatar_url;
    loginBtn.hidden = true;
    userLink.hidden = false;
    return true;
  }

  function setState(user) {
    latestUser = user;
    haveSession = !!user;
    applyToHeader();
    document.dispatchEvent(new CustomEvent('nele-auth-changed', { detail: { user: user } }));
  }

  sb.auth.getSession().then(function (res) {
    var session = res.data.session;
    setState(session ? session.user : null);
  });

  sb.auth.onAuthStateChange(function (event, session) {
    setState(session ? session.user : null);
  });

  // Le header est injecté de façon asynchrone (include-header.js) : on
  // réapplique l'état déjà connu dès que les éléments apparaissent.
  if (!applyToHeader()) {
    var tries = 0;
    var interval = setInterval(function () {
      tries++;
      if (applyToHeader() || tries > 50) clearInterval(interval);
    }, 100);
  }
})();
