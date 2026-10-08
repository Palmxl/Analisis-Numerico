/* Simulador reutilizable para métodos abiertos de búsqueda de raíces
   (Newton-Raphson y, más adelante, secante, punto fijo...).
   Parten de un valor inicial x₀; opcionalmente se comparan con los métodos
   cerrados si se da un intervalo [a, b] con cambio de signo. */
NA.raices.montarAbierto = function (root, cfg) {
  const { presets, ejecutar, nombreCorto, color = 's2', dibujarIteracion, leyendaExtra = '', usaDerivada = true,
          nombreF = 'f', indice = 'n', x0Label = 'x₀', MLabel = 'M',
          // f usada por los métodos cerrados de la comparación (punto fijo usa x − g(x))
          fComparar = f => f,
          residuo = { etiqueta: '|f(p)|', valor: (f, p) => Math.abs(f(p)) },
          mensajeExito = 'se obtuvo una aproximación de',
          textoLineal = 'convergencia <b>lineal</b> (típico de una raíz múltiple, donde f′(p) = 0).',
          statsExtra = () => '', graficaPrincipal = null,
          subGrafica = 'Cada paso sigue la recta tangente desde (xₙ, f(xₙ)) hasta el eje x',
          leyendaPrincipal = null, columnas = null, tarjeta = null, motivosExtra = {},
          segundo = null /* { label: 'p₁' }: segundo valor inicial */ } = cfg;
  const colorSoft = color + 'soft';

  root.innerHTML = `
    <div class="sim">
      <aside class="box sim-inputs">
        <div class="box-title">Parámetros</div>
        <div class="box-sub">Entrada del algoritmo</div>
        <div class="field">
          <label>Ejemplo</label>
          <select id="preset">
            ${presets.map((p, i) => `<option value="${i}">${p.nombre}</option>`).join('')}
            <option value="-1">Personalizado…</option>
          </select>
        </div>
        <div class="field">
          <label><span class="mono">${nombreF}(x)</span> = función</label>
          <input id="fx" spellcheck="false" autocomplete="off">
          <div class="fx-preview" id="fxPrev"></div>
        </div>
        ${usaDerivada ? `
        <div class="field">
          <label class="label-row"><span><span class="mono">f′(x)</span> = derivada</span>
            <button type="button" class="mini-btn" id="derivar" title="Calcular la derivada simbólicamente">Derivar automáticamente</button></label>
          <input id="dfx" spellcheck="false" autocomplete="off">
          <div class="fx-preview" id="dfxPrev"></div>
        </div>` : ''}
        ${segundo ? `
        <div class="field-row">
          <div class="field"><label><span class="mono">${x0Label}</span> inicial</label><input id="x0" inputmode="decimal"></div>
          <div class="field"><label><span class="mono">${segundo.label}</span> inicial</label><input id="x1" inputmode="decimal"></div>
        </div>
        <div class="field-row">
          <div class="field"><label><span class="mono">ε</span> tolerancia</label><input id="tol" inputmode="decimal"></div>
          <div class="field"><label><span class="mono">${MLabel}</span> máx. iter.</label><input id="M" inputmode="numeric"></div>
        </div>` : `
        <div class="field-row">
          <div class="field"><label><span class="mono">${x0Label}</span> valor inicial</label><input id="x0" inputmode="decimal"></div>
          <div class="field"><label><span class="mono">${MLabel}</span> máx. iter.</label><input id="M" inputmode="numeric"></div>
        </div>
        <div class="field">
          <label><span class="mono">ε</span> precisión deseada</label><input id="tol" inputmode="decimal">
        </div>`}
        <div class="sub-sec">
          <div class="sub-title">Comparar con métodos cerrados <span>(opcional)</span></div>
          <div class="field-row">
            <div class="field"><label><span class="mono">a</span></label><input id="ca" inputmode="decimal" placeholder="—"></div>
            <div class="field"><label><span class="mono">b</span></label><input id="cb" inputmode="decimal" placeholder="—"></div>
          </div>
          <div class="hint">${cfg.hintComparar || 'Intervalo con f(a)·f(b) &lt; 0 para correr también regla falsa y bisección.'}</div>
        </div>
        <button class="btn" id="run" style="margin-top:14px">Ejecutar algoritmo</button>
        <div class="form-error" id="err"></div>
        <div class="form-warn" id="warn"></div>
      </aside>
      <div class="stack" id="out"></div>
    </div>`;

  const $ = id => root.querySelector('#' + id);
  const inp = { fx: $('fx'), dfx: $('dfx'), x0: $('x0'), x1: $('x1'), tol: $('tol'), M: $('M'), ca: $('ca'), cb: $('cb') };

  const preview = (input, el, pre) => {
    if (!input) return;
    try { el.innerHTML = NA.tex(pre + NA.compilar(input.value).tex); }
    catch (e) { el.innerHTML = '<span style="color:var(--muted)">…</span>'; }
  };
  const previews = () => { preview(inp.fx, $('fxPrev'), nombreF + '(x) = '); preview(inp.dfx, $('dfxPrev'), "f'(x) = "); };

  const cargarPreset = i => {
    const p = presets[i];
    if (!p) return;
    inp.fx.value = p.f; if (inp.dfx) inp.dfx.value = p.df || '';
    inp.x0.value = p.x0; if (inp.x1) inp.x1.value = p.x1; inp.tol.value = p.tol; inp.M.value = p.M;
    inp.ca.value = p.a ?? ''; inp.cb.value = p.b ?? '';
    previews();
  };

  $('preset').addEventListener('change', e => { if (+e.target.value >= 0) { cargarPreset(+e.target.value); correr(); } });
  Object.values(inp).filter(Boolean).forEach(el => {
    el.addEventListener('input', () => { $('preset').value = '-1'; if (el === inp.fx || el === inp.dfx) previews(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') correr(); });
  });
  if (usaDerivada) {
    $('derivar').addEventListener('click', () => {
      try {
        inp.dfx.value = math.simplify(math.derivative(inp.fx.value, 'x')).toString();
        $('preset').value = '-1'; previews();
      } catch (e) { $('err').textContent = 'No se pudo derivar f(x): ' + e.message; }
    });
  }
  $('run').addEventListener('click', () => correr());

  let estado = null, timer = null;

  function correr() {
    $('err').textContent = ''; $('warn').textContent = '';
    let F, DF = null;
    try { F = NA.compilar(inp.fx.value); }
    catch (e) { $('err').textContent = `No se pudo leer ${nombreF}(x): ` + e.message; return; }
    if (usaDerivada) {
      try { DF = NA.compilar(inp.dfx.value); }
      catch (e) { $('err').textContent = "No se pudo leer f′(x): " + e.message; return; }
    }
    const x0 = Number(inp.x0.value), tol = Number(inp.tol.value), M = Number(inp.M.value);
    if (inp.x0.value === '' || ![x0, tol, M].every(isFinite)) { $('err').textContent = `${x0Label}, ε y ${MLabel} deben ser numéricos.`; return; }
    if (!(tol > 0)) { $('err').textContent = 'La precisión ε debe ser positiva.'; return; }
    if (!(M >= 1) || !Number.isInteger(M)) { $('err').textContent = `${MLabel} debe ser un entero ≥ 1.`; return; }
    if (M > 100000) { $('err').textContent = `${MLabel} es demasiado grande (máx. 100000).`; return; }
    if (!isFinite(F.f(x0))) { $('err').textContent = `${nombreF} no está definida en ${x0Label}.`; return; }
    const x1 = segundo ? Number(inp.x1.value) : null;
    if (segundo) {
      if (inp.x1.value === '' || !isFinite(x1)) { $('err').textContent = `${segundo.label} debe ser numérico.`; return; }
      if (x1 === x0) { $('err').textContent = `${x0Label} y ${segundo.label} deben ser distintos.`; return; }
      if (!isFinite(F.f(x1))) { $('err').textContent = `${nombreF} no está definida en ${segundo.label}.`; return; }
    }

    // ¿f′ es realmente la derivada de f? (comparación con diferencias centrales)
    if (DF) {
      const malos = [x0, x0 + 0.37, x0 - 0.61].filter(x => {
        const h = 1e-5 * Math.max(1, Math.abs(x));
        const num = (F.f(x + h) - F.f(x - h)) / (2 * h), d = DF.f(x);
        return isFinite(num) && isFinite(d) && Math.abs(num - d) > 1e-3 * Math.max(1, Math.abs(num));
      });
      if (malos.length) $('warn').textContent = '⚠ f′(x) no parece ser la derivada de f(x). Revisa o usa "Derivar automáticamente".';
    }

    const correrMetodo = () => usaDerivada ? ejecutar(F.f, DF.f, x0, tol, M)
      : segundo ? ejecutar(F.f, x0, x1, tol, M) : ejecutar(F.f, x0, tol, M);
    const res = correrMetodo();
    const t = NA.cronometrar(correrMetodo);
    const xsPropia = [x0, ...(segundo ? [x1] : []), ...res.iter.map(i => i.xn)];
    const orden = NA.ordenConvergencia(xsPropia);

    // Comparación opcional con métodos cerrados
    let comp = null;
    const a = Number(inp.ca.value), b = Number(inp.cb.value);
    const fc = fComparar(F.f);
    if (inp.ca.value !== '' && inp.cb.value !== '') {
      if (!(a < b) || !isFinite(a) || !isFinite(b)) $('warn').textContent += ' La comparación necesita a < b.';
      else if (!(fc(a) * fc(b) < 0)) $('warn').textContent += ' No hay cambio de signo en [a, b]: se omite la comparación.';
      else {
        const rf = NA.buscar('regla-falsa');
        comp = [
          rf && { nombre: 'Regla falsa', color: 's1', ejecutar: rf.ejecutar },
          { nombre: 'Bisección', color: 's3', ejecutar: NA.raices.biseccion },
        ].filter(Boolean).map(m => {
          const r = m.ejecutar(fc, a, b, tol, M);
          return { ...m, res: r, t: NA.cronometrar(() => m.ejecutar(fc, a, b, tol, M)), xs: r.iter.map(i => i.x), orden: NA.ordenConvergencia(r.iter.map(i => i.x)) };
        });
      }
    }

    estado = { F, DF, fc, x0, tol, M, res, t, orden, xsPropia, comp, k: Math.max(0, res.iter.length - 1), zoom: false };
    render();
  }

  function render() {
    if (!estado) return;
    if (timer) { clearInterval(timer); timer = null; }
    NA.charts.destruirTodas();
    const { F, M, tol, res, t, orden, comp } = estado;
    const out = $('out');
    const N = res.iter.length;
    const last = res.iter[N - 1];
    const us = ms => ms * 1000 < 1000 ? (ms * 1000).toFixed(1) + ' µs' : ms.toFixed(2) + ' ms';
    const motivos = {
      derivada: `f′(x<sub>${N ? N : 0}</sub>) = 0: la recta tangente es horizontal y no corta el eje x.`,
      diverge: 'la sucesión se fue al infinito (divergió).',
      max: `después de ${M} iteraciones no se logró la precisión deseada.`,
      ...Object.fromEntries(Object.entries(motivosExtra).map(([k, f]) => [k, f(estado)])),
    };
    const cols = columnas || [
      ['n', it => it.n], ['xₙ', it => NA.fmt(it.x, 14)], ['f(xₙ)', it => NA.fmt(it.fx, 6)],
      ...(usaDerivada ? [['f′(xₙ)', it => NA.fmt(it.dfx, 6)]] : []),
      ['xₙ₊₁', it => NA.fmt(it.xn, 14)], ['eₙ₊₁', it => NA.fmt(it.err, 5)],
    ];
    const evalTxt = r => r.evalsD !== undefined ? `${r.evals} <small>f</small> + ${r.evalsD} <small>f′</small>` : `${r.evals}`;

    out.innerHTML = `
      <div>
        <div class="result-banner ${res.ok ? 'ok' : 'fail'}">
          <div class="ico">${res.ok ? '✓' : '✕'}</div>
          <div>${res.ok
            ? `<b>Éxito:</b> ${mensajeExito} p ≈ <span class="mono">${NA.fmt(res.p, 14)}</span>`
            : `<b>Fracaso:</b> ${motivos[res.motivo] || motivos.max}`}</div>
        </div>
        <div class="stats">
          <div class="stat"><div class="k">Aproximación p</div><div class="v">${NA.fmt(res.p, 12)}</div></div>
          <div class="stat"><div class="k">Iteraciones</div><div class="v">${N} <small>/ ${M}</small></div></div>
          <div class="stat"><div class="k">Error final eₙ₊₁</div><div class="v">${last ? NA.fmt(last.err, 4) : '—'}</div></div>
          <div class="stat"><div class="k">${residuo.etiqueta}</div><div class="v">${NA.fmt(residuo.valor(F.f, res.p), 4)}</div></div>
          <div class="stat"><div class="k">Orden α estimado</div><div class="v">${orden.alpha === null ? '—' : orden.alpha.toFixed(2)}</div></div>
          <div class="stat"><div class="k">Tiempo de ejecución</div><div class="v">${us(t)}</div></div>
          ${statsExtra(estado)}
        </div>
      </div>

      ${N ? `
      <div class="box">
        <div class="box-head">
          <div>
            <div class="box-title">Gráfica del método</div>
            <div class="box-sub">${subGrafica}</div>
          </div>
          <label class="switch"><input type="checkbox" id="zoom" ${estado.zoom ? 'checked' : ''}> Enfocar iteración</label>
        </div>
        <div class="legend">
          ${leyendaPrincipal || `<span><i style="background:var(--curve)"></i>f(x)</span>
          ${leyendaExtra}
          <span><i class="dot" style="background:var(--${color})"></i>xₙ₊₁</span>
          <span><i class="dot" style="background:var(--muted)"></i>x anteriores</span>`}
        </div>
        <div class="plot-wrap"><canvas id="cMain"></canvas></div>
        <div class="stepper">
          <button id="first" title="Primera iteración">«</button>
          <button id="prev" title="Anterior">‹</button>
          <button id="play" title="Reproducir">▶</button>
          <button id="next" title="Siguiente">›</button>
          <button id="last" title="Última iteración">»</button>
          <input type="range" id="slider" min="0" max="${N - 1}" value="${estado.k}">
          <span class="lbl" id="lbl"></span>
        </div>
        <div class="iter-card" id="iterCard"></div>
      </div>

      <div class="grid-2">
        <div class="box">
          <div class="box-title">Convergencia</div>
          <div class="box-sub">eₙ₊₁ = |xₙ₊₁ − xₙ| por iteración (escala log)</div>
          <div class="legend">
            <span><i style="background:var(--${color})"></i>${nombreCorto}</span>
            <span><i style="background:none;height:0;border-top:2px dashed var(--muted)"></i>precisión ε</span>
          </div>
          <div class="plot-wrap sm"><canvas id="cErr"></canvas></div>
        </div>
        <div class="box">
          <div class="box-title">Orden de convergencia</div>
          <div class="box-sub">eₙ₊₁ contra eₙ en escala log-log: la pendiente es el orden α</div>
          <div class="legend">
            <span><i class="dot" style="background:var(--${color})"></i>(eₙ, eₙ₊₁)</span>
            <span><i style="background:none;height:0;border-top:2px dashed var(--muted)"></i>pendiente 1</span>
            <span><i style="background:none;height:0;border-top:2px dotted var(--text-2)"></i>pendiente 2</span>
          </div>
          <div class="plot-wrap sm"><canvas id="cOrden"></canvas></div>
        </div>
      </div>` : ''}

      <div class="box">
        <div class="box-title">Rendimiento y comparación</div>
        <div class="box-sub">${comp
          ? (cfg.subComparar || `Error real |xₖ − p| de cada método sobre la misma f (cada uno con su criterio de parada)`)
          : `Agrega un intervalo [a, b] en los parámetros para comparar con regla falsa y bisección`}</div>
        ${comp ? `
          <div class="legend">
            <span><i style="background:var(--${color})"></i>${nombreCorto}</span>
            ${comp.map(c => `<span><i style="background:var(--${c.color})"></i>${c.nombre}</span>`).join('')}
          </div>
          <div class="plot-wrap sm"><canvas id="cComp"></canvas></div>` : ''}
        <div class="table-wrap" style="max-height:none;margin-top:14px">
          <table>
            <thead><tr><th style="text-align:left">Método</th><th>Resultado</th><th>Iteraciones</th><th>Evaluaciones</th><th>Tiempo</th><th>Orden α</th><th>Aproximación</th></tr></thead>
            <tbody>
              ${[{ nombre: nombreCorto, res, t, orden }, ...(comp || [])].map(m => `
                <tr style="cursor:default">
                  <td style="text-align:left;font-family:var(--font)">${m.nombre}</td>
                  <td style="color:${m.res.ok ? 'var(--good)' : 'var(--bad)'}">${m.res.ok ? 'Éxito' : 'Fracaso'}</td>
                  <td>${m.res.iter.length}</td><td>${evalTxt(m.res)}</td><td>${us(m.t)}</td>
                  <td>${m.orden.alpha === null ? '—' : m.orden.alpha.toFixed(3)}</td>
                  <td>${NA.fmt(m.res.p, 12)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="note">${veredicto()}</div>
      </div>

      ${N ? `
      <div class="box">
        <div class="box-title">Tabla de iteraciones</div>
        <div class="box-sub">Haz clic en una fila para verla en la gráfica</div>
        <div class="table-wrap">
          <table>
            <thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead>
            <tbody id="tbody">
              ${res.iter.map((it, i) => `
                <tr data-k="${i}" class="${i === N - 1 && res.ok ? 'final' : ''}">
                  ${cols.map(c => `<td>${c[1](it)}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}`;

    if (!N) return;
    const tm = NA.charts.tema();
    const C = tm[color], Csoft = tm[colorSoft] || tm.s1soft;

    /* --- Gráfica principal --- */
    const iterables = estado.xsPropia.slice(0, 9).filter(x => isFinite(x) && Math.abs(x) < 1e6);
    const dominioGlobal = () => {
      let lo = Math.min(...iterables), hi = Math.max(...iterables);
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      const w = hi - lo;
      return [lo - 0.18 * w, hi + 0.18 * w];
    };
    const dominioZoom = it => {
      let lo = Math.min(it.x, it.xn), hi = Math.max(it.x, it.xn);
      let w = hi - lo;
      if (!(w > 1e-12 * Math.max(1, Math.abs(lo)))) w = 1e-6 * Math.max(1, Math.abs(lo));
      return [lo - 0.6 * w, hi + 0.6 * w];
    };
    const muestrear = ([xmin, xmax]) => {
      const pts = [];
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 500; i++) {
        const x = xmin + (xmax - xmin) * i / 500;
        const y = F.f(x);
        if (isFinite(y)) { pts.push({ x, y }); lo = Math.min(lo, y); hi = Math.max(hi, y); }
        else pts.push({ x, y: null });
      }
      lo = Math.min(lo, 0); hi = Math.max(hi, 0);
      const pad = (hi - lo) * 0.08 || 1;
      return { pts, ylo: lo - pad, yhi: hi + pad };
    };

    const main = NA.charts.crear($('cMain'), {
      type: 'scatter',
      data: { datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        scales: (() => {
          const s = NA.charts.ejes(tm, { xTitle: 'x', yTitle: cfg.yTitulo || 'f(x)' });
          s.x.ticks.callback = v => NA.fmt(v, 4); s.y.ticks.callback = v => NA.fmt(v, 4);
          return s;
        })(),
        plugins: {
          intervalo: { axis: tm.muted },
          tooltip: {
            filter: item => item.dataset.tip !== false,
            callbacks: { title: () => '', label: c => `${c.dataset.label}: x = ${NA.fmt(c.parsed.x, 10)}, y = ${NA.fmt(c.parsed.y, 6)}` },
          },
        },
      },
      plugins: [NA.charts.pluginIntervalo],
    });

    const lbl = $('lbl'), slider = $('slider'), card = $('iterCard'), tbody = $('tbody');
    const mostrar = k => {
      estado.k = k;
      const it = res.iter[k];
      const dom = estado.zoom ? dominioZoom(it) : dominioGlobal();
      let { pts, ylo, yhi } = muestrear(dom);
      const prevs = estado.xsPropia.slice(0, k + (segundo ? 2 : 1)).map(x => ({ x, y: 0 }));
      if (graficaPrincipal) {
        const g = graficaPrincipal({ it, k, res, estado, tm, C, dom, F });
        main.data.datasets = g.datasets; ylo = g.ylo; yhi = g.yhi;
      } else main.data.datasets = [
        { label: 'f(x)', data: pts, showLine: true, borderColor: tm.curve, borderWidth: 2, pointRadius: 0, pointHitRadius: 4, order: 5 },
        ...dibujarIteracion(it, tm, C, dom),
        { label: 'xₙ → f(xₙ)', data: [{ x: it.x, y: 0 }, { x: it.x, y: it.fx }], showLine: true, borderColor: tm.muted, borderWidth: 1.25, borderDash: [3, 3], pointRadius: 0, tip: false, order: 3 },
        { label: 'x anterior', data: prevs, pointRadius: 3.5, pointBackgroundColor: tm.muted, pointBorderColor: tm.surface, pointBorderWidth: 1, order: 2 },
        { label: '(xₙ, f(xₙ))', data: [{ x: it.x, y: it.fx }], pointRadius: 4.5, pointBackgroundColor: tm.curve, pointBorderColor: tm.surface, pointBorderWidth: 1.5, order: 1 },
        { label: 'xₙ₊₁', data: [{ x: it.xn, y: 0 }], pointRadius: 6.5, pointHoverRadius: 8, pointBackgroundColor: C, pointBorderColor: tm.surface, pointBorderWidth: 2, order: 0 },
      ];
      Object.assign(main.options.scales.x, { min: dom[0], max: dom[1] });
      Object.assign(main.options.scales.y, { min: ylo, max: yhi });
      main.update('none');
      slider.value = k;
      lbl.textContent = `${indice} = ${it.n}`;
      card.innerHTML = (tarjeta ? tarjeta(it) : [
        ['xₙ', it.x, 14], ['f(xₙ)', it.fx, 8], ...(usaDerivada ? [['f′(xₙ)', it.dfx, 8]] : []), ['xₙ₊₁', it.xn, 14], ['eₙ₊₁', it.err, 6],
      ]).map(([k2, v, d]) => `<div><div class="k">${k2}</div><div class="v">${NA.fmt(v, d)}</div></div>`).join('');
      tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('sel', +tr.dataset.k === k));
    };
    mostrar(Math.min(estado.k, N - 1));

    $('zoom').addEventListener('change', e => { estado.zoom = e.target.checked; mostrar(estado.k); });
    slider.addEventListener('input', e => mostrar(+e.target.value));
    $('first').onclick = () => mostrar(0);
    $('prev').onclick = () => mostrar(Math.max(0, estado.k - 1));
    $('next').onclick = () => mostrar(Math.min(N - 1, estado.k + 1));
    $('last').onclick = () => mostrar(N - 1);
    $('play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('play').textContent = '▶'; return; }
      if (estado.k >= N - 1) mostrar(0);
      $('play').textContent = '❚❚';
      timer = setInterval(() => {
        if (estado.k >= N - 1) { clearInterval(timer); timer = null; $('play').textContent = '▶'; return; }
        mostrar(estado.k + 1);
      }, Math.max(150, Math.min(900, 6000 / N)));
    };
    tbody.addEventListener('click', e => {
      const tr = e.target.closest('tr');
      if (tr) { mostrar(+tr.dataset.k); $('cMain').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });

    /* --- Convergencia --- */
    const linea = (label, data, col, extra = {}) => ({
      label, data, showLine: true, borderColor: col, backgroundColor: col, borderWidth: 2,
      pointRadius: data.length > 40 ? 0 : 3.5, pointHoverRadius: 5, pointBorderColor: tm.surface, pointBorderWidth: 1, ...extra,
    });
    const logTicks = v => { const e = Math.log10(v); return Math.abs(e - Math.round(e)) < 1e-9 ? '1e' + Math.round(e) : ''; };
    const errs = res.iter.filter(i => i.err > 0 && isFinite(i.err)).map(i => ({ x: i.n, y: i.err }));
    NA.charts.crear($('cErr'), {
      type: 'scatter',
      data: {
        datasets: [
          linea(nombreCorto, errs, C),
          { label: 'ε', data: [{ x: 0, y: tol }, { x: Math.max(1, N - 1), y: tol }], showLine: true, borderColor: tm.muted, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'iteración n', yLog: true }); s.x.min = 0; s.x.max = Math.max(1, N - 1); s.x.ticks.precision = 0; return s; })(),
        plugins: { tooltip: { mode: 'index', intersect: false, callbacks: { title: c => 'n = ' + c[0].parsed.x, label: c => `${c.dataset.label}: ${NA.fmt(c.parsed.y, 5)}` } } },
      },
    });

    /* --- Orden (log-log) --- */
    const d = [];
    const xs = estado.xsPropia;
    for (let i = 1; i < xs.length; i++) {
      const di = Math.abs(xs[i] - xs[i - 1]);
      if (!isFinite(di) || di < 1e-13 * Math.max(1, Math.abs(xs[i]))) break;
      d.push(di);
    }
    const pares = [];
    for (let i = 0; i + 1 < d.length; i++) pares.push({ x: d[i], y: d[i + 1] });
    const ordenDatasets = [linea('(eₙ, eₙ₊₁)', pares, C, { showLine: false, pointRadius: 5.5, pointHoverRadius: 7, pointBorderWidth: 2, order: 2 })];
    if (pares.length) {
      const xsP = pares.map(p => p.x), lo = Math.min(...xsP), hi = Math.max(...xsP);
      const p0 = pares[0];
      const ref = (m, dash, col, label) => ({
        label, data: [lo, hi].map(x => ({ x, y: p0.y * Math.pow(x / p0.x, m) })),
        showLine: true, borderColor: col, borderDash: dash, borderWidth: 1.75, pointRadius: 0, tip: false, order: m === 2 ? 0 : 1,
      });
      ordenDatasets.push(ref(1, [5, 4], tm.muted, 'pendiente 1'), ref(2, [2, 3], tm.text2, 'pendiente 2'));
    }
    NA.charts.crear($('cOrden'), {
      type: 'scatter',
      data: { datasets: ordenDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: (() => {
          const s = NA.charts.ejes(tm, { xTitle: 'eₙ', yLog: true });
          s.x.type = 'logarithmic'; s.x.ticks.callback = logTicks; s.x.ticks.maxRotation = 0;
          return s;
        })(),
        plugins: { tooltip: { filter: i => i.dataset.tip !== false, callbacks: { title: () => '', label: c => `eₙ = ${NA.fmt(c.parsed.x, 4)}, eₙ₊₁ = ${NA.fmt(c.parsed.y, 4)}` } } },
      },
    });

    /* --- Comparación: error real --- */
    if (comp) {
      // p de referencia: la aproximación con menor |f|
      const cands = [res, ...comp.map(c => c.res)].filter(r => r.ok).map(r => r.p);
      const fc = estado.fc;
      const pRef = cands.length ? cands.reduce((m, p) => Math.abs(fc(p)) < Math.abs(fc(m)) ? p : m) : null;
      if (pRef !== null) {
        const serieReal = xsArr => xsArr.map((x, k) => ({ x: k, y: Math.abs(x - pRef) })).filter(p => p.y > 0 && isFinite(p.y));
        const maxK = Math.max(estado.xsPropia.length, ...comp.map(c => c.xs.length)) - 1;
        NA.charts.crear($('cComp'), {
          type: 'scatter',
          data: { datasets: [linea(nombreCorto, serieReal(estado.xsPropia), C), ...comp.map(c => linea(c.nombre, serieReal(c.xs), tm[c.color]))] },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'iteración k', yLog: true }); s.x.min = 0; s.x.max = Math.max(1, maxK); s.x.ticks.precision = 0; return s; })(),
            plugins: { tooltip: { mode: 'index', intersect: false, callbacks: { title: c => 'k = ' + c[0].parsed.x, label: c => `${c.dataset.label}: ${NA.fmt(c.parsed.y, 4)}` } } },
          },
        });
      }
    }
  }

  function veredicto() {
    const { res, orden, comp } = estado;
    let s = '';
    if (res.ok && orden.alpha !== null) {
      const a = orden.alpha;
      s += `Orden estimado α ≈ ${a.toFixed(2)}: ` + (a > 1.8 ? 'convergencia <b>cuadrática</b>, el número de cifras correctas se duplica en cada paso.'
        : a > 1.15 ? (cfg.textoSuperlineal || 'convergencia <b>superlineal</b>.')
        : (typeof textoLineal === 'function' ? textoLineal(estado) : textoLineal));
    } else if (res.ok) s += 'Convergió en muy pocas iteraciones como para estimar el orden.';
    else s += cfg.textoFallo || `El método no convergió con este valor inicial; prueba con otro ${x0Label} más cercano a la raíz.`;
    if (comp) {
      const n = res.iter.length;
      const lineas = comp.map(c => `${c.nombre}: ${c.res.ok ? c.res.iter.length + ' iteraciones' : 'no convergió'}`);
      s += ` Comparación — ${nombreCorto}: ${res.ok ? n + ' iteraciones' : 'no convergió'}; ${lineas.join('; ')}.`;
    }
    return s;
  }

  NA.charts.redibujar = render;
  cargarPreset(0);
  correr();
};
