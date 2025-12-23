# Тестовое задание для Effective Mobile

## Запуск
Выполните команды:
```sh
npm install
npm run build
npm run start 
```

После запуска можно прогнать unit-тесты:
```sh
npm run test
```

## Документация API

### Регистрация пользователя
```
POST /auth/sign-up
```

**Тело запроса:**
```jsonc
{
  "firstname": "Иванов",
  "secondname": "Иван",
  "patronymic": "Иванович",
  "email": "user@example.com",
  "password": "1234",
  "birthdate": 1698765432000, // timestamp Date.now()
}
```
Роль нового пользователя "user"<br>
Из соображений безопасности через этот эндпоинт нельзя создать пользователя с ролью "admin" (в тестах создаётся через запрос к БД)

**Успешный ответ:**
```json
{
  "status": "OK"
}
```

### Авторизация пользователя
```
POST /auth/log-in
```

**Тело запроса (JSON):**
```json
{
  "email": "user@example.com",
  "password": "1234"
}
```

**Успешный ответ:**
```jsonc
{
  "id": 1,
  "token": "123456787654" // строка с 12-значным числом
}
```

**Ошибки:**
- `400: {"error": "User not found"}` - пользователь не найден
- `400: {"error": "Invalid password"}` - неверный пароль

### Получение пользователя по ID
```
GET /user/{id}
```

**Заголовки:**
```
Authorization: Bearer {token}
```

**Доступ:**
- Пользователь может получать только свою информацию
- Администратор может получать информацию любого пользователя

**Ошибки:**
- `400: {"error": "Authorization error"}` - нет авторизации
- `401: {"error": "Access denied"}` - недостаточно прав (для обычного пользователя, запрашивающего чужую информацию)

**Успешный ответ:**
```jsonc
{
  "id": 1,
  "firstname": "Иванов",
  "secondname": "Иван",
  "patronymic": "Иванович",
  "email": "user@example.com",
  "birthdate": 1698765432000, 
  "role": "user",
  "active": true
}
```

### Получение списка всех пользователей
```
GET /user/
```

**Заголовки:**
```
Authorization: Bearer {token}
```

**Ошибки:**
- `400: {"error": "Authorization error"}` - нет авторизации
- `401: {"error": "Access denied"}` - недостаточно прав (если role = "user")

**Успешный ответ:**
```json
[
  {
    "id": 1,
    "firstname": "Иванов",
    "secondname": "Иван",
    "patronymic": "Иванович",
    "email": "user@example.com",
    "role": "user",
    "active": true
  },
  {
    "id": 2,
    "firstname": "Петров",
    "secondname": "Петр",
    "patronymic": "Иванович",
    "email": "admin@example.com",
    "role": "admin",
    "active": true
  }
]
```

### Блокировка пользователя
```
PUT /user/{id}/block
```

**Заголовки:**
```
Authorization: Bearer {token}
```

**Тело запроса (JSON):**
```json
{
  "active": false
}
```

**Доступ:**
- Пользователь может блокировать только себя
- Администратор может блокировать любого пользователя

**Ошибки:**
- `402: {"error": "Access denied"}` - попытка заблокировать другого пользователя (для обычного пользователя)

**Успешный ответ:**
```json
{
  "id": 1,
  "firstname": "Иванов",
  "secondname": "Иван",
  "patronymic": "Иванович",
  "email": "user@example.com",
  "birthdate": 1698765432000,
  "role": "user",
  "active": false
}
```

### Роли

Пользователь (role = user)
- Может получать свою информацию
- Может блокировать себя
- Не может получать список всех пользователей
- Не может блокировать других пользователей

Администратор (role = admin)
- Может получать информацию любого пользователя
- Может получать список всех пользователей
- Может блокировать любого пользователя

### Примеры использования

1. Полный цикл работы пользователя
```javascript
// 1. Регистрация
await fetch('/auth/sign-up', {
  method: 'POST',
  body: JSON.stringify({
    firstname: "Иванов",
    secondname: "Иван",
    email: "ivan@mail.com",
    password: "1234"
  })
});

// 2. Вход
const login = await fetch('/auth/log-in', {
  method: 'POST',
  body: JSON.stringify({
    email: "ivan@mail.com",
    password: "1234"
  })
});

const { token, id } = await login.json();

// 3. Получение своей информации
const userInfo = await fetch(`/user/${id}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 4. Блокировка себя
await fetch(`/user/${id}/block`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ active: false })
});
```

2. Работа администратора
```javascript
// 1. Вход
const login = await fetch('/auth/log-in', {
  method: 'POST',
  body: JSON.stringify({
    email: "admin@mail.com",
    password: "admin123"
  })
});

const { token } = await login.json();

// 2. Получение списка всех пользователей
const allUsers = await fetch('/user/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 3. Блокировка пользователя с ID=5
await fetch('/user/5/block', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ active: false })
});
```
