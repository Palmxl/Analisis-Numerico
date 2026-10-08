/* FACTORIZACIÓN LU — transcrita del pseudocódigo de clase */
(function () {
  const sub = n => NA.mat.sub(n);
  const f = v => NA.mat.num(v);

  /* Cómo repartir lᵢᵢ·uᵢᵢ = P según la diagonal elegida */
  const TIPOS = {
    doolittle: { nombre: 'Doolittle (lᵢᵢ = 1)', elegir: P => [1, P] },
    crout: { nombre: 'Crout (uᵢᵢ = 1)', elegir: P => [P, 1] },
    cholesky: { nombre: 'Cholesky (lᵢᵢ = uᵢᵢ)', elegir: P => [Math.sqrt(P), Math.sqrt(P)] },
  };

  /* Implementación fiel al pseudocódigo. Si registrar = true, guarda cada paso para la animación. */
  function factorizacionLU(A, tipo = 'doolittle', registrar = false) {
    const n = A.length;
    const elegir = TIPOS[tipo].elegir;
    const L = NA.mat.ceros(n), U = NA.mat.ceros(n);
    const pasos = [];
    let ops = 0;
    let escala = 0;
    A.forEach(fila => fila.forEach(v => { escala = Math.max(escala, Math.abs(v)); }));
    const esCero = v => !isFinite(v) || Math.abs(v) <= 1e-12 * Math.max(1, escala);
    const reg = p => { if (registrar) pasos.push(p); };
    const falla = (paso, i) => ({ ok: false, paso, i, L, U, ops, pasos, n });

    // Paso 1: l11·u11 = a11
    let [l, u] = elegir(A[0][0]);
    L[0][0] = l; U[0][0] = u;
    reg({ paso: 1, celdas: [['L', 0, 0], ['U', 0, 0]], usa: [[0, 0]],
      texto: [`l₁₁ · u₁₁ = a₁₁ = ${f(A[0][0])}`, `l₁₁ = ${f(l)},  u₁₁ = ${f(u)}`] });
    if (esCero(l * u)) return falla(1, 1);

    // Paso 2: primera fila de U y primera columna de L
    for (let j = 1; j < n; j++) {
      U[0][j] = A[0][j] / L[0][0];
      L[j][0] = A[j][0] / U[0][0];
      ops += 2;
      reg({ paso: 2, j: j + 1, celdas: [['U', 0, j], ['L', j, 0]], usa: [[0, j], [j, 0]],
        texto: [`u₁${sub(j + 1)} = a₁${sub(j + 1)} / l₁₁ = ${f(A[0][j])} / ${f(L[0][0])} = ${f(U[0][j])}`,
                `l${sub(j + 1)}₁ = a${sub(j + 1)}₁ / u₁₁ = ${f(A[j][0])} / ${f(U[0][0])} = ${f(L[j][0])}`] });
    }

    // Paso 3: para i = 2, ..., n − 1
    for (let i = 1; i < n - 1; i++) {
      // Paso 4: lii·uii = aii − Σ lik·uki
      let s = 0;
      for (let k = 0; k < i; k++) s += L[i][k] * U[k][i];
      ops += i;
      const P = A[i][i] - s;
      [l, u] = elegir(P);
      L[i][i] = l; U[i][i] = u;
      const I = sub(i + 1);
      reg({ paso: 4, i: i + 1, celdas: [['L', i, i], ['U', i, i]], usa: [[i, i]],
        texto: [`l${I}${I} · u${I}${I} = a${I}${I} − Σ l${I}ₖ uₖ${I} = ${f(A[i][i])} − (${f(s)}) = ${f(P)}`,
                `l${I}${I} = ${f(l)},  u${I}${I} = ${f(u)}`] });
      if (esCero(l * u)) return falla(4, i + 1);

      // Paso 5: fila i de U y columna i de L
      for (let j = i + 1; j < n; j++) {
        let s1 = 0, s2 = 0;
        for (let k = 0; k < i; k++) { s1 += L[i][k] * U[k][j]; s2 += L[j][k] * U[k][i]; }
        U[i][j] = (A[i][j] - s1) / L[i][i];
        L[j][i] = (A[j][i] - s2) / U[i][i];
        ops += 2 * i + 2;
        const J = sub(j + 1);
        reg({ paso: 5, i: i + 1, j: j + 1, celdas: [['U', i, j], ['L', j, i]], usa: [[i, j], [j, i]],
          texto: [`u${I}${J} = (a${I}${J} − Σ l${I}ₖ uₖ${J}) / l${I}${I} = (${f(A[i][j])} − (${f(s1)})) / ${f(L[i][i])} = ${f(U[i][j])}`,
                  `l${J}${I} = (a${J}${I} − Σ l${J}ₖ uₖ${I}) / u${I}${I} = (${f(A[j][i])} − (${f(s2)})) / ${f(U[i][i])} = ${f(L[j][i])}`] });
      }
    }

    // Paso 6: lnn·unn = ann − Σ lnk·ukn
    const m = n - 1, N = sub(n);
    let s = 0;
    for (let k = 0; k < m; k++) s += L[m][k] * U[k][m];
    ops += m;
    const P = A[m][m] - s;
    [l, u] = elegir(P);
    L[m][m] = l; U[m][m] = u;
    reg({ paso: 6, celdas: [['L', m, m], ['U', m, m]], usa: [[m, m]],
      texto: [`l${N}${N} · u${N}${N} = a${N}${N} − Σ l${N}ₖ uₖ${N} = ${f(A[m][m])} − (${f(s)}) = ${f(P)}`,
              `l${N}${N} = ${f(l)},  u${N}${N} = ${f(u)}`] });
    if (!isFinite(l * u)) return falla(6, n);   // (solo pasa en Cholesky con P < 0)

    // Paso 7: SALIDA (L, U)
    return { ok: true, L, U, ops, pasos, n, singular: esCero(l * u) };
  }

  /* Extra: con A = LU se resuelve Ax = b en dos sustituciones */
  function resolver(L, U, b) {
    const n = b.length, y = Array(n).fill(0), x = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let k = 0; k < i; k++) s += L[i][k] * y[k];
      y[i] = (b[i] - s) / L[i][i];
    }
    for (let i = n - 1; i >= 0; i--) {
      let s = 0;
      for (let k = i + 1; k < n; k++) s += U[i][k] * x[k];
      x[i] = (y[i] - s) / U[i][i];
    }
    return { y, x };
  }

  /* Rendimiento: se mide con matrices aleatorias de distintos tamaños (se guarda en caché) */
  const cacheRend = {};
  function medirRendimiento(tipo) {
    if (cacheRend[tipo]) return cacheRend[tipo];
    const tam = [2, 5, 10, 15, 20, 30, 40, 50, 60, 80, 100];
    const datos = tam.map(n => {
      const A = NA.mat.aleatoria(n, n * 7 + 3);
      const r = factorizacionLU(A, tipo);
      const t = NA.cronometrar(() => factorizacionLU(A, tipo));
      return { n, ops: r.ops, t };
    });
    return (cacheRend[tipo] = datos);
  }

  const PRESETS = [
    { nombre: 'Matriz 4×4 del libro', tipo: 'doolittle', A: [[1, 1, 0, 3], [2, 1, -1, 1], [3, -1, -1, 2], [-1, 2, 3, -1]], b: [8, 7, 14, -7] },
    { nombre: 'Misma matriz con Crout', tipo: 'crout', A: [[1, 1, 0, 3], [2, 1, -1, 1], [3, -1, -1, 2], [-1, 2, 3, -1]], b: [8, 7, 14, -7] },
    { nombre: 'Simétrica definida positiva (Cholesky)', tipo: 'cholesky', A: [[4, -1, 1], [-1, 4.25, 2.75], [1, 2.75, 3.5]], b: [1, 2, 3] },
    { nombre: 'Tridiagonal 5×5', tipo: 'doolittle', A: [[2, -1, 0, 0, 0], [-1, 2, -1, 0, 0], [0, -1, 2, -1, 0], [0, 0, -1, 2, -1], [0, 0, 0, -1, 2]], b: [1, 0, 0, 0, 1] },
    { nombre: '3×3 general', tipo: 'doolittle', A: [[2, -1, 1], [3, 3, 9], [3, 3, 5]], b: [-1, 0, 4] },
    { nombre: 'a₁₁ = 0  (imposible en el paso 1)', tipo: 'doolittle', A: [[0, 1], [1, 1]], b: [1, 2] },
    { nombre: 'Pivote nulo  (imposible en el paso 4)', tipo: 'doolittle', A: [[1, 2, 3], [2, 4, 5], [1, 3, 4]], b: [6, 11, 8] },
    { nombre: 'Matriz singular  (lₙₙuₙₙ = 0)', tipo: 'doolittle', A: [[1, 2], [2, 4]], b: [3, 6] },
  ];

  function montar(root) {
    let n = PRESETS[0].A.length;
    let A = PRESETS[0].A.map(r => r.slice()), b = PRESETS[0].b.slice();
    let estado = null, timer = null;

    root.innerHTML = `
      <div class="stack">
        <div class="box">
          <div class="box-head">
            <div>
              <div class="box-title">Parámetros</div>
              <div class="box-sub">Entrada: dimensión n y las entradas aᵢⱼ de A (acepta fracciones como 1/3)</div>
            </div>
          </div>
          <div class="lu-form">
            <div class="lu-controls">
              <div class="field">
                <label>Ejemplo</label>
                <select id="preset">
                  ${PRESETS.map((p, i) => `<option value="${i}">${p.nombre}</option>`).join('')}
                  <option value="-1">Personalizado…</option>
                </select>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Dimensión <span class="mono">n</span></label>
                  <select id="n">${[2, 3, 4, 5, 6, 7, 8].map(k => `<option value="${k}">${k} × ${k}</option>`).join('')}</select>
                </div>
                <div class="field">
                  <label>Diagonal</label>
                  <select id="tipo">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}">${t.nombre}</option>`).join('')}</select>
                </div>
              </div>
              <label class="switch"><input type="checkbox" id="conB" checked> Resolver también A x = b</label>
              <button class="btn" id="run" style="margin-top:16px">Factorizar</button>
              <div class="form-error" id="err"></div>
            </div>
            <div class="lu-editor">
              <div id="editor"></div>
            </div>
          </div>
        </div>
        <div class="stack" id="out"></div>
      </div>`;

    const $ = id => root.querySelector('#' + id);

    const pintarEditor = () => {
      NA.mat.editor($('editor'), n, A, b, $('conB').checked);
      $('editor').querySelectorAll('.cell').forEach(c => {
        c.addEventListener('input', () => { $('preset').value = '-1'; });
        c.addEventListener('keydown', e => { if (e.key === 'Enter') correr(); });
      });
    };
    const leerValores = () => {
      $('editor').querySelectorAll('.cell:not(.b)').forEach(c => { A[+c.dataset.i][+c.dataset.j] = c.value; });
      $('editor').querySelectorAll('.cell.b').forEach(c => { b[+c.dataset.i] = c.value; });
    };
    const cargarPreset = i => {
      const p = PRESETS[i];
      n = p.A.length; A = p.A.map(r => r.slice()); b = p.b.slice();
      $('n').value = n; $('tipo').value = p.tipo;
      pintarEditor();
    };

    $('preset').addEventListener('change', e => { if (+e.target.value >= 0) { cargarPreset(+e.target.value); correr(); } });
    $('n').addEventListener('change', e => {
      leerValores();
      const nuevo = +e.target.value;
      A = Array.from({ length: nuevo }, (_, i) => Array.from({ length: nuevo }, (_, j) => (A[i] && A[i][j] !== undefined ? A[i][j] : (i === j ? 1 : 0))));
      b = Array.from({ length: nuevo }, (_, i) => (b[i] !== undefined ? b[i] : 0));
      n = nuevo; $('preset').value = '-1';
      pintarEditor();
    });
    $('tipo').addEventListener('change', () => { $('preset').value = '-1'; correr(); });
    $('conB').addEventListener('change', () => { leerValores(); pintarEditor(); correr(); });
    $('run').addEventListener('click', () => correr());

    function correr() {
      $('err').textContent = '';
      const { A: An, b: bn, malo } = NA.mat.leerEditor($('editor'), n);
      if (malo) { $('err').textContent = `El valor de ${malo} no es un número válido.`; return; }
      const tipo = $('tipo').value;
      const res = factorizacionLU(An, tipo, true);
      const t = NA.cronometrar(() => factorizacionLU(An, tipo));
      const conB = $('conB').checked;
      let sol = null;
      if (res.ok && !res.singular && conB) {
        sol = resolver(res.L, res.U, bn);
        const Ax = An.map(fila => fila.reduce((s, v, j) => s + v * sol.x[j], 0));
        sol.residuo = Math.max(...Ax.map((v, i) => Math.abs(v - bn[i])));
      }
      estado = { A: An, b: bn, tipo, res, t, sol, conB, k: res.pasos.length - 1 };
      render();
    }

    function render() {
      if (!estado) return;
      if (timer) { clearInterval(timer); timer = null; }
      NA.charts.destruirTodas();
      const { A, tipo, res, t, sol, conB } = estado;
      const out = $('out');
      const S = res.pasos.length;
      const us = ms => ms * 1000 < 1000 ? (ms * 1000).toFixed(1) + ' µs' : ms.toFixed(2) + ' ms';
      const det = res.ok ? res.L.reduce((p, fila, i) => p * fila[i] * res.U[i][i], 1) : null;
      const LU = res.ok ? NA.mat.multiplicar(res.L, res.U) : null;
      const residuo = LU ? NA.mat.normaDif(A, LU) : null;
      const opsTeo = Math.round(n ** 3 / 3);

      out.innerHTML = `
        <div>
          <div class="result-banner ${res.ok ? 'ok' : 'fail'}">
            <div class="ico">${res.ok ? '✓' : '✕'}</div>
            <div>${res.ok
              ? `<b>Éxito:</b> se obtuvo la factorización A = LU con ${TIPOS[tipo].nombre}.${res.singular ? ' <b>Nota:</b> lₙₙuₙₙ = 0, entonces A = LU pero A es <b>singular</b>.' : ''}`
              : `<b>Factorización imposible:</b> l${sub(res.i)}${sub(res.i)}·u${sub(res.i)}${sub(res.i)} = 0 en el paso ${res.paso}${tipo === 'cholesky' && res.paso !== 1 ? ' (o el valor quedó negativo y no tiene raíz real)' : ''}. Hace falta intercambiar filas (pivoteo).`}</div>
          </div>
          <div class="stats">
            <div class="stat"><div class="k">Dimensión</div><div class="v">${n} × ${n}</div></div>
            <div class="stat"><div class="k">Operaciones (× y ÷)</div><div class="v">${res.ops} <small>orden n³/3 ≈ ${opsTeo}</small></div></div>
            <div class="stat"><div class="k">det(A) = Π lᵢᵢuᵢᵢ</div><div class="v">${det === null ? '—' : f(det)}</div></div>
            <div class="stat"><div class="k">‖A − LU‖∞</div><div class="v">${residuo === null ? '—' : NA.fmt(residuo, 3)}</div></div>
            <div class="stat"><div class="k">Tiempo de ejecución</div><div class="v">${us(t)}</div></div>
          </div>
        </div>

        <div class="box">
          <div class="box-title">Paso a paso</div>
          <div class="box-sub">Cada paso calcula una entrada de L y una de U a partir de A y de lo ya calculado</div>
          <div class="legend">
            <span><i class="band" style="background:var(--s1-soft);border:1px solid var(--s1)"></i>calculado en este paso</span>
            <span><i class="band" style="background:none;border:1.5px dashed var(--hl)"></i>entradas de A usadas</span>
            <span><i class="band" style="background:var(--surface-2)"></i>pendiente</span>
          </div>
          <div class="mats" id="mats"></div>
          <div class="paso-texto" id="pasoTexto"></div>
          <div class="stepper">
            <button id="first" title="Primer paso">«</button>
            <button id="prev" title="Anterior">‹</button>
            <button id="play" title="Reproducir">▶</button>
            <button id="next" title="Siguiente">›</button>
            <button id="last" title="Último paso">»</button>
            <input type="range" id="slider" min="0" max="${S - 1}" value="${estado.k}">
            <span class="lbl" id="lbl"></span>
          </div>
        </div>

        ${res.ok ? `
        <div class="box">
          <div class="box-title">Resultado</div>
          <div class="box-sub">Comprobación: el producto L · U debe reproducir A</div>
          <div class="mats">
            ${NA.mat.html(res.L, { nombre: 'L', estado: (i, j) => j > i ? 'cero' : 'ok' })}
            <div class="mat-op">·</div>
            ${NA.mat.html(res.U, { nombre: 'U', estado: (i, j) => j < i ? 'cero' : 'ok' })}
            <div class="mat-op">=</div>
            ${NA.mat.html(LU, { nombre: 'L · U' })}
          </div>
        </div>` : ''}

        ${sol ? `
        <div class="box">
          <div class="box-title">Solución de A x = b</div>
          <div class="box-sub">Con A = LU: primero L y = b (sustitución hacia adelante), luego U x = y (sustitución hacia atrás)</div>
          <div class="mats">
            ${NA.mat.html(estado.b, { nombre: 'b', vector: true })}
            <div class="mat-op">→</div>
            ${NA.mat.html(sol.y, { nombre: 'y', vector: true })}
            <div class="mat-op">→</div>
            ${NA.mat.html(sol.x, { nombre: 'x', vector: true, estado: () => 'actual' })}
          </div>
          <div class="note">Residuo ‖Ax − b‖∞ = ${NA.fmt(sol.residuo, 3)}. Una vez que se tiene A = LU, resolver con otro b cuesta solo ≈ n² operaciones, en lugar de volver a factorizar (≈ n³/3).</div>
        </div>` : (conB && res.ok && res.singular ? `<div class="note">A es singular: el sistema A x = b no tiene solución única.</div>` : '')}

        <div class="box">
          <div class="box-title">Rendimiento</div>
          <div class="box-sub">Factorización de matrices aleatorias de distintos tamaños con ${TIPOS[tipo].nombre}</div>
          <div class="grid-2" style="margin-top:0">
            <div>
              <div class="legend">
                <span><i style="background:var(--s1)"></i>operaciones medidas</span>
                <span><i style="background:none;height:0;border-top:2px dashed var(--muted)"></i>n³/3</span>
              </div>
              <div class="plot-wrap sm"><canvas id="cOps"></canvas></div>
            </div>
            <div>
              <div class="legend"><span><i style="background:var(--s1)"></i>tiempo por factorización</span></div>
              <div class="plot-wrap sm"><canvas id="cTiempo"></canvas></div>
            </div>
          </div>
          <div class="note">El costo crece como n³: duplicar el tamaño de la matriz multiplica el trabajo por ≈ 8.</div>
        </div>`;

      /* --- Animación paso a paso --- */
      const lbl = $('lbl'), slider = $('slider');
      const mostrar = k => {
        estado.k = k;
        const hechas = { L: new Set(), U: new Set() };
        res.pasos.slice(0, k).forEach(p => p.celdas.forEach(([M, i, j]) => hechas[M].add(i + ',' + j)));
        const p = res.pasos[k];
        const actual = { L: new Set(), U: new Set() };
        p.celdas.forEach(([M, i, j]) => actual[M].add(i + ',' + j));
        const usa = new Set(p.usa.map(([i, j]) => i + ',' + j));
        const est = (M, triang) => (i, j) => {
          const key = i + ',' + j;
          if (actual[M].has(key)) return 'actual';
          if (hechas[M].has(key)) return 'ok';
          if (triang(i, j)) return 'cero';
          return 'pend';
        };
        $('mats').innerHTML = `
          ${NA.mat.html(A, { nombre: 'A', estado: (i, j) => usa.has(i + ',' + j) ? 'usa' : 'ok' })}
          <div class="mat-op">=</div>
          ${NA.mat.html(res.L, { nombre: 'L', estado: est('L', (i, j) => j > i) })}
          <div class="mat-op">·</div>
          ${NA.mat.html(res.U, { nombre: 'U', estado: est('U', (i, j) => j < i) })}`;
        const titulo = `Paso ${p.paso}` + (p.i ? ` · i = ${p.i}` : '') + (p.j ? `${p.i ? ',' : ' ·'} j = ${p.j}` : '');
        $('pasoTexto').innerHTML = `<div class="paso-titulo">${titulo}</div>${p.texto.map(l => `<div>${l}</div>`).join('')}`;
        slider.value = k;
        lbl.textContent = `${k + 1} / ${S}`;
      };
      mostrar(Math.min(estado.k, S - 1));
      slider.addEventListener('input', e => mostrar(+e.target.value));
      $('first').onclick = () => mostrar(0);
      $('prev').onclick = () => mostrar(Math.max(0, estado.k - 1));
      $('next').onclick = () => mostrar(Math.min(S - 1, estado.k + 1));
      $('last').onclick = () => mostrar(S - 1);
      $('play').onclick = () => {
        if (timer) { clearInterval(timer); timer = null; $('play').textContent = '▶'; return; }
        if (estado.k >= S - 1) mostrar(0);
        $('play').textContent = '❚❚';
        timer = setInterval(() => {
          if (estado.k >= S - 1) { clearInterval(timer); timer = null; $('play').textContent = '▶'; return; }
          mostrar(estado.k + 1);
        }, 900);
      };

      /* --- Rendimiento --- */
      const tm = NA.charts.tema();
      const datos = medirRendimiento(tipo);
      const nMax = datos[datos.length - 1].n;
      const teo = [];
      for (let k = 2; k <= nMax; k += 2) teo.push({ x: k, y: k ** 3 / 3 });
      const serie = (label, data, extra = {}) => ({
        label, data, showLine: true, borderColor: tm.s1, backgroundColor: tm.s1, borderWidth: 2,
        pointRadius: 3.5, pointHoverRadius: 5, pointBorderColor: tm.surface, pointBorderWidth: 1, ...extra,
      });
      const tip = fmtY => ({ mode: 'nearest', intersect: false, filter: i => i.dataset.tip !== false,
        callbacks: { title: c => 'n = ' + c[0].parsed.x, label: c => `${c.dataset.label}: ${fmtY(c.parsed.y)}` } });
      NA.charts.crear($('cOps'), {
        type: 'scatter',
        data: { datasets: [
          serie('operaciones', datos.map(d => ({ x: d.n, y: d.ops }))),
          { label: 'n³/3', data: teo, showLine: true, borderColor: tm.muted, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, tip: false },
        ] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'n' }); s.x.min = 0; s.x.max = nMax; s.y.ticks.callback = v => v >= 1000 ? (v / 1000) + 'k' : v; return s; })(),
          plugins: { tooltip: tip(v => Math.round(v).toLocaleString('es')) },
        },
      });
      NA.charts.crear($('cTiempo'), {
        type: 'scatter',
        data: { datasets: [serie('tiempo', datos.map(d => ({ x: d.n, y: d.t })))] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'n', yTitle: 'ms' }); s.x.min = 0; s.x.max = nMax; return s; })(),
          plugins: { tooltip: tip(v => us(v)) },
        },
      });
    }

    NA.charts.redibujar = render;
    cargarPreset(0);
    correr();
  }

  NA.registrar({
    id: 'factorizacion-lu',
    nombre: 'Factorización LU',
    alias: 'Doolittle · Crout · Cholesky',
    unidad: 'Sistemas de ecuaciones lineales',
    resumen: 'Escribe A = LU, con L triangular inferior y U triangular superior, para luego resolver sistemas A x = b con dos sustituciones.',
    tags: ['Método directo', 'Costo ≈ n³/3', 'Sin pivoteo'],
    ejecutar: factorizacionLU,

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <g font-family="JetBrains Mono" font-size="13" fill="var(--muted)">
          <text x="44" y="22">A</text><text x="141" y="22">L</text><text x="236" y="22">U</text>
        </g>
        <rect x="16" y="32" width="70" height="70" rx="6" fill="var(--s1-soft)" stroke="var(--s1)" stroke-width="1.5"/>
        <text x="96" y="74" font-size="18" fill="var(--muted)">=</text>
        <path d="M114 32 L114 102 L184 102 Z" fill="var(--s1-soft)" stroke="var(--s1)" stroke-width="1.5" stroke-linejoin="round"/>
        <text x="194" y="74" font-size="18" fill="var(--muted)">·</text>
        <path d="M210 32 L280 32 L280 102 Z" fill="var(--s1-soft)" stroke="var(--s1)" stroke-width="1.5" stroke-linejoin="round"/>
        <g stroke="var(--s1)" stroke-width="2" opacity=".6"><line x1="114" y1="32" x2="184" y2="102"/><line x1="210" y1="32" x2="280" y2="102"/></g>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>FACTORIZACIÓN LU</h3>
      <div class="cm">Para factorizar la matriz \(n \times n\) \(A = [a_{ij}]\) en el producto de la matriz triangular inferior
      \(L = [l_{ij}]\) y la matriz triangular superior \(U = [u_{ij}]\), es decir \(A = LU\), donde la diagonal principal ya sea de
      \(L\) o \(U\) consta sólo de unos:</div>
      <div class="gap"></div>
      <div><span class="sec">ENTRADA</span> &nbsp;dimensión \(n\); las entradas \(a_{ij}\), \(1 \le i, j \le n\) de \(A\); la diagonal \(l_{11} = \cdots = l_{nn} = 1\) de \(L\) o la diagonal \(u_{11} = \cdots = u_{nn} = 1\) de \(U\).</div>
      <div><span class="sec">SALIDA</span> &nbsp;las entradas \(l_{ij}\), \(1 \le j \le i\), \(1 \le i \le n\) de \(L\) y las entradas \(u_{ij}\), \(i \le j \le n\), \(1 \le i \le n\) de \(U\).</div>
      <div class="gap"></div>
      <div><span class="kw">Paso 1</span> &nbsp;Seleccione \(l_{11}\) y \(u_{11}\) al satisfacer \(l_{11}u_{11} = a_{11}\).</div>
      <div class="ind2"><span class="cond"><span class="kw">Si</span> \(l_{11}u_{11} = 0\)</span> <span class="kw">entonces</span> SALIDA ('Factorización imposible');</div>
      <div class="ind2"><span class="stop">PARE.</span></div>
      <div><span class="kw">Paso 2</span> &nbsp;<span class="kw">Para</span> \(j = 2, \dots, n\) determine \(u_{1j} = a_{1j}/l_{11}\); &nbsp;<span class="cm">(Primera fila de \(U\).)</span></div>
      <div class="ind3">\(l_{j1} = a_{j1}/u_{11}\). &nbsp;<span class="cm">(Primera columna de \(L\).)</span></div>
      <div><span class="kw">Paso 3</span> &nbsp;<span class="kw">Para</span> \(i = 2, \dots, n-1\) <span class="kw">haga</span> los pasos 4 y 5.</div>
      <div class="ind1"><span class="kw">Paso 4</span> &nbsp;Seleccione \(l_{ii}\) y \(u_{ii}\) al satisfacer \(l_{ii}u_{ii} = a_{ii} - \sum_{k=1}^{i-1} l_{ik}u_{ki}\).</div>
      <div class="ind2"><span class="cond"><span class="kw">Si</span> \(l_{ii}u_{ii} = 0\)</span> <span class="kw">entonces</span> SALIDA ('Factorización imposible');</div>
      <div class="ind2"><span class="stop">PARE.</span></div>
      <div class="ind1"><span class="kw">Paso 5</span> &nbsp;<span class="kw">Para</span> \(j = i+1, \dots, n\)</div>
      <div class="ind2">Determine $$u_{ij} = \frac{1}{l_{ii}}\left[a_{ij} - \sum_{k=1}^{i-1} l_{ik}u_{kj}\right]; \quad \text{(i-ésima fila de } U\text{.)}$$</div>
      <div class="ind2">$$l_{ji} = \frac{1}{u_{ii}}\left[a_{ji} - \sum_{k=1}^{i-1} l_{jk}u_{ki}\right]. \quad \text{(i-ésima columna de } L\text{.)}$$</div>
      <div><span class="kw">Paso 6</span> &nbsp;Seleccione \(l_{nn}\) y \(u_{nn}\) al satisfacer \(l_{nn}u_{nn} = a_{nn} - \sum_{k=1}^{n-1} l_{nk}u_{kn}\).</div>
      <div class="ind1"><span class="cm">(Nota: Si \(l_{nn}u_{nn} = 0\), entonces \(A = LU\) pero \(A\) es singular.)</span></div>
      <div><span class="kw">Paso 7</span> &nbsp;SALIDA (\(l_{ij}\) para \(j = 1, \dots, i\) y \(i = 1, \dots, n\));</div>
      <div class="ind2">SALIDA (\(u_{ij}\) para \(j = i, \dots, n\) y \(i = 1, \dots, n\));</div>
      <div class="ind2"><span class="stop">PARE.</span></div>`,

    python: `def factorizacion_lu(A, diagonal="L"):
    """Factorización LU (A = L·U).

    Entrada: A matriz n x n (lista de listas).
             diagonal = "L" -> l_ii = 1 (Doolittle)
             diagonal = "U" -> u_ii = 1 (Crout)
    Salida:  L (triangular inferior) y U (triangular superior).
    """
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    U = [[0.0] * n for _ in range(n)]

    def seleccionar(producto):
        # l_ii * u_ii = producto
        return (1.0, producto) if diagonal == "L" else (producto, 1.0)

    # Paso 1
    L[0][0], U[0][0] = seleccionar(A[0][0])
    if L[0][0] * U[0][0] == 0:
        print("Factorización imposible")
        return None

    # Paso 2
    for j in range(1, n):
        U[0][j] = A[0][j] / L[0][0]          # primera fila de U
        L[j][0] = A[j][0] / U[0][0]          # primera columna de L

    # Paso 3
    for i in range(1, n - 1):
        # Paso 4
        suma = sum(L[i][k] * U[k][i] for k in range(i))
        L[i][i], U[i][i] = seleccionar(A[i][i] - suma)
        if L[i][i] * U[i][i] == 0:
            print("Factorización imposible")
            return None

        # Paso 5
        for j in range(i + 1, n):
            U[i][j] = (A[i][j] - sum(L[i][k] * U[k][j] for k in range(i))) / L[i][i]
            L[j][i] = (A[j][i] - sum(L[j][k] * U[k][i] for k in range(i))) / U[i][i]

    # Paso 6
    suma = sum(L[n - 1][k] * U[k][n - 1] for k in range(n - 1))
    L[n - 1][n - 1], U[n - 1][n - 1] = seleccionar(A[n - 1][n - 1] - suma)
    if L[n - 1][n - 1] * U[n - 1][n - 1] == 0:
        print("Nota: A = LU pero A es singular")

    # Paso 7
    return L, U


# Ejemplo
A = [[1, 1, 0, 3],
     [2, 1, -1, 1],
     [3, -1, -1, 2],
     [-1, 2, 3, -1]]
L, U = factorizacion_lu(A)`,

    montar,
  });
})();
