// stabilType/src/core/adjust.ts — framework-agnostic motion-adaptive typography algorithm (scroll + device motion)

import type { StabilTypeOptions, Velocity2D } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

/** perspective() value that is effectively flat — used as the at-rest baseline */
const FLAT_PERSPECTIVE = 5000

// ─── Saved-state registry ─────────────────────────────────────────────────────

/** Original inline styles and smoothed velocity saved per element */
interface SavedState {
	/** el.style.fontVariationSettings at time of first call */
	fvs: string
	/** el.style.letterSpacing at time of first call */
	letterSpacing: string
	/** el.style.opacity at time of first call */
	opacity: string
	/** el.style.transform at time of first call */
	transform: string
	/** Current EMA-smoothed vertical velocity, signed –1 to +1 */
	smoothedVY: number
	/** Current EMA-smoothed horizontal velocity, signed –1 to +1 */
	smoothedVX: number
	/** rAF handle for startStabilType loop, if active */
	rafId?: number
}

/**
 * Per-element saved original inline styles and smoothed velocity.
 * The first call to applyStabilType saves the originals; removeStabilType restores them.
 */
const savedState = new WeakMap<HTMLElement, SavedState>()

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** Default option values applied when options are omitted */
const DEFAULTS = {
	trackingRange: [0, 0.06] as [number, number],
	weightRange: [300, 600] as [number, number],
	opszRange: [12, 24] as [number, number],
	opacityRange: [1, 0.7] as [number, number],
	smoothing: 0.15,
	velocityMax: 15,
	weightAxis: 'wght',
	opszAxis: 'opsz',
	perspective: 600,
	tilt: 3,
	slntRange: [8, -8] as [number, number],
	slntAxis: 'slnt',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Linear interpolation between a and b by factor t (clamped 0–1).
 *
 * @param a - Value at t = 0
 * @param b - Value at t = 1
 * @param t - Interpolation factor, clamped to [0, 1]
 */
export function lerp(a: number, b: number, t: number): number {
	const tc = Math.min(1, Math.max(0, t))
	return a + (b - a) * tc
}

/**
 * Override a single axis value inside a font-variation-settings string,
 * preserving all other axis values. Adds the axis if not already present.
 *
 * e.g. overrideAxis('"wght" 300', 'opsz', 18) → '"wght" 300, "opsz" 18'
 *
 * @param baseFVS - Existing font-variation-settings string
 * @param axis    - Axis tag to set (e.g. 'wght', 'opsz')
 * @param value   - Numeric value to assign
 */
export function overrideAxis(baseFVS: string, axis: string, value: number): string {
	if (!baseFVS || baseFVS === 'normal') return `"${axis}" ${value}`
	const pattern = new RegExp(`(["'])${axis}\\1\\s+[\\d.eE+-]+`)
	const replacement = `"${axis}" ${value}`
	return pattern.test(baseFVS)
		? baseFVS.replace(pattern, replacement)
		: `${baseFVS}, ${replacement}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Apply motion-adaptive typography to an element given a pre-normalised velocity.
 *
 * Velocity can be:
 * - A signed scalar –1 to +1 (treated as Y-axis / vertical only)
 * - A Velocity2D object { x, y } for full 2D directional support
 *
 * Unsigned effects (wght, opsz, tracking, opacity) respond to combined speed magnitude.
 * Directional effects (slnt, rotateX, rotateY, perspective) respond to signed components.
 *
 * @param el       - Element to adapt
 * @param velocity - Signed velocity scalar or 2D vector
 * @param options  - StabilTypeOptions (merged with defaults)
 */
export function applyStabilType(
	el: HTMLElement,
	velocity: number | Velocity2D,
	options: StabilTypeOptions = {},
): void {
	if (typeof window === 'undefined') return

	// Resolve velocity components
	const vy = typeof velocity === 'object' ? velocity.y : velocity
	const vx = typeof velocity === 'object' ? velocity.x : 0

	// Resolve options
	const trackingRange     = options.trackingRange ?? DEFAULTS.trackingRange
	const weightRange       = options.weightRange   ?? DEFAULTS.weightRange
	const opszRange         = options.opszRange     ?? DEFAULTS.opszRange
	const opacityRange      = options.opacityRange  ?? DEFAULTS.opacityRange
	const smoothing         = options.smoothing     ?? DEFAULTS.smoothing
	const weightAxis        = options.weightAxis    ?? DEFAULTS.weightAxis
	const opszAxis          = options.opszAxis      ?? DEFAULTS.opszAxis
	const perspectiveDepth  = options.perspective   ?? DEFAULTS.perspective
	const tiltDeg           = options.tilt          ?? DEFAULTS.tilt
	const slntRange         = options.slntRange     ?? DEFAULTS.slntRange
	const slntAxis          = options.slntAxis      ?? DEFAULTS.slntAxis

	// Save original inline styles on first call
	if (!savedState.has(el)) {
		savedState.set(el, {
			fvs: el.style.fontVariationSettings,
			letterSpacing: el.style.letterSpacing,
			opacity: el.style.opacity,
			transform: el.style.transform,
			smoothedVY: 0,
			smoothedVX: 0,
		})
	}

	const state = savedState.get(el)!

	// Clamp inputs to –1…+1
	const clampedVY = Math.min(1, Math.max(-1, vy))
	const clampedVX = Math.min(1, Math.max(-1, vx))

	// EMA smoothing per axis: new = prev * (1 – α) + input * α
	const alpha = Math.min(1, Math.max(0, 1 - smoothing))
	state.smoothedVY = state.smoothedVY * alpha + clampedVY * (1 - alpha)
	state.smoothedVX = state.smoothedVX * alpha + clampedVX * (1 - alpha)

	const ty = state.smoothedVY  // signed –1…+1, vertical
	const tx = state.smoothedVX  // signed –1…+1, horizontal

	// Combined speed magnitude (0–1) for unsigned effects
	const speed = Math.min(1, Math.sqrt(ty * ty + tx * tx))

	// ── Unsigned effects (speed-based) ─────────────────────────────────────────
	const tracking = lerp(trackingRange[0], trackingRange[1], speed)
	const weight   = lerp(weightRange[0],   weightRange[1],   speed)
	const opsz     = lerp(opszRange[0],     opszRange[1],     speed)
	const opacity  = lerp(opacityRange[0],  opacityRange[1],  speed)

	const baseFVS = getComputedStyle(el).fontVariationSettings
	let newFVS = overrideAxis(baseFVS, weightAxis, Math.round(weight))
	newFVS     = overrideAxis(newFVS,  opszAxis,   Math.round(opsz * 10) / 10)

	el.style.fontVariationSettings = newFVS
	el.style.letterSpacing         = `${tracking.toFixed(4)}em`
	el.style.opacity               = opacity.toFixed(4)

	// ── Directional effects ─────────────────────────────────────────────────────

	// slnt: driven by vertical scroll only (forward lean on downscroll)
	// lerp from slntRange[0] (peak up) to slntRange[1] (peak down) via ty
	const slntValue = lerp(slntRange[0], slntRange[1], (ty + 1) / 2)
	newFVS = overrideAxis(newFVS, slntAxis, Math.round(slntValue * 10) / 10)
	el.style.fontVariationSettings = newFVS

	// perspective + rotateX (Y scroll) + rotateY (X scroll)
	if (perspectiveDepth > 0) {
		const perspValue = lerp(FLAT_PERSPECTIVE, perspectiveDepth, speed)
		const rotateX    = ty * -tiltDeg   // downscroll tips top away (negative rotateX)
		const rotateY    = tx * tiltDeg    // rightscroll tips right away
		el.style.transform = `perspective(${perspValue.toFixed(0)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
	} else {
		el.style.transform = state.transform
	}
}

/**
 * Start motion-adaptive typography on an element.
 *
 * Two calling conventions:
 *
 * 1. `startStabilType(el, getVelocity, options?)` — external velocity source.
 *    `getVelocity` returns a scalar or Velocity2D each frame. Use for gyroscope,
 *    accelerometer, audio level, pointer proximity, etc.
 *
 * 2. `startStabilType(el, options?)` — built-in scroll listener.
 *    Tracks both window.scrollX and window.scrollY, computes signed px-per-frame
 *    velocity on each axis, normalises by `options.velocityMax`, and decays when
 *    the user stops scrolling.
 *
 * Returns a cleanup function that cancels the loop and restores original styles.
 *
 * @param el                   - Element to adapt
 * @param getVelocityOrOptions - Velocity callback OR options object (selects mode)
 * @param options              - StabilTypeOptions when using callback mode
 */
export function startStabilType(el: HTMLElement, options?: StabilTypeOptions): () => void
export function startStabilType(
	el: HTMLElement,
	getVelocity: () => number | Velocity2D,
	options?: StabilTypeOptions,
): () => void
export function startStabilType(
	el: HTMLElement,
	getVelocityOrOptions?: (() => number | Velocity2D) | StabilTypeOptions,
	options?: StabilTypeOptions,
): () => void {
	if (typeof window === 'undefined') return () => undefined

	let rafId: number

	if (typeof getVelocityOrOptions === 'function') {
		// ── External velocity source ───────────────────────────────────────────
		const getVelocity = getVelocityOrOptions
		const opts = options ?? {}

		function tick() {
			applyStabilType(el, getVelocity(), opts)
			rafId = requestAnimationFrame(tick)
		}

		rafId = requestAnimationFrame(tick)
		if (savedState.has(el)) savedState.get(el)!.rafId = rafId

		return () => {
			cancelAnimationFrame(rafId)
			removeStabilType(el)
		}
	}

	// ── Built-in scroll listener ───────────────────────────────────────────────
	const opts = getVelocityOrOptions ?? {}
	const velocityMax = opts.velocityMax ?? DEFAULTS.velocityMax

	let lastScrollX = window.scrollX
	let lastScrollY = window.scrollY
	let lastTime    = performance.now()
	let currentVX   = 0
	let currentVY   = 0

	/** Compute signed px-per-frame velocity on both axes from scroll delta */
	const onScroll = () => {
		const now = performance.now()
		const dt  = now - lastTime
		if (dt > 0) {
			const dx = window.scrollX - lastScrollX
			const dy = window.scrollY - lastScrollY
			// Normalise to px/frame at 60fps (16.67ms per frame)
			currentVX = (dx / dt) * 16.67
			currentVY = (dy / dt) * 16.67
		}
		lastScrollX = window.scrollX
		lastScrollY = window.scrollY
		lastTime    = now
	}

	/** Per-frame tick: normalise, apply, decay */
	const tick = () => {
		rafId = requestAnimationFrame(tick)
		const nx = Math.sign(currentVX) * Math.min(Math.abs(currentVX) / velocityMax, 1)
		const ny = Math.sign(currentVY) * Math.min(Math.abs(currentVY) / velocityMax, 1)
		applyStabilType(el, { x: nx, y: ny }, opts)
		// Decay so typography settles back to rest after scrolling stops
		currentVX *= 0.85
		currentVY *= 0.85
	}

	window.addEventListener('scroll', onScroll, { passive: true })
	rafId = requestAnimationFrame(tick)
	if (savedState.has(el)) savedState.get(el)!.rafId = rafId

	return () => {
		cancelAnimationFrame(rafId)
		window.removeEventListener('scroll', onScroll)
		removeStabilType(el)
	}
}

/**
 * Remove stabilType styles and restore the element to its original inline styles.
 * Also cancels any active rAF loop started by startStabilType.
 * No-op if applyStabilType was never called on this element.
 *
 * @param el - The element previously adjusted by applyStabilType
 */
export function removeStabilType(el: HTMLElement): void {
	const state = savedState.get(el)
	if (!state) return
	if (state.rafId !== undefined) cancelAnimationFrame(state.rafId)
	el.style.fontVariationSettings = state.fvs
	el.style.letterSpacing         = state.letterSpacing
	el.style.opacity               = state.opacity
	el.style.transform             = state.transform
	savedState.delete(el)
}
