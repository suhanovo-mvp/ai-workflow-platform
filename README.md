# AI Workflow Platform

Визуальная платформа для конструирования и управления AI-операциями с поддержкой мультиформатных артефактов.

## 🚀 Возможности

- **Визуальный редактор workflow** - Kanban-доска с drag-and-drop на основе React Flow
- **Управление артефактами** - поддержка текста, изображений, аудио, видео, кода, JSON
- **Справочник AI-сервисов** - каталог операций с описаниями и параметрами
- **Оркестратор workflow** - управление выполнением процессов
- **Интеграция OpenAI** - GPT-4, суммаризация, перевод, анализ, генерация кода
- **Система аутентификации** - JWT-based с ролевой моделью

## 📋 Требования

- Node.js 22+
- PostgreSQL 14+
- pnpm 10+

## 🛠️ Установка

### 1. Клонирование репозитория

```bash
cd /home/ubuntu/ai-workflow-platform
```

### 2. Установка зависимостей

```bash
pnpm install
```

### 3. Настройка базы данных

```bash
# Запуск PostgreSQL
sudo service postgresql start

# Создание базы данных
sudo -u postgres psql -c "CREATE DATABASE ai_workflow;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 4. Настройка переменных окружения

Файл `.env` уже создан с базовыми настройками:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_workflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

**Важно:** OPENAI_API_KEY уже настроен в системных переменных окружения.

### 5. Применение миграций и заполнение данных

```bash
# Генерация миграций
pnpm db:generate

# Применение миграций
pnpm db:push

# Заполнение базы начальными AI-сервисами
pnpm db:seed
```

## 🚀 Запуск

### Режим разработки

```bash
pnpm dev
```

Приложение будет доступно по адресу:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production сборка

```bash
# Сборка
pnpm build

# Запуск
pnpm start
```

## 📁 Структура проекта

```
ai-workflow-platform/
├── server/              # Backend (Express + TypeScript)
│   ├── db/             # База данных (Drizzle ORM)
│   ├── routes/         # API маршруты
│   ├── middleware/     # Middleware (auth)
│   ├── services/       # Сервисы (OpenAI, orchestrator)
│   └── index.ts        # Точка входа сервера
├── src/                # Frontend (React + TypeScript)
│   ├── components/     # UI компоненты
│   ├── pages/          # Страницы приложения
│   ├── lib/            # Утилиты и API клиент
│   ├── types/          # TypeScript типы
│   └── main.tsx        # Точка входа клиента
├── drizzle/            # Миграции базы данных
└── package.json        # Зависимости проекта
```

## 🎯 Использование

### 1. Регистрация и вход

- Откройте http://localhost:5173
- Зарегистрируйтесь с email и паролем
- Войдите в систему

### 2. Просмотр AI-сервисов

- Перейдите в раздел "AI Сервисы"
- Ознакомьтесь с доступными операциями:
  - GPT-4 Chat
  - Text Summarization
  - Language Translation
  - Text Analysis
  - Code Generator
  - Text Generator

### 3. Создание Workflow

1. На главной странице нажмите "Создать Workflow"
2. В боковой панели выберите AI-сервисы
3. Кликните на сервис, чтобы добавить его на канвас
4. Соедините узлы стрелками для создания последовательности операций
5. Сохраните workflow
6. Нажмите "Запустить" для выполнения

### 4. Просмотр артефактов

- Перейдите в раздел "Артефакты"
- Просмотрите результаты выполнения workflow

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### AI Сервисы
- `GET /api/ai-services` - Список сервисов
- `GET /api/ai-services/:id` - Получить сервис
- `POST /api/ai-services` - Создать сервис (admin)
- `PUT /api/ai-services/:id` - Обновить сервис (admin)
- `DELETE /api/ai-services/:id` - Удалить сервис (admin)

### Артефакты
- `GET /api/artifacts` - Список артефактов
- `GET /api/artifacts/:id` - Получить артефакт
- `POST /api/artifacts` - Создать артефакт
- `PUT /api/artifacts/:id` - Обновить артефакт
- `DELETE /api/artifacts/:id` - Удалить артефакт

### Workflows
- `GET /api/workflows` - Список workflows
- `GET /api/workflows/:id` - Получить workflow
- `POST /api/workflows` - Создать workflow
- `PUT /api/workflows/:id` - Обновить workflow
- `DELETE /api/workflows/:id` - Удалить workflow
- `POST /api/workflows/:id/execute` - Запустить workflow
- `GET /api/workflows/:id/executions` - История выполнений

### Executions
- `GET /api/executions/:id` - Получить выполнение
- `GET /api/executions/:id/logs` - Логи выполнения

## 🏗️ Технологический стек

### Frontend
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- React Flow (визуализация workflow)
- React Router
- Axios

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- JWT (аутентификация)
- OpenAI API

## 🔐 Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- Ролевая модель доступа (admin, developer, analyst, user)
- CORS настройка
- Валидация входных данных

## 📝 Дополнительные команды

```bash
# Просмотр базы данных через Drizzle Studio
pnpm db:studio

# Генерация новых миграций
pnpm db:generate

# Применение миграций
pnpm db:push
```

## 🎨 Особенности реализации

### Оркестратор Workflow
- Топологическая сортировка узлов
- Последовательное выполнение операций
- Обработка ошибок и логирование
- Поддержка асинхронных операций
- Автоматическое создание артефактов с результатами

### Интеграция OpenAI
- Поддержка GPT-4.1-mini
- Суммаризация текста
- Перевод на различные языки
- Анализ текста
- Генерация кода
- Кастомные промпты

### Визуальный редактор
- React Flow для визуализации
- Drag-and-drop узлов
- Интерактивное соединение
- Сохранение состояния
- Превью параметров

## 📄 Лицензия

ISC

## 👥 Автор

Разработано с использованием Manus.im

