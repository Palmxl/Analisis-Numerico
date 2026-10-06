/* ALGORITMO DE NEWTON-RAPHSON — transcrito del apunte de clase */
(function () {

  /* Implementación fiel al pseudocódigo */
  function newtonRaphson(f, df, x0, tol, M) {
    let x = x0, evals = 0, evalsD = 0;
    const iter = [];
    for (let n = 0; n <= M - 1; n++) {                  // Para n = 0, 1, 2, ..., M−1 haga
      if (Math.abs(x) > 1e12) return { ok: false, motivo: 'diverge', p: x, iter, evals, evalsD };
      const fx = f(x), dfx = df(x); evals++; evalsD++;
      if (dfx === 0 || !isFinite(dfx)) {               // (protección: tangente horizontal, no está en el apunte)
        return { ok: false, motivo: 'derivada', p: x, iter, evals, evalsD };
      }
      const xn = x - fx / dfx;                         // xn+1 = xn − f(xn) / f′(xn)
      if (!isFinite(xn)) return { ok: false, motivo: 'diverge', p: x, iter, evals, evalsD };
      const err = Math.abs(xn - x);                    // en+1 = |xn+1 − xn|
      iter.push({ n, x, fx, dfx, xn, err });
      if (err < tol) return { ok: true, p: xn, iter, evals, evalsD };   // Si en+1 < ε: Salida (Éxito) [PARE]
      x = xn;
    }
    return { ok: false, motivo: 'max', p: x, iter, evals, evalsD };     // Si n = M: Salida (Fracaso) [PARE]
  }

  NA.registrar({
    id: 'newton-raphson',
    nombre: 'Newton-Raphson',
    alias: 'Método de Newton · método de la tangente',
    unidad: 'Raíces de ecuaciones',
    resumen: 'Método abierto que, desde un valor inicial x₀, sigue la recta tangente a f hasta el eje x. Converge cuadráticamente cerca de una raíz simple.',
    tags: ['Método abierto', 'Convergencia cuadrática', 'Usa la derivada'],
    ejecutar: newtonRaphson,

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <line x1="20" y1="96" x2="280" y2="96" stroke="var(--muted)" stroke-width="1.2"/>
        <path d="M40 124 C 90 118, 130 104, 160 88 S 230 38, 270 10" fill="none" stroke="var(--curve)" stroke-width="2.4"/>
        <line x1="270" y1="10" x2="196" y2="96" stroke="var(--s2)" stroke-width="2"/>
        <line x1="196" y1="96" x2="196" y2="64" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="3 3"/>
        <line x1="196" y1="64" x2="162" y2="96" stroke="var(--s2)" stroke-width="2" opacity=".75"/>
        <circle cx="270" cy="10" r="4.5" fill="var(--curve)"/>
        <circle cx="196" cy="64" r="4" fill="var(--curve)"/>
        <circle cx="196" cy="96" r="4" fill="var(--muted)"/>
        <circle cx="162" cy="96" r="6" fill="var(--s2)" stroke="var(--surface-2)" stroke-width="2"/>
        <text x="263" y="112" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">x₀</text>
        <text x="190" y="112" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">x₁</text>
        <text x="150" y="112" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">x₂</text>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>ALGORITMO DE NEWTON-RAPHSON</h3>
      <div><span class="sec">− Entrada:</span></div>
      <div class="ind1">• \(f\) = función</div>
      <div class="ind1">• \(f'\) = derivada de la función</div>
      <div class="ind1">• \(x_0\) = valor inicial</div>
      <div class="ind1">• \(\varepsilon\) = precisión deseada</div>
      <div class="ind1">• \(M\) = máximo de iteraciones</div>
      <div class="gap"></div>
      <div><span class="sec">− Salida:</span></div>
      <div class="ind1">• <b>Éxito:</b> "Se obtuvo una aproximación de \(p\)"</div>
      <div class="ind1">• <b>Fracaso:</b> "Después de \(M\) iteraciones no se logró la precisión deseada"</div>
      <div class="gap"></div>
      <div><span class="sec">− Iteraciones:</span></div>
      <div>• <span class="kw">Para</span> \(n = 0, 1, 2, \dots, M-1\) <span class="kw">haga</span></div>
      <div class="ind1">$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$</div>
      <div class="ind1">\(e_{n+1} = \left| x_{n+1} - x_n \right|\)</div>
      <div class="gap"></div>
      <div class="ind1">• <span class="cond"><span class="kw">Si</span> \(e_{n+1} < \varepsilon\)</span>, <span class="kw">entonces</span></div>
      <div class="ind2">Salida (Éxito) &nbsp;<span class="stop">[PARE]</span></div>
      <div class="gap"></div>
      <div>• <span class="kw">Si</span> \(n = M\), <span class="kw">entonces</span></div>
      <div class="ind1">Salida (Fracaso) &nbsp;<span class="stop">[PARE]</span></div>`,

    python: `def newton_raphson(f, df, x0, tol, M):
    """Algoritmo de Newton-Raphson.

    Entrada: f función, df derivada de f, x0 valor inicial,
             tol = ε precisión deseada, M = máximo de iteraciones.
    """
    x = x0
    for n in range(M):                     # n = 0, 1, 2, ..., M-1
        if df(x) == 0:
            print("La derivada se anuló en x =", x)
            return None

        x_sig = x - f(x) / df(x)            # x_{n+1} = x_n - f(x_n) / f'(x_n)
        e = abs(x_sig - x)                  # e_{n+1} = |x_{n+1} - x_n|

        if e < tol:
            print("Éxito: se obtuvo una aproximación de p =", x_sig)
            return x_sig

        x = x_sig

    print("Fracaso: después de", M, "iteraciones no se logró la precisión deseada")
    return None


# Ejemplo
p = newton_raphson(lambda x: x**3 - 2*x - 5,
                   lambda x: 3*x**2 - 2,
                   2, 1e-10, 50)`,

    montar(el) {
      NA.raices.montarAbierto(el, {
        nombreCorto: 'Newton-Raphson',
        color: 's2',
        ejecutar: newtonRaphson,
        leyendaExtra: '<span><i style="background:var(--s2)"></i>tangente en xₙ</span>',
        dibujarIteracion: (it, tm, C, [xmin, xmax]) => {
          const tang = x => it.fx + it.dfx * (x - it.x);
          const w = it.xn - it.x;
          let x1 = it.x - 0.25 * w, x2 = it.xn + 0.25 * w;
          if (!(Math.abs(w) > 0)) { x1 = xmin; x2 = xmax; }
          return [{
            label: 'tangente',
            data: [{ x: x1, y: tang(x1) }, { x: x2, y: tang(x2) }],
            showLine: true, borderColor: C, borderWidth: 2, pointRadius: 0, tip: false, order: 1,
          }];
        },
        presets: [
          { nombre: 'x³ − 2x − 5, x₀ = 2', f: 'x^3 - 2x - 5', df: '3x^2 - 2', x0: 2, tol: '1e-10', M: 50, a: 2, b: 3 },
          { nombre: 'cos(x) − x, x₀ = 1', f: 'cos(x) - x', df: '-sin(x) - 1', x0: 1, tol: '1e-10', M: 50, a: 0, b: 1 },
          { nombre: 'x² − 2, x₀ = 1  (√2)', f: 'x^2 - 2', df: '2x', x0: 1, tol: '1e-12', M: 50, a: 1, b: 2 },
          { nombre: 'e⁻ˣ − x, x₀ = 0', f: 'exp(-x) - x', df: '-exp(-x) - 1', x0: 0, tol: '1e-10', M: 50, a: 0, b: 1 },
          { nombre: '(x − 1)²(x + 2), x₀ = 2  (raíz doble)', f: '(x - 1)^2 * (x + 2)', df: '3(x - 1)(x + 1)', x0: 2, tol: '1e-8', M: 100 },
          { nombre: 'x³ − 2x + 2, x₀ = 0  (ciclo)', f: 'x^3 - 2x + 2', df: '3x^2 - 2', x0: 0, tol: '1e-8', M: 30, a: -2, b: -1 },
          { nombre: 'arctan(x − 1), x₀ = 2.5  (diverge)', f: 'atan(x - 1)', df: '1 / (1 + (x - 1)^2)', x0: 2.5, tol: '1e-8', M: 50, a: 0, b: 2.5 },
          { nombre: 'x² − 4, x₀ = 0  (tangente horizontal)', f: 'x^2 - 4', df: '2x', x0: 0, tol: '1e-8', M: 50, a: 0, b: 3 },
        ],
      });
    },
  });
})();
