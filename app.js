"use strict";
// Única fuente de fórmulas. Multiplicadores como fracciones exactas.
const RULES = Object.freeze({
  oro: Object.freeze({ numerator: 29n, denominator: 10n, cashDiscount: 30, cardDiscount: 25 }),
  plata: Object.freeze({ numerator: 255n, denominator: 1n, cashDiscount: 0, cardDiscount: 0 }),
  argollas: Object.freeze({ numerator: 32n, denominator: 10n, cashDiscount: 25, cardDiscount: 20 })
});
const ceilDiv = (n, d) => (n + d - 1n) / d;
function calculate(raw, material) {
  const value = String(raw).trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) throw new Error('Ingresa una clave válida, por ejemplo 125.50.');
  const [whole, fraction = ''] = value.split('.');
  if (value.length > 30) throw new Error('La clave es demasiado larga (máximo 30 caracteres).');
  const numerator = BigInt((whole || '0') + fraction);
  const denominator = 10n ** BigInt(fraction.length);
  const rule = RULES[material];
  if (!rule) throw new Error('Selecciona un material.');
  // BigInt evita errores de coma flotante (por ejemplo, centavos fantasma).
  const base = ceilDiv(numerator * rule.numerator, denominator * rule.denominator);
  if (base > 999999999n) throw new Error('El precio excede el máximo de $999,999,999. Revisa la clave.');
  return { base, cash: ceilDiv(base * BigInt(100-rule.cashDiscount), 100n), card: ceilDiv(base * BigInt(100-rule.cardDiscount), 100n) };
}
if (typeof module !== 'undefined') module.exports = { calculate, RULES };
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const format = value => '$' + value.toLocaleString('es-MX');
  const material = () => document.querySelector('[name="material"]:checked').value;
  function render() {
    const kind = material(), rule = RULES[kind];
    $('material-name').textContent = kind.toUpperCase();
    $('discounts').hidden = kind === 'plata';
    $('silver-note').hidden = kind !== 'plata';
    $('base-label').textContent = kind === 'plata' ? 'Precio final' : 'Precio de lista';
    $('cash-discount').textContent = '−' + rule.cashDiscount + '%';
    $('card-discount').textContent = '−' + rule.cardDiscount + '%';
    $('error').hidden = true;
    $('clave').removeAttribute('aria-invalid');
    for (const id of ['base','cash','card']) $(id).textContent = '—';
    if (!$('clave').value.trim()) return;
    try {
      const result = calculate($('clave').value, kind);
      for (const id of ['base','cash','card']) $(id).textContent = format(result[id]);
    } catch (error) {
      $('error').textContent = error.message;
      $('error').hidden = false;
      $('clave').setAttribute('aria-invalid', 'true');
    }
  }
  $('clave').addEventListener('input', render);
  document.querySelectorAll('[name="material"]').forEach(el => el.addEventListener('change', render));
  $('reset').addEventListener('click', () => { $('clave').value = ''; render(); $('clave').focus(); });
  document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.key;
    const input = $('clave');
    if (key === '.' && /[.,]/.test(input.value)) return;
    if (input.value.length >= 30) return;
    input.value = key === '.' && !input.value ? '0.' : input.value + key;
    render();
    input.scrollLeft = input.scrollWidth;
  }));
  $('backspace').addEventListener('click', () => { $('clave').value = $('clave').value.slice(0, -1); render(); });
  $('equals').addEventListener('click', () => { render(); $('clave').blur(); });
  $('clave').addEventListener('keydown', event => {
    if (event.key === 'Enter') { render(); $('clave').blur(); }
    if (event.key === 'Escape') { $('clave').value = ''; render(); }
  });
  render();
  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; $('install').hidden = false;
  });
  $('install').addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt(); installPrompt = null; $('install').hidden = true;
  });
  window.addEventListener('appinstalled', () => { $('install').hidden = true; installPrompt = null; });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      $('offline-status').textContent = '✓ Lista para usar sin conexión';
    }).catch(() => { $('offline-status').textContent = 'No se pudo preparar el modo sin conexión. Recarga con internet.'; });
  } else {
    $('offline-status').textContent = 'Para instalar y usar sin conexión, abre la versión HTTPS o localhost.';
  }
}
