/* Krullend cursorspoor. Klein en zichtbaar, net als site.js.
 *
 * HERKOMST. Aangepast uit een gekochte componentbibliotheek (Mouse Effects/14,
 * "satisfying curly cursor", 2,4 KB puur JavaScript op een 2D-doek). Geen
 * bibliotheek, geen bouwstap.
 *
 * WAT ER IS VERANDERD TEN OPZICHTE VAN HET ORIGINEEL, EN WAAROM
 *   kleur      zwart op wit  ->  --chalk die uitdooft, want deze site is Noir
 *   dikte      0.3           ->  0.16, een dunne lijn in plaats van een kwaststreek
 *   veer       0.4           ->  0.32, en wrijving 0.5 -> 0.58: rustiger, loopt langer door
 *   in rust    de lijn zwemt vanzelf rond  ->  niets tot de bezoeker beweegt
 *   aanraken   volgt je vinger bij scrollen -> uit, er is daar geen cursor
 *   beweging   niet afgevangen -> geen doek als de bezoeker beweging heeft uitgezet
 *
 * Die laatste drie zijn geen smaak. Een spoor dat een scrollende vinger volgt zit
 * in de weg, en een pagina die blijft bewegen terwijl iemand wil lezen ook.
 *
 * TERUGZETTEN. Dit bestand weghalen en de regel eronder uit build.py; verder raakt
 * het niets aan. Het doek staat op pointer-events:none, dus het vangt geen enkele
 * klik af — dat is getoetst op vijf links en met een echte klik.
 */
(function () {
  var mq = window.matchMedia;
  if (!mq) return;
  if (mq('(prefers-reduced-motion: reduce)').matches) return;
  /* Geen cursor op een aanraakscherm, dus ook geen spoor. */
  if (mq('(hover: none)').matches) return;

  var doek = document.createElement('canvas');
  doek.setAttribute('aria-hidden', 'true');
  doek.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60';
  document.body.appendChild(doek);
  var ctx = doek.getContext('2d');
  if (!ctx) { doek.remove(); return; }

  var muis = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var PUNTEN = 34, DIKTE = 0.16, VEER = 0.32, WRIJVING = 0.58;

  var spoor = [];
  for (var i = 0; i < PUNTEN; i++) spoor.push({ x: muis.x, y: muis.y, dx: 0, dy: 0 });

  var bewogen = false;
  window.addEventListener('mousemove', function (e) {
    bewogen = true; muis.x = e.clientX; muis.y = e.clientY;
  });

  function meet() {
    /* Op een scherm met dubbele pixels tekent een doek anders half zo scherp. */
    var d = Math.min(window.devicePixelRatio || 1, 2);
    doek.width = window.innerWidth * d;
    doek.height = window.innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  meet();
  window.addEventListener('resize', meet);

  function teken() {
    ctx.clearRect(0, 0, doek.width, doek.height);
    if (bewogen) {
      for (var i = 0; i < spoor.length; i++) {
        var p = spoor[i];
        var vorig = i === 0 ? muis : spoor[i - 1];
        var veer = i === 0 ? 0.4 * VEER : VEER;
        p.dx = (p.dx + (vorig.x - p.x) * veer) * WRIJVING;
        p.dy = (p.dy + (vorig.y - p.y) * veer) * WRIJVING;
        p.x += p.dx; p.y += p.dy;
      }
      ctx.lineCap = 'round';
      for (var j = 1; j < spoor.length - 1; j++) {
        var xc = 0.5 * (spoor[j].x + spoor[j + 1].x);
        var yc = 0.5 * (spoor[j].y + spoor[j + 1].y);
        /* De staart dooft uit in plaats van hard af te breken. */
        ctx.strokeStyle = 'rgba(244,243,240,' + (1 - j / spoor.length) * 0.5 + ')';
        ctx.lineWidth = DIKTE * (PUNTEN - j);
        ctx.beginPath();
        ctx.moveTo(spoor[j - 1].x, spoor[j - 1].y);
        ctx.quadraticCurveTo(spoor[j].x, spoor[j].y, xc, yc);
        ctx.stroke();
      }
    }
    window.requestAnimationFrame(teken);
  }
  teken();
})();
