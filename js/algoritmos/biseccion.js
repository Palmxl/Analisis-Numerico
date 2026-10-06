/* ALGORITMO DE BISECCIÓN (Tarea 1) — transcrito del apunte de clase */
(function () {

  /* Implementación fiel al pseudocódigo */
  function biseccion(f, a, b, tol, M) {
    const a0 = a, b0 = b;
    let i = 1;                                         // Paso 1: i = 1, FA = f(a), FB = f(b)
    const FA = f(a);
    f(b);
    let evals = 2;
    const iter = [];
    while (i <= M) {                                   // Paso 2: Mientras i ≤ M, haga los pasos 3 al 6
      const p = a + (b - a) / 2;                       // Paso 3: p = a + (b − a)/2,  FP = f(p)
      const FP = f(p); evals++;
      const cota = (b0 - a0) / Math.pow(2, i);         // (b − a)/2ⁱ con los extremos iniciales
      iter.push({ n: i, a, b, x: p, fx: FP, err: cota });
      if (FP === 0 || cota < tol) {                    // Paso 4: Si FP = 0 ó (b − a)/2ⁿ < ε
        return { ok: true, p, iter, evals };           //   Salida (Éxito): p es la raíz aproximada
      }
      i = i + 1;                                       // Paso 5: i = i + 1
      if (FA * FP > 0) a = p;                          // Paso 6: Si FA·FP > 0 entonces a = p
      else b = p;                                      //   En caso contrario b = p
      // FA no se actualiza: si FA·FP > 0, f(p) tiene el mismo signo que FA, así que el signo sigue siendo válido.
    }
    return { ok: false, p: iter.length ? iter[iter.length - 1].x : a, iter, evals };  // Paso 7: Salida (Fracaso) [PARE]
  }

  // Bisección también es el método de referencia en las comparaciones de los demás algoritmos
  NA.raices.biseccion = biseccion;

  NA.registrar({
    id: 'biseccion',
    nombre: 'Bisección',
    alias: 'Tarea 1 · método de Bolzano · búsqueda binaria',
    unidad: 'Raíces de ecuaciones',
    resumen: 'Método cerrado que parte el intervalo [a, b] por la mitad en cada paso y conserva la mitad donde f cambia de signo.',
    tags: ['Método cerrado', 'Convergencia lineal', 'Cota de error conocida'],
    apunte: ['assets/apuntes/biseccion-1.jpg', 'assets/apuntes/biseccion-2.jpg'],
    ejecutar: biseccion,

    icono: `
      <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet">
        <line x1="20" y1="62" x2="280" y2="62" stroke="var(--muted)" stroke-width="1.2"/>
        <path d="M30 104 C 90 98, 130 82, 165 56 S 245 12, 280 8" fill="none" stroke="var(--curve)" stroke-width="2.4"/>
        <g stroke="var(--s3)" stroke-width="3" stroke-linecap="round">
          <line x1="50" y1="92" x2="250" y2="92"/>
          <line x1="50" y1="104" x2="150" y2="104" opacity=".85"/>
          <line x1="100" y1="116" x2="150" y2="116" opacity=".7"/>
          <line x1="125" y1="128" x2="150" y2="128" opacity=".55"/>
        </g>
        <line x1="150" y1="30" x2="150" y2="128" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3"/>
        <circle cx="150" cy="62" r="6" fill="var(--s3)" stroke="var(--surface-2)" stroke-width="2"/>
        <circle cx="157" cy="62" r="2.5" fill="var(--curve)"/>
      </svg>`,

    pseudocodigo: String.raw`
      <h3>ALGORITMO (TAREA 1) DE BISECCIÓN</h3>
      <div><span class="sec">Entrada:</span></div>
      <div class="ind1">• \(f\) = función</div>
      <div class="ind1">• \(a, b\): extremos</div>
      <div class="ind1">• \(\varepsilon\): precisión deseada</div>
      <div class="ind1">• \(M\) = máximo de iteraciones</div>
      <div class="gap"></div>
      <div><span class="sec">Salida:</span> Éxito ó Fracaso</div>
      <div class="ind1"><b>Éxito:</b> "Se encontró una aproximación a la raíz de la función con tolerancia deseada \((p_i)\)"</div>
      <div class="ind1"><b>Fracaso:</b> "No se encontró una aprox. a la raíz de la función con la tolerancia deseada y núm. de iteraciones"</div>
      <div class="gap"></div>
      <div><span class="kw">Paso 1:</span> Sea \(i = 1\), &nbsp; \(FA = f(a)\), &nbsp; \(FB = f(b)\)</div>
      <div><span class="kw">Paso 2:</span> <span class="kw">Mientras</span> \(i \le M\), <span class="kw">haga</span> los pasos 3 al 6</div>
      <div class="ind1"><span class="kw">Paso 3:</span> Sea \(p = a + \dfrac{b - a}{2}\) &nbsp; \((p_i)\), &nbsp; luego \(FP = f(p)\)</div>
      <div class="ind1"><span class="kw">Paso 4:</span> <span class="cond"><span class="kw">Si</span> \(FP = 0\) ó \(\dfrac{b - a}{2^n} < \varepsilon\)</span></div>
      <div class="ind2">Salida (Éxito): \(p\) es la raíz aproximada &nbsp;<span class="stop">[PARE]</span></div>
      <div class="ind1"><span class="kw">Paso 5:</span> Sea \(i = i + 1\)</div>
      <div class="ind1"><span class="kw">Paso 6:</span></div>
      <div class="ind2">• <span class="kw">Si</span> \(FA \cdot FP > 0\), <span class="kw">entonces</span> \(a = p\)</div>
      <div class="ind2">• <span class="kw">En caso contrario</span> \(b = p\)</div>
      <div><span class="kw">Paso 7:</span> Salida (Fracaso) &nbsp;<span class="stop">[PARE]</span></div>
      <div class="gap"></div>
      <div class="cm">Nota: en el paso 4, \(a\) y \(b\) son los extremos iniciales y \(n = i\); \(\frac{b_0 - a_0}{2^i}\) es justamente la mitad del intervalo actual.</div>`,

    teoria: String.raw`
      <h3>Idea del método</h3>
      <p>Si \(f\) es continua en \([a, b]\) y \(f(a)\) y \(f(b)\) tienen signos opuestos, el <b>teorema del valor intermedio</b>
      garantiza que existe al menos una raíz \(p\) en \((a, b)\). Bisección toma el punto medio, revisa en qué mitad sigue
      habiendo cambio de signo y descarta la otra. Repetir esto encierra la raíz en intervalos cada vez más pequeños.</p>
      <h3>¿Por qué \(a + \frac{b-a}{2}\) y no \(\frac{a+b}{2}\)?</h3>
      <p>Matemáticamente son iguales, pero en aritmética de punto flotante \(a + \frac{b-a}{2}\) es más segura: cuando \(a\) y
      \(b\) están muy cerca, \(\frac{a+b}{2}\) puede caer <b>fuera</b> del intervalo por redondeo.</p>
      <h3>Cota del error</h3>
      <p>Después de \(n\) pasos el intervalo mide \(\frac{b-a}{2^{n-1}}\) y \(p_n\) es su punto medio, así que</p>
      $$|p_n - p| \le \frac{b - a}{2^n}.$$
      <p>Ese es exactamente el criterio del paso 4: cuando \(\frac{b-a}{2^n} < \varepsilon\), el error <b>real</b> ya es menor
      que \(\varepsilon\). A diferencia de los otros métodos, aquí el criterio de parada sí garantiza la precisión.</p>
      <h3>Número de iteraciones necesarias</h3>
      <p>Como la cota no depende de \(f\), se puede saber de antemano cuántas iteraciones hacen falta:</p>
      $$\frac{b - a}{2^n} < \varepsilon \quad\Longleftrightarrow\quad n > \log_2\!\left(\frac{b - a}{\varepsilon}\right).$$
      <p>Por ejemplo, con \([1, 2]\) y \(\varepsilon = 10^{-4}\) se necesitan \(n \ge 14\) iteraciones, sin importar la función.
      El simulador muestra este valor como “Iteraciones teóricas”.</p>
      <h3>Convergencia</h3>
      <p>La convergencia es <b>lineal</b> con razón \(C = \tfrac12\): cada paso gana exactamente un bit (≈ 0.3 cifras decimales)
      de precisión. Es lenta comparada con Newton-Raphson, pero nunca falla si hay cambio de signo.</p>
      <div class="pros">
        <div class="box p"><h4>Ventajas</h4><ul>
          <li>Siempre converge si \(f(a)f(b) < 0\).</li>
          <li>Cota de error garantizada y número de iteraciones conocido de antemano.</li>
          <li>Solo necesita evaluar \(f\) (ni derivadas ni nada más).</li>
        </ul></div>
        <div class="box c"><h4>Desventajas</h4><ul>
          <li>Convergencia lenta (lineal, \(C = \tfrac12\)).</li>
          <li>Necesita un intervalo con cambio de signo: no encuentra raíces dobles como \(x^2 = 0\).</li>
          <li>Si hay varias raíces en \([a, b]\), solo encuentra una.</li>
        </ul></div>
      </div>`,

    python: `def biseccion(f, a, b, tol, M):
    """Algoritmo (Tarea 1) de Bisección.

    Entrada: f función, a y b extremos, tol = ε precisión deseada,
             M = máximo de iteraciones.
    """
    a0, b0 = a, b

    # Paso 1
    i = 1
    FA = f(a)
    FB = f(b)

    # Paso 2
    while i <= M:
        # Paso 3
        p = a + (b - a) / 2
        FP = f(p)

        # Paso 4
        if FP == 0 or (b0 - a0) / 2**i < tol:
            print("Éxito: se encontró una aproximación a la raíz con la tolerancia deseada, p =", p)
            return p

        # Paso 5
        i = i + 1

        # Paso 6
        if FA * FP > 0:
            a = p
        else:
            b = p

    # Paso 7
    print("Fracaso: no se encontró una aproximación con la tolerancia deseada y el número de iteraciones")
    return None


# Ejemplo
p = biseccion(lambda x: x**3 + 4*x**2 - 10, 1, 2, 1e-4, 50)`,

    montar(el) {
      NA.raices.montarCerrado(el, {
        nombreCorto: 'Bisección',
        color: 's3',
        indice: 'i',
        etiquetaErr: 'Cota (b₀−a₀)/2ⁱ',
        mensajeExito: 'se encontró una aproximación a la raíz de la función con la tolerancia deseada,',
        mensajeFracaso: () => 'no se encontró una aproximación a la raíz de la función con la tolerancia deseada y el número de iteraciones.',
        ejecutar: biseccion,
        referencia: { nombre: 'Regla falsa', ejecutar: NA.buscar('regla-falsa').ejecutar, color: 's1' },
        dibujarIteracion: () => [],
        statsExtra: e => {
          const nTeo = Math.max(1, Math.ceil(Math.log2((e.b0 - e.a0) / e.tol)));
          return `<div class="stat"><div class="k">Iteraciones teóricas</div><div class="v">${nTeo} <small>⌈log₂((b−a)/ε)⌉</small></div></div>`;
        },
        presets: [
          { nombre: 'x³ + 4x² − 10 en [1, 2]', f: 'x^3 + 4x^2 - 10', a: 1, b: 2, tol: '1e-4', M: 50 },
          { nombre: 'x³ − 2x − 5 en [2, 3]', f: 'x^3 - 2x - 5', a: 2, b: 3, tol: '1e-8', M: 100 },
          { nombre: 'cos(x) − x en [0, 1]', f: 'cos(x) - x', a: 0, b: 1, tol: '1e-8', M: 100 },
          { nombre: 'x² − 2 en [1, 2]  (√2)', f: 'x^2 - 2', a: 1, b: 2, tol: '1e-10', M: 100 },
          { nombre: 'x¹⁰ − 1 en [0, 1.3]  (gana a regla falsa)', f: 'x^10 - 1', a: 0, b: 1.3, tol: '1e-6', M: 100 },
          { nombre: 'x² − 1 en [0, 2]  (FP = 0 exacto)', f: 'x^2 - 1', a: 0, b: 2, tol: '1e-8', M: 100 },
          { nombre: 'x³ + 4x² − 10, M = 5  (fracaso)', f: 'x^3 + 4x^2 - 10', a: 1, b: 2, tol: '1e-4', M: 5 },
        ],
      });
    },
  });
})();
