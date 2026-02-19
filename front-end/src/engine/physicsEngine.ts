/**
 * Planck.js physics engine initialization and world management.
 *
 * Uses Planck.js testbed approach: physics in MKS units (0.1-10 meters),
 * gravity Vec2(0, -10), bodies in physics coordinates.
 */

import { World, Vec2, Circle, type Body } from 'planck'
import type { TransformConfig } from './coordinateTransform'
import { createCoordinateTransform } from './coordinateTransform'

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 750

const DEFAULT_TRANSFORM_CONFIG: TransformConfig = {
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  mathXMin: -25,
  mathXMax: 25,
  mathYMin: -25,
  mathYMax: 25,
}

export type PlanckBody = Body

export interface PhysicsWorld {
  world: World
  transform: ReturnType<typeof createCoordinateTransform>
  canvas: HTMLCanvasElement
  canvasWidth: number
  canvasHeight: number
}

export function createPhysicsWorld(
  canvas: HTMLCanvasElement,
  transformConfig: Partial<TransformConfig> = {}
): PhysicsWorld {
  const config = { ...DEFAULT_TRANSFORM_CONFIG, ...transformConfig }
  const transform = createCoordinateTransform(config)

  // MKS gravity (y down), like Planck testbed: Vec2(0, -10)
  const world = new World({
    gravity: Vec2(0, -10),
  })

  return {
    world,
    transform,
    canvas,
    canvasWidth: config.canvasWidth,
    canvasHeight: config.canvasHeight,
  }
}

/**
 * Create ball in physics world. spawnX/spawnY in math coords, radius in physics units.
 * Ball radius ~0.3 m (12px / 40) fits Box2D 0.1-10 range.
 */
export function createBall(
  world: World,
  spawnX: number,
  spawnY: number,
  transform: PhysicsWorld['transform'],
  radiusMathScale: number = 12,
  ballColor?: string
): Body {
  const { x, y } = transform.mathToPhysics(spawnX, spawnY)
  // Convert radius: 12 px at ratio 40 = 0.3 m
  const radiusPhysics = radiusMathScale / transform.getPhysicsRatio()
  const body = world.createDynamicBody({ position: Vec2(x, y) })
  body.createFixture(Circle(Vec2(0, 0), radiusPhysics), {
    density: 2,
    friction: 0,
    restitution: 0.25,
  })
  body.setUserData({ fillStyle: ballColor ?? '#f19648' })
  return body
}

export function stopEngine(_physicsWorld: PhysicsWorld): void {
  // Planck has no built-in runner to stop; render loop controls stepping
}
