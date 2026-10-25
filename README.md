# ⚡ Ryoko Table

Система управления рабочим временем, персональными графиками и расчета заработной платы в стилистике кибернетического интерфейса *Soul Hackers / Ryoko Table*.

## 🛠 Стек технологий
- **Backend:** NestJS, TypeScript, Prisma ORM, SQLite, ESM.
- **Frontend:** Next.js (App Router), Tailwind CSS, React.
- **Features:** Автогенерация месячных сеток, динамический патчинг смен, расчет зарплаты с вычетом обеденного перерыва (30 мин), многоязычность (EN, RU, UK, PL).

## 🚀 Схема запуска локально
```bash
# Клонирование и установка зависимостей
git clone [https://github.com/ВАШ_НИК/aion-work-schedule.git](https://github.com/RomanSinAlexandra/aion-work-schedule.git)
cd Ryoko Table

# Одновременный запуск бэкенда и фронтенда
npm install
npm run start:all