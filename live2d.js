(function () {
  // Chemin du modèle. Tous les fichiers (moc3, model3.json, physics3.json,
  // cdi3.json, et le dossier de textures "Bluum Pin Fey.2048") doivent se
  // trouver ensemble dans un dossier "models/" à la racine du site, à côté
  // de about.html.
  var MODEL_PATH = 'models/Bluum Pin Fey.model3.json';

  var wrap = document.getElementById('live2dCanvasWrap');
  var canvas = document.getElementById('live2dCanvas');
  var statusEl = document.getElementById('live2dStatus');
  if (!wrap || !canvas) return;

  function setStatus(msg, show) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('hidden', !show);
  }

  if (!window.PIXI || !window.PIXI.live2d) {
    setStatus('Le visualiseur Live2D n\u2019a pas pu se charger (bibliothèque indisponible ou pas de connexion internet).', true);
    return;
  }

  setStatus('Chargement du modèle…', true);

  var app = new PIXI.Application({
    view: canvas,
    autoStart: true,
    backgroundAlpha: 0,
    antialias: true,
    resizeTo: wrap,
  });

  var currentModel = null;

  function fitModel() {
    if (!currentModel) return;
    currentModel.scale.set(1);
    var scale = Math.min(
      app.renderer.width / currentModel.width,
      app.renderer.height / currentModel.height
    ) * 0.92;
    currentModel.scale.set(scale);
    currentModel.x = app.renderer.width / 2;
    currentModel.y = app.renderer.height / 2;
  }

  PIXI.live2d.Live2DModel.from(encodeURI(MODEL_PATH), { autoInteract: true })
    .then(function (model) {
      currentModel = model;
      model.anchor.set(0.5, 0.5);
      app.stage.addChild(model);
      fitModel();
      setStatus('', false);
      window.addEventListener('resize', fitModel);
    })
    .catch(function (err) {
      console.error('Live2D load error:', err);
      setStatus(
        'Impossible de charger le modèle. Vérifiez que le dossier "models" contient bien Bluum Pin Fey.moc3, .model3.json, .physics3.json, .cdi3.json et le dossier de textures "Bluum Pin Fey.2048".',
        true
      );
    });
})();
