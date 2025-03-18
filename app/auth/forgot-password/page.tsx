"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { AuthButton } from "@/components/auth-button"
import { AuthInput } from "@/components/auth-input"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate loading and redirect
    setTimeout(() => {
      setLoading(false)
      router.push("/auth/password-reset-sent")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-100">Восстановление пароля</h1>
        <p className="text-sm text-muted-foreground">Введите ваш email для получения ссылки на сброс пароля</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Email" id="email" type="email" placeholder="name@example.com" required autoComplete="email" />

        <AuthButton type="submit" loading={loading}>
          Отправить ссылку
        </AuthButton>
      </form>

      <div className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          Вспомнили пароль?{" "}
          <Link href="/auth/login" className="text-primary hover:underline transition-all">
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  )
}

