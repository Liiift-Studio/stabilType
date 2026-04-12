// stabilType/src/react/useStabilType.ts — React hook for stabilType
import { useEffect, type RefObject } from 'react'
import { applyStabilType, removeStabilType } from '../core/adjust'
import type { StabilTypeOptions } from '../core/types'

/**
 * React hook that applies motion-adaptive typography to a referenced element
 * whenever the velocity prop changes.
 *
 * @param ref      - Ref to the target HTMLElement
 * @param velocity - Normalised velocity 0–1 (updated on each render)
 * @param options  - StabilTypeOptions
 */
export function useStabilType(ref: RefObject<HTMLElement | null>, velocity: number, options?: StabilTypeOptions): void {
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
