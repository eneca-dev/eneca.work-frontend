"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthButton } from "@/components/auth-button"
import { AuthInput } from "@/components/auth-input"
import { useRouter } from "next/navigation"
import { register as registerUser } from "@/lib/auth/auth"

const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру")
    .regex(/[a-zA-Z]/, "Пароль должен содержать хотя бы одну букву"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "Имя обязательно для заполнения"),
  lastName: z.string().min(1, "Фамилия обязательна для заполнения")
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true)
    setError("")
    
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      // Redirect to verification page
      router.push("/auth/pending-verification")
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-100">Регистрация</h1>
        <p className="text-sm text-muted-foreground">Создайте аккаунт для доступа к платформе</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput 
          label="Имя"
          {...register("firstName")}
          error={errors.firstName?.message}
          placeholder="Иван" 
          required 
        />
        
        <AuthInput 
          label="Фамилия"
          {...register("lastName")}
          error={errors.lastName?.message}
          placeholder="Иванов" 
          required 
        />

        <AuthInput 
          label="Email"
          {...register("email")}
          error={errors.email?.message}
          type="email" 
          placeholder="name@example.com" 
          required 
        />

        <AuthInput
          label="Пароль"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          required
          showPasswordToggle={true}
        />

        <AuthInput
          label="Подтверждение пароля"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          required
          showPasswordToggle={true}
        />
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

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

