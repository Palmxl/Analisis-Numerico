/* Utilidades para algoritmos de matrices y sistemas lineales */
NA.mat = {
  ceros: (n, m = n) => Array.from({ length: n }, () => Array(m).fill(0)),

  /* Lee un valor escrito por el usuario: admite fracciones y expresiones (1/3, sqrt(2), -2.5) */
  leer(txt) {
    const t = String(txt).trim();
    if (t === '') return NaN;
    try {
      const v = math.evaluate(t);
      return typeof v === 'number' ? v : NaN;
    } catch (e) { return NaN; }
  },

  multiplicar(A, B) {
    const n = A.length, m = B[0].length, p = B.length;
    const C = NA.mat.ceros(n, m);
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      let s = 0;
      for (let k = 0; k < p; k++) s += A[i][k] * B[k][j];
      C[i][j] = s;
    }
    return C;
  },

  /* Norma infinito de A − B */
  normaDif(A, B) {
    let max = 0;
    for (let i = 0; i < A.length; i++) {
      let s = 0;
      for (let j = 0; j < A[i].length; j++) s += Math.abs(A[i][j] - B[i][j]);
      max = Math.max(max, s);
    }
    return max;
  },

  /* Subíndices unicode: sub(12) → "₁₂" */
  sub(n) { return String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]); },

  /* Número compacto para celdas de matriz */
  num(v) {
    if (!isFinite(v)) return String(v);
    if (Math.abs(v) < 1e-12) return '0';
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) return v.toExponential(2);
    return parseFloat(v.toPrecision(6)).toString();
  },

  /* Matriz en HTML. estado(i, j) → 'pend' | 'cero' | 'ok' | 'actual' | 'usa' */
  html(M, { nombre = '', estado = () => 'ok', vector = false } = {}) {
    const filas = M.map((fila, i) => `<tr>${(vector ? [fila] : fila).map((v, j) => {
      const e = estado(i, j);
      const txt = e === 'pend' ? '·' : NA.mat.num(v);
      return `<td class="c-${e}">${txt}</td>`;
    }).join('')}</tr>`).join('');
    return `
      <div class="matriz-wrap">
        ${nombre ? `<div class="matriz-nombre">${nombre}</div>` : ''}
        <table class="matriz"><tbody>${filas}</tbody></table>
      </div>`;
  },

  /* Editor de matriz n × n (y vector b opcional) */
  editor(root, n, A, b, conB) {
    root.innerHTML = `
      <div class="mat-editor" style="--n:${n}">
        <div class="mat-col">
          <div class="mat-label">A</div>
          <div class="mat-grid">
            ${A.map((fila, i) => fila.map((v, j) => `<input class="cell" data-i="${i}" data-j="${j}" value="${v}" inputmode="decimal" aria-label="a${i + 1}${j + 1}">`).join('')).join('')}
          </div>
        </div>
        ${conB ? `
        <div class="mat-col">
          <div class="mat-label">b</div>
          <div class="mat-grid b-grid">
            ${b.map((v, i) => `<input class="cell b" data-i="${i}" value="${v}" inputmode="decimal" aria-label="b${i + 1}">`).join('')}
          </div>
        </div>` : ''}
      </div>`;
  },

  leerEditor(root, n) {
    const A = NA.mat.ceros(n), b = Array(n).fill(0);
    let malo = null;
    root.querySelectorAll('.cell:not(.b)').forEach(inp => {
      const v = NA.mat.leer(inp.value);
      inp.classList.toggle('invalido', !isFinite(v));
      if (!isFinite(v) && !malo) malo = `a${NA.mat.sub(+inp.dataset.i + 1)}${NA.mat.sub(+inp.dataset.j + 1)}`;
      A[+inp.dataset.i][+inp.dataset.j] = v;
    });
    root.querySelectorAll('.cell.b').forEach(inp => {
      const v = NA.mat.leer(inp.value);
      inp.classList.toggle('invalido', !isFinite(v));
      if (!isFinite(v) && !malo) malo = `b${NA.mat.sub(+inp.dataset.i + 1)}`;
      b[+inp.dataset.i] = v;
    });
    return { A, b, malo };
  },

  /* Matriz aleatoria diagonalmente dominante (para medir rendimiento) */
  aleatoria(n, semilla = 1) {
    let s = semilla;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const A = NA.mat.ceros(n);
    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) if (i !== j) { A[i][j] = rnd() * 2 - 1; suma += Math.abs(A[i][j]); }
      A[i][i] = suma + 1 + rnd();
    }
    return A;
  },
};
