// stabilType/src/react/useStabilType.ts — React hook for stabilType
import { useEffect, useRef, type RefObject } from 'react'
import { applyStabilType, removeStabilType } from '../core/adjust'
import type { StabilTypeOptions, Velocity2D } from '../core/types'

/**
 * React hook that applies motion-adaptive typography to a referenced element
 * whenever the velocity prop changes.
 *
 * @param ref      - Ref to the target HTMLElement
 * @param velocity - Signed scalar –1…+1 or Velocity2D { x, y } (updated on each render)
 * @param options  - StabilTypeOptions
 */
export function useStabilType(ref: RefObject<HTMLElement | null>, velocity: number | Velocity2D, options?: StabilTypeOptions): void {
	// Keep a stable ref to options so the apply effect always reads the latest values
	// without triggering re-runs on every object identity change.
	const optionsRef = useRef<StabilTypeOptions | undefined>(options)
	optionsRef.current = options

	// Serialise velocity so the effect only re-runs when the value actually changes
	const vx = typeof velocity === 'object' ? velocity.x : 0
	const vy = typeof velocity === 'object' ? velocity.y : velocity

	useEffect(() => {
		const el = ref.current
		if (!el) return
		applyStabilType(el, velocity, optionsRef.current)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vx, vy])

	useEffect(() => {
		return () => {
			const el = ref.current
			if (el) removeStabilType(el)
		}
	}, [])
}
