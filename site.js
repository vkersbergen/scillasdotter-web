/* Klein en zichtbaar: er draait niets wat je niet kunt uitleggen. */
(function () {
  var stil = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Menu. Overlay dicht met Escape, en de focus gaat terug naar de knop. */
  var knop = document.querySelector('.kop-balk .menuknop');
  var menu = document.getElementById('menu');
  if (knop && menu) {
    var sluit = menu.querySelector('.sluit');
    function zet(open) {
      menu.hidden = !open;
      menu.classList.toggle('open', open);
      knop.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (!open) knop.focus();
    }
    knop.addEventListener('click', function () { zet(true); });
    if (sluit) sluit.addEventListener('click', function () { zet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) zet(false); });
  }

  /* 2. Video. Het posterbeeld staat er eerst; de film neemt het pas over als
        hij echt kan doorspelen. Anders zie je een zwart gat waar beeld hoort.
        En hij speelt alleen als hij in beeld staat — een film die onder de
        vouw staat te draaien kost batterij en levert niets op. */
  if (!stil) {
    var films = Array.prototype.slice.call(document.querySelectorAll('.hero video'));
    films.forEach(function (v) {
      v.addEventListener('canplaythrough', function () { v.classList.add('klaar'); }, { once: true });
    });
    if ('IntersectionObserver' in window) {
      var kijker = new IntersectionObserver(function (rijen) {
        rijen.forEach(function (r) {
          var v = r.target;
          if (r.isIntersecting) {
            if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
            var p = v.play(); if (p && p.catch) p.catch(function () {});
          } else { v.pause(); }
        });
      }, { rootMargin: '200px' });
      films.forEach(function (v) { kijker.observe(v); });
    } else {
      films.forEach(function (v) { v.preload = 'auto'; v.play().catch(function () {}); });
    }
  }

  /* 3. Het trouwdatumveld verschijnt alleen als het gesprek over een bruiloft gaat. */
  var onderwerp = document.getElementById('onderwerp');
  var datum = document.getElementById('datum-veld');
  if (onderwerp && datum) {
    function toon() { datum.hidden = onderwerp.value !== 'Bridal'; }
    onderwerp.addEventListener('change', toon); toon();
  }
})();
