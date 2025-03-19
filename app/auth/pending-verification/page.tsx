"use client"

import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { Mail, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { resendConfirmation } from "@/lib/auth/auth"

export default function PendingVerificationPage() {
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState("")
  const [resendError, setResendError] = useState("")
  const [resendSuccess, setResendSuccess] = useState(false)

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("registerEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const handleResend = async () => {
    if (!email) {
      setResendError("Email не найден. Пожалуйста, зарегистрируйтесь заново.")
      return
    }

    setResending(true)
    setResendError("")
    setResendSuccess(false)
    
    try {
      await resendConfirmation(email)
      setResendSuccess(true)
    } catch (err: any) {
      setResendError(err.message || "Не удалось отправить письмо")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center dark:text-gray-100">Подтвердите ваш email</h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Мы отправили ссылку для подтверждения на {email ? <strong>{email}</strong> : "ваш email"}. Пожалуйста, проверьте вашу почту и подтвердите аккаунт.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center space-x-3">
        <RefreshCw className="h-5 w-5 text-primary animate-spin-slow" />
        <div className="text-sm">
          <p className="font-medium dark:text-gray-200">Ожидание подтверждения</p>
          <p className="text-muted-foreground">После подтверждения вы будете автоматически перенаправлены.</p>
        </div>
      </div>

      {resendSuccess && (
        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm">
          Письмо успешно отправлено повторно. Пожалуйста, проверьте вашу почту.
        </div>
      )}

      {resendError && (
        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm">
          {resendError}
        </div>
      )}

      <div className="space-y-6">
        <AuthButton variant="outline" onClick={handleResend} loading={resending}>
          Отправить снова
        </AuthButton>

        <Link href="/auth/login">
          <AuthButton variant="secondary">Вернуться ко входу</AuthButton>
        </Link>
      </div>
    </div>
  )
}

