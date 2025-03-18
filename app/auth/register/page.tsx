"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { AuthButton } from "@/components/auth-button"
import { AuthInput } from "@/components/auth-input"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate loading and redirect
    setTimeout(() => {
      setLoading(false)
      router.push("/auth/pending-verification")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-100">Регистрация</h1>
        <p className="text-sm text-muted-foreground">Создайте аккаунт для доступа к платформе</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Имя" id="name" type="text" placeholder="Иван Иванов" required autoComplete="name" />

        <AuthInput label="Email" id="email" type="email" placeholder="name@example.com" required autoComplete="email" />

        <AuthInput
          label="Пароль"
          id="password"
          type="password"
          required
          autoComplete="new-password"
          showPasswordToggle={true}
        />

        <AuthInput
          label="Подтверждение пароля"
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          showPasswordToggle={true}
        />

        <AuthButton type="submit" loading={loading}>
          Зарегистрироваться
        </AuthButton>
      </form>

      <div className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="text-primary hover:underline transition-all">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

