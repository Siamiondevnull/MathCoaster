/**
 * Level definitions: spawn, visit zones, finish zone, base function.
 * All coordinates in math space (x, y ∈ [-25, 25]).
 */

export interface Zone {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface Level {
  id: number
  name: string
  spawnX: number
  spawnY: number
  visitZones: Zone[]
  finishZone: Zone
  baseFunction: string
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'First Drop',
    spawnX: -20,
    spawnY: 18,
    visitZones: [{ xMin: -10, xMax: -5, yMin: 0, yMax: 8 }],
    finishZone: { xMin: 15, xMax: 22, yMin: -5, yMax: 5 },
    baseFunction: '0.02*x*x',
  },
  {
    id: 2,
    name: 'Double Dip',
    spawnX: -22,
    spawnY: 20,
    visitZones: [
      { xMin: -15, xMax: -10, yMin: 2, yMax: 10 },
      { xMin: 0, xMax: 5, yMin: -5, yMax: 5 },
    ],
    finishZone: { xMin: 15, xMax: 22, yMin: -8, yMax: 2 },
    baseFunction: '0.05*x*x',
  },
  {
    id: 3,
    name: 'Wave',
    spawnX: -20,
    spawnY: 5,
    visitZones: [
      { xMin: -12, xMax: -8, yMin: 2, yMax: 6 },
      { xMin: 8, xMax: 14, yMin: -4, yMax: 2 },
    ],
    finishZone: { xMin: 18, xMax: 24, yMin: -3, yMax: 4 },
    baseFunction: '5*sin(0.3*x)',
  },
  {
    id: 4,
    name: 'Hill',
    spawnX: -18,
    spawnY: 10,
    visitZones: [{ xMin: -5, xMax: 5, yMin: 8, yMax: 14 }],
    finishZone: { xMin: 16, xMax: 23, yMin: -8, yMax: 0 },
    baseFunction: '-0.03*x*x+12',
  },
  {
    id: 5,
    name: 'Valley',
    spawnX: -20,
    spawnY: 12,
    visitZones: [
      { xMin: -12, xMax: -6, yMin: -10, yMax: -4 },
      { xMin: 6, xMax: 12, yMin: -10, yMax: -4 },
    ],
    finishZone: { xMin: 17, xMax: 24, yMin: -6, yMax: 2 },
    baseFunction: '0.04*x*x-8',
  },
  {
    id: 6,
    name: 'Combo',
    spawnX: -22,
    spawnY: 18,
    visitZones: [
      { xMin: -14, xMax: -8, yMin: 0, yMax: 8 },
      { xMin: 2, xMax: 10, yMin: -2, yMax: 6 },
    ],
    finishZone: { xMin: 16, xMax: 23, yMin: -4, yMax: 4 },
    baseFunction: '0.02*x*x+2*sin(x)',
  },
  {
    id: 7,
    name: 'Steep',
    spawnX: -18,
    spawnY: 22,
    visitZones: [{ xMin: -2, xMax: 6, yMin: -5, yMax: 5 }],
    finishZone: { xMin: 14, xMax: 22, yMin: -12, yMax: 0 },
    baseFunction: '0.08*x*x',
  },
  {
    id: 8,
    name: 'Gentle',
    spawnX: -24,
    spawnY: 12,
    visitZones: [
      { xMin: -18, xMax: -12, yMin: 2, yMax: 10 },
      { xMin: 4, xMax: 12, yMin: 0, yMax: 8 },
    ],
    finishZone: { xMin: 18, xMax: 24, yMin: -2, yMax: 6 },
    baseFunction: '0.01*x*x',
  },
  {
    id: 9,
    name: 'Final',
    spawnX: -20,
    spawnY: 15,
    visitZones: [
      { xMin: -14, xMax: -8, yMin: 0, yMax: 8 },
      { xMin: -2, xMax: 4, yMin: -2, yMax: 4 },
      { xMin: 8, xMax: 14, yMin: 0, yMax: 8 },
    ],
    finishZone: { xMin: 18, xMax: 24, yMin: -3, yMax: 5 },
    baseFunction: '0.03*x*x+sin(0.5*x)*3',
  },
]
