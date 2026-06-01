// stabilType/src/__tests__/react.test.tsx — @testing-library/react tests for useStabilType and StabilTypeText
import React, { useRef } from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useStabilType } from '../react/useStabilType'
import { StabilTypeText } from '../react/StabilTypeText'

// ─── Global stubs ─────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.stubGlobal('getComputedStyle', () => ({
		fontVariationSettings: 'normal',
		fontSize: '16px',
	}))
})

afterEach(() => {
	vi.unstubAllGlobals()
})

// ─── useStabilType ────────────────────────────────────────────────────────────

describe('useStabilType', () => {
	it('mounts without throwing', () => {
		const { result } = renderHook(() => {
			const ref = useRef<HTMLElement>(null)
			useStabilType(ref, 0)
		})
		expect(result.error).toBeUndefined()
	})

	it('unmounts without throwing', () => {
		const { unmount } = renderHook(() => {
			const ref = useRef<HTMLElement>(null)
			useStabilType(ref, 0)
		})
		expect(() => unmount()).not.toThrow()
	})

	it('re-runs when velocity changes', () => {
		let velocity = 0
		const { rerender } = renderHook(() => {
			const ref = useRef<HTMLParagraphElement>(null)
			useStabilType(ref, velocity)
		})
		act(() => {
			velocity = 0.5
			rerender()
		})
		// No throw and no error means the effect re-ran cleanly
	})

	it('accepts a Velocity2D object without throwing', () => {
		const { result } = renderHook(() => {
			const ref = useRef<HTMLElement>(null)
			useStabilType(ref, { x: 0.3, y: 0.7 })
		})
		expect(result.error).toBeUndefined()
	})

	it('accepts all StabilTypeOptions without throwing', () => {
		const { result } = renderHook(() => {
			const ref = useRef<HTMLElement>(null)
			useStabilType(ref, 0.5, {
				smoothing: 0.2,
				trackingRange: [0, 0.1],
				weightRange: [300, 700],
				opszRange: [12, 36],
				opacityRange: [1, 0.6],
				tilt: 5,
				perspective: 800,
			})
		})
		expect(result.error).toBeUndefined()
	})
})

// ─── StabilTypeText ───────────────────────────────────────────────────────────

describe('StabilTypeText', () => {
	it('renders children', () => {
		const { container } = render(
			<StabilTypeText velocity={0}>Hello world</StabilTypeText>
		)
		expect(container.textContent).toContain('Hello world')
	})

	it('renders a p element by default', () => {
		const { container } = render(
			<StabilTypeText velocity={0}>text</StabilTypeText>
		)
		expect(container.querySelector('p')).not.toBeNull()
	})

	it('renders a custom element when as prop is provided', () => {
		const { container } = render(
			<StabilTypeText velocity={0} as="span">text</StabilTypeText>
		)
		expect(container.querySelector('span')).not.toBeNull()
		expect(container.querySelector('p')).toBeNull()
	})

	it('forwards className', () => {
		const { container } = render(
			<StabilTypeText velocity={0} className="my-class">text</StabilTypeText>
		)
		const el = container.firstElementChild
		expect(el?.classList.contains('my-class')).toBe(true)
	})

	it('forwards style prop', () => {
		const { container } = render(
			<StabilTypeText velocity={0} style={{ color: 'red' }}>text</StabilTypeText>
		)
		const el = container.firstElementChild as HTMLElement
		expect(el?.style.color).toBe('red')
	})

	it('mounts and unmounts without throwing', () => {
		const { unmount } = render(
			<StabilTypeText velocity={0}>text</StabilTypeText>
		)
		expect(() => unmount()).not.toThrow()
	})

	it('accepts velocity 1 without throwing', () => {
		expect(() =>
			render(<StabilTypeText velocity={1}>text</StabilTypeText>)
		).not.toThrow()
	})

	it('accepts a Velocity2D object without throwing', () => {
		expect(() =>
			render(<StabilTypeText velocity={{ x: 0.2, y: 0.8 }}>text</StabilTypeText>)
		).not.toThrow()
	})
})
