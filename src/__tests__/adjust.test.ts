// motionType/src/__tests__/adjust.test.ts — unit tests for the motionType core algorithm

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { applyMotionType, removeMotionType, lerp, overrideAxis } from '../core/adjust'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a minimal HTMLElement mock with trackable style properties */
function makeEl(): HTMLElement {
	const style: Record<string, string> = {
		fontVariationSettings: '',
		letterSpacing: '',
		opacity: '',
	}
	return {
		style,
		getAttribute: () => null,
	} as unknown as HTMLElement
}

// ─── lerp ────────────────────────────────────────────────────────────────────

describe('lerp', () => {
	it('returns a at t=0', () => {
		expect(lerp(10, 20, 0)).toBe(10)
	})
	it('returns b at t=1', () => {
		expect(lerp(10, 20, 1)).toBe(20)
	})
	it('returns midpoint at t=0.5', () => {
		expect(lerp(0, 100, 0.5)).toBe(50)
	})
	it('clamps t below 0', () => {
		expect(lerp(10, 20, -1)).toBe(10)
	})
	it('clamps t above 1', () => {
		expect(lerp(10, 20, 2)).toBe(20)
	})
})

// ─── overrideAxis ────────────────────────────────────────────────────────────

describe('overrideAxis', () => {
	it('creates a new FVS string from empty/normal', () => {
		expect(overrideAxis('', 'wght', 400)).toBe('"wght" 400')
		expect(overrideAxis('normal', 'wght', 400)).toBe('"wght" 400')
	})
	it('appends a new axis when not present', () => {
		expect(overrideAxis('"wght" 300', 'opsz', 18)).toBe('"wght" 300, "opsz" 18')
	})
	it('overrides an existing axis value', () => {
		expect(overrideAxis('"wght" 300, "opsz" 12', 'wght', 600)).toBe('"wght" 600, "opsz" 12')
	})
})

// ─── applyMotionType ─────────────────────────────────────────────────────────

describe('applyMotionType', () => {
	beforeEach(() => {
		// Stub getComputedStyle to return empty FVS
		vi.stubGlobal('getComputedStyle', () => ({
			fontVariationSettings: 'normal',
			fontSize: '16px',
		}))
		vi.stubGlobal('window', { scrollY: 0 })
	})

	it('at velocity 0 applies rest values', () => {
		const el = makeEl()
		applyMotionType(el, 0, {
			trackingRange: [0, 0.06],
			weightRange: [300, 600],
			opszRange: [12, 24],
			opacityRange: [1, 0.7],
			smoothing: 0, // no smoothing so values are immediate
		})
		// Smoothed velocity should move toward 0
		expect(el.style.letterSpacing).toMatch(/^0\./)
		// opacity should be close to 1
		const opacity = parseFloat(el.style.opacity)
		expect(opacity).toBeGreaterThan(0.95)
	})

	it('at velocity 1 after many calls applies near-max values', () => {
		const el = makeEl()
		// Call many times at velocity 1 to let EMA converge
		for (let i = 0; i < 100; i++) {
			applyMotionType(el, 1, {
				trackingRange: [0, 0.06],
				weightRange: [300, 600],
				opszRange: [12, 24],
				opacityRange: [1, 0.7],
				smoothing: 0.15,
			})
		}
		const ls = parseFloat(el.style.letterSpacing)
		const opacity = parseFloat(el.style.opacity)
		expect(ls).toBeGreaterThan(0.05)
		expect(opacity).toBeLessThan(0.75)
		// FVS should contain wght close to 600
		expect(el.style.fontVariationSettings).toContain('"wght"')
		expect(el.style.fontVariationSettings).toContain('"opsz"')
	})

	it('uses custom axis tags', () => {
		const el = makeEl()
		applyMotionType(el, 1, {
			weightAxis: 'WGHT',
			opszAxis: 'OPSZ',
			smoothing: 0,
		})
		expect(el.style.fontVariationSettings).toContain('"WGHT"')
		expect(el.style.fontVariationSettings).toContain('"OPSZ"')
	})
})

// ─── removeMotionType ────────────────────────────────────────────────────────

describe('removeMotionType', () => {
	beforeEach(() => {
		vi.stubGlobal('getComputedStyle', () => ({
			fontVariationSettings: 'normal',
			fontSize: '16px',
		}))
		vi.stubGlobal('window', { scrollY: 0 })
	})

	it('restores original inline styles', () => {
		const el = makeEl()
		el.style.fontVariationSettings = '"wght" 350'
		el.style.letterSpacing = '0.02em'
		el.style.opacity = '0.9'

		applyMotionType(el, 0.5, { smoothing: 0 })
		// Styles should have been changed
		expect(el.style.fontVariationSettings).not.toBe('"wght" 350')

		removeMotionType(el)
		// Styles should be restored
		expect(el.style.fontVariationSettings).toBe('"wght" 350')
		expect(el.style.letterSpacing).toBe('0.02em')
		expect(el.style.opacity).toBe('0.9')
	})

	it('is a no-op if applyMotionType was never called', () => {
		const el = makeEl()
		el.style.opacity = '1'
		// Should not throw
		removeMotionType(el)
		expect(el.style.opacity).toBe('1')
	})
})
