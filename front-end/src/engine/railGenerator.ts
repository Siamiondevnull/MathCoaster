/**
 * Discretizes a function y=f(x) and creates a rail as a static ChainShape body.
 * The rail is a line along the curve y = f(x).
 *
 * Vertices in physics (MKS) coordinates, as per Planck.js testbed approach.
 */

import { Chain, Vec2, type World, type Body } from 'planck'
import type { TransformConfig } from './coordinateTransform'
import { createCoordinateTransform } from './coordinateTransform'

export interface RailConfig {
  xMin: number
  xMax: number
  step: number
}

const DEFAULT_RAIL_CONFIG: RailConfig = {
  xMin: -5,
  xMax: 5,
  step: 0.2,
}

/**
 * Creates a rail as a static body with ChainShape along the curve y = f(x).
 * Vertices are in physics world units (MKS).
 */
export function createRailBody(
  world: World,
  evaluate: (x: number) => number,
  transformConfig: TransformConfig,
  railConfig: Partial<RailConfig> = {}
): Body | null {
  const config = { ...DEFAULT_RAIL_CONFIG, ...railConfig }
  const transform = createCoordinateTransform(transformConfig)

  const vertices: Vec2[] = []
  const steps = Math.round((config.xMax - config.xMin) / config.step)
  for (let i = 0; i <= steps; i++) {
    const x = config.xMin + i * config.step
    const y = evaluate(x)
    if (!Number.isFinite(y)) continue
    const physics = transform.mathToPhysics(x, y)
    if (!Number.isFinite(physics.x) || !Number.isFinite(physics.y)) continue
    vertices.push(Vec2(physics.x, physics.y))
  }

  if (vertices.length < 2) return null

  const chain = Chain(vertices)
  const railBody = world.createBody({ type: 'static' })
  railBody.createFixture(chain, {
    friction: 0,
    restitution: 0.25,
  })
  railBody.setUserData({
    strokeStyle: '#29b6f6',
    fillStyle: '#4fc3f7',
  })
  return railBody
}
