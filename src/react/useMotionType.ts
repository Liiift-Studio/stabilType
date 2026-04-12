// motionType/src/react/useMotionType.ts — React hook for motionType
import { useEffect, type RefObject } from 'react'
import { applyMotionType, removeMotionType } from '../core/adjust'
import type { MotionTypeOptions } from '../core/types'

/**
 * React hook that applies motion-adaptive typography to a referenced element
 * whenever the velocity prop changes.
 *
 * @param ref      - Ref to the target HTMLElement
 * @param velocity - Normalised velocity 0–1 (updated on each render)
 * @param options  - MotionTypeOptions
 */
export function useMotionType(ref: RefObject<HTMLElement | null>, velocity: number, options?: MotionTypeOptions): void {
	useEffect(() => {
		const el = ref.current
		if (!el) return
		applyMotionType(el, velocity, options)
	})
	useEffect(() => {
		return () => {
			const el = ref.current
			if (el) removeMotionType(el)
		}
	}, [])
}
