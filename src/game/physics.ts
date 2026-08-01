export const pointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

export const checkCollision = (x: number, y: number, polygons: any[]) => {
  const collisionPolygons = polygons.filter(p => p.type === 'collision');
  for (const poly of collisionPolygons) {
    if (pointInPolygon({ x, y }, poly.points)) {
      return true;
    }
  }
  return false;
};

export const getOverlayLevel = (x: number, y: number, polygons: any[]) => {
  const overlayPolygons = polygons.filter(p => p.type === 'overlay');
  for (const poly of overlayPolygons) {
    if (pointInPolygon({ x, y }, poly.points)) {
      return true;
    }
  }
  return false;
};

export const checkPortal = (x: number, y: number, polygons: any[]) => {
  const portalPolygons = polygons.filter(p => p.type === 'portal');
  for (const poly of portalPolygons) {
    if (pointInPolygon({ x, y }, poly.points)) {
      return poly.portalData;
    }
  }
  return null;
};
