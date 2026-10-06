# Análisis Numérico · Cuaderno de algoritmos

Web estática con los pseudocódigos del curso, implementados y graficados.
Abre `index.html` con doble clic (necesita internet para las librerías y fuentes).

## Estructura

```
index.html                 página principal (aquí se enlaza cada algoritmo)
css/styles.css             estilos y tema claro/oscuro
js/core/na.js              registro de algoritmos y utilidades
js/core/charts.js          gráficas (Chart.js) con los colores del tema
js/core/raices.js          simulador para métodos cerrados (regla falsa, bisección…)
js/core/abiertos.js        simulador para métodos abiertos (Newton-Raphson, secante…)
js/algoritmos/*.js         un archivo por algoritmo
assets/apuntes/*.jpg       foto del apunte original
```

## Agregar un algoritmo nuevo

1. Crea `js/algoritmos/<id>.js` y llama a `NA.registrar({...})` con:
   `id`, `nombre`, `unidad`, `resumen`, `tags`, `icono`, `pseudocodigo`, `teoria`, `python`, `apunte` y `montar(el)`.
   Usa `regla-falsa.js` como plantilla.
2. Agrega `<script src="js/algoritmos/<id>.js"></script>` en `index.html`.
3. Guarda la foto del apunte en `assets/apuntes/`.
# Analisis-Numerico
