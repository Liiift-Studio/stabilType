# stabilType

[![npm](https://img.shields.io/npm/v/%40liiift-studio%2Fstabiltype.svg)](https://www.npmjs.com/package/@liiift-studio/stabiltype) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

Motion-adaptive typography — adjusts letter-spacing, weight, optical size, slant, opacity, and perspective tilt in real time based on scroll velocity and device motion. Faster movement loosens tracking, increases weight, and tilts the type away; slower movement returns to rest. The text physically registers the energy of reading.

**[stabiltype.com](https://stabiltype.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/stabiltype) · [GitHub](https://github.com/Liiift-Studio/StabilType)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/stabiltype
```

---

## Usage

> **Next.js App Router:** this library uses browser APIs. Add `"use client"` to any component file that imports from it.

### React component

`StabilTypeText` is a controlled component — pass it a `velocity` value (–1 to +1) and it adapts the typography accordingly. Compute velocity however you like (scroll delta, `devicemotion`, a spring simulation) and re-render.

```tsx
import { StabilTypeText } from '@liiift-studio/stabiltype'

<StabilTypeText
  velocity={scrollVelocity}
  trackingRange={[0, 0.08]}
  weightRange={[300, 700]}
  opszRange={[12, 36]}
>
  Typography in motion
</StabilTypeText>
```

### React hook

`useStabilType` takes a ref, a velocity value, and options. It applies the typography directly to the element on every render where velocity changes.

```tsx
import { useStabilType } from '@liiift-studio/stabiltype'
import { useRef } from 'react'

const ref = useRef<HTMLElement>(null)

// velocity is a number –1…+1, or a Velocity2D { x, y } for 2D motion
useStabilType(ref, velocity, {
  weightRange: [300, 700],
  smoothing: 0.2,
})

return <p ref={ref}>Typography in motion</p>
```

### Vanilla JS

`startStabilType` is the self-contained entry point. It starts a `requestAnimationFrame` loop, reads scroll velocity each frame, and updates the element's typography. Returns a `stop` function.

```ts
import { startStabilType, removeStabilType } from '@liiift-studio/stabiltype'

const el = document.querySelector('p')
const stop = startStabilType(el, {
  weightRange: [300, 700],
  trackingRange: [0, 0.06],
  velocityMax: 15,
})

// Later — stop the loop and restore original styles:
stop()
removeStabilType(el)
```

For manual control — drive velocity yourself from any source:

```ts
import { applyStabilType, removeStabilType } from '@liiift-studio/stabiltype'

const el = document.querySelector('p')

// Call on every animation frame with the current velocity –1…+1:
applyStabilType(el, scrollVelocity, {
  weightRange: [300, 700],
})

// Or pass a 2D velocity (e.g. from devicemotion):
applyStabilType(el, { x: 0.3, y: 0.8 }, {
  tilt: 5,
})

// Restore original styles:
removeStabilType(el)
```

### TypeScript

```ts
import type { StabilTypeOptions, Velocity2D } from '@liiift-studio/stabiltype'

const opts: StabilTypeOptions = {
  trackingRange: [0, 0.06],
  weightRange: [300, 600],
  smoothing: 0.2,
  velocityMax: 20,
}

const velocity: Velocity2D = { x: 0, y: 0.7 }
```

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trackingRange` | `[number, number]` | `[0, 0.06]` | Letter-spacing in em: `[at rest, at max velocity]` |
| `weightRange` | `[number, number]` | `[300, 600]` | `wght` axis: `[at rest, at max velocity]` |
| `opszRange` | `[number, number]` | `[12, 24]` | `opsz` axis: `[at rest, at max velocity]` |
| `opacityRange` | `[number, number]` | `[1, 0.7]` | Opacity: `[at rest, at max velocity]` |
| `slntRange` | `[number, number]` | `[8, -8]` | `slnt` axis: `[at peak upscroll, at peak downscroll]` |
| `smoothing` | `number` | `0.15` | EMA smoothing factor (0–1). Higher = more smoothing, slower response |
| `velocityMax` | `number` | `15` | Scroll velocity in px/frame that maps to maximum adjustment. Only used by `startStabilType` |
| `perspective` | `number` | `600` | CSS `perspective` depth in px at peak velocity. Controls dolly compression. Set to `0` to disable |
| `tilt` | `number` | `3` | `rotateX` tilt in degrees at peak velocity. Direction follows scroll: downscroll tips top away, upscroll tips bottom away |
| `weightAxis` | `string` | `'wght'` | Variable font weight axis tag |
| `opszAxis` | `string` | `'opsz'` | Variable font optical size axis tag |
| `slntAxis` | `string` | `'slnt'` | Variable font slant axis tag |

---

## How it works

`applyStabilType` takes a signed velocity value (–1 = max negative direction, +1 = max positive direction) and maps it through each option range using linear interpolation. The resulting values are written as `font-variation-settings` (weight, opsz, slnt), `letter-spacing`, `opacity`, and a CSS `transform` (perspective + rotateX tilt) directly on the element's inline style. The first call saves the original inline styles so `removeStabilType` can restore them exactly.

`startStabilType` runs a `requestAnimationFrame` loop. Each frame it reads `window.scrollY`, computes the delta from the previous frame, normalises it against `velocityMax`, applies exponential moving average smoothing, then calls `applyStabilType`. The smoothing factor prevents jerky jumps on large scroll events.

**2D velocity:** Pass a `Velocity2D { x, y }` object to `applyStabilType` or `useStabilType` for device-motion or horizontal-scroll scenarios. The `y` component drives the main axis adaptations; `x` drives the `slnt` tilt independently.

**Variable font requirement:** The weight, opsz, and slant effects require a variable font with those axes. On non-variable fonts, the effect degrades gracefully to opacity and letter-spacing only.

---

## API reference

| Export | Description |
|--------|-------------|
| `applyStabilType(el, velocity, options?)` | Apply one frame of typography adaptation. Velocity is `number` or `Velocity2D`. |
| `startStabilType(el, options?)` | Start a rAF scroll loop. Returns `stop()`. |
| `removeStabilType(el)` | Stop any running loop and restore original inline styles. |
| `lerp(a, b, t)` | Linear interpolation utility exported for custom velocity mapping. |
| `overrideAxis(baseFVS, axis, value)` | Override one axis in a `font-variation-settings` string, preserving others. |
| `useStabilType` | React hook: `(ref, velocity, options?)` |
| `StabilTypeText` | React component. Controlled via `velocity` prop. |
| `StabilTypeOptions` | TypeScript interface for all options. |
| `Velocity2D` | Interface for 2D velocity input `{ x: number, y: number }`. |

---

## Next.js

`StabilTypeText`, `useStabilType`, and `startStabilType` all require a browser environment. Add `"use client"` to any component that imports them:

```tsx
"use client"
import { StabilTypeText } from '@liiift-studio/stabiltype'
```

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.
