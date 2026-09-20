/* Het gordijn voor scillasdotter.com.
 *
 * Dit is geen slot. GitHub Pages heeft geen serverkant, dus er is niets dat een
 * bezoeker tegenhoudt die de bron bekijkt of het bestand rechtstreeks opvraagt —
 * en de repo scillasdotter-web is publiek, dus de hele site is daar sowieso te
 * lezen. Wat dit wel doet: de toevallige voorbijganger ziet de site niet.
 *
 * Een inline <script> zou hier niet werken: de CSP van de site staat alleen
 * script-src 'self' toe. Vandaar een eigen bestand.
 */
(function () {
  'use strict';

  var KOEK = 'poort';
  var WAARDE = 'open';
  var POORT = '/poort.html';
  var DAGEN = 30;

  function magBinnen() {
    return document.cookie.split(';').some(function (stuk) {
      return stuk.trim() === KOEK + '=' + WAARDE;
    });
  }

  function laatBinnen() {
    document.cookie =
      KOEK + '=' + WAARDE + ';path=/;max-age=' + DAGEN * 86400 + ';SameSite=Lax';
  }

  /* Alleen een pad dat met één enkele / begint. Zonder deze controle is
     ?door=//ergens-anders.example een open doorverwijzing. */
  function veiligPad(pad) {
    return typeof pad === 'string' && pad.charAt(0) === '/' && pad.charAt(1) !== '/';
  }

  function naarBinnen() {
    var deur = '/';
    try {
      var gevraagd = new URLSearchParams(location.search).get('door');
      if (veiligPad(gevraagd)) deur = gevraagd;
    } catch (e) {
      /* oude browser zonder URLSearchParams: dan naar de voorpagina */
    }
    location.replace(deur);
  }

  var opDePoort = /(^|\/)poort\.html$/.test(location.pathname);

  if (!opDePoort) {
    if (magBinnen()) return;
    /* Dit staat in <head>, dus de doorverwijzing gebeurt vóórdat de body
       geparseerd wordt: geen flits van de echte pagina. */
    location.replace(POORT + '?door=' + encodeURIComponent(
      location.pathname + location.search + location.hash));
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var formulier = document.getElementById('poort-formulier');
    if (!formulier) return;

    if (magBinnen()) {
      naarBinnen();
      return;
    }

    var gebruiker = document.getElementById('poort-gebruiker');
    var sleutel = document.getElementById('poort-sleutel');
    var fout = document.getElementById('poort-fout');

    gebruiker.focus();

    formulier.addEventListener('submit', function (e) {
      e.preventDefault();
      if (gebruiker.value.trim() === 'a' && sleutel.value === 'a') {
        laatBinnen();
        naarBinnen();
        return;
      }
      fout.hidden = false;
      sleutel.value = '';
      sleutel.focus();
    });
  });
})();
