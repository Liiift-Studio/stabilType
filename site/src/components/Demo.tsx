"use client"

// Interactive demo: velocity slider or cursor/gyro mode drives motion-adaptive typography
import { useState, useEffect, useRef } from "react"
import { StabilTypeText } from "@liiift-studio/stabiltype"
import type { StabilTypeOptions } from "@liiift-studio/stabiltype"

/** Sample paragraph text about motion and legibility */
const SAMPLE = "Reading anchored text while moving is a fundamentally different perceptual task than reading static type. Smart glasses surface UI while the wearer walks, turns, and gestures — head velocity matters."

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

/** Gyroscope icon SVG */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
			<circle cx="7" cy="7" r="5.5" />
			<circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
			<path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.4" />
			<path d="M11.5 5.5 L12.5 7 L13.8 6" strokeWidth="1.2" />
		</svg>
	)
}

/** Clamp a number to [min, max] */
function clamp(v: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, v))
}

/** Interactive demo with velocity slider, cursor mode, and gyro mode */
export default function Demo() {
	const [velocity, setVelocity] = useState(0)

	// Interaction modes — mutually exclusive
	const [cursorMode, setCursorMode] = useState(false)
	const [gyroMode, setGyroMode] = useState(false)

	// Accelerometer magnitude for gyro mode — stored in a ref to avoid stale closure issues
	const accelRef = useRef(0)

	// Detected capabilities — resolved client-side after mount
	const [showCursor, setShowCursor] = useState(false)
	const [showGyro, setShowGyro] = useState(false)

	// Ref to the demo wrapper for bounding box
	const demoRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const isHover = window.matchMedia('(hover: hover)').matches
		const isTouch = window.matchMedia('(hover: none)').matches
		setShowCursor(isHover)
		setShowGyro(isTouch && 'DeviceMotionEvent' in window)
	}, [])

	// Cursor mode — mouse Y position drives velocity (top = 1, bottom = 0). Esc to exit.
	useEffect(() => {
		if (!cursorMode) return
		const handleMove = (e: MouseEvent) => {
			// Invert Y: top of viewport = max velocity
			setVelocity(clamp(1 - e.clientY / window.innerHeight, 0, 1))
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode])

	// Gyro mode — DeviceMotionEvent acceleration magnitude → velocity.
	// Uses rAF throttle to avoid flooding React with state updates.
	useEffect(() => {
		if (!gyroMode) return
		let rafId: number | null = null

		const handleMotion = (e: DeviceMotionEvent) => {
			const acc = e.acceleration
			if (!acc) return
			const mag = Math.sqrt(
				(acc.x ?? 0) ** 2 +
				(acc.y ?? 0) ** 2 +
				(acc.z ?? 0) ** 2
			)
			accelRef.current = clamp(mag / 20, 0, 1)
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				rafId = null
				setVelocity(accelRef.current)
			})
		}

		window.addEventListener('devicemotion', handleMotion)
		return () => {
			window.removeEventListener('devicemotion', handleMotion)
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [gyroMode])

	// Toggle cursor mode
	const toggleCursor = () => {
		setGyroMode(false)
		setCursorMode(v => !v)
	}

	// Toggle gyro mode — requests iOS permission if needed
	const toggleGyro = async () => {
		if (gyroMode) {
			setGyroMode(false)
			return
		}
		setCursorMode(false)
		const DME = DeviceMotionEvent as typeof DeviceMotionEvent & {
			requestPermission?: () => Promise<PermissionState>
		}
		if (typeof DME.requestPermission === 'function') {
			const permission = await DME.requestPermission()
			if (permission === 'granted') setGyroMode(true)
		} else {
			setGyroMode(true)
		}
	}

	const activeMode = cursorMode || gyroMode

	// Resolve current options for live readout
	const options: StabilTypeOptions = {
		trackingRange: [0, 0.06],
		weightRange: [300, 600],
		opszRange: [12, 24],
		opacityRange: [1, 0.7],
		smoothing: 0.15,
	}

	return (
		<div ref={demoRef} className="w-full flex flex-col gap-8">

			{/* Controls */}
			<div className="flex flex-wrap items-center gap-6">
				{/* Velocity slider — hidden in active cursor/gyro mode */}
				{!activeMode && (
					<div className="flex flex-col gap-1 min-w-48 flex-1">
						<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
							<span>Velocity</span>
							<span className="tabular-nums">{velocity.toFixed(2)}</span>
						</div>
						<input
							type="range"
							min={0}
							max={1}
							step={0.01}
							value={velocity}
							aria-label="Velocity (0 = at rest, 1 = maximum)"
							onChange={e => setVelocity(Number(e.target.value))}
							onTouchStart={e => e.stopPropagation()}
							style={{ touchAction: 'none' }}
						/>
					</div>
				)}

				{/* Cursor / gyro mode toggles */}
				<div className="flex flex-wrap items-center gap-3">
					{showCursor && (
						<button
							onClick={toggleCursor}
							title="Move cursor up/down to control velocity"
							className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
							style={{
								borderColor: 'currentColor',
								opacity: cursorMode ? 1 : 0.5,
								background: cursorMode ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							<CursorIcon />
							<span>{cursorMode ? 'Esc to exit' : 'Cursor'}</span>
						</button>
					)}
					{showGyro && (
						<button
							onClick={toggleGyro}
							title="Device motion drives velocity"
							className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
							style={{
								borderColor: 'currentColor',
								opacity: gyroMode ? 1 : 0.5,
								background: gyroMode ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							<GyroIcon />
							<span>{gyroMode ? 'Motion active' : 'Gyro'}</span>
						</button>
					)}
					{activeMode && (
						<p className="text-xs opacity-50 italic">
							{cursorMode
								? 'Move cursor up for max velocity, down for rest. Press Esc to exit.'
								: 'Move your device to drive velocity.'}
						</p>
					)}
				</div>
			</div>

			{/* Demo text */}
			<div
				className="rounded-lg p-6 flex flex-col gap-4"
				style={{ background: 'rgba(212,184,240,0.04)', border: '1px solid rgba(212,184,240,0.12)' }}
			>
				<StabilTypeText
					velocity={velocity}
					as="p"
					{...options}
					style={{
						fontFamily: 'var(--font-merriweather), serif',
						fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
						lineHeight: 1.7,
						margin: 0,
					}}
				>
					{SAMPLE}
				</StabilTypeText>
			</div>

			{/* Live internals readout */}
			<LiveReadout velocity={velocity} options={options} />

			<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>
				On smart glasses, head motion creates perceptual blur on anchored text. stabilType compensates — wider tracking, heavier weight, and larger optical size as velocity increases. The same principle applies to automotive head-up displays — road vibration creates the same perceptual challenge as walking with glasses.
			</p>
		</div>
	)
}

/** Always-visible live readout of interpolated values */
function LiveReadout({ velocity, options }: { velocity: number; options: Required<Pick<StabilTypeOptions, 'trackingRange' | 'weightRange' | 'opszRange'>> }) {
	// Mirror the EMA from the core so readout values match what's applied
	const smoothedRef = useRef(0)
	const [display, setDisplay] = useState({ tracking: 0, weight: 300, opsz: 12 })

	useEffect(() => {
		const smoothing = 0.15
		const alpha = 1 - smoothing
		smoothedRef.current = smoothedRef.current * alpha + velocity * (1 - alpha)
		const t = smoothedRef.current
		const lerp = (a: number, b: number) => a + (b - a) * t
		setDisplay({
			tracking: lerp(options.trackingRange[0], options.trackingRange[1]),
			weight: lerp(options.weightRange[0], options.weightRange[1]),
			opsz: lerp(options.opszRange[0], options.opszRange[1]),
		})
	})

	return (
		<div className="flex flex-wrap gap-6 text-xs opacity-50 font-mono tabular-nums">
			<span>tracking: {display.tracking.toFixed(4)}em</span>
			<span>wght: {display.weight.toFixed(1)}</span>
			<span>opsz: {display.opsz.toFixed(1)}</span>
		</div>
	)
}
