/* ALGORITMO DE LA REGLA FALSA — transcrito del apunte de clase */
(function () {

  /* Implementación fiel al pseudocódigo */
  function reglaFalsa(f, a, b, tol, M) {
    let fa = f(a), fb = f(b), evals = 2;
    const iter = [];
    let xPrev = null;
    for (let n = 0; n < M; n++) {                       // Mientras n < M haga
      const x = (a * fb - b * fa) / (fb - fa);          // xn = (an f(bn) − bn f(an)) / (f(bn) − f(an))
      const fx = f(x); evals++;
      const err = (n > 0 && x !== 0) ? Math.abs((x - xPrev) / x) : null;
      iter.push({ n, a, b, fa, fb, x, fx, err });
      if (err !== null && err < tol) {                  // Si n > 0 y xn ≠ 0 y |(xn − xn−1)/xn| < ε
        return { ok: true, p: x, iter, evals };         //   Salida (Éxito) [PARE]
      }
      if (fx * fa < 0) { b = x; fb = fx; }              // Si f(xn) f(an) < 0: bn+1 = xn, an+1 = an
      else { a = x; fa = fx; }                          // En caso contrario: an+1 = xn, bn+1 = bn
      xPrev = x;
    }
    return { ok: false, p: xPrev, iter, evals };        // Si n = M: Salida (Fracaso) [PARE]
  }

  NA.registrar({
    id: 'regla-falsa',
    nombre: 'Regla Falsa',
    alias: 'Regula Falsi · Falsa posición',
    unidad: 'Raíces de ecuaciones',
    resumen: 'Método cerrado que aproxima la raíz con el corte de la recta secante entre (aₙ, f(aₙ)) y (bₙ, f(bₙ)).',
    tags: ['Método cerrado', 'Convergencia lineal', 'Siempre converge'],
    ejecutar: reglaFalsa,   // expuesto para que otros métodos se comparen con este

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <rect x="70" y="10" width="170" height="112" fill="var(--s1-soft)"/>
        <line x1="20" y1="72" x2="280" y2="72" stroke="var(--muted)" stroke-width="1.2"/>
        <path d="M30 118 C 90 112, 140 92, 175 60 S 250 14, 280 8" fill="none" stroke="var(--curve)" stroke-width="2.4"/>
        <line x1="70" y1="111" x2="240" y2="22" stroke="var(--s1)" stroke-width="2"/>
        <circle cx="70" cy="111" r="4.5" fill="var(--s1)"/>
        <circle cx="240" cy="22" r="4.5" fill="var(--s1)"/>
        <circle cx="144.5" cy="72" r="6" fill="var(--s1)" stroke="var(--surface-2)" stroke-width="2"/>
        <text x="66" y="128" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">a</text>
        <text x="236" y="128" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">b</text>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>ALGORITMO DE LA REGLA FALSA</h3>
      <div><span class="sec">− Entrada:</span></div>
      <div class="ind1">• \(f\) = función</div>
      <div class="ind1">• \(a_0\) y \(b_0\): valores iniciales \(a_0 < b_0\) y que \(f(a_0)\,f(b_0) < 0\)</div>
      <div class="ind1">• \(\varepsilon\) = tolerancia (precisión deseada)</div>
      <div class="ind1">• \(M\) = máximo de iteraciones</div>
      <div class="gap"></div>
      <div><span class="sec">− Salida:</span></div>
      <div class="ind1">• <b>Éxito:</b> "Se obtuvo una aproximación de \(p\)"</div>
      <div class="ind1">• <b>Fracaso:</b> "Después de \(M\) iteraciones no se logró la precisión deseada"</div>
      <div class="gap"></div>
      <div><span class="sec">− Iteraciones:</span></div>
      <div><span class="kw">Mientras</span> \(n < M\) &nbsp;\((n = 0, 1, 2, \dots)\) <span class="kw">haga</span></div>
      <div class="ind1">$$x_n = \frac{a_n\,f(b_n) - b_n\,f(a_n)}{f(b_n) - f(a_n)}$$</div>
      <div class="ind1"><span class="cond">Si \(n > 0\) y \(x_n \neq 0\)</span></div>
      <div class="ind2">\(\left|\dfrac{x_n - x_{n-1}}{x_n}\right| < \varepsilon\) &nbsp; <span class="cm">(error relativo)</span></div>
      <div class="ind2"><span class="kw">entonces</span> Salida (Éxito) &nbsp;<span class="stop">[PARE]</span></div>
      <div class="ind1"><span class="kw">En caso contrario</span></div>
      <div class="ind2">• <span class="kw">Si</span> \(f(x_n)\,f(a_n) < 0\) <span class="kw">entonces</span></div>
      <div class="ind3">\(b_{n+1} = x_n\)</div>
      <div class="ind3">\(a_{n+1} = a_n\)</div>
      <div class="ind2">• <span class="kw">En caso contrario</span></div>
      <div class="ind3">\(a_{n+1} = x_n\)</div>
      <div class="ind3">\(b_{n+1} = b_n\)</div>
      <div class="gap"></div>
      <div>• <span class="kw">Si</span> \(n = M\), <span class="kw">entonces</span> Salida (Fracaso) &nbsp;<span class="stop">[PARE]</span></div>`,

    python: `def regla_falsa(f, a, b, tol, M):
    """Algoritmo de la Regla Falsa.

    Entrada: f función, a < b con f(a)*f(b) < 0, tol = ε, M = máximo de iteraciones.
    """
    if not (a < b and f(a) * f(b) < 0):
        raise ValueError("Se requiere a0 < b0 y f(a0)·f(b0) < 0")

    x_ant = None
    n = 0
    while n < M:
        x = (a * f(b) - b * f(a)) / (f(b) - f(a))

        if n > 0 and x != 0 and abs((x - x_ant) / x) < tol:
            print("Éxito: se obtuvo una aproximación de p =", x)
            return x

        if f(x) * f(a) < 0:
            b = x          # b_{n+1} = x_n,  a_{n+1} = a_n
        else:
            a = x          # a_{n+1} = x_n,  b_{n+1} = b_n

        x_ant = x
        n += 1

    print("Fracaso: después de", M, "iteraciones no se logró la precisión deseada")
    return None


# Ejemplo
p =regla_falsa(lambda x: x**3 - 2*x - 5, 2, 3, 1e-8, 100)`,

    montar(el) {
      NA.raices.montarCerrado(el, {
        nombreCorto: 'Regla falsa',
        ejecutar: reglaFalsa,
        leyendaExtra: '<span><i style="background:var(--s1)"></i>secante</span>',
        dibujarIteracion: (it, tm) => [{
          label: 'secante',
          data: [{ x: it.a, y: it.fa }, { x: it.b, y: it.fb }],
          showLine: true, borderColor: tm.s1, borderWidth: 2,
          pointRadius: 4.5, pointBackgroundColor: tm.s1, pointBorderColor: tm.surface, pointBorderWidth: 1.5,
          order: 1,
        }],
        presets: [
          { nombre: 'x³ − 2x − 5 en [2, 3]', f: 'x^3 - 2x - 5', a: 2, b: 3, tol: '1e-8', M: 100 },
          { nombre: 'cos(x) − x en [0, 1]', f: 'cos(x) - x', a: 0, b: 1, tol: '1e-8', M: 100 },
          { nombre: 'e⁻ˣ − x en [0, 1]', f: 'exp(-x) - x', a: 0, b: 1, tol: '1e-8', M: 100 },
          { nombre: 'x² − 2 en [1, 2]  (√2)', f: 'x^2 - 2', a: 1, b: 2, tol: '1e-10', M: 100 },
          { nombre: 'x¹⁰ − 1 en [0, 1.3]  (caso lento)', f: 'x^10 - 1', a: 0, b: 1.3, tol: '1e-6', M: 100 },
          { nombre: 'ln(x) + x − 2 en [1, 2]', f: 'ln(x) + x - 2', a: 1, b: 2, tol: '1e-8', M: 100 },
        ],
      });
    },
  });
})();
