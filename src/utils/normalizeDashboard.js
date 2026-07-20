const CHART_DEFAULT = {
  total: 0,
  labels: ['En proceso', 'Finalizadas'],
  values: [0, 0],
  colors: ['#1890ff', '#faad14'],
}

const RESUMEN_DEFAULT = {
  proveedoresRegistrados: 0,
  evaluacionesEnProceso: 0,
  evaluacionesFinalizadas: 0,
  proveedoresAprobados: 0,
  puntajePromedio: 0,
}

function pick(obj, ...keys) {
  if (!obj) return undefined
  for (const key of keys) {
    if (obj[key] != null) return obj[key]
  }
  return undefined
}

function parseResumen(source) {
  const src = source?.resumen ?? source ?? {}
  return {
    proveedoresRegistrados:
      pick(src, 'proveedoresRegistrados', 'ProveedoresRegistrados') ?? 0,
    evaluacionesEnProceso:
      pick(src, 'evaluacionesEnProceso', 'EvaluacionesEnProceso') ?? 0,
    evaluacionesFinalizadas:
      pick(src, 'evaluacionesFinalizadas', 'EvaluacionesFinalizadas') ?? 0,
    proveedoresAprobados:
      pick(src, 'proveedoresAprobados', 'ProveedoresAprobados') ?? 0,
    puntajePromedio: pick(src, 'puntajePromedio', 'PuntajePromedio') ?? 0,
  }
}

/** Gráfico donut: En proceso (activo) vs Finalizadas. */
function buildChartPorEstado(resumen, chartRaw) {
  const fromApi = chartRaw
    ? {
        total: pick(chartRaw, 'total', 'Total') ?? 0,
        labels: chartRaw.labels ?? chartRaw.Labels ?? CHART_DEFAULT.labels,
        values: chartRaw.values ?? chartRaw.Values ?? CHART_DEFAULT.values,
        colors: chartRaw.colors ?? chartRaw.Colors ?? CHART_DEFAULT.colors,
      }
    : null

  const sumFromApi = fromApi?.values?.reduce((a, b) => a + (Number(b) || 0), 0) ?? 0
  if (fromApi && sumFromApi > 0 && fromApi.labels?.length === 2) return fromApi

  // Compatibilidad: si el API aún manda 3 series, fusiona En proceso + En evaluación.
  if (fromApi && fromApi.labels?.length === 3 && fromApi.values?.length === 3) {
    const activo = (Number(fromApi.values[0]) || 0) + (Number(fromApi.values[1]) || 0)
    const finalizadas = Number(fromApi.values[2]) || 0
    return {
      total: activo + finalizadas,
      labels: CHART_DEFAULT.labels,
      values: [activo, finalizadas],
      colors: CHART_DEFAULT.colors,
    }
  }

  const enProceso = resumen.evaluacionesEnProceso ?? 0
  const finalizadas = resumen.evaluacionesFinalizadas ?? 0
  const values = [enProceso, finalizadas]

  return {
    ...CHART_DEFAULT,
    total: values.reduce((a, b) => a + b, 0),
    values,
  }
}

/**
 * Adapta la respuesta del back (plana o envuelta) al shape del mock del front.
 */
export function normalizeDashboardResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      resumen: { ...RESUMEN_DEFAULT },
      evaluacionesRecientes: [],
      proximasVencer: [],
      chartPorEstado: { ...CHART_DEFAULT },
      chartLabels: [],
      chartScores: [],
    }
  }

  const resumen = { ...RESUMEN_DEFAULT, ...parseResumen(raw) }
  const chartPorEstado = buildChartPorEstado(resumen, raw.chartPorEstado ?? raw.chart)

  if (raw.resumen && (raw.evaluacionesRecientes || raw.chartPorEstado)) {
    return {
      resumen,
      evaluacionesRecientes: raw.evaluacionesRecientes ?? [],
      proximasVencer: raw.proximasVencer ?? [],
      chartPorEstado,
      chartLabels: raw.chartLabels ?? [],
      chartScores: raw.chartScores ?? [],
    }
  }

  return {
    resumen,
    evaluacionesRecientes: raw.evaluacionesRecientes ?? raw.EvaluacionesRecientes ?? [],
    proximasVencer: raw.proximasVencer ?? raw.ProximasVencer ?? [],
    chartPorEstado,
    chartLabels: raw.chartLabels ?? raw.ChartLabels ?? [],
    chartScores: raw.chartScores ?? raw.ChartScores ?? [],
  }
}
