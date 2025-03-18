import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { AuthHeader } from "./header"

export const metadata: Metadata = {
  title: "Authentication - eneca.work",
  description: "Authentication pages for eneca.work platform",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AuthHeader />
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 pt-16">
        <div className="w-full max-w-md mx-auto relative">
          {/* Floating logo that overlaps the card */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-md">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image__10_-removebg-preview-DH3poORK5SwnmDnICGNszX6XADuVhH.png"
                alt="eneca.work Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden animate-slide-up mt-8">
            {/* Title bar with subtle gradient background */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 px-6 py-5 text-center border-b border-gray-100 dark:border-gray-700">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 tracking-tighter">
                  eneca
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">.work</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Платформа для эффективной работы</p>
            </div>

            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()}{" "}
        <span className="font-mono">
          <span className="text-primary">eneca</span>
          <span className="dark:text-gray-300">.work</span>
        </span>
        . All rights reserved.
      </footer>
    </div>
  )
}

