import seaRoutes from '../data/seaRoutes.json'

/**
 * Convert a list of [lat, lng] waypoints into a sea route using
 * pre-computed maritime paths between port pairs.
 * Falls back to straight lines if no sea route is available.
 */
export function toSeaRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return waypoints

  const allCoords = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const fromKey = findPortCode(waypoints[i])
    const toKey = findPortCode(waypoints[i + 1])
    const key = fromKey && toKey ? `${fromKey}-${toKey}` : null
    const seaPath = key ? seaRoutes[key] : null

    if (seaPath && seaPath.length >= 2) {
      const coords = [...seaPath]
      if (allCoords.length > 0) coords.shift()
      allCoords.push(...coords)
    } else {
      // Fallback to straight line
      if (allCoords.length === 0) allCoords.push(waypoints[i])
      allCoords.push(waypoints[i + 1])
    }
  }

  return allCoords
}

// Known port coordinates → code lookup (rounded to 1 decimal for fuzzy matching)
const portLookup = {
  '31.4,121.6': 'CNSHA', '51.9,4.5': 'NLRTM', '1.3,103.8': 'SGSIN',
  '37.9,23.6': 'GRPIR', '53.5,10.0': 'DEHAM', '39.5,-0.3': 'ESVLC',
  '21.5,39.2': 'SAJED', '25.0,55.1': 'AEJEA', '19.0,73.0': 'INNSA',
  '33.7,-118.3': 'USLAX', '-24.0,-46.3': 'BRSSZ', '36.1,-5.4': 'ESALG',
  '35.9,-5.5': 'MAPTM', '6.9,79.9': 'LKCMB', '-33.9,18.4': 'ZACPT',
}

function findPortCode([lat, lng]) {
  const key = `${Math.round(lat * 10) / 10},${Math.round(lng * 10) / 10}`
  return portLookup[key] || null
}
