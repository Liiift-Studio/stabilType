// stabilType/src/core/adjust.ts — framework-agnostic motion-adaptive typography algorithm

import type { StabilTypeOptions } from './types'

// ─── Saved-state registry ─────────────────────────────────────────────────────

/** Original inline styles and smoothed velocity saved per element */
interface SavedState {
	/** el.style.fontVariationSettings at time of first call */
	fvs: string
	/** el.style.letterSpacing at time of first call */
	letterSpacing: string
	/** el.style.opacity at time of first call */
	opacity: string
	/** Current EMA-smoothed velocity 0–1 */
	smoothedVelocity: number
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
	weightAxis: 'wght',
	opszAxis: 'opsz',
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
 * Apply motion-adaptive typography to an element given a pre-normalised
 * velocity value (0 = at rest, 1 = maximum velocity).
 *
 * Uses an exponential moving average to smooth the velocity before applying
 * letter-spacing, font-variation-settings (wght + opsz), and opacity.
 *
 * Calling applyStabilType multiple times is idempotent: original styles are
 * saved on the first call and used as the baseline for all subsequent calls.
 *
 * @param el       - Element to adapt
 * @param velocity - Normalised velocity 0–1
 * @param options  - StabilTypeOptions (merged with defaults)
 */
export function applyStabilType(el: HTMLElement, velocity: number, options: StabilTypeOptions = {}): void {
	if (typeof window === 'undefined') return

	// Resolve options
	const trackingRange = options.trackingRange ?? DEFAULTS.trackingRange
	const weightRange   = options.weightRange   ?? DEFAULTS.weightRange
	const opszRange     = options.opszRange     ?? DEFAULTS.opszRange
	const opacityRange  = options.opacityRange  ?? DEFAULTS.opacityRange
	const smoothing     = options.smoothing     ?? DEFAULTS.smoothing
	const weightAxis    = options.weightAxis    ?? DEFAULTS.weightAxis
	const opszAxis      = options.opszAxis      ?? DEFAULTS.opszAxis

	// Save original inline styles on first call
	if (!savedState.has(el)) {
		savedState.set(el, {
			fvs: el.style.fontVariationSettings,
			letterSpacing: el.style.letterSpacing,
			opacity: el.style.opacity,
			smoothedVelocity: 0,
		})
	}

	const state = savedState.get(el)!

	// Clamp input velocity
	const clampedVelocity = Math.min(1, Math.max(0, velocity))

	// Apply EMA smoothing: new = prev * (1 - α) + input * α
	// Higher smoothing factor → slower response (more smoothing)
	const alpha = Math.min(1, Math.max(0, 1 - smoothing))
	state.smoothedVelocity = state.smoothedVelocity * alpha + clampedVelocity * (1 - alpha)

	const t = state.smoothedVelocity

	// Compute interpolated values
	const tracking = lerp(trackingRange[0], trackingRange[1], t)
	const weight   = lerp(weightRange[0],   weightRange[1],   t)
	const opsz     = lerp(opszRange[0],     opszRange[1],     t)
	const opacity  = lerp(opacityRange[0],  opacityRange[1],  t)

	// Read base FVS from computed style (inherits parent axis values)
	const baseFVS = getComputedStyle(el).fontVariationSettings

	// Apply: weight axis, then opsz axis
	let newFVS = overrideAxis(baseFVS, weightAxis, Math.round(weight))
	newFVS = overrideAxis(newFVS, opszAxis, Math.round(opsz * 10) / 10)

	// Write all style properties
	el.style.fontVariationSettings = newFVS
	el.style.letterSpacing = `${tracking.toFixed(4)}em`
	el.style.opacity = opacity.toFixed(4)
}

/**
 * Start a requestAnimationFrame loop that reads velocity from a callback and
 * applies motion-adaptive typography on every frame.
 *
 * Returns a cleanup function that cancels the loop and restores original styles.
 *
 * @param el          - Element to adapt
 * @param getVelocity - Callback returning current normalised velocity 0–1
 * @param options     - StabilTypeOptions (merged with defaults)
 */
export function startStabilType(
	el: HTMLElement,
	getVelocity: () => number,
	options: StabilTypeOptions = {},
): () => void {
	if (typeof window === 'undefined') return () => undefined

	let rafId: number

	function tick() {
		applyStabilType(el, getVelocity(), options)
		rafId = requestAnimationFrame(tick)
	}

	rafId = requestAnimationFrame(tick)

	// Store rafId so removeStabilType can cancel it
	if (savedState.has(el)) {
		savedState.get(el)!.rafId = rafId
	}

	return () => {
		cancelAnimationFrame(rafId)
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
	if (state.rafId !== undefined) {
		cancelAnimationFrame(state.rafId)
	}
	el.style.fontVariationSettings = state.fvs
	el.style.letterSpacing = state.letterSpacing
	el.style.opacity = state.opacity
	savedState.delete(el)
}
