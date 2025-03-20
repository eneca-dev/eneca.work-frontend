import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Пути, требующие аутентификации
const protectedPaths = ['/dashboard', '/profile', '/settings'];

// Пути, доступные только для неаутентифицированных пользователей
const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

// API пути, которые не должны проверяться middleware
const apiPaths = ['/api/'];

/**
 * Middleware для защиты маршрутов на основе статуса аутентификации
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Пропускаем API маршруты - они обрабатываются отдельно
  if (apiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Проверка наличия cookie аутентификации
  const authCookie = request.cookies.get('auth-token');
  const refreshCookie = request.cookies.get('refresh-token');
  
  // Если есть auth-token или refresh-token, считаем пользователя аутентифицированным
  // Это позволяет корректно обрабатывать случаи, когда auth-token истек, но refresh-token еще действителен
  const isAuthenticated = !!authCookie || !!refreshCookie;

  // Редирект для защищенных маршрутов, если пользователь не аутентифицирован
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('from', pathname); // Сохраняем исходный путь
    return NextResponse.redirect(url);
  }

  // Редирект аутентифицированных пользователей от страниц аутентификации
  if (authPaths.some(path => pathname === path) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Защищенные маршруты
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Маршруты аутентификации
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    // API пути (для валидации в middleware)
    '/api/:path*'
  ],
}; 