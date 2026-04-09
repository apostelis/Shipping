import searoute from 'searoute-js'

/**
 * Convert a list of [lat, lng] waypoints into a sea route by computing
 * maritime paths between each consecutive pair.
 * Falls back to straight lines if searoute fails.
 */
export function toSeaRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return waypoints

  const allCoords = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const origin = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [waypoints[i][1], waypoints[i][0]] } // [lng, lat]
    }
    const dest = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [waypoints[i + 1][1], waypoints[i + 1][0]] }
    }

    try {
      const route = searoute(origin, dest)
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]) // back to [lat, lng]
      // Avoid duplicate points at segment boundaries
      if (allCoords.length > 0) coords.shift()
      allCoords.push(...coords)
    } catch (e) {
      // Fallback to straight line for this segment
      if (allCoords.length === 0) allCoords.push(waypoints[i])
      allCoords.push(waypoints[i + 1])
    }
  }

  return allCoords
}
