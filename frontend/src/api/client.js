const BASE = '/api/v1'

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getScenarios: () => fetchJson('/scenarios'),
  getScenario: (id) => fetchJson(`/scenarios/${id}`),
  getKpis: (scenarioId) => fetchJson(`/dashboard/kpis?scenarioId=${scenarioId}`),
  getPorts: () => fetchJson('/ports'),
  getTradeLanes: () => fetchJson('/forecast/trade-lanes'),
  getAlgorithms: () => fetchJson('/forecast/algorithms'),
  generateForecast: (body) => postJson('/forecast/demand', body),
  optimizeRoute: (body) => postJson('/routes/optimize', body),
  getAlternativeRoutes: (origin, dest, max = 3) =>
    fetchJson(`/routes/alternatives?origin=${origin}&destination=${dest}&maxAlternatives=${max}`),
  applyScenario: (scenarioId) => postJson(`/scenarios/${scenarioId}/activate`, {}),
  getHistoricalDemand: (tradeLane, days = 90, scenarioId = 'normal') =>
    fetchJson(`/historical/demand?tradeLane=${tradeLane}&days=${days}&scenarioId=${scenarioId}`),
  refreshFeed: () => postJson('/feed/refresh', {}),
}
