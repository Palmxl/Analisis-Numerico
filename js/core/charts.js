/* Utilidades de gráficas (Chart.js) con los colores del tema */
NA.charts = {
  instancias: [],

  tema() {
    const cs = getComputedStyle(document.documentElement);
    const v = n => cs.getPropertyValue(n).trim();
    return {
      text: v('--text'), text2: v('--text-2'), muted: v('--muted'),
      border: v('--border'), borderStrong: v('--border-strong'),
      surface: v('--surface'), surface2: v('--surface-2'),
      s1: v('--s1'), s1soft: v('--s1-soft'), s2: v('--s2'), s2soft: v('--s2-soft'), s3: v('--s3'), s3soft: v('--s3-soft'),
      ink: v('--ink'), hl: v('--hl'), curve: v('--curve'),
    };
  },

  aplicarDefaults() {
    const t = this.tema();
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = innerWidth < 600 ? 11 : 12;
    Chart.defaults.color = t.muted;
    Chart.defaults.borderColor = t.border;
    Chart.defaults.animation.duration = 250;
    Object.assign(Chart.defaults.plugins.tooltip, {
      backgroundColor: t.surface, titleColor: t.text, bodyColor: t.text2,
      borderColor: t.borderStrong, borderWidth: 1, padding: 10, cornerRadius: 8,
      titleFont: { family: "'JetBrains Mono', monospace", size: 12, weight: '500' },
      bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
      boxPadding: 4, usePointStyle: true,
    });
    Chart.defaults.plugins.legend.display = false;
  },

  crear(canvas, config) {
    this.aplicarDefaults();
    const c = new Chart(canvas, config);
    this.instancias.push(c);
    return c;
  },

  destruirTodas() {
    this.instancias.forEach(c => c.destroy());
    this.instancias = [];
  },

  /* Ejes con grilla recesiva */
  ejes(t, { xTitle, yTitle, yLog = false, xInt = false } = {}) {
    return {
      x: {
        type: 'linear',
        grid: { color: t.border, drawTicks: false },
        border: { color: t.borderStrong },
        ticks: { padding: 6, includeBounds: false, precision: xInt ? 0 : undefined },
        title: xTitle ? { display: true, text: xTitle, color: t.muted } : undefined,
      },
      y: {
        type: yLog ? 'logarithmic' : 'linear',
        grid: { color: t.border, drawTicks: false },
        border: { display: false },
        ticks: {
          padding: 6,
          includeBounds: false,
          callback: yLog ? (v => {
            const e = Math.log10(v);
            return Math.abs(e - Math.round(e)) < 1e-9 ? '1e' + Math.round(e) : '';
          }) : undefined,
        },
        title: yTitle ? { display: true, text: yTitle, color: t.muted } : undefined,
      },
    };
  },
};

/* Plugin: sombrea un intervalo [a, b] en el eje x y dibuja la línea y = 0 */
NA.charts.pluginIntervalo = {
  id: 'intervalo',
  beforeDatasetsDraw(chart, _args, opts) {
    const { ctx, chartArea: ca, scales: { x, y } } = chart;
    ctx.save();
    if (opts.a !== undefined && opts.b !== undefined) {
      const xa = Math.max(x.getPixelForValue(opts.a), ca.left);
      const xb = Math.min(x.getPixelForValue(opts.b), ca.right);
      ctx.fillStyle = opts.color;
      ctx.fillRect(xa, ca.top, xb - xa, ca.bottom - ca.top);
      ctx.strokeStyle = opts.edge;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      [xa, xb].forEach(px => { ctx.beginPath(); ctx.moveTo(px, ca.top); ctx.lineTo(px, ca.bottom); ctx.stroke(); });
      ctx.setLineDash([]);
    }
    const y0 = y.getPixelForValue(0);
    if (y0 >= ca.top && y0 <= ca.bottom) {
      ctx.strokeStyle = opts.axis;
      ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(ca.left, y0); ctx.lineTo(ca.right, y0); ctx.stroke();
    }
    ctx.restore();
  },
};
