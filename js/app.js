/* Enrutador y vistas: inicio y página de cada algoritmo */
(function () {
  const app = document.getElementById('app');

  /* ---------- Tema claro / oscuro ---------- */
  const temaActual = () => {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  document.getElementById('themeToggle').addEventListener('click', () => {
    const nuevo = temaActual() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    try { localStorage.setItem('na-theme', nuevo); } catch (e) {}
    if (NA.charts.redibujar) NA.charts.redibujar();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (NA.charts.redibujar) NA.charts.redibujar();
  });

  /* ---------- Inicio ---------- */
  function vistaInicio() {
    const porUnidad = NA.unidades
      .map((u, i) => ({ u, i, algos: NA.algoritmos.filter(a => a.unidad === u) }))
      .filter(g => g.algos.length);
    const nUnidades = porUnidad.length;

    app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">Proyectos · Análisis Numérico</div>
        <h1>Algoritmos que <span>se pueden ver</span> funcionar</h1>
        <p>Cada pseudocódigo visto en clase, implementado y graficado: recorre las iteraciones,
        mide su rendimiento y compara la convergencia con otros métodos.</p>
        <div class="hero-stats">
          <div><b>${NA.algoritmos.length}</b><span>algoritmo${NA.algoritmos.length === 1 ? '' : 's'}</span></div>
          <div><b>${nUnidades}</b><span>unidad${nUnidades === 1 ? '' : 'es'}</span></div>
        </div>
      </section>
      ${porUnidad.map(g => `
        <section class="unit">
          <div class="unit-head">
            <span class="num">${String(g.i + 1).padStart(2, '0')}</span>
            <h2>${g.u}</h2>
            <span class="count">${g.algos.length} método${g.algos.length === 1 ? '' : 's'}</span>
          </div>
          <div class="cards">
            ${g.algos.map(a => `
              <a class="card" href="#/algoritmo/${a.id}">
                <div class="card-art">${a.icono || ''}</div>
                <div class="card-body">
                  <h3>${a.nombre}</h3>
                  <p>${a.resumen}</p>
                  <div class="tags">${a.tags.map((t, i) => `<span class="tag ${i === 0 ? 'ink' : ''}">${t}</span>`).join('')}</div>
                </div>
              </a>`).join('')}
          </div>
        </section>`).join('')}`;
  }

  /* ---------- Página de algoritmo ---------- */
  function vistaAlgoritmo(id, tabInicial) {
    const a = NA.buscar(id);
    if (!a) { location.hash = '#/'; return; }

    const tabs = [
      ['simulador', 'Simulador'],
      ['pseudocodigo', 'Pseudocódigo'],
      ['teoria', 'Teoría'],
      ['python', 'Código Python'],
      a.apunte ? ['apunte', 'Apunte original'] : null,
    ].filter(Boolean);
    const activa = tabs.some(t => t[0] === tabInicial) ? tabInicial : 'simulador';

    app.innerHTML = `
      <nav class="crumbs"><a href="#/">Inicio</a> / ${a.unidad}</nav>
      <header class="algo-head">
        <div>
          <h1>${a.nombre}</h1>
          <p>${a.alias ? `<span class="mono" style="color:var(--muted);font-size:13px">${a.alias}</span><br>` : ''}${a.resumen}</p>
          <div class="tags">${a.tags.map((t, i) => `<span class="tag ${i === 0 ? 'ink' : ''}">${t}</span>`).join('')}</div>
        </div>
      </header>
      <div class="tabs" role="tablist">
        ${tabs.map(([k, n]) => `<button class="tab ${k === activa ? 'active' : ''}" data-tab="${k}" role="tab">${n}</button>`).join('')}
      </div>
      <section class="panel" data-panel="simulador" id="sim"></section>
      <section class="panel" data-panel="pseudocodigo"><div class="pseudo">${a.pseudocodigo}</div></section>
      <section class="panel" data-panel="teoria"><div class="box theory">${a.teoria || ''}</div></section>
      <section class="panel" data-panel="python">
        <pre class="code"><button class="copy-btn" id="copy">Copiar</button><code>${NA.resaltarPython(a.python || '')}</code></pre>
      </section>
      ${a.apunte ? `<section class="panel apunte" data-panel="apunte">${[].concat(a.apunte).map((src, i, arr) => `<img src="${src}" alt="Apunte original de ${a.nombre}${arr.length > 1 ? ` (página ${i + 1})` : ''}">`).join('')}</section>` : ''}`;

    const activar = k => {
      app.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === k));
      app.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === k));
      history.replaceState(null, '', `#/algoritmo/${id}/${k}`);
    };
    app.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => activar(b.dataset.tab)));
    activar(activa);

    NA.renderMath(app.querySelector('[data-panel=pseudocodigo]'));
    NA.renderMath(app.querySelector('[data-panel=teoria]'));

    const copy = document.getElementById('copy');
    copy.addEventListener('click', () => {
      navigator.clipboard.writeText(a.python).then(() => {
        copy.textContent = '¡Copiado!';
        setTimeout(() => (copy.textContent = 'Copiar'), 1500);
      });
    });

    a.montar(document.getElementById('sim'));
  }

  /* ---------- Router ---------- */
  function ruta() {
    NA.charts.destruirTodas();
    NA.charts.redibujar = null;
    const partes = location.hash.replace(/^#\/?/, '').split('/');
    if (partes[0] === 'algoritmo' && partes[1]) vistaAlgoritmo(partes[1], partes[2]);
    else vistaInicio();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', ruta);
  ruta();
})();
