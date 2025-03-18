"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthButton } from "@/components/auth-button"
import { AuthInput } from "@/components/auth-input"
import { LoginAnimation } from "@/components/login-animation"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
  }

  const handleAnimationComplete = () => {
    router.push("/dashboard")
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-100">Вход в систему</h1>
          <p className="text-sm text-muted-foreground">Введите ваши данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <AuthInput
                label="Пароль"
                id="password"
                type="password"
                required
                autoComplete="current-password"
                showPasswordToggle={true}
              />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline transition-all">
                Забыли пароль?
              </Link>
            </div>
          </div>

          <AuthButton type="submit" loading={loading} disabled={loading}>
            Войти
          </AuthButton>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">Или</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/auth/register" className="text-primary hover:underline transition-all">
              Регистрация
            </Link>
          </p>
        </div>
      </div>

      <LoginAnimation isLoading={loading} onComplete={handleAnimationComplete} />
    </>
  )
}

