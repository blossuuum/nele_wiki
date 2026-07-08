// Anime l'ouverture/fermeture des <details> de la FAQ avec la Web Animations API.
(function () {
  var DURATION = 260;
  var EASING = 'ease-out';

  function Accordion(el) {
    this.el = el;
    this.summary = el.querySelector('summary');
    this.content = el.querySelector('.faq-answer');
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.summary.addEventListener('click', this.onClick.bind(this));
  }

  Accordion.prototype.onClick = function (e) {
    e.preventDefault();
    this.el.style.overflow = 'hidden';
    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  };

  Accordion.prototype.shrink = function () {
    this.isClosing = true;
    var startHeight = this.el.offsetHeight + 'px';
    var endHeight = this.summary.offsetHeight + 'px';
    if (this.animation) this.animation.cancel();
    this.animation = this.el.animate(
      { height: [startHeight, endHeight] },
      { duration: DURATION, easing: EASING }
    );
    var self = this;
    this.animation.onfinish = function () { self.onAnimationFinish(false); };
    this.animation.oncancel = function () { self.isClosing = false; };
  };

  Accordion.prototype.open = function () {
    this.el.style.height = this.el.offsetHeight + 'px';
    this.el.open = true;
    var self = this;
    window.requestAnimationFrame(function () { self.expand(); });
  };

  Accordion.prototype.expand = function () {
    this.isExpanding = true;
    var startHeight = this.el.offsetHeight + 'px';
    var endHeight = (this.summary.offsetHeight + this.content.offsetHeight) + 'px';
    if (this.animation) this.animation.cancel();
    this.animation = this.el.animate(
      { height: [startHeight, endHeight] },
      { duration: DURATION, easing: EASING }
    );
    var self = this;
    this.animation.onfinish = function () { self.onAnimationFinish(true); };
    this.animation.oncancel = function () { self.isExpanding = false; };
  };

  Accordion.prototype.onAnimationFinish = function (open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = '';
    this.el.style.overflow = '';
  };

  if (!('animate' in document.createElement('div'))) return; // fallback: comportement natif sans JS

  document.querySelectorAll('.faq-item').forEach(function (el) {
    new Accordion(el);
  });
})();
