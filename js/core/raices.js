/* Simulador reutilizable para métodos cerrados de búsqueda de raíces
   (regla falsa, bisección, ...). Cada algoritmo aporta su función `ejecutar`
   y cómo dibujar una iteración; aquí se arma toda la interfaz. */
NA.raices = {

  /* NA.raices.biseccion lo define js/algoritmos/biseccion.js (algoritmo de la Tarea 1)
     y se usa como método de referencia en las comparaciones. */

  montarCerrado(root, cfg) {
    const { presets, ejecutar, nombreCorto, dibujarIteracion, leyendaExtra = '',
            color = 's1', etiquetaErr = 'Error relativo', indice = 'n', statsExtra = () => '',
            mensajeExito = 'se obtuvo una aproximación de',
            mensajeFracaso = M => `después de ${M} iteraciones no se logró la precisión deseada` } = cfg;
    const ref = cfg.referencia || { nombre: 'Bisección', ejecutar: NA.raices.biseccion, color: 's3' };

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
            <label><span class="mono">f(x)</span> = función</label>
            <input id="fx" spellcheck="false" autocomplete="off">
            <div class="fx-preview" id="fxPrev"></div>
            <div class="hint">Usa x, ^, sin, cos, exp, ln, sqrt, pi, e…</div>
          </div>
          <div class="field-row">
            <div class="field"><label><span class="mono">a₀</span></label><input id="a0" inputmode="decimal"></div>
            <div class="field"><label><span class="mono">b₀</span></label><input id="b0" inputmode="decimal"></div>
          </div>
          <div class="field-row">
            <div class="field"><label><span class="mono">ε</span> tolerancia</label><input id="tol" inputmode="decimal"></div>
            <div class="field"><label><span class="mono">M</span> máx. iter.</label><input id="M" inputmode="numeric"></div>
          </div>
          <button class="btn" id="run">Ejecutar algoritmo</button>
          <div class="form-error" id="err"></div>
        </aside>

        <div class="stack" id="out"></div>
      </div>`;

    const $ = id => root.querySelector('#' + id);
    const inputs = { fx: $('fx'), a0: $('a0'), b0: $('b0'), tol: $('tol'), M: $('M') };

    const cargarPreset = i => {
      const p = presets[i];
      if (!p) return;
      inputs.fx.value = p.f; inputs.a0.value = p.a; inputs.b0.value = p.b;
      inputs.tol.value = p.tol; inputs.M.value = p.M;
      previewFx();
    };
    const previewFx = () => {
      try { $('fxPrev').innerHTML = NA.tex('f(x) = ' + NA.compilar(inputs.fx.value).tex); }
      catch (e) { $('fxPrev').innerHTML = '<span style="color:var(--muted)">…</span>'; }
    };

    $('preset').addEventListener('change', e => { if (+e.target.value >= 0) { cargarPreset(+e.target.value); correr(); } });
    Object.values(inputs).forEach(inp => {
      inp.addEventListener('input', () => { $('preset').value = '-1'; if (inp === inputs.fx) previewFx(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') correr(); });
    });
    $('run').addEventListener('click', () => correr());

    let estado = null;   // último resultado, para redibujar al cambiar de tema
    let timer = null;

    function correr() {
      $('err').textContent = '';
      let F;
      try { F = NA.compilar(inputs.fx.value); }
      catch (e) { $('err').textContent = 'No se pudo leer f(x): ' + e.message; return; }
      const a0 = Number(inputs.a0.value), b0 = Number(inputs.b0.value);
      const tol = Number(inputs.tol.value), M = Number(inputs.M.value);
      if (![a0, b0, tol, M].every(isFinite) || inputs.a0.value === '' || inputs.b0.value === '') { $('err').textContent = 'Todos los valores deben ser numéricos.'; return; }
      if (!(a0 < b0)) { $('err').textContent = 'Se requiere a₀ < b₀.'; return; }
      if (!(tol > 0)) { $('err').textContent = 'La tolerancia ε debe ser positiva.'; return; }
      if (!(M >= 1) || !Number.isInteger(M)) { $('err').textContent = 'M debe ser un entero ≥ 1.'; return; }
      if (M > 100000) { $('err').textContent = 'M es demasiado grande (máx. 100000).'; return; }
      const fa = F.f(a0), fb = F.f(b0);
      if (!isFinite(fa) || !isFinite(fb)) { $('err').textContent = 'f no está definida en a₀ o b₀.'; return; }
      if (!(fa * fb < 0)) { $('err').textContent = `Se requiere f(a₀)·f(b₀) < 0, pero f(a₀)=${NA.fmt(fa, 5)} y f(b₀)=${NA.fmt(fb, 5)}.`; return; }

      const res = ejecutar(F.f, a0, b0, tol, M);
      const resRef = ref.ejecutar(F.f, a0, b0, tol, M);
      const t = NA.cronometrar(() => ejecutar(F.f, a0, b0, tol, M));
      const tRef = NA.cronometrar(() => ref.ejecutar(F.f, a0, b0, tol, M));
      const orden = NA.ordenConvergencia(res.iter.map(i => i.x));
      const ordenRef = NA.ordenConvergencia(resRef.iter.map(i => i.x));

      estado = { F, a0, b0, tol, M, res, resRef, t, tRef, orden, ordenRef, k: res.iter.length - 1 };
      render();
    }

    function render() {
      if (!estado) return;
      if (timer) { clearInterval(timer); timer = null; }
      NA.charts.destruirTodas();
      const { F, a0, b0, tol, M, res, resRef, t, tRef, orden, ordenRef } = estado;
      const out = $('out');
      const N = res.iter.length;
      const last = res.iter[N - 1];
      const us = ms => ms * 1000 < 1000 ? (ms * 1000).toFixed(1) + ' µs' : ms.toFixed(2) + ' ms';

      out.innerHTML = `
        <div>
          <div class="result-banner ${res.ok ? 'ok' : 'fail'}">
            <div class="ico">${res.ok ? '✓' : '✕'}</div>
            <div>${res.ok
              ? `<b>Éxito:</b> ${mensajeExito} p ≈ <span class="mono">${NA.fmt(res.p, 14)}</span>`
              : `<b>Fracaso:</b> ${mensajeFracaso(M)}`}</div>
          </div>
          <div class="stats">
            <div class="stat"><div class="k">Aproximación p</div><div class="v">${NA.fmt(res.p, 12)}</div></div>
            <div class="stat"><div class="k">Iteraciones</div><div class="v">${N} <small>/ ${M}</small></div></div>
            <div class="stat"><div class="k">${etiquetaErr} final</div><div class="v">${NA.fmt(last.err, 4)}</div></div>
            <div class="stat"><div class="k">|f(p)|</div><div class="v">${NA.fmt(Math.abs(last.fx), 4)}</div></div>
            <div class="stat"><div class="k">Tiempo de ejecución</div><div class="v">${us(t)}</div></div>
            ${statsExtra(estado)}
          </div>
        </div>

        <div class="box">
          <div class="box-title">Gráfica del método</div>
          <div class="box-sub">Recorre las iteraciones para ver cómo se actualiza el intervalo [aₙ, bₙ]</div>
          <div class="legend">
            <span><i style="background:var(--curve)"></i>f(x)</span>
            ${leyendaExtra}
            <span><i class="dot" style="background:var(--${color})"></i>xₙ</span>
            <span><i class="dot" style="background:var(--muted)"></i>x anteriores</span>
            <span><i class="band" style="background:var(--${color}-soft);border:1px dashed var(--${color})"></i>[aₙ, bₙ]</span>
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
            <div class="box-sub">Error relativo |xₙ − xₙ₋₁| / |xₙ| por iteración (escala log)</div>
            <div class="legend">
              <span><i style="background:var(--${color})"></i>${nombreCorto}</span>
              <span><i style="background:var(--${ref.color})"></i>${ref.nombre} (referencia)</span>
              <span><i style="background:none;height:0;border-top:2px dashed var(--muted)"></i>tolerancia ε</span>
            </div>
            <div class="plot-wrap sm"><canvas id="cErr"></canvas></div>
          </div>
          <div class="box">
            <div class="box-title">Ancho del intervalo</div>
            <div class="box-sub">bₙ − aₙ por iteración (escala log)</div>
            <div class="legend">
              <span><i style="background:var(--${color})"></i>${nombreCorto}</span>
              <span><i style="background:var(--${ref.color})"></i>${ref.nombre} (referencia)</span>
            </div>
            <div class="plot-wrap sm"><canvas id="cAncho"></canvas></div>
          </div>
        </div>

        <div class="box">
          <div class="box-title">Rendimiento</div>
          <div class="box-sub">Comparación con ${ref.nombre.toLowerCase()} usando la misma f, intervalo, ε y M (cada uno con su criterio de parada)</div>
          <div class="table-wrap" style="max-height:none">
            <table>
              <thead><tr><th style="text-align:left">Método</th><th>Resultado</th><th>Iteraciones</th><th>Evaluaciones de f</th><th>Tiempo</th><th>Orden α estimado</th><th>Razón C</th><th>Aproximación</th></tr></thead>
              <tbody>
                ${[[nombreCorto, res, t, orden], [ref.nombre, resRef, tRef, ordenRef]].map(([nom, r, tt, o]) => `
                  <tr style="cursor:default">
                    <td style="text-align:left;font-family:var(--font)">${nom}</td>
                    <td style="color:${r.ok ? 'var(--good)' : 'var(--bad)'}">${r.ok ? 'Éxito' : 'Fracaso'}</td>
                    <td>${r.iter.length}</td><td>${r.evals}</td><td>${us(tt)}</td>
                    <td>${o.alpha === null ? '—' : o.alpha.toFixed(3)}</td>
                    <td>${o.C === null ? '—' : o.C.toFixed(4)}</td>
                    <td>${NA.fmt(r.p, 12)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="note">${veredicto(res, resRef, orden)}</div>
        </div>

        <div class="box">
          <div class="box-title">Tabla de iteraciones</div>
          <div class="box-sub">Haz clic en una fila para verla en la gráfica</div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>${indice}</th><th>aₙ</th><th>bₙ</th><th>xₙ</th><th>f(xₙ)</th><th>${etiquetaErr}</th></tr></thead>
              <tbody id="tbody">
                ${res.iter.map((it, i) => `
                  <tr data-k="${i}" class="${i === N - 1 && res.ok ? 'final' : ''}">
                    <td>${it.n}</td><td>${NA.fmt(it.a, 12)}</td><td>${NA.fmt(it.b, 12)}</td>
                    <td>${NA.fmt(it.x, 12)}</td><td>${NA.fmt(it.fx, 6)}</td><td>${NA.fmt(it.err, 5)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;

      const tm = NA.charts.tema();

      /* --- Gráfica principal --- */
      const w = b0 - a0;
      const xmin = a0 - 0.12 * w, xmax = b0 + 0.12 * w;
      const curva = [];
      let ylo = Infinity, yhi = -Infinity;
      for (let i = 0; i <= 500; i++) {
        const x = xmin + (xmax - xmin) * i / 500;
        const y = F.f(x);
        if (isFinite(y)) { curva.push({ x, y }); ylo = Math.min(ylo, y); yhi = Math.max(yhi, y); }
        else curva.push({ x, y: null });
      }
      ylo = Math.min(ylo, 0); yhi = Math.max(yhi, 0);
      const pad = (yhi - ylo) * 0.08 || 1;

      const main = NA.charts.crear($('cMain'), {
        type: 'scatter',
        data: { datasets: [] },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'nearest', intersect: false },
          scales: (() => {
            const s = NA.charts.ejes(tm, { xTitle: 'x', yTitle: 'f(x)' });
            s.x.min = xmin; s.x.max = xmax; s.y.suggestedMin = ylo - pad; s.y.suggestedMax = yhi + pad;
            s.x.ticks.callback = v => NA.fmt(v, 4); s.y.ticks.callback = v => NA.fmt(v, 4);
            return s;
          })(),
          plugins: {
            intervalo: { color: tm[color + 'soft'], edge: tm[color], axis: tm.muted },
            tooltip: {
              filter: item => item.dataset.tip !== false,
              callbacks: {
                title: () => '',
                label: c => `${c.dataset.label}: x = ${NA.fmt(c.parsed.x, 8)}, y = ${NA.fmt(c.parsed.y, 6)}`,
              },
            },
          },
        },
        plugins: [NA.charts.pluginIntervalo],
      });

      const datasetsIter = k => {
        const it = res.iter[k];
        const prevs = res.iter.slice(0, k).map(p => ({ x: p.x, y: 0 }));
        return [
          { label: 'f(x)', data: curva, showLine: true, borderColor: tm.curve, borderWidth: 2, pointRadius: 0, pointHitRadius: 4, spanGaps: false, order: 5 },
          ...dibujarIteracion(it, tm),
          { label: 'f(xₙ)', data: [{ x: it.x, y: 0 }, { x: it.x, y: it.fx }], showLine: true, borderColor: tm.muted, borderWidth: 1.25, borderDash: [3, 3], pointRadius: 0, tip: false, order: 3 },
          { label: 'x anterior', data: prevs, pointRadius: 3.5, pointBackgroundColor: tm.muted, pointBorderColor: tm.surface, pointBorderWidth: 1, order: 2 },
          { label: 'xₙ', data: [{ x: it.x, y: 0 }], pointRadius: 6.5, pointHoverRadius: 8, pointBackgroundColor: tm[color], pointBorderColor: tm.surface, pointBorderWidth: 2, order: 0 },
        ];
      };

      const lbl = $('lbl'), slider = $('slider'), card = $('iterCard'), tbody = $('tbody');
      const mostrar = k => {
        estado.k = k;
        const it = res.iter[k];
        main.data.datasets = datasetsIter(k);
        main.options.plugins.intervalo.a = it.a;
        main.options.plugins.intervalo.b = it.b;
        main.update('none');
        slider.value = k;
        lbl.textContent = `${indice} = ${it.n}`;
        card.innerHTML = [
          ['aₙ', it.a], ['bₙ', it.b], ['xₙ', it.x], ['f(xₙ)', it.fx], [etiquetaErr, it.err],
        ].map(([k2, v]) => `<div><div class="k">${k2}</div><div class="v">${NA.fmt(v, 10)}</div></div>`).join('');
        tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('sel', +tr.dataset.k === k));
      };
      mostrar(Math.min(estado.k, N - 1));

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
        }, Math.max(120, Math.min(700, 6000 / N)));
      };
      tbody.addEventListener('click', e => {
        const tr = e.target.closest('tr');
        if (tr) { mostrar(+tr.dataset.k); $('cMain').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });

      /* --- Convergencia --- */
      // Misma métrica para ambos métodos: cambio relativo entre aproximaciones consecutivas
      const serieRel = r => r.iter.map((it, i) => ({ x: it.n, y: i > 0 && it.x !== 0 ? Math.abs((it.x - r.iter[i - 1].x) / it.x) : 0 })).filter(p => p.y > 0 && isFinite(p.y));
      const serie = (r, campo) => r.iter.filter(i => i[campo] !== null && i[campo] > 0).map(i => ({ x: i.n, y: i[campo] }));
      const lineaSerie = (label, data, color) => ({
        label, data, showLine: true, borderColor: color, backgroundColor: color, borderWidth: 2,
        pointRadius: data.length > 40 ? 0 : 3, pointHoverRadius: 5, pointBorderColor: tm.surface, pointBorderWidth: 1,
      });
      const maxN = Math.max(res.iter[res.iter.length - 1].n, resRef.iter[resRef.iter.length - 1].n);
      const tipLog = { mode: 'index', intersect: false, callbacks: { title: c => 'n = ' + c[0].parsed.x, label: c => `${c.dataset.label}: ${NA.fmt(c.parsed.y, 5)}` } };

      NA.charts.crear($('cErr'), {
        type: 'scatter',
        data: {
          datasets: [
            lineaSerie(nombreCorto, serieRel(res), tm[color]),
            lineaSerie(ref.nombre, serieRel(resRef), tm[ref.color]),
            { label: 'ε', data: [{ x: 0, y: tol }, { x: maxN, y: tol }], showLine: true, borderColor: tm.muted, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'iteración n', yLog: true }); s.x.min = 0; s.x.max = maxN; return s; })(),
          plugins: { tooltip: tipLog },
        },
      });

      const ancho = r => r.iter.map(i => ({ x: i.n, y: i.b - i.a })).filter(p => p.y > 0);
      NA.charts.crear($('cAncho'), {
        type: 'scatter',
        data: { datasets: [lineaSerie(nombreCorto, ancho(res), tm[color]), lineaSerie(ref.nombre, ancho(resRef), tm[ref.color])] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: (() => { const s = NA.charts.ejes(tm, { xTitle: 'iteración n', yLog: true }); s.x.min = 0; s.x.max = maxN; return s; })(),
          plugins: { tooltip: tipLog },
        },
      });
    }

    function veredicto(res, resRef, orden) {
      const a = res.iter.length, b = resRef.iter.length;
      const otro = ref.nombre.toLowerCase();
      // Explicación cuando la regla falsa resulta más lenta: un extremo se queda fijo
      const lentaRF = (nombreCorto === 'Regla falsa' && a > b) || (ref.nombre === 'Regla falsa' && b > a);
      let s = '';
      if (res.ok && resRef.ok) {
        s = a < b
          ? `${nombreCorto} necesitó <b>${b - a} iteraciones menos</b> que ${otro} (${a} vs ${b}).`
          : a > b
            ? `Aquí ${otro} necesitó <b>${a - b} iteraciones menos</b> (${b} vs ${a} de ${nombreCorto.toLowerCase()}).`
            : `Ambos métodos usaron ${a} iteraciones.`;
        if (lentaRF) s += ' En la regla falsa uno de los extremos se queda fijo y el intervalo no se reduce a cero.';
      } else if (res.ok) s = `${nombreCorto} convergió y ${otro} no lo logró en ${estado.M} iteraciones.`;
      else if (resRef.ok) s = `${nombreCorto} no alcanzó la precisión en ${estado.M} iteraciones, mientras que ${otro} sí.`;
      else s = 'Ninguno de los dos métodos alcanzó la precisión pedida con este M.';
      if (orden.alpha !== null) s += ` Orden estimado α ≈ ${orden.alpha.toFixed(2)}${Math.abs(orden.alpha - 1) < 0.15 ? ' (convergencia lineal)' : orden.alpha > 1.15 ? ' (superlineal)' : ''}.`;
      return s;
    }

    NA.charts.redibujar = render;
    cargarPreset(0);
    correr();
  },
};
