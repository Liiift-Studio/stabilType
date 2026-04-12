import type { Metadata } from "next"
import "./globals.css"
import { Merriweather } from "next/font/google"

const merriweather = Merriweather({
	weight: ['300', '700'],
	style: ['normal', 'italic'],
	subsets: ["latin"],
	variable: "--font-merriweather",
})

export const metadata: Metadata = {
	title: "motionType — Motion-adaptive typography for smart glasses",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "motionType adapts letter-spacing, weight, and optical size in real time based on motion velocity. Higher velocity — wider tracking, heavier weight, larger optical size.",
	keywords: ["typography", "variable font", "motion", "velocity", "smart glasses", "AR", "XR", "wght", "opsz", "letter-spacing", "TypeScript", "npm", "react"],
	openGraph: {
		title: "motionType — Motion-adaptive typography for smart glasses",
		description: "Adapts letter-spacing, weight, and optical size in real time based on motion velocity. A precision typesetting tool for smart glasses and AR displays.",
		url: "https://motiontype.com",
		siteName: "motionType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "motionType — Motion-adaptive typography for smart glasses",
		description: "Adapts letter-spacing, weight, and optical size in real time based on motion velocity.",
	},
	metadataBase: new URL("https://motiontype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${merriweather.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
