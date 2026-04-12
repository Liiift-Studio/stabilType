// stabilType/src/react/StabilTypeText.tsx — React component wrapper for stabilType
"use client"
import { useRef, type ElementType, type ComponentPropsWithRef } from 'react'
import { useStabilType } from './useStabilType'
import type { StabilTypeOptions } from '../core/types'

/** Props for the StabilTypeText component */
interface StabilTypeTextProps extends StabilTypeOptions {
	/** Normalised velocity 0–1 driving the typographic adaptation */
	velocity: number
	/** HTML element to render. Default: 'p' */
	as?: ElementType
	/** Text content */
	children: React.ReactNode
	/** Inline styles passed through to the element */
	style?: React.CSSProperties
	/** Class name passed through to the element */
	className?: string
}

/**
 * Drop-in React component that adapts its typography in real time
 * based on a normalised velocity prop (0 = at rest, 1 = max velocity).
 */
export function StabilTypeText({ velocity, as: Tag = 'p', children, style, className, ...options }: StabilTypeTextProps) {
	const ref = useRef<HTMLElement>(null)
	useStabilType(ref as React.RefObject<HTMLElement | null>, velocity, options)
	return <Tag ref={ref} style={style} className={className}>{children}</Tag>
}
