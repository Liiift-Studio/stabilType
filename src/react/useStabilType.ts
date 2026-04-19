// stabilType/src/react/useStabilType.ts — React hook for stabilType
import { useEffect, type RefObject } from 'react'
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
	useEffect(() => {
		const el = ref.current
		if (!el) return
		applyStabilType(el, velocity, options)
	})
	useEffect(() => {
		return () => {
			const el = ref.current
			if (el) removeStabilType(el)
		}
	}, [])
}
