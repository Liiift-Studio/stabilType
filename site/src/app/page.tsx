import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import CodeBlock from "@/components/CodeBlock"
import ToolDirectory from "@/components/ToolDirectory"
import { version } from "../../../package.json"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-50">motiontype</p>
					<h1 className="text-4xl lg:text-8xl xl:text-9xl" style={{ fontFamily: "var(--font-merriweather), serif", fontVariationSettings: '"wght" 300', lineHeight: "1.05em" }}>
						Motion adapts<br />
						<span style={{ opacity: 0.5, fontStyle: "italic" }}>your type.</span>
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a href="https://github.com/Liiift-Studio/MotionType" className="text-sm opacity-50 hover:opacity-100 transition-opacity">GitHub</a>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-50 tracking-wide">
					<span>TypeScript</span><span>·</span><span>Zero dependencies</span><span>·</span><span>React + Vanilla JS</span>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					On smart glasses, head motion creates perceptual blur on anchored text. CSS has no motion context — it can&apos;t adjust tracking or weight in response to velocity. motionType bridges that gap, interpolating letter&#8209;spacing, wght, and opsz in real time as velocity changes.
				</p>
			</section>

			{/* Demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest opacity-50">Live demo — drag the slider or use cursor / gyro</p>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "rgba(0,0,0,0.25)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* Explanation */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-50">How it works</p>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Motion blurs anchored text</p>
						<p>When you turn your head wearing smart glasses, world-anchored UI elements appear to smear. The faster the motion, the more the text becomes illegible. CSS has no mechanism to respond to this — there is no velocity context in the rendering pipeline.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Three axes compensate together</p>
						<p>motionType interpolates three properties simultaneously: letter&#8209;spacing opens up at speed (wider tracking survives blur better), wght increases (heavier strokes remain legible), and opsz grows (optical size optimises letterform detail for the effective size-at-blur).</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">EMA smoothing prevents jitter</p>
						<p>Raw velocity signals are noisy. motionType applies an exponential moving average before mapping velocity to type properties — so the typography transitions feel deliberate rather than jittery. The smoothing factor is tunable per element.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Runs in a rAF loop or on demand</p>
						<p><code className="text-xs font-mono">startMotionType</code> wires up a <code className="text-xs font-mono">requestAnimationFrame</code> loop and accepts a <code className="text-xs font-mono">getVelocity</code> callback — connect your platform&apos;s IMU or head&#8209;tracking API directly. <code className="text-xs font-mono">applyMotionType</code> lets you drive it frame&#8209;by&#8209;frame from your own loop.</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex items-baseline gap-4">
					<p className="text-xs uppercase tracking-widest opacity-50">Usage</p>
					<p className="text-xs opacity-50 tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Drop-in component</p>
						<CodeBlock code={`import { MotionTypeText } from '@liiift-studio/motiontype'

<MotionTypeText velocity={velocity}>
  Heading text
</MotionTypeText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook — attach to any element</p>
						<CodeBlock code={`import { useMotionType } from '@liiift-studio/motiontype'
import { useRef } from 'react'

const ref = useRef(null)
useMotionType(ref, velocity, { weightRange: [300, 700] })
<h1 ref={ref}>Heading text</h1>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">rAF loop — vanilla JS with IMU callback</p>
						<CodeBlock code={`import { startMotionType } from '@liiift-studio/motiontype'

const el = document.querySelector('h1')
const stop = startMotionType(el, () => imu.velocity, {
  trackingRange: [0, 0.08],
  weightRange: [300, 600],
})

// Later — cancel loop and restore styles
stop()`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead><tr className="opacity-50 text-left"><th className="pb-2 pr-6 font-normal">Option</th><th className="pb-2 pr-6 font-normal">Default</th><th className="pb-2 font-normal">Description</th></tr></thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">trackingRange</td><td className="py-2 pr-6">[0, 0.06]</td><td className="py-2">Letter-spacing range in em: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">weightRange</td><td className="py-2 pr-6">[300, 600]</td><td className="py-2">wght axis range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opszRange</td><td className="py-2 pr-6">[12, 24]</td><td className="py-2">opsz axis range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opacityRange</td><td className="py-2 pr-6">[1, 0.7]</td><td className="py-2">Opacity range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">smoothing</td><td className="py-2 pr-6">0.15</td><td className="py-2">EMA smoothing factor 0–1. Higher = more smoothing (slower response).</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">weightAxis</td><td className="py-2 pr-6">&apos;wght&apos;</td><td className="py-2">Variable font weight axis tag.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opszAxis</td><td className="py-2 pr-6">&apos;opsz&apos;</td><td className="py-2">Variable font optical size axis tag.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">as</td><td className="py-2 pr-6">&apos;p&apos;</td><td className="py-2">HTML element to render. (MotionTypeText only)</td></tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 pt-8 border-t border-white/10 text-xs">
				<ToolDirectory current="motionType" />
				<hr className="border-white/10" />
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 opacity-50">
					<a href="https://liiift.studio" className="hover:opacity-100 transition-opacity">liiift.studio</a>
					<span className="sm:col-start-4">motionType v{version}</span>
				</div>
			</footer>

		</main>
	)
}
