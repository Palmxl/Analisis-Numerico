/* Núcleo compartido: registro de algoritmos y utilidades */
window.NA = {
  algoritmos: [],

  // Orden de las unidades del curso (se muestran solo las que tengan algoritmos)
  unidades: [
    'Raíces de ecuaciones',
    'Sistemas de ecuaciones lineales',
    'Interpolación y aproximación',
    'Diferenciación e integración numérica',
    'Ecuaciones diferenciales',
  ],

  registrar(algo) { this.algoritmos.push(algo); },
  buscar(id) { return this.algoritmos.find(a => a.id === id); },

  /* Convierte un texto como "x^3 - 2x - 5" en una función JS usando math.js */
  compilar(expr) {
    const node = math.parse(expr);
    const code = node.compile();
    const scope = { ln: Math.log };
    const f = x => {
      scope.x = x;
      const v = code.evaluate(scope);
      return typeof v === 'number' ? v : NaN;
    };
    const test = f(0.5);
    if (typeof test !== 'number') throw new Error('La expresión no devuelve un número');
    let tex = '';
    try { tex = node.toTex({ parenthesis: 'auto', implicit: 'hide' }); } catch (e) { tex = expr; }
    return { f, tex };
  },

  /* Formato numérico compacto y legible */
  fmt(v, digits = 10) {
    if (v === null || v === undefined) return '—';
    if (!isFinite(v)) return String(v);
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a < 1e-4 || a >= 1e7) return v.toExponential(Math.max(2, Math.min(digits - 4, 6)));
    return parseFloat(v.toPrecision(digits)).toString();
  },

  /* Mide el tiempo promedio de una función repitiéndola ~40 ms */
  cronometrar(fn) {
    let reps = 0;
    const t0 = performance.now();
    let t = t0;
    while (t - t0 < 40 || reps < 5) { fn(); reps++; t = performance.now(); }
    return (t - t0) / reps; // ms por ejecución
  },

  /* Estima el orden de convergencia α a partir de las diferencias |x_n − x_{n−1}| */
  ordenConvergencia(xs) {
    const d = [];
    for (let i = 1; i < xs.length; i++) {
      const di = Math.abs(xs[i] - xs[i - 1]);
      if (!isFinite(di) || di < 1e-13 * Math.max(1, Math.abs(xs[i]))) break; // ruido de redondeo
      d.push(di);
    }
    const alphas = [], razones = [];
    for (let i = 2; i < d.length; i++) {
      if (d[i] > 0 && d[i - 1] > 0 && d[i - 2] > 0 && d[i - 1] !== d[i - 2]) {
        const a = Math.log(d[i] / d[i - 1]) / Math.log(d[i - 1] / d[i - 2]);
        if (isFinite(a)) alphas.push(a);
      }
      if (d[i] > 0 && d[i - 1] > 0) razones.push(d[i] / d[i - 1]);
    }
    const ultimos = arr => {
      const s = arr.slice(-3).sort((x, y) => x - y);
      return s.length ? s[Math.floor(s.length / 2)] : null;
    };
    return { alpha: ultimos(alphas), C: ultimos(razones) };
  },

  /* Resaltado simple de Python */
  resaltarPython(src) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const kws = 'def|return|if|elif|else|for|while|in|range|and|or|not|None|True|False|import|from|as|raise|print|abs|lambda';
    const re = new RegExp(`(#[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(${kws})\\b|\\b(\\d+(?:\\.\\d+)?(?:e-?\\d+)?)\\b|\\b(def)\\b`, 'g');
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += `<span class="c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="k">${m[3]}</span>`;
      else if (m[4]) out += `<span class="n">${m[4]}</span>`;
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  },

  renderMath(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
      });
    }
  },

  tex(str, display = false) {
    try { return katex.renderToString(str, { displayMode: display, throwOnError: false }); }
    catch (e) { return str; }
  },
};
