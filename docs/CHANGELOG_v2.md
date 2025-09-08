# Журнал изменений API v2.0

## 🚀 Крупные изменения в версии 2.0

### ⚠️ Критические изменения (Breaking Changes)

#### 1. Удален Tasks API ❌

**Что изменилось:**

- Удален эндпоинт `/tasks/` со всеми методами
- Удален файл `src/api/routes/tasks.py`
- Удалена таблица `tasks` из БД

**Что использовать вместо этого:**

- Используйте **Scheduler API** (`/scheduler/tasks/`) для всех операций с задачами
- Все функции перенесены в новый планировщик с расширенными возможностями

**Миграция:**

```bash
# Старый способ
POST /tasks/

# Новый способ
POST /scheduler/tasks/
```

#### 2. Изменена структура Connections API 🔄

**Что изменилось:**

- Удалены поля из БД: `host`, `port`, `database`, `username`
- Добавлены новые поля: `environment`, `description`, `tags`
- Все учетные данные теперь хранятся только в Vault

**Старая структура:**

```json
{
  "id": 1,
  "name": "DB",
  "host": "localhost",
  "port": 5432,
  "database": "mydb",
  "username": "user",
  "vault_path": "...",
  "is_active": true
}
```

**Новая структура:**

```json
{
  "id": 1,
  "name": "DB",
  "vault_path": "secret/database/connections/db",
  "environment": "production",
  "description": "Основная БД",
  "tags": ["prod", "critical"],
  "is_active": true
}
```

#### 3. Упрощена структура миграций 📋

**Что изменилось:**

- Старые миграции (V001-V005) объединены в 2 файла
- Удалены промежуточные таблицы и поля
- Финальная схема БД без legacy кода

**Новые миграции:**

- `V001_init_database.sql` - основная схема БД
- `V002_test_data.sql` - тестовые данные

### ✅ Новые возможности

#### 1. Расширенная поддержка окружений

```json
{
  "environment": "production|staging|development",
  "description": "Описание подключения",
  "tags": ["tag1", "tag2", "tag3"]
}
```

#### 2. Улучшенная безопасность

- Все credentials только в Vault
- Никаких секретов в основной БД
- Разделение метаданных и учетных данных

#### 3. Новые типы задач

- `table_analysis` - анализ таблиц и индексов
- `custom_sql` - выполнение пользовательских SQL запросов

### 🔧 Руководство по миграции

#### Для разработчиков

1. **Обновите API вызовы:**

   ```javascript
   // Старо
   await fetch('/tasks/', { method: 'POST', ... })

   // Ново
   await fetch('/scheduler/tasks/', { method: 'POST', ... })
   ```

2. **Обновите структуру connections:**

   ```javascript
   // Старая структура
   const connection = {
     name: "DB",
     host: "localhost",
     port: 5432,
     database: "mydb",
     username: "user",
     password: "pass",
   };

   // Новая структура
   const connection = {
     name: "DB",
     vault_path: "secret/database/connections/db",
     environment: "production",
     description: "Основная БД",
     tags: ["prod"],
     // credentials уходят в отдельные поля для Vault
     host: "localhost",
     port: 5432,
     database: "mydb",
     username: "user",
     password: "pass",
   };
   ```

#### Для DevOps

1. **Обновите скрипты развертывания:**

   - Используйте новые миграции V001-V002
   - Настройте Vault для хранения credentials

2. **Обновите мониторинг:**
   - Проверьте новые эндпоинты Scheduler API
   - Обновите dashboards для новой структуры connections

### 📚 Документация

- **Полная документация:** [docs/index.md](index.md)
- **Scheduler API:** [endpoints/scheduler.md](endpoints/scheduler.md)
- **Connections API:** [endpoints/connections.md](endpoints/connections.md)
- **Архитектура планировщика:** [guides/scheduler_architecture_guide.md](guides/scheduler_architecture_guide.md)
