/* Klein en zichtbaar: er draait niets wat je niet kunt uitleggen. */
(function () {
  /* De browser herstelt bij een terugkeer de scrollpositie. Op een pagina die
     onderaan een formulier heeft betekende dat: klik op het woordmerk en je
     staat weer onderin. Wij bepalen zelf waar een pagina begint. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

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

  /* 3. De takken van de tijdlijn komen binnen zodra ze in beeld staan.
        Eén keer, en daarna blijft het staan; niets dat op en neer flikkert. */
  var takken = document.querySelectorAll('.tijdlijn.stam li');
  if (takken.length) {
    if (stil || !('IntersectionObserver' in window)) {
      takken.forEach(function (t) { t.classList.add('zichtbaar'); });
    } else {
      var tw = new IntersectionObserver(function (rijen) {
        rijen.forEach(function (r, i) {
          if (!r.isIntersecting) return;
          var el = r.target;
          setTimeout(function () { el.classList.add('zichtbaar'); }, i * 90);
          tw.unobserve(el);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
      takken.forEach(function (t) { tw.observe(t); });
    }
  }

  /* 4. Het formulier in stappen. Zonder dit script staan alle bladen open en
        werkt het als een gewoon formulier; de klasse 'js' zet dat om. */
  var form = document.querySelector('.stappen-form');
  if (form) {
    form.classList.add('js');
    var bladen = Array.prototype.slice.call(form.querySelectorAll('.stap-blad'));
    var bollen = Array.prototype.slice.call(form.querySelectorAll('.stap-balk .bol'));
    var teller = form.querySelector('.stap-tel');
    var nu = 0;

    function toon(i) {
      bladen.forEach(function (b, n) { b.classList.toggle('open', n === i); });
      bollen.forEach(function (b, n) { b.classList.toggle('aan', n <= i); });
      if (teller) teller.textContent = (i + 1) + ' of ' + bladen.length;
      nu = i;
      var eerste = bladen[i].querySelector('input:not([type=hidden]),select,textarea');
      if (eerste) eerste.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: stil ? 'auto' : 'smooth' });
    }

    /* Alleen de velden van het huidige blad worden gecontroleerd. Zo krijg je
       geen foutmelding over een veld dat je nog niet gezien hebt. */
    function klopt(blad) {
      var velden = blad.querySelectorAll('input[required],select[required],textarea[required]');
      for (var i = 0; i < velden.length; i++) {
        if (!velden[i].checkValidity()) { velden[i].reportValidity(); return false; }
      }
      return true;
    }

    form.addEventListener('click', function (e) {
      if (e.target.classList.contains('verder')) {
        if (klopt(bladen[nu]) && nu < bladen.length - 1) toon(nu + 1);
      }
      if (e.target.classList.contains('terug') && nu > 0) toon(nu - 1);
    });

    form.addEventListener('submit', function (e) {
      for (var i = 0; i < bladen.length; i++) {
        if (!klopt(bladen[i])) { e.preventDefault(); toon(i); return; }
      }
    });

    toon(0);
  }

  /* 5. Klik je op het woordmerk terwijl je al op de homepage staat, dan gaat
        de pagina naar boven in plaats van niets te doen. */
  var merk = document.querySelector('.kop-balk .woordmerk');
  if (merk) {
    merk.addEventListener('click', function (e) {
      var hier = location.pathname.replace(/\/$/, '/index.html');
      if (!hier.endsWith('/index.html')) return;   // andere pagina: gewoon navigeren
      e.preventDefault();
      /* Sta je al op de homepage met #write in de balk, dan moet die er eerst
         af. Anders zet de browser je terug bij het formulier. */
      history.replaceState(null, '', location.pathname);
      window.scrollTo({ top: 0, behavior: stil ? 'auto' : 'smooth' });
      /* Zacht scrollen wordt niet overal uitgevoerd. Staat hij daarna nog
         steeds onderin, dan gaat hij er alsnog hard naartoe. */
      setTimeout(function () { if (window.scrollY > 4) window.scrollTo(0, 0); }, 700);
    });
  }

  /* 6. Het trouwdatumveld verschijnt alleen als het gesprek over een bruiloft gaat. */
  var onderwerp = document.getElementById('onderwerp');
  var datum = document.getElementById('datum-veld');
  if (onderwerp && datum) {
    /* Deze heette eerst ook toon(). Twee functiedeclaraties met dezelfde naam in
       dezelfde functie: de laatste wint, dus riepen Next en Send hierna deze aan
       in plaats van de stappenfunctie, en gebeurde er zichtbaar niets. */
    function datumZichtbaar() { datum.hidden = onderwerp.value !== 'Bridal'; }
    onderwerp.addEventListener('change', datumZichtbaar); datumZichtbaar();
  }
})();
