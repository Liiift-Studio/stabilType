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
}
