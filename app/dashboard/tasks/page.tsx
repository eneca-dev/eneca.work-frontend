"use client"

import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/auth"

export default function TasksPage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

    return () => {
      observer.disconnect()
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar user={{ name: user?.profile?.full_name, email: user?.email || '' }} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 animate-fade-in transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <Send className="h-5 w-5 text-[#1e7260]" />
              <h2 className="text-lg font-medium dark:text-gray-200">Передача заданий</h2>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Здесь будет размещена система передачи и отслеживания заданий.
            </p>

            <div className="h-64 flex items-center justify-center text-gray-300 dark:text-gray-600 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="h-16 w-16" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

