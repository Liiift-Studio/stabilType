// motionType/src/react/MotionTypeText.tsx — React component wrapper for motionType
"use client"
import { useRef, type ElementType, type ComponentPropsWithRef } from 'react'
import { useMotionType } from './useMotionType'
import type { MotionTypeOptions } from '../core/types'

/** Props for the MotionTypeText component */
interface MotionTypeTextProps extends MotionTypeOptions {
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
export function MotionTypeText({ velocity, as: Tag = 'p', children, style, className, ...options }: MotionTypeTextProps) {
	const ref = useRef<HTMLElement>(null)
	useMotionType(ref as React.RefObject<HTMLElement | null>, velocity, options)
	return <Tag ref={ref} style={style} className={className}>{children}</Tag>
}
