const CHART_DEFAULT = {
  total: 0,
  labels: ['En proceso', 'En evaluación', 'Finalizadas'],
  values: [0, 0, 0],
  colors: ['#1890ff', '#69c0ff', '#faad14'],
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
    }
  }

  if (raw.resumen && (raw.evaluacionesRecientes || raw.chartPorEstado)) {
    return {
      resumen: { ...RESUMEN_DEFAULT, ...raw.resumen },
      evaluacionesRecientes: raw.evaluacionesRecientes ?? [],
      proximasVencer: raw.proximasVencer ?? [],
      chartPorEstado: { ...CHART_DEFAULT, ...raw.chartPorEstado },
    }
  }

  const source = raw.resumen ?? raw
  const resumen = {
    proveedoresRegistrados:
      pick(source, 'proveedoresRegistrados', 'ProveedoresRegistrados') ?? 0,
    evaluacionesEnProceso:
      pick(source, 'evaluacionesEnProceso', 'EvaluacionesEnProceso') ?? 0,
    evaluacionesFinalizadas:
      pick(source, 'evaluacionesFinalizadas', 'EvaluacionesFinalizadas') ?? 0,
    proveedoresAprobados:
      pick(source, 'proveedoresAprobados', 'ProveedoresAprobados') ?? 0,
    puntajePromedio: pick(source, 'puntajePromedio', 'PuntajePromedio') ?? 0,
  }

  const enProceso = resumen.evaluacionesEnProceso
  const finalizadas = resumen.evaluacionesFinalizadas
  const enEvaluacion = pick(source, 'evaluacionesEnEvaluacion', 'EvaluacionesEnEvaluacion') ?? 0

  const chartRaw = raw.chartPorEstado ?? raw.chart ?? null
  const chartPorEstado = chartRaw
    ? {
        total: pick(chartRaw, 'total', 'Total') ?? 0,
        labels: chartRaw.labels ?? chartRaw.Labels ?? CHART_DEFAULT.labels,
        values: chartRaw.values ?? chartRaw.Values ?? CHART_DEFAULT.values,
        colors: chartRaw.colors ?? chartRaw.Colors ?? CHART_DEFAULT.colors,
      }
    : {
        ...CHART_DEFAULT,
        total: enProceso + enEvaluacion + finalizadas,
        values: [enProceso, enEvaluacion, finalizadas],
      }

  return {
    resumen,
    evaluacionesRecientes: raw.evaluacionesRecientes ?? raw.EvaluacionesRecientes ?? [],
    proximasVencer: raw.proximasVencer ?? raw.ProximasVencer ?? [],
    chartPorEstado,
  }
}
