"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthButton } from "@/components/auth-button"
import { AuthInput } from "@/components/auth-input"
import { LoginAnimation } from "@/components/login-animation"
import { useAuth } from "@/hooks/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export default function LoginPage() {
  const { login, error: authError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    if (!email) {
      setError("Email обязателен")
      return
    }
    
    if (!password) {
      setError("Пароль обязателен")
      return
    }
    
    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов")
      return
    }
    
    setError(null)
    setLoading(true)
    
    try {
      await login(email, password)
      // После успешного входа включаем анимацию
    } catch (err: any) {
      setError(err.message || "Ошибка входа")
      setLoading(false)
    }
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

        {(error || authError) && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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

