# stabilType

[![npm](https://img.shields.io/npm/v/%40liiift-studio%2Fstabiltype.svg)](https://www.npmjs.com/package/@liiift-studio/stabiltype) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

Motion-adaptive typography — adapts letter-spacing, weight, and optical size in real time based on scroll velocity and device motion.

**[stabiltype.com](https://stabiltype.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/stabiltype) · [GitHub](https://github.com/Liiift-Studio/StabilType)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/stabiltype
```

## React

### Component

```tsx
import { StabilTypeText } from '@liiift-studio/stabiltype'

<StabilTypeText axis="wght" min={300} max={700}>
  Typography in motion
</StabilTypeText>
```

### Hook

```tsx
import { useStabilType } from '@liiift-studio/stabiltype'

const ref = useStabilType({ axis: 'wght', min: 300, max: 700 })

<p ref={ref}>Typography in motion</p>
```

## Vanilla JS

```ts
import { applyStabilType, startStabilType, removeStabilType } from '@liiift-studio/stabiltype'

const el = document.querySelector('p')
applyStabilType(el, { axis: 'wght', min: 300, max: 700 })
const stop = startStabilType(el)

// Later:
stop()
removeStabilType(el)
```
