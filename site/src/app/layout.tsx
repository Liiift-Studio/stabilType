import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "stabilType — Motion-adaptive variable font typography | Type Tools",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "stabilType adapts letter-spacing, weight, optical size, slant, and perspective tilt in real time based on scroll velocity and device motion. Zero dependencies.",
	keywords: ["typography", "variable font", "motion", "scroll velocity", "device motion", "gyroscope", "smart glasses", "AR", "XR", "wght", "opsz", "slnt", "letter-spacing", "TypeScript", "npm", "react"],
	openGraph: {
		title: "stabilType — Motion-adaptive variable font typography",
		description: "Adapts letter-spacing, weight, optical size, slant, and perspective tilt in real time based on scroll velocity and device motion. For web, smart glasses, and AR.",
		url: "https://stabiltype.com",
		siteName: "stabilType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "stabilType — Motion-adaptive variable font typography",
		description: "Adapts letter-spacing, weight, optical size, slant, and perspective tilt in real time based on scroll velocity and device motion.",
	},
	metadataBase: new URL("https://stabiltype.com"),
	alternates: { canonical: "https://stabiltype.com" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
