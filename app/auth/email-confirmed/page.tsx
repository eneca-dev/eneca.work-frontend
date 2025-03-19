"use client"

import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { CheckCircle } from "lucide-react"
import { useEffect } from "react"

export default function EmailConfirmedPage() {
  // Clear the temporary data from localStorage when this component loads
  useEffect(() => {
    localStorage.removeItem("registerEmail")
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center dark:text-gray-100">Email подтвержден!</h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Ваш email успешно подтвержден. Теперь вы можете войти в систему.
        </p>
      </div>

      <Link href="/auth/login" className="block">
        <AuthButton variant="default">Войти в систему</AuthButton>
      </Link>
    </div>
  )
} 