import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export const metadata: Metadata = {
  title: "MechWise WMS — Dhalla Automotive",
  description: "Australian Automotive Workshop Management Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#F3F5F7]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
