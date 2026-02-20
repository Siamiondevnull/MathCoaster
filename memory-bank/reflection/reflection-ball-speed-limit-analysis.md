# Analysis: Ball Speed Limit (Why Ball Does Not Exceed Certain Velocity)

## Summary

The ball in MathCoaster is limited to approximately **120 px/s** because Planck.js (Box2D port) enforces a **hard limit of 2.0 units per time step** on body displacement. Our physics world uses **pixels as units** (1 physics unit = 1 pixel), so the limit translates directly to ~120 px/s at 60 FPS.

---

## Root Cause: Box2D/Planck.js Internal Constraint

### b2_maxTranslation = 2.0 units per step

- Defined in `b2Settings.h` (Box2D) and inherited by Planck.js
- **Maximum movement per time step**: 2.0 units
- **Effective max velocity** at 60 FPS:  
  `2.0 / (1/60) = 120 units/second`

### Our Current Physics Setup

| Parameter            | Value    | Units  |
|---------------------|----------|--------|
| Canvas size         | 800×500  | pixels |
| Physics units       | = pixels | 1:1    |
| Gravity             | Vec2(0, 500) | px/s² |
| Time step           | 1/60     | s      |
| Ball radius         | 12       | px     |
| Rail vertices       | canvas coords | px |

Because we use **1 physics unit = 1 pixel**, the cap becomes:

- **Max velocity ≈ 120 px/s**
- Free fall: `v = g·t` → after ~0.24 s the ball reaches ~120 px/s and is clamped

---

## Evidence from Planck.js Community

1. **GitHub Issue #82** (piqnt/planck.js): User set velocity to `Vec2(0, 10000)`, after one step it was reduced to `Vec2(0, 2000)`.
2. **Stack Overflow / Box2D FAQ**: Confirms 2.0 units per step limit; recommends **scaling down physics units** rather than changing the engine.
3. **iforce2d.net Box2D gotchas**: If using pixels, scale the physics world by a constant ratio so that “a top speed of 2 units per timestep is more reasonable.”

---

## Contributing Factors

1. **Physics step frequency**
   - Single step per frame: `world.step(1/60)` → max 120 units/s
   - Substepping (e.g. 4 steps per frame) could increase perceived smoothness but does **not** remove the per-step displacement limit

2. **Body size vs. world scale**
   - Box2D is tuned for bodies ~0.1–10 units
   - Our ball radius = 12 px, canvas ~800 px → we are using pixels directly instead of a physics scale

3. **Restitution / friction**
   - Ball: `restitution: 0.25`, `friction: 0`
   - Rail: `restitution: 0.25`, `friction: 0`
   - These affect bounces, not the maximum velocity cap

---

## Recommended Solutions

### Option 1: Physics Scale Factor (Recommended)

Introduce a scale so that 1 physics unit ≠ 1 pixel:

- **Example**: `physicsScale = 0.1` → 10 px = 1 physics unit
- Max velocity in physics: 120 units/s  
- Max velocity in pixels: 120 × 10 = **1200 px/s** (10× higher)

Implementation sketch:

```
canvasCoords = physicsCoords * (1 / physicsScale)
physicsCoords = canvasCoords * physicsScale
```

Apply this at:
- `physicsEngine.ts`: gravity, ball spawn position
- `railGenerator.ts`: vertices
- `renderPhysics.ts`: body positions for drawing
- `coordinateTransform.ts` or a wrapper: convert between canvas and physics space

### Option 2: Increase Physics Substeps

- Call `world.step(dt/4)` four times per frame with `dt = 1/60`
- Improves stability but does **not** raise the 2.0 units/step limit
- Only useful in combination with Option 1

### Option 3: Custom Velocity Clamping (Not Recommended)

- Manually clamp velocity in our code after each step
- Conflicts with Box2D/Planck internal constraints and can cause jitter and tunneling
- Prefer proper scaling instead

---

## Conclusion

The ball does not accelerate beyond ~120 px/s because **Planck.js (Box2D) limits displacement to 2.0 units per step**, and we use **pixels as physics units**. The fix is to **scale the physics world** so that 1 physics unit represents several pixels (e.g. 10 px = 1 unit), increasing the effective maximum velocity in screen space.
