"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, User, PenSquare } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { AuthInput } from "@/components/auth-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/auth"
import { AuthButton } from "@/components/auth-button"
import { getCategories } from "@/lib/categoryData"

export default function SettingsPage() {        
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar user={{ name: user?.profile?.full_name, email: user?.email || '' }} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="h-6 w-6 text-[#1e7260]" />
            <h1 className="text-2xl font-medium dark:text-gray-200">Настройки аккаунта</h1>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 dark:bg-gray-800/50 dark:text-gray-400">
              <TabsTrigger
                value="profile"
                className="flex items-center dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Профиль</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="dark:bg-gray-800/70 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Личная информация</CardTitle>
                  <CardDescription>Обновите вашу личную информацию и контактные данные.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AuthInput label="Имя" id="name" type="text" defaultValue={user?.profile?.full_name || ''} required />
                      <AuthInput label="Email" id="email" type="email" defaultValue={user?.email || ''} required />
                      <AuthInput label="Должность" id="position" type="text" defaultValue={user?.profile?.position || 'Менеджер'} />
                      <AuthInput label="Отдел" id="department" type="text" defaultValue={user?.profile?.department || 'Разработка'} />
                      <AuthInput label="Команда" id="team" type="text" defaultValue={user?.profile?.team || 'Frontend'} />
                      <AuthInput label="Категория" id="category" type="text" defaultValue={user?.profile?.category || 'Разработчик'} />
                    </div>

                    <div className="flex justify-end">
                      <AuthButton type="submit" loading={saving}>
                        Сохранить изменения
                      </AuthButton>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/70 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Фото профиля</CardTitle>
                  <CardDescription>Загрузите фото профиля, которое будет отображаться в системе.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-12 w-12 text-[#1e7260]" />
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" className="flex-1">
                        Загрузить фото
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600">
                        Удалить
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Разрешенные форматы: JPG, PNG. Максимальный размер: 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/70 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Роль и разрешения</CardTitle>
                  <CardDescription>Информация о вашей роли и доступных разрешениях в системе.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Роль</Label>
                      <div id="role" className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                        {user?.profile?.role || 'Пользователь'}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="permissions">Разрешения</Label>
                      <div id="permissions" className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                        {user?.profile?.permissions || 'Стандартные разрешения пользователя'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

