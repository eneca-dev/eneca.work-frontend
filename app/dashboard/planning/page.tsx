"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/auth"

export default function PlanningPage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [frameHeight, setFrameHeight] = useState("100vh")

  useEffect(() => {
    setMounted(true)

    // Функция для отслеживания изменения ширины бокового меню
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const sidebar = document.querySelector("[data-sidebar]")
          if (sidebar) {
            const isCollapsed = sidebar.classList.contains("w-20")
            setSidebarCollapsed(isCollapsed)
          }
        }
      })
    })

    const sidebar = document.querySelector("[data-sidebar]")
    if (sidebar) {
      observer.observe(sidebar, { attributes: true })
    }

    // Update iframe height on resize
    const updateHeight = () => {
      setFrameHeight(`100vh`)
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!mounted) {
    return null
  }

  // Prepare user name from profile if available
  const userName = user?.profile 
    ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() 
    : '';

  return (
    <div className="min-h-screen">
      <Sidebar user={{ name: userName, email: user?.email || '' }} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
        <iframe 
          src="https://v0-enecawork.vercel.app/" 
          className="w-full border-0"
          style={{ height: frameHeight }}
          title="Eneca Planning System"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  )
}

