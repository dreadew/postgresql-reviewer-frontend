# PostgreSQL Reviewer API Documentation

Документация по REST API системы анализа и мониторинга PostgreSQL баз данных.

## Базовый URL

```
http://localhost:8000
```

## API Версионность

Система поддерживает версионное API для обеспечения обратной совместимости:

- **Актуальная версия:** `v1`
- **Базовый путь v1:** `/api/v1/`
- **Обратная совместимость:** `/api/` (перенаправляет на v1)

### Документация API

- **Interactive Docs (Swagger):** `/api/v1/docs`
- **ReDoc:** `/api/v1/redoc`
- **OpenAPI Schema:** `/api/v1/openapi.json`
- **Версии API:** `/api/versions`

### 📖 [Полный гайд по версионности](./API_VERSIONING.md)

Подробная информация о работе с API версиями, миграции и лучших практиках.

## Структура API

### 📊 [Планировщик задач](./scheduler.md) - `/api/v1/scheduler/*`

Управление автоматизированными задачами анализа

### 🔗 [Подключения](./connections.md) - `/api/v1/connections/*`

Управление подключениями к базам данных

### 📝 [Логи](./logs.md) - `/api/v1/logs/*`

Просмотр и анализ системных логов

### 📈 [Мониторинг](./monitoring.md) - `/api/v1/monitoring/*`

Мониторинг состояния баз данных и системы

### 🔍 [Анализ и ревью](./review.md) - `/api/v1/review/*`

Выполнение анализа запросов и конфигураций

### ⚙️ [Правила](./rules.md) - `/api/v1/rules/*`

Управление правилами анализа

### 🛠 [Конфигурация](./config.md) - `/api/v1/config/*`

Системные настройки

## Быстрый старт

1. **Создание подключения к БД:**

```bash
curl -X POST http://localhost:8000/api/v1/connections/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production-db",
    "vault_path": "database/postgresql/prod",
    "environment": "production",
    "description": "Production database connection",
    "tags": ["production", "main"],
    "host": "localhost",
    "port": 5432,
    "database": "proddb",
    "username": "postgres",
    "password": "password"
  }'
```

2. **Создание задачи анализа:**

```bash
curl -X POST http://localhost:8000/api/v1/scheduler/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Config Check",
    "task_type": "config_check",
    "connection_id": 1,
    "cron_schedule": "0 2 * * *",
    "description": "Ежедневная проверка конфигурации"
  }'
```

3. **Запуск задачи:**

```bash
curl -X POST http://localhost:8000/api/v1/scheduler/tasks/1/run
```

## Общие принципы

- Все запросы/ответы используют JSON формат
- Аутентификация через заголовки (если настроена)
- Стандартные HTTP коды ответов
- Пагинация для списочных эндпоинтов
- Единообразные схемы ошибок

## Обратная совместимость

Для обеспечения плавного перехода поддерживается доступ к API без указания версии:

```bash
# Новый способ (рекомендуется)
curl http://localhost:8000/api/v1/connections/

# Старый способ (для обратной совместимости)
curl http://localhost:8000/api/connections/
```

## Схемы ответов

### Успешный ответ

```json
{
  "data": { ... },
  "status": "success"
}
```

### Ошибка

```json
{
  "detail": "Описание ошибки",
  "status": "error"
}
```
