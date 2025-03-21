"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, User, PenSquare } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/auth"
import { AuthButton } from "@/components/auth-button"
import { useForm } from "react-hook-form"
import { useProfile } from "@/hooks/useProfile"
import { useReferences } from "@/hooks/useReferences"
import { SelectField } from "@/components/SelectField"
import { UserProfile, Department, Team, Position, Category } from "@/hooks/auth/types"
import { FormInput } from "@/components/FormInput"

export default function SettingsPage() {        
  const { user, isLoading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading, isUpdating, updateProfile } = useProfile()
  const { 
    departments, 
    teams, 
    positions, 
    categories, 
    isLoading: referencesLoading,
    updateSelectedDepartment
  } = useReferences()
  
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // React Hook Form
  const { register, handleSubmit, formState, setValue, watch } = useForm<UserProfile>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      department_id: '',
      team_id: '',
      position_id: '',
      category_id: ''
    }
  })
  
  const { isDirty, errors } = formState
  const watchDepartmentId = watch('department_id')

  // Отслеживаем изменение отдела для обновления списка команд
  useEffect(() => {
    if (watchDepartmentId) {
      updateSelectedDepartment(watchDepartmentId)
    }
  }, [watchDepartmentId, updateSelectedDepartment])

  // Инициализация данных формы из профиля
  useEffect(() => {
    if (profile) {
      setValue('first_name', profile.first_name || '')
      setValue('last_name', profile.last_name || '')
      setValue('email', profile.email || '')
      setValue('department_id', profile.department_id || '')
      setValue('team_id', profile.team_id || '')
      setValue('position_id', profile.position_id || '')
      setValue('category_id', profile.category_id || '')
    }
  }, [profile, setValue])

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

  // Предупреждение о несохраненных изменениях при уходе со страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const onSubmit = (data: UserProfile) => {
    updateProfile(data)
  }

  if (authLoading || profileLoading || referencesLoading) {
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
      <Sidebar user={{ name: user?.profile?.first_name + ' ' + user?.profile?.last_name, email: user?.email || '' }} />

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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput 
                        label="Имя" 
                        id="first_name" 
                        type="text" 
                        {...register('first_name', { required: 'Имя обязательно' })}
                        error={errors.first_name?.message}
                      />
                      <FormInput 
                        label="Фамилия" 
                        id="last_name" 
                        type="text" 
                        {...register('last_name', { required: 'Фамилия обязательна' })}
                        error={errors.last_name?.message}
                      />
                      
                      <SelectField
                        label="Отдел"
                        id="department_id"
                        options={departments.map((dept: Department) => ({
                          value: dept.department_id,
                          label: dept.department_name
                        }))}
                        value={watch('department_id')}
                        onChange={(value) => setValue('department_id', value, { shouldDirty: true })}
                        error={errors.department_id?.message}
                      />
                      
                      <SelectField
                        label="Команда"
                        id="team_id"
                        options={teams.map((team: Team) => ({
                          value: team.team_id,
                          label: team.team_name
                        }))}
                        value={watch('team_id')}
                        onChange={(value) => setValue('team_id', value, { shouldDirty: true })}
                        error={errors.team_id?.message}
                      />
                      
                      <SelectField
                        label="Должность"
                        id="position_id"
                        options={positions.map((pos: Position) => ({
                          value: pos.position_id,
                          label: pos.position_name
                        }))}
                        value={watch('position_id')}
                        onChange={(value) => setValue('position_id', value, { shouldDirty: true })}
                        error={errors.position_id?.message}
                      />
                      
                      <SelectField
                        label="Категория"
                        id="category_id"
                        options={categories.map((cat: Category) => ({
                          value: cat.category_id,
                          label: cat.category_name
                        }))}
                        value={watch('category_id')}
                        onChange={(value) => setValue('category_id', value, { shouldDirty: true })}
                        error={errors.category_id?.message}
                      />
                      
                      <FormInput 
                        label="Email" 
                        id="email" 
                        type="email" 
                        {...register('email')}
                        disabled={true}
                      />
                    </div>

                    <div className="flex justify-end">
                      <AuthButton 
                        type="submit" 
                        loading={isUpdating}
                        disabled={!isDirty}
                        className={isDirty ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400'}
                      >
                        {isDirty ? 'Сохранить изменения' : 'Изменений нет'}
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

