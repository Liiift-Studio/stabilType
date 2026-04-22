import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "stabilType — Motion-adaptive typography for smart glasses",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "stabilType adapts letter-spacing, weight, and optical size in real time based on motion velocity. Higher velocity — wider tracking, heavier weight, larger optical size.",
	keywords: ["typography", "variable font", "motion", "velocity", "smart glasses", "AR", "XR", "wght", "opsz", "letter-spacing", "TypeScript", "npm", "react"],
	openGraph: {
		title: "stabilType — Motion-adaptive typography for smart glasses",
		description: "Adapts letter-spacing, weight, and optical size in real time based on motion velocity. A precision typesetting tool for smart glasses and AR displays.",
		url: "https://stabiltype.com",
		siteName: "stabilType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "stabilType — Motion-adaptive typography for smart glasses",
		description: "Adapts letter-spacing, weight, and optical size in real time based on motion velocity.",
	},
	metadataBase: new URL("https://stabiltype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
