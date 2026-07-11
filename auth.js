(function () {
  function initHeaderAuth() {
    var loginBtn = document.getElementById('headerLoginBtn');
    var userLink = document.getElementById('headerUserLink');
    var avatar = document.getElementById('headerAvatar');
    var username = document.getElementById('headerUsername');

    // Le header n'est pas encore injecté par include-header.js : on réessaiera.
    if (!loginBtn || !userLink) return false;

    if (!window.supabase || !window.SUPABASE_URL) {
      console.warn('Supabase n\u2019est pas configuré : remplis supabase-config.js.');
      return true; // pas la peine de réessayer, la config manque
    }

    // Un seul client partagé, réutilisable par les scripts de page (ex: suivi.js).
    var sb = window.NELE_SUPABASE || window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    window.NELE_SUPABASE = sb;

    function showLoggedIn(user) {
      var meta = user.user_metadata || {};
      username.textContent = meta.full_name || meta.name || meta.user_name || 'Mon compte';
      if (meta.avatar_url) avatar.src = meta.avatar_url;
      loginBtn.hidden = true;
      userLink.hidden = false;
    }

    function showLoggedOut() {
      loginBtn.hidden = false;
      userLink.hidden = true;
    }

    loginBtn.addEventListener('click', function () {
      sb.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: window.location.href }
      });
    });

    sb.auth.getSession().then(function (res) {
      var session = res.data.session;
      if (session && session.user) showLoggedIn(session.user);
      else showLoggedOut();
    });

    sb.auth.onAuthStateChange(function (event, session) {
      if (session && session.user) showLoggedIn(session.user);
      else showLoggedOut();
      document.dispatchEvent(new CustomEvent('nele-auth-changed', {
        detail: { user: session ? session.user : null }
      }));
    });

    return true;
  }

  if (!initHeaderAuth()) {
    var tries = 0;
    var interval = setInterval(function () {
      tries++;
      if (initHeaderAuth() || tries > 50) clearInterval(interval);
    }, 100);
  }
})();
