/* ITERACIÓN DE PUNTO FIJO — transcrito del pseudocódigo de clase */
(function () {

  /* Implementación fiel al pseudocódigo */
  function puntoFijo(g, p0, TOL, N0) {
    let i = 1;                                         // Paso 1: i = 1
    let evals = 0;
    const iter = [];
    while (i <= N0) {                                  // Paso 2: Mientras i ≤ N₀ haga los pasos 3–6
      const p = g(p0); evals++;                        // Paso 3: p = g(p₀)  (calcule pᵢ)
      if (Number.isNaN(p)) return { ok: false, motivo: 'indefinido', p: p0, iter, evals };   // (protección: g no definida)
      if (!isFinite(p) || Math.abs(p) > 1e12) return { ok: false, motivo: 'diverge', p: p0, iter, evals };
      const err = Math.abs(p - p0);
      iter.push({ n: i, x: p0, fx: p, xn: p, err });
      if (err < TOL) return { ok: true, p, iter, evals };    // Paso 4: Si |p − p₀| < TOL: SALIDA (p) [PARE]
      i = i + 1;                                       // Paso 5: i = i + 1
      p0 = p;                                          // Paso 6: p₀ = p  (actualizar p₀)
    }
    return { ok: false, motivo: 'max', p: p0, iter, evals };   // Paso 7: SALIDA ('El método falló…') [PARE]
  }

  // Derivada numérica de g (para estimar la razón de convergencia |g′(p)|)
  const derivada = (g, x) => {
    const h = 1e-6 * Math.max(1, Math.abs(x));
    return (g(x + h) - g(x - h)) / (2 * h);
  };

  NA.registrar({
    id: 'punto-fijo',
    nombre: 'Punto Fijo',
    alias: 'Iteración de punto fijo · p = g(p)',
    unidad: 'Raíces de ecuaciones',
    resumen: 'Método abierto que busca p tal que p = g(p) repitiendo pᵢ = g(pᵢ₋₁) desde una aproximación inicial p₀.',
    tags: ['Método abierto', 'Convergencia lineal', 'Converge si |g′(p)| < 1'],
    ejecutar: puntoFijo,

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <line x1="40" y1="124" x2="260" y2="8" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 4"/>
        <path d="M40 40 C 100 52, 160 66, 260 84" fill="none" stroke="var(--curve)" stroke-width="2.4"/>
        <path d="M70 108 L70 45 L131 45 L131 58 L117 58 L117 66 L123 66"
              fill="none" stroke="var(--s4)" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="121" cy="65" r="6" fill="var(--s4)" stroke="var(--surface-2)" stroke-width="2"/>
        <text x="64" y="124" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">p₀</text>
        <text x="236" y="98" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">g(x)</text>
        <text x="236" y="24" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">y = x</text>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>ITERACIÓN DE PUNTO FIJO</h3>
      <div class="cm">Encontrar una solución de \(p = g(p)\) dada una aproximación inicial \(p_0\):</div>
      <div class="gap"></div>
      <div><span class="sec">ENTRADA</span> &nbsp;aproximación inicial \(p_0\); tolerancia \(TOL\); número máximo de iteraciones \(N_0\).</div>
      <div><span class="sec">SALIDA</span> &nbsp;aproximada \(p\) o mensaje de falla.</div>
      <div class="gap"></div>
      <div><span class="kw">Paso 1</span> &nbsp;Determine \(i = 1\).</div>
      <div><span class="kw">Paso 2</span> &nbsp;<span class="kw">Mientras</span> \(i \le N_0\) <span class="kw">haga</span> los pasos 3–6.</div>
      <div class="ind1"><span class="kw">Paso 3</span> &nbsp;Determine \(p = g(p_0)\). &nbsp;<span class="cm">(Calcule \(p_i\).)</span></div>
      <div class="ind1"><span class="kw">Paso 4</span> &nbsp;<span class="cond"><span class="kw">Si</span> \(|p - p_0| < TOL\)</span> <span class="kw">entonces</span></div>
      <div class="ind2">SALIDA \((p)\); &nbsp;<span class="cm">(El procedimiento fue exitoso.)</span></div>
      <div class="ind2"><span class="stop">PARE.</span></div>
      <div class="ind1"><span class="kw">Paso 5</span> &nbsp;Determine \(i = i + 1\).</div>
      <div class="ind1"><span class="kw">Paso 6</span> &nbsp;Determine \(p_0 = p\). &nbsp;<span class="cm">(Actualizar \(p_0\).)</span></div>
      <div><span class="kw">Paso 7</span> &nbsp;SALIDA ('El método falló después de \(N_0\) iteraciones, \(N_0\) =', \(N_0\));</div>
      <div class="ind1"><span class="cm">(El procedimiento no fue exitoso.)</span></div>
      <div class="ind1"><span class="stop">PARE.</span></div>`,

    python: `def punto_fijo(g, p0, TOL, N0):
    """Iteración de punto fijo: encuentra p tal que p = g(p).

    Entrada: g función, p0 aproximación inicial,
             TOL tolerancia, N0 número máximo de iteraciones.
    """
    # Paso 1
    i = 1

    # Paso 2
    while i <= N0:
        # Paso 3
        p = g(p0)                       # calcule p_i

        # Paso 4
        if abs(p - p0) < TOL:
            print("El procedimiento fue exitoso, p =", p)
            return p

        # Paso 5
        i = i + 1

        # Paso 6
        p0 = p                          # actualizar p0

    # Paso 7
    print("El método falló después de N0 iteraciones, N0 =", N0)
    return None


# Ejemplo: x^3 + 4x^2 - 10 = 0 escrita como x = g(x)
import math
p = punto_fijo(lambda x: math.sqrt(10 / (4 + x)), 1.5, 1e-9, 50)`,

    montar(el) {
      NA.raices.montarAbierto(el, {
        nombreCorto: 'Punto fijo',
        color: 's4',
        usaDerivada: false,
        ejecutar: puntoFijo,
        nombreF: 'g',
        yTitulo: 'y',
        indice: 'i',
        x0Label: 'p₀',
        MLabel: 'N₀',
        fComparar: g => x => x - g(x),
        hintComparar: 'Intervalo donde x − g(x) cambia de signo, para correr también regla falsa y bisección sobre f(x) = x − g(x).',
        subComparar: 'Error real |pₖ − p| de cada método (regla falsa y bisección resuelven f(x) = x − g(x) = 0)',
        residuo: { etiqueta: '|g(p) − p|', valor: (g, p) => Math.abs(g(p) - p) },
        mensajeExito: 'el procedimiento fue exitoso,',
        motivosExtra: {
          max: e => `el método falló después de N₀ iteraciones, N₀ = ${e.M}.`,
          indefinido: () => 'g(p₀) no está definida en los reales (por ejemplo, raíz cuadrada de un número negativo).',
          diverge: () => 'las iteraciones se alejan sin control: la sucesión divergió.',
        },
        textoLineal: e => {
          const d = Math.abs(derivada(e.F.f, e.res.p));
          return `convergencia <b>lineal</b>; la razón C coincide con |g′(p)| ≈ ${isFinite(d) ? d.toFixed(4) : '—'}: mientras más pequeño, más rápido converge.`;
        },
        textoFallo: 'El método no convergió: prueba otro p₀ u otra forma de despejar x = g(x) (se necesita |g′(p)| < 1 cerca de la raíz).',
        statsExtra: e => {
          if (!e.res.ok) return '';
          const d = Math.abs(derivada(e.F.f, e.res.p));
          if (!isFinite(d)) return '';
          return `<div class="stat"><div class="k">|g′(p)| estimado</div><div class="v">${NA.fmt(d, 4)} <small>${d < 1 ? '&lt; 1 ✓' : '≥ 1'}</small></div></div>`;
        },
        subGrafica: 'Diagrama de telaraña: sube a la curva y = g(x), avanza hasta la recta y = x y repite',
        leyendaPrincipal: `
          <span><i style="background:var(--curve)"></i>g(x)</span>
          <span><i style="background:none;height:0;border-top:2px dashed var(--muted)"></i>y = x</span>
          <span><i style="background:var(--s4)"></i>paso actual</span>
          <span><i style="background:var(--text-2);opacity:.5"></i>pasos anteriores</span>
          <span><i class="dot" style="background:var(--s4)"></i>pᵢ</span>`,
        columnas: [
          ['i', it => it.n],
          ['p₀', it => NA.fmt(it.x, 14)],
          ['p = g(p₀)', it => NA.fmt(it.xn, 14)],
          ['|p − p₀|', it => NA.fmt(it.err, 5)],
        ],
        tarjeta: it => [['p₀', it.x, 14], ['p = g(p₀)', it.xn, 14], ['|p − p₀|', it.err, 6]],
        graficaPrincipal: ({ k, res, estado, tm, C, dom, F }) => {
          const [xmin, xmax] = dom;
          const curva = [];
          let lo = xmin, hi = xmax;
          for (let j = 0; j <= 400; j++) {
            const x = xmin + (xmax - xmin) * j / 400, y = F.f(x);
            if (isFinite(y)) { curva.push({ x, y }); lo = Math.min(lo, y); hi = Math.max(hi, y); }
            else curva.push({ x, y: null });
          }
          // Telaraña: (p₀, p₀) → (p₀, g(p₀)) → (g(p₀), g(p₀)) → ...
          const tela = [];
          res.iter.slice(0, k).forEach(it => tela.push({ x: it.x, y: it.x }, { x: it.x, y: it.xn }, { x: it.xn, y: it.xn }));
          const it = res.iter[k];
          const actual = [{ x: it.x, y: it.x }, { x: it.x, y: it.xn }, { x: it.xn, y: it.xn }];
          const pad = (hi - lo) * 0.06 || 1;
          return {
            ylo: lo - pad, yhi: hi + pad,
            datasets: [
              { label: 'g(x)', data: curva, showLine: true, borderColor: tm.curve, borderWidth: 2, pointRadius: 0, pointHitRadius: 4, order: 5 },
              { label: 'y = x', data: [{ x: xmin, y: xmin }, { x: xmax, y: xmax }], showLine: true, borderColor: tm.muted, borderDash: [6, 5], borderWidth: 1.5, pointRadius: 0, tip: false, order: 4 },
              { label: 'pasos anteriores', data: tela, showLine: true, borderColor: tm.text2 + '80', borderWidth: 1.25, pointRadius: 0, tip: false, order: 3 },
              { label: 'paso actual', data: actual, showLine: true, borderColor: C, borderWidth: 2.5, pointRadius: 0, tip: false, order: 1 },
              { label: 'p₀', data: [{ x: it.x, y: it.x }], pointRadius: 4, pointBackgroundColor: tm.text2, pointBorderColor: tm.surface, pointBorderWidth: 1.5, order: 2 },
              { label: 'pᵢ', data: [{ x: it.xn, y: it.xn }], pointRadius: 6.5, pointHoverRadius: 8, pointBackgroundColor: C, pointBorderColor: tm.surface, pointBorderWidth: 2, order: 0 },
            ],
          };
        },
        presets: [
          { nombre: '√(10/(4 + x)), p₀ = 1.5', f: 'sqrt(10 / (4 + x))', x0: 1.5, tol: '1e-9', M: 50, a: 1, b: 2 },
          { nombre: '½·√(10 − x³), p₀ = 1.5  (lenta)', f: '0.5 * sqrt(10 - x^3)', x0: 1.5, tol: '1e-9', M: 50, a: 1, b: 2 },
          { nombre: 'x − (x³ + 4x² − 10)/(3x² + 8x)  (Newton)', f: 'x - (x^3 + 4x^2 - 10) / (3x^2 + 8x)', x0: 1.5, tol: '1e-9', M: 50, a: 1, b: 2 },
          { nombre: 'cos(x), p₀ = 1  (espiral)', f: 'cos(x)', x0: 1, tol: '1e-9', M: 100, a: 0, b: 1 },
          { nombre: 'e⁻ˣ, p₀ = 0.5', f: 'exp(-x)', x0: 0.5, tol: '1e-9', M: 100, a: 0, b: 1 },
          { nombre: '(x + 2/x)/2, p₀ = 1  (√2)', f: '(x + 2/x) / 2', x0: 1, tol: '1e-12', M: 50, a: 1, b: 2 },
          { nombre: 'x − x³ − 4x² + 10, p₀ = 1.5  (diverge)', f: 'x - x^3 - 4x^2 + 10', x0: 1.5, tol: '1e-9', M: 50, a: 1, b: 2 },
          { nombre: '√(10/x − 4x), p₀ = 1.5  (se indefine)', f: 'sqrt(10 / x - 4x)', x0: 1.5, tol: '1e-9', M: 50 },
        ],
      });
    },
  });
})();
