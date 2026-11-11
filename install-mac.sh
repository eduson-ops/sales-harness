#!/bin/bash

# ==============================================================================
# SALES HARNESS — АВТОМАТИЧЕСКАЯ УСТАНОВКА НА MACOS (APPLE SILICON & INTEL)
# ==============================================================================

echo "🍏 Запуск установки Sales Harness для macOS..."

# 1. Проверка Homebrew и Node.js
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js не найден на твоем Mac."
    if ! command -v brew &> /dev/null; then
        echo "📦 Устанавливаем Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    echo "📦 Устанавливаем Node.js..."
    brew install node
else
    echo "✅ Node.js найден: $(node -v)"
fi

# 2. Установка зависимостей
echo "📦 Установка библиотек..."
npm install

# 3. Запуск интерактивного визарда
echo "🚀 Запуск мастера настройки..."
node setup.mjs

echo ""
echo "🎉 Готово! Чтобы запустить ассистента в фоне на Mac, выполни:"
echo "   npm start"
