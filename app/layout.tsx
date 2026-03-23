import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Survey review",
  description: "View survey responses — review UI prototype",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
