// stabilType/src/core/types.ts — options interface for the stabilType tool

/** Options controlling how typography adapts to motion velocity */
export interface StabilTypeOptions {
	/** Letter-spacing range in em: [at rest, at max velocity]. Default: [0, 0.06] */
	trackingRange?: [number, number]
	/** wght axis range: [at rest, at max velocity]. Default: [300, 600] */
	weightRange?: [number, number]
	/** opsz axis range: [at rest, at max velocity]. Default: [12, 24] */
	opszRange?: [number, number]
	/** Opacity range: [at rest, at max velocity]. Default: [1, 0.7] */
	opacityRange?: [number, number]
	/** Exponential moving average smoothing factor 0–1. Higher = more smoothing. Default: 0.15 */
	smoothing?: number
	/** Variable font weight axis tag. Default: 'wght' */
	weightAxis?: string
	/** Variable font optical size axis tag. Default: 'opsz' */
	opszAxis?: string
	/**
	 * Scroll velocity in px/frame that maps to maximum typography adjustment.
	 * Only used when startStabilType is called without a getVelocity callback.
	 * Default: 15
	 */
	velocityMax?: number
	/**
	 * CSS perspective depth in px at peak scroll velocity. Controls dolly compression —
	 * the faster the scroll, the tighter the perspective. Default: 600. Set to 0 to disable.
	 */
	perspective?: number
	/**
	 * rotateX/rotateY tilt in degrees at peak velocity. Sign follows scroll direction:
	 * downscroll tips the top away, upscroll tips the bottom away. Default: 3
	 */
	tilt?: number
	/** slnt axis range: [at peak upscroll, at peak downscroll]. Default: [8, -8] */
	slntRange?: [number, number]
	/** Variable font slant axis tag. Default: 'slnt' */
	slntAxis?: string
}

/** 2D signed velocity vector, each axis –1 (negative direction) to +1 (positive direction) */
export interface Velocity2D {
	/** Horizontal: negative = scrolling left, positive = scrolling right */
	x: number
	/** Vertical: negative = scrolling up, positive = scrolling down */
	y: number
}
