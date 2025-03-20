# Исправление ошибок аутентификации

## Выявленные проблемы

1. Несоответствие URL путей: запросы к API идут напрямую на Heroku без префикса `/api`
2. Проблемы с обновлением токена: "Token already expired" и "Skipping token refresh - too soon since last refresh"
3. Неправильная обработка ошибок 401 при проверке сессии
4. Конфликт между настройками CORS и cookies

## План исправлений

1. Унифицировать URL пути API
2. Исправить прямой вызов к Heroku
3. Настроить корректную обработку устаревших токенов
4. Обновить настройки CORS на бэкенде
5. Исправить middleware на фронтенде
6. Настроить корректное хранение cookies
7. Улучшить обработку ошибок

## Внесенные изменения

### 1. Улучшение настроек CORS в бэкенде (`enecawork-backend/src/index.ts`)

- Добавлена поддержка нескольких origin с проверкой допустимых доменов
- Расширены HTTP-методы и заголовки
- Добавлена поддержка legacy-путей без префикса `/api` для обратной совместимости

```typescript
// Настройка CORS с поддержкой credentials и корректным origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Разрешенные origin из env или по умолчанию
      const allowedOrigins = [
        CORS_ORIGIN,
        'https://eneca.work',
        'https://www.eneca.work'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true, // Allow cookies in cross-origin requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Legacy route support for backwards compatibility
app.use('/auth', authRoutes);
```

### 2. Улучшение обработки cookies в бэкенде (`enecawork-backend/src/middleware/authMiddleware.ts`)

- Добавлены функции для централизованного управления cookies
- Изменены настройки `sameSite` на `none` для cross-origin запросов в production
- Добавлен общий домен для всех cookie: `.eneca.work`
- Снижен минимальный интервал между обновлениями токена с 15 до 5 минут
- Улучшена логика ограничения частоты обновления токенов с учетом истории обновлений

```typescript
// Централизованная установка кук аутентификации
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // Определяем правильные настройки для куки
  const isProd = process.env.NODE_ENV === 'production';
  const secureCookie = isProd;
  const cookieDomain = isProd ? '.eneca.work' : undefined;
  
  // Access token cookie
  res.cookie('auth-token', accessToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: isProd ? 'none' : 'lax', // none для cross-origin в продакшене
    domain: cookieDomain,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
  
  // Refresh token cookie
  res.cookie('refresh-token', refreshToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: isProd ? 'none' : 'lax', // none для cross-origin в продакшене
    domain: cookieDomain,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
  });
}
```

### 3. Улучшение обработки токенов в контроллере аутентификации (`enecawork-backend/src/auth/authController.ts`)

- Добавлены те же функции управления cookies в контроллеры аутентификации
- Улучшен механизм отслеживания частоты обновлений токенов
- Точное время истечения токена в ответе API
- Возврат профиля пользователя при обновлении токена для консистентности данных

```typescript
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // ... (аналогично middleware)
}

function getRefreshCount(key: string): number {
  if (!refreshHistory.has(key)) {
    return 0;
  }
  
  const history = refreshHistory.get(key)!;
  const cutoff = Date.now() - MIN_REFRESH_INTERVAL;
  return history.filter(time => time >= cutoff).length;
}
```

### 4. Улучшение обработки сессии на фронтенде (`enecawork-frontend/hooks/useAuth.tsx`)

- Добавлено управление количеством попыток обновления токена
- Уменьшен минимальный интервал между обновлениями до 1 минуты
- Добавлен перехватчик fetch для автоматической обработки 401 ошибок
- Добавлена логика повторных попыток с задержкой
- Экспортирована функция `refreshSession` для возможности вызова вручную

```typescript
// Minimum interval between token refreshes (уменьшен с 15 до 1 минуты)
const MIN_REFRESH_INTERVAL = 60 * 1000;
// Maximum attempts to refresh token before redirecting to login
const MAX_REFRESH_ATTEMPTS = 3;

// Перехватчик fetch для 401 ошибок
useEffect(() => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input, init) => {
    try {
      const response = await originalFetch(input, init);
      
      if (response.status === 401) {
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('/api/') && user) {
          console.log('Intercepted 401 response, attempting to refresh token');
          await refreshSession(true);
          return await originalFetch(input, init);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  return () => {
    window.fetch = originalFetch;
  };
}, [refreshSession, user]);
```

### 5. Улучшение middleware на фронтенде (`enecawork-frontend/middleware.ts`)

- Добавлена проверка как auth-token, так и refresh-token для определения аутентификации
- Добавлена фильтрация API путей, чтобы они обрабатывались отдельно
- Улучшена логика редиректов с сохранением изначального пути

```typescript
// Проверка наличия cookie аутентификации
const authCookie = request.cookies.get('auth-token');
const refreshCookie = request.cookies.get('refresh-token');

// Если есть auth-token или refresh-token, считаем пользователя аутентифицированным
const isAuthenticated = !!authCookie || !!refreshCookie;
```

### 6. Улучшение обработки ошибок API на фронтенде (`enecawork-frontend/lib/auth/auth.ts`)

- Создана обертка для fetch с улучшенной обработкой ошибок
- Добавлена обработка сетевых ошибок с понятными сообщениями
- Улучшен логгинг ошибок сессии

```typescript
async function fetchWithErrorHandling(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Пытаемся получить сообщение об ошибке из JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      } catch (jsonError) {
        // Если не удалось разобрать JSON, используем статус
        throw new Error(`Request failed with status ${response.status}`);
      }
    }
    
    return response;
  } catch (error) {
    // Улучшаем сообщение об ошибке для сетевых проблем
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}
```

## Результаты

Внесенные изменения должны решить следующие проблемы:

1. ✅ Корректная работа cross-origin запросов между фронтендом (eneca.work) и бэкендом (heroku)
2. ✅ Корректная обработка устаревших токенов с автоматическим обновлением
3. ✅ Правильное хранение и передача cookies между доменами
4. ✅ Автоматические повторные попытки при ошибках аутентификации
5. ✅ Уменьшение вероятности выбрасывания пользователя на окно логина

## Дополнительные рекомендации

1. Рассмотреть возможность использования JWT-токенов в localStorage вместо cookies для большей надежности
2. Добавить явное управление временем сессии на стороне сервера
3. Реализовать проверку активности пользователя для обновления токенов только при необходимости 