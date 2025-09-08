# Документация PostgreSQL Reviewer

## 📚 Навигация по документации

### 🚀 Быстрый старт

- [README.md](../README.md) - Основная документация и установка
- [.env.example](../.env.example) - Пример конфигурации
- [📋 Журнал изменений v2.0](CHANGELOG_v2.md) - **Важные изменения API**

### 🔌 API Документация

- [Scheduler API](endpoints/scheduler.md) - Планировщик задач (11 эндпоинтов)
- [Connections API](endpoints/connections.md) - Управление подключениями БД (5 эндпоинтов)
- [Monitoring API](endpoints/monitoring.md) - Мониторинг системы (7 эндпоинтов)
- [Review API](endpoints/review.md) - Анализ SQL запросов (2 эндпоинта)
- [Config API](endpoints/config.md) - Анализ конфигурации PostgreSQL (1 эндпоинт)
- [Logs API](endpoints/logs.md) - Анализ логов (1 эндпоинт)
- [Rules API](endpoints/rules.md) - Управление правилами анализа (6 эндпоинтов)

### 📋 Руководства по планировщику

- [Типы задач и примеры](task_types_guide.md) - **Главный гайд** по 5 типам задач
- [Архитектура планировщика](guides/scheduler_architecture_guide.md) - Техническая документация
- [Создание и управление задачами](guides/task_creation_guide.md) - Полное руководство
- [Практические примеры](guides/practical_examples.md) - 18 готовых примеров

### 🛠️ Технические детали

- [Миграции БД](../migrations/) - Схема базы данных
- [Примеры использования](../examples/) - Скрипты и примеры кода
- [Скрипты настройки](../scripts/) - Утилиты для установки и конфигурации

## 🎯 Что где искать

### 💻 Хочу начать использовать API

➡️ Смотри [endpoints/](endpoints/) - полная документация всех API

### 🕐 Хочу настроить автоматические задачи

➡️ Смотри [task_types_guide.md](task_types_guide.md) - все типы задач с примерами

### 🏗️ Хочу понять как работает система

➡️ Смотри [guides/scheduler_architecture_guide.md](guides/scheduler_architecture_guide.md)

### 📊 Нужны готовые примеры мониторинга

➡️ Смотри [guides/practical_examples.md](guides/practical_examples.md) - 18 примеров

### 🔧 Хочу создать свою задачу

➡️ Смотри [guides/task_creation_guide.md](guides/task_creation_guide.md)

### 🚨 Проблемы с установкой/настройкой

➡️ Смотри [README.md](../README.md) секцию Troubleshooting

## 📈 Статистика документации

- **33 эндпоинта** API полностью задокументированы
- **5 типов задач** планировщика с примерами
- **18 готовых примеров** для реальных сценариев
- **Полная архитектурная документация** системы
- **40+ переменных конфигурации** описаны

---

💡 **Совет**: Начни с [task_types_guide.md](task_types_guide.md) - это основной документ для понимания возможностей системы!
