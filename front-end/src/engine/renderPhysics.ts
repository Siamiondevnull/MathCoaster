/**
 * Renders Planck.js world bodies to a canvas 2D context.
 *
 * Physics positions are in MKS units; uses physicsToCanvas transform
 * (testbed-style ratio: pixels per physics unit).
 */

import type { World, CircleShape, ChainShape } from 'planck'

export interface PhysicsRenderTransform {
  physicsToCanvas(physicsX: number, physicsY: number): { x: number; y: number }
  getPhysicsRatio(): number
}

export function drawBodies(
  ctx: CanvasRenderingContext2D,
  world: World,
  transform: PhysicsRenderTransform,
  logicalWidth?: number,
  logicalHeight?: number
): void {
  const w = logicalWidth ?? ctx.canvas.width
  const h = logicalHeight ?? ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  const ratio = transform.getPhysicsRatio()

  for (let body = world.getBodyList(); body; body = body.getNext()) {
    const userData = body.getUserData() as { fillStyle?: string; strokeStyle?: string } | null
    const fillStyle = userData?.fillStyle ?? '#4fc3f7'
    const strokeStyle = userData?.strokeStyle ?? '#29b6f6'
    const pos = body.getPosition()
    const angle = body.getAngle()

    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const shape = fixture.getShape()
      const type = shape.getType()

      if (type === 'circle') {
        const circle = shape as CircleShape
        const radiusPhysics = circle.getRadius()
        const center = circle.getCenter()
        const wx = pos.x + center.x * Math.cos(angle) - center.y * Math.sin(angle)
        const wy = pos.y + center.x * Math.sin(angle) + center.y * Math.cos(angle)
        const canvas = transform.physicsToCanvas(wx, wy)
        const radiusCanvas = radiusPhysics * ratio
        ctx.beginPath()
        ctx.arc(canvas.x, canvas.y, radiusCanvas, 0, 2 * Math.PI)
        ctx.fillStyle = fillStyle
        ctx.fill()
        ctx.strokeStyle = strokeStyle
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (type === 'chain') {
        const chain = shape as ChainShape
        const vertexCount = chain.getChildCount() + 1
        if (vertexCount < 2) continue
        ctx.beginPath()
        const v0 = chain.getVertex(0)
        const w0x = pos.x + v0.x * Math.cos(angle) - v0.y * Math.sin(angle)
        const w0y = pos.y + v0.x * Math.sin(angle) + v0.y * Math.cos(angle)
        const c0 = transform.physicsToCanvas(w0x, w0y)
        ctx.moveTo(c0.x, c0.y)
        for (let i = 1; i < vertexCount; i++) {
          const v = chain.getVertex(i)
          const wx = pos.x + v.x * Math.cos(angle) - v.y * Math.sin(angle)
          const wy = pos.y + v.x * Math.sin(angle) + v.y * Math.cos(angle)
          const c = transform.physicsToCanvas(wx, wy)
          ctx.lineTo(c.x, c.y)
        }
        ctx.strokeStyle = strokeStyle
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }
}
