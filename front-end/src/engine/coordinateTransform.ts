/**
 * Coordinate transform between math space (y-axis up), physics space (MKS, y-axis up),
 * and canvas space (y-axis down).
 *
 * Uses Planck.js testbed approach: physics in meter-scale units (0.1-10),
 * ratio = pixels per physics unit for rendering.
 */

export interface TransformConfig {
  canvasWidth: number
  canvasHeight: number
  mathXMin: number
  mathXMax: number
  mathYMin: number
  mathYMax: number
  /** Padding around plot area (pixels) so axis labels are visible */
  plotPadding?: number
}

/** Pixels per physics unit (like testbed.ratio). Physics tuned for 0.1-10 meter objects. */
export const PHYSICS_RATIO = 40

export function createCoordinateTransform(config: TransformConfig) {
  const {
    canvasWidth,
    canvasHeight,
    mathXMin,
    mathXMax,
    mathYMin,
    mathYMax,
  } = config

  const padding = config.plotPadding ?? 0
  const plotWidth = canvasWidth - 2 * padding
  const plotHeight = canvasHeight - 2 * padding
  const scaleX = plotWidth / (mathXMax - mathXMin)
  const scaleY = plotHeight / (mathYMax - mathYMin)
  const scale = Math.min(scaleX, scaleY)

  const centerX = (mathXMin + mathXMax) / 2
  const centerY = (mathYMin + mathYMax) / 2

  const canvasCenterX = canvasWidth / 2
  const canvasCenterY = canvasHeight / 2

  // Physics world extent in MKS units (like testbed width/height)
  const physicsWidth = canvasWidth / PHYSICS_RATIO
  const physicsHeight = canvasHeight / PHYSICS_RATIO
  const mathToPhysicsScale = Math.min(
    physicsWidth / (mathXMax - mathXMin),
    physicsHeight / (mathYMax - mathYMin)
  )
  // Display ratio so physics rendering aligns with math grid (same scale)
  const displayPhysicsRatio = scale / mathToPhysicsScale

  return {
    /** Convert math coordinates (y up) to canvas pixels (y down) */
    mathToCanvas(x: number, y: number): { x: number; y: number } {
      const px = canvasCenterX + (x - centerX) * scale
      const py = canvasCenterY - (y - centerY) * scale
      return { x: px, y: py }
    },

    /** Convert math coordinates to physics world (MKS, y up) */
    mathToPhysics(x: number, y: number): { x: number; y: number } {
      const px = (x - centerX) * mathToPhysicsScale
      const py = (y - centerY) * mathToPhysicsScale
      return { x: px, y: py }
    },

    /** Convert physics world (MKS) to canvas pixels (y down) */
    physicsToCanvas(physicsX: number, physicsY: number): { x: number; y: number } {
      const px = canvasCenterX + physicsX * displayPhysicsRatio
      const py = canvasCenterY - physicsY * displayPhysicsRatio
      return { x: px, y: py }
    },

    /** Convert canvas pixels to math coordinates */
    canvasToMath(px: number, py: number): { x: number; y: number } {
      const x = centerX + (px - canvasCenterX) / scale
      const y = centerY - (py - canvasCenterY) / scale
      return { x, y }
    },

    /** Convert physics world (MKS) to math coordinates */
    physicsToMath(physicsX: number, physicsY: number): { x: number; y: number } {
      const canvas = this.physicsToCanvas(physicsX, physicsY)
      return this.canvasToMath(canvas.x, canvas.y)
    },

    /** Scale factor (pixels per math unit) for grid/overlay */
    getScale(): number {
      return scale
    },

    /** Pixels per physics unit for rendering (matches grid scale) */
    getPhysicsRatio(): number {
      return displayPhysicsRatio
    },

    /** Physics scale (math units to physics units) */
    getMathToPhysicsScale(): number {
      return mathToPhysicsScale
    },
  }
}
