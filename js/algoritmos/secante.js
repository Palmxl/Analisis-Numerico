/* MÉTODO DE LA SECANTE — transcrito del pseudocódigo de clase */
(function () {

  /* Implementación fiel al pseudocódigo */
  function secante(f, p0, p1, TOL, N0) {
    let i = 2;                                         // Paso 1: i = 2; q0 = f(p0); q1 = f(p1)
    let q0 = f(p0), q1 = f(p1);
    let evals = 2;
    const iter = [];
    while (i <= N0) {                                  // Paso 2: Mientras i ≤ N₀ haga los pasos 3–6
      if (q1 === q0) return { ok: false, motivo: 'horizontal', p: p1, iter, evals };   // (protección: división entre cero)
      const p = p1 - q1 * (p1 - p0) / (q1 - q0);       // Paso 3: p = p1 − q1(p1 − p0)/(q1 − q0)
      if (!isFinite(p) || Math.abs(p) > 1e12) return { ok: false, motivo: 'diverge', p: p1, iter, evals };
      const err = Math.abs(p - p1);
      iter.push({ n: i, x0: p0, f0: q0, x: p1, fx: q1, xn: p, err });
      if (err < TOL) return { ok: true, p, iter, evals };    // Paso 4: Si |p − p1| < TOL: SALIDA (p) [PARE]
      i = i + 1;                                       // Paso 5: i = i + 1
      p0 = p1;                                         // Paso 6: actualice p0, q0, p1, q1
      q0 = q1;
      p1 = p;
      q1 = f(p); evals++;
      if (Number.isNaN(q1)) return { ok: false, motivo: 'indefinido', p, iter, evals };
    }
    return { ok: false, motivo: 'max', p: p1, iter, evals };   // Paso 7: SALIDA ('El método falló…') [PARE]
  }

  NA.registrar({
    id: 'secante',
    nombre: 'Secante',
    alias: 'Método de la secante · Newton sin derivada',
    unidad: 'Raíces de ecuaciones',
    resumen: 'Método abierto que reemplaza la derivada de Newton por la pendiente de la recta secante entre las dos últimas aproximaciones.',
    tags: ['Método abierto', 'Convergencia superlineal (α ≈ 1.618)', 'No usa la derivada'],
    ejecutar: secante,

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <line x1="20" y1="96" x2="280" y2="96" stroke="var(--muted)" stroke-width="1.2"/>
        <path d="M40 124 C 90 118, 130 104, 160 88 S 230 38, 270 10" fill="none" stroke="var(--curve)" stroke-width="2.4"/>
        <line x1="270" y1="10" x2="130" y2="112" stroke="var(--s5)" stroke-width="2"/>
        <circle cx="270" cy="10" r="4.5" fill="var(--curve)"/>
        <circle cx="218" cy="48" r="4.5" fill="var(--curve)"/>
        <circle cx="152" cy="96" r="6" fill="var(--s5)" stroke="var(--surface-2)" stroke-width="2"/>
        <text x="262" y="112" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">p₀</text>
        <text x="212" y="112" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">p₁</text>
        <text x="146" y="124" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">p₂</text>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>MÉTODO DE LA SECANTE</h3>
      <div class="cm">Para encontrar una solución para \(f(x) = 0\) dadas las aproximaciones iniciales \(p_0\) y \(p_1\):</div>
      <div class="gap"></div>
      <div><span class="sec">ENTRADA</span> &nbsp;aproximaciones iniciales \(p_0, p_1\); tolerancia \(TOL\); número máximo de iteraciones \(N_0\).</div>
      <div><span class="sec">SALIDA</span> &nbsp;solución aproximada \(p\) o mensaje de falla.</div>
      <div class="gap"></div>
      <div><span class="kw">Paso 1</span> &nbsp;Determine \(i = 2\);</div>
      <div class="ind2">\(q_0 = f(p_0)\);</div>
      <div class="ind2">\(q_1 = f(p_1)\).</div>
      <div><span class="kw">Paso 2</span> &nbsp;<span class="kw">Mientras</span> \(i \le N_0\) <span class="kw">haga</span> los pasos 3–6.</div>
      <div class="ind1"><span class="kw">Paso 3</span> &nbsp;Determine \(p = p_1 - q_1(p_1 - p_0)/(q_1 - q_0)\). &nbsp;<span class="cm">(Calcule \(p_i\).)</span></div>
      <div class="ind1"><span class="kw">Paso 4</span> &nbsp;<span class="cond"><span class="kw">Si</span> \(|p - p_1| < TOL\)</span> <span class="kw">entonces</span></div>
      <div class="ind2">SALIDA \((p)\); &nbsp;<span class="cm">(El procedimiento fue exitoso.)</span></div>
      <div class="ind2"><span class="stop">PARE.</span></div>
      <div class="ind1"><span class="kw">Paso 5</span> &nbsp;Determine \(i = i + 1\).</div>
      <div class="ind1"><span class="kw">Paso 6</span> &nbsp;Determine \(p_0 = p_1\); &nbsp;<span class="cm">(Actualice \(p_0, q_0, p_1, q_1\).)</span></div>
      <div class="ind3">\(q_0 = q_1\);</div>
      <div class="ind3">\(p_1 = p\);</div>
      <div class="ind3">\(q_1 = f(p)\).</div>
      <div><span class="kw">Paso 7</span> &nbsp;SALIDA ('El método falló después de \(N_0\) iteraciones, \(N_0\) =', \(N_0\));</div>
      <div class="ind1"><span class="cm">(El procedimiento no fue exitoso.)</span></div>
      <div class="ind1"><span class="stop">PARE.</span></div>`,

    python: `def secante(f, p0, p1, TOL, N0):
    """Método de la secante para f(x) = 0.

    Entrada: f función, p0 y p1 aproximaciones iniciales,
             TOL tolerancia, N0 número máximo de iteraciones.
    """
    # Paso 1
    i = 2
    q0 = f(p0)
    q1 = f(p1)

    # Paso 2
    while i <= N0:
        # Paso 3
        p = p1 - q1 * (p1 - p0) / (q1 - q0)     # calcule p_i

        # Paso 4
        if abs(p - p1) < TOL:
            print("El procedimiento fue exitoso, p =", p)
            return p

        # Paso 5
        i = i + 1

        # Paso 6: actualice p0, q0, p1, q1
        p0 = p1
        q0 = q1
        p1 = p
        q1 = f(p)

    # Paso 7
    print("El método falló después de N0 iteraciones, N0 =", N0)
    return None


# Ejemplo
import math
p = secante(lambda x: math.cos(x) - x, 0.5, math.pi / 4, 1e-10, 50)`,

    montar(el) {
      NA.raices.montarAbierto(el, {
        nombreCorto: 'Secante',
        color: 's5',
        usaDerivada: false,
        segundo: { label: 'p₁' },
        ejecutar: secante,
        indice: 'i',
        x0Label: 'p₀',
        MLabel: 'N₀',
        mensajeExito: 'el procedimiento fue exitoso,',
        motivosExtra: {
          max: e => `el método falló después de N₀ iteraciones, N₀ = ${e.M}.`,
          horizontal: () => 'q₁ = q₀: la recta secante es horizontal y no corta el eje x (división entre cero en el paso 3).',
          indefinido: () => 'f(p) no está definida en la nueva aproximación.',
        },
        textoSuperlineal: 'convergencia <b>superlineal</b>: el orden teórico de la secante es la razón áurea φ = (1 + √5)/2 ≈ 1.618, entre lineal y cuadrática.',
        textoFallo: 'El método no convergió con estos valores iniciales; prueba con p₀ y p₁ más cercanos a la raíz.',
        subGrafica: 'La recta secante por (pᵢ₋₂, f(pᵢ₋₂)) y (pᵢ₋₁, f(pᵢ₋₁)) corta el eje x en la nueva aproximación',
        leyendaPrincipal: `
          <span><i style="background:var(--curve)"></i>f(x)</span>
          <span><i style="background:var(--s5)"></i>secante</span>
          <span><i class="dot" style="background:var(--s5)"></i>p</span>
          <span><i class="dot" style="background:var(--muted)"></i>aproximaciones anteriores</span>`,
        columnas: [
          ['i', it => it.n],
          ['p₀', it => NA.fmt(it.x0, 14)],
          ['p₁', it => NA.fmt(it.x, 14)],
          ['p', it => NA.fmt(it.xn, 14)],
          ['|p − p₁|', it => NA.fmt(it.err, 5)],
        ],
        tarjeta: it => [['p₀', it.x0, 14], ['p₁', it.x, 14], ['q₀ = f(p₀)', it.f0, 8], ['q₁ = f(p₁)', it.fx, 8], ['p', it.xn, 14], ['|p − p₁|', it.err, 6]],
        dibujarIteracion: (it, tm, C) => {
          const m = (it.fx - it.f0) / (it.x - it.x0);
          const xs = [it.x0, it.x, it.xn];
          const lo = Math.min(...xs), hi = Math.max(...xs), w = (hi - lo) * 0.15;
          const recta = x => it.fx + m * (x - it.x);
          return [
            { label: 'secante', data: [{ x: lo - w, y: recta(lo - w) }, { x: hi + w, y: recta(hi + w) }], showLine: true, borderColor: C, borderWidth: 2, pointRadius: 0, tip: false, order: 1 },
            { label: '(p₀, q₀)', data: [{ x: it.x0, y: it.f0 }], pointRadius: 4.5, pointBackgroundColor: tm.curve, pointBorderColor: tm.surface, pointBorderWidth: 1.5, order: 1 },
          ];
        },
        presets: [
          { nombre: 'cos(x) − x, p₀ = 0.5, p₁ = π/4', f: 'cos(x) - x', x0: 0.5, x1: 0.7853981633974483, tol: '1e-10', M: 50, a: 0, b: 1 },
          { nombre: 'x³ + 4x² − 10, p₀ = 1, p₁ = 2', f: 'x^3 + 4x^2 - 10', x0: 1, x1: 2, tol: '1e-10', M: 50, a: 1, b: 2 },
          { nombre: 'x³ − 2x − 5, p₀ = 2, p₁ = 3', f: 'x^3 - 2x - 5', x0: 2, x1: 3, tol: '1e-10', M: 50, a: 2, b: 3 },
          { nombre: 'x² − 2, p₀ = 1, p₁ = 2  (√2)', f: 'x^2 - 2', x0: 1, x1: 2, tol: '1e-12', M: 50, a: 1, b: 2 },
          { nombre: 'e⁻ˣ − x, p₀ = 0, p₁ = 1', f: 'exp(-x) - x', x0: 0, x1: 1, tol: '1e-10', M: 50, a: 0, b: 1 },
          { nombre: 'x² − 4, p₀ = −1, p₁ = 1  (secante horizontal)', f: 'x^2 - 4', x0: -1, x1: 1, tol: '1e-8', M: 50, a: 0, b: 3 },
          { nombre: 'arctan(x − 1), p₀ = 3, p₁ = 4  (diverge)', f: 'atan(x - 1)', x0: 3, x1: 4, tol: '1e-8', M: 50, a: 0, b: 4 },
        ],
      });
    },
  });
})();
